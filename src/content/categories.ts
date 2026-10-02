export const CATEGORIES = [
  "Films",
  "Series",
  "News Features",
  "Music Video",
  "Reels",
  "Writing",
  "Exhibitions",
  "Workshops & Teaching",
  "Improv",
  "Cyanotypes",
] as const

export type Category = typeof CATEGORIES[number]

export const DEFAULT_LINK_LABEL: Record<Category, "Watch" | "Read" | "View"> = {
  Films: "Watch",
  Series: "Watch",
  "Music Video": "Watch",
  Reels: "Watch",
  Writing: "Read",
  "News Features": "Read",
  Exhibitions: "View",
  "Workshops & Teaching": "View",
  Improv: "View",
  Cyanotypes: "View",
}
