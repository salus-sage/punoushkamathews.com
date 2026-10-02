// Optimises images under public/media/ in place: fit inside 2000x2000, re-encode at
// quality 80, strip metadata. Format and path are preserved so content/ never changes.
// Run with `pnpm optimize-images` (all files) or
// `pnpm optimize-images --changed <fromSha> <toSha>` (only files added or modified in
// that commit range; falls back to all files on the all-zeros sha or a failing diff).
// Exit code 1 when any file cannot be decoded; it is named in the output.

import { execFileSync } from "node:child_process"
import { readdirSync, statSync } from "node:fs"
import { rename, stat, unlink } from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"

const root = path.resolve(import.meta.dirname, "..")
const mediaDir = path.join(root, "public", "media")

const MAX_EDGE = 2000
const MAX_SKIP_BYTES = 300 * 1024
const QUALITY = 80
// A file already within MAX_EDGE that is over MAX_SKIP_BYTES even at QUALITY would
// otherwise be re-encoded on every run for a tiny saving. Keep the input unless the
// re-encode saves at least this fraction, so repeated runs change nothing.
const MIN_SAVING_RATIO = 0.05
const CONCURRENCY = 4
const EXTENSIONS = new Set([".jpg", ".jpeg", ".webp"])
const ZERO_SHA = /^0{40}$/

type Status = "processed" | "skip" | "kept" | "error"

interface Result {
  file: string
  status: Status
  before: number
  after: number
  message?: string
}

function rel(file: string): string {
  return path.relative(root, file).split(path.sep).join("/")
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  return `${(bytes / 1024).toFixed(1)} KB`
}

function isImage(file: string): boolean {
  return EXTENSIONS.has(path.extname(file).toLowerCase())
}

/** Every image under public/media/, recursively, sorted for a stable report. */
function listAllImages(dir: string): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name)
    if (statSync(full).isDirectory()) out.push(...listAllImages(full))
    else if (isImage(full)) out.push(full)
  }
  return out.sort()
}

/**
 * Images under public/media/ added or modified between two commits. Returns
 * undefined when the range cannot be diffed (first push, unknown sha), so the
 * caller falls back to processing everything.
 */
function listChangedImages(from: string, to: string): string[] | undefined {
  if (ZERO_SHA.test(from)) return undefined
  let output: string
  try {
    output = execFileSync(
      "git",
      ["diff", "--name-only", "--diff-filter=AM", from, to],
      { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
    )
  } catch (err) {
    console.log(`git diff ${from} ${to} failed: ${(err as Error).message.trim()}`)
    return undefined
  }
  return output
    .split("\n")
    .filter((line) => line.startsWith("public/media/") && isImage(line))
    .map((line) => path.join(root, ...line.split("/")))
    .filter((file) => statSync(file, { throwIfNoEntry: false })?.isFile())
    .sort()
}

async function optimise(file: string): Promise<Result> {
  const before = (await stat(file)).size
  const ext = path.extname(file).toLowerCase()

  let width: number | undefined
  let height: number | undefined
  try {
    const meta = await sharp(file).metadata()
    width = meta.width
    height = meta.height
  } catch (err) {
    return {
      file,
      status: "error",
      before,
      after: before,
      message: `cannot decode: ${(err as Error).message}`,
    }
  }
  if (width === undefined || height === undefined) {
    return { file, status: "error", before, after: before, message: "no dimensions" }
  }

  const needsResize = Math.max(width, height) > MAX_EDGE
  if (!needsResize && before <= MAX_SKIP_BYTES) {
    return { file, status: "skip", before, after: before }
  }

  // Same directory so the final rename is atomic. Prefix matches .gitignore's .tmp-*.
  const temp = path.join(
    path.dirname(file),
    `.tmp-${process.pid}-${path.basename(file)}`,
  )

  try {
    let pipeline = sharp(file)
      .rotate()
      .resize(MAX_EDGE, MAX_EDGE, { fit: "inside", withoutEnlargement: true })
      .toColorspace("srgb")
    pipeline =
      ext === ".webp"
        ? pipeline.webp({ quality: QUALITY })
        : pipeline.jpeg({ quality: QUALITY, progressive: true, mozjpeg: true })
    await pipeline.toFile(temp)

    const after = (await stat(temp)).size
    const worthwhile = needsResize || after <= before * (1 - MIN_SAVING_RATIO)
    if (after >= before || !worthwhile) {
      await unlink(temp)
      return { file, status: "kept", before, after: before }
    }
    await rename(temp, file)
    return { file, status: "processed", before, after }
  } catch (err) {
    await unlink(temp).catch(() => {})
    return {
      file,
      status: "error",
      before,
      after: before,
      message: `cannot process: ${(err as Error).message}`,
    }
  }
}

async function runAll(files: string[]): Promise<Result[]> {
  const results: Result[] = new Array(files.length)
  let next = 0
  async function worker(): Promise<void> {
    while (next < files.length) {
      const index = next++
      const result = await optimise(files[index])
      results[index] = result
      const line = `${result.status} ${rel(result.file)} ${formatSize(result.before)} → ${formatSize(result.after)}`
      console.log(result.message ? `${line} (${result.message})` : line)
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, files.length) }, worker),
  )
  return results
}

// --- main --------------------------------------------------------------------

const args = process.argv.slice(2)
let files: string[]

if (args[0] === "--changed") {
  const [from, to] = [args[1], args[2]]
  if (!from || !to) {
    console.log("usage: optimize-images [--changed <fromSha> <toSha>]")
    process.exit(2)
  }
  const changed = listChangedImages(from, to)
  if (changed === undefined) {
    console.log(`cannot diff ${from}..${to}, processing all images`)
    files = listAllImages(mediaDir)
  } else {
    console.log(`${changed.length} changed image(s) in ${from}..${to}`)
    files = changed
  }
} else if (args.length > 0) {
  console.log("usage: optimize-images [--changed <fromSha> <toSha>]")
  process.exit(2)
} else {
  files = listAllImages(mediaDir)
}

if (files.length === 0) console.log("no images to process")

const results = await runAll(files)

const count = (status: Status) =>
  results.filter((r) => r.status === status).length
const saved = results.reduce((sum, r) => sum + (r.before - r.after), 0)
const failed = results.filter((r) => r.status === "error")

console.log(
  `processed ${count("processed")}, skipped ${count("skip")}, kept ${count("kept")}, saved ${(saved / (1024 * 1024)).toFixed(2)} MB`,
)

if (failed.length > 0) {
  console.log(
    `${failed.length} file(s) failed: ${failed.map((r) => rel(r.file)).join(", ")}`,
  )
  process.exit(1)
}
