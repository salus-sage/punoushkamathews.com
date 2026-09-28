import React, { useState, useRef, useEffect } from 'react'

// ─── Data ────────────────────────────────────────────────────────────────────

type Category =
  | 'Films'
  | 'Series'
  | 'News Features'
  | 'Music Video'
  | 'Reels'
  | 'Writing'
  | 'Exhibitions'
  | 'Workshops & Teaching'
  | 'Improv'
  | 'Cyanotypes'

interface Project {
  category: Category
  client?: string
  title: string
  description: string
  role?: string
  tags?: string[]
  thumbnail?: string
  year?: string
}

const ALL_CATEGORIES: Category[] = [
  'Films',
  'Series',
  'News Features',
  'Music Video',
  'Reels',
  'Writing',
  'Exhibitions',
  'Workshops & Teaching',
  'Improv',
  'Cyanotypes',
]

const projects: Project[] = [
  // ── Films ──────────────────────────────────────────────────────────────────
  {
    category: 'Films',
    client: 'Rotary Club, Bengaluru (Youth Wing)',
    title: 'We Heart to Vote',
    description:
      'Campaign film commissioned for Voter Awareness during the Parliamentary Elections in 2024.',
    role: 'Director, Editor',
    year: '2024',
    thumbnail: 'https://images.unsplash.com/photo-1587560699334-cc4ff634909a?w=700&h=460&fit=crop&auto=format',
  },
  {
    category: 'Films',
    client: 'PSBT, New Delhi',
    title: '#unfair',
    description:
      'A feature-length documentary that explores the complexities of racism and the lived experiences of Africans in India.',
    role: 'Co-Director',
    thumbnail: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=700&h=460&fit=crop&auto=format',
  },
  {
    category: 'Films',
    client: 'MAP, Bengaluru',
    title: 'We Don\'t End at our Edges',
    description:
      'A short film part of an exhibition of artworks by artist, writer, and educator Ravikumar Kashi, that opened at the Museum of Art & Photography (MAP), Bengaluru.',
    role: 'Director, Editor',
    thumbnail: 'https://images.unsplash.com/photo-1578926288207-a90a5366f7c8?w=700&h=460&fit=crop&auto=format',
  },
  {
    category: 'Films',
    client: 'Industree Foundation',
    title: 'Product Film',
    description:
      'A short film showcasing Industree Foundation\'s newly designed sustainable product range for the Banana Fiber, Bamboo, and Sal value chains.',
    role: 'Director',
    thumbnail: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=700&h=460&fit=crop&auto=format',
  },
  {
    category: 'Films',
    client: 'Leftword',
    title: 'The Leftword Story',
    description:
      'A short film about LeftWord Books made on the occasion of their 20th anniversary.',
    role: 'Director, Editor',
    thumbnail: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=700&h=460&fit=crop&auto=format',
  },
  {
    category: 'Films',
    client: 'Nrityagram',
    title: 'Dance Commons Film',
    description:
      'Short event film on the first Dance Commons held by Nrityagram that brought together young dancers from all over India to reflect on questions about art, passion, dreams, and the future.',
    role: 'Editor',
    thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=700&h=460&fit=crop&auto=format',
  },
  {
    category: 'Films',
    client: 'BML Munjal University',
    title: 'Please Mind the Gap',
    description:
      'A short animation film that dives into the inequalities in accessing higher education for school students in India.',
    role: 'Writer, Director, Editor',
    thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=700&h=460&fit=crop&auto=format',
  },
  {
    category: 'Films',
    client: 'Toxics Link',
    title: 'The Story of Microplastics',
    description:
      'A short animation film about microplastics — their ubiquity in the air, water, soil, and now in human bodies.',
    role: 'Researcher, Writer, Director',
    thumbnail: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=700&h=460&fit=crop&auto=format',
  },
  {
    category: 'Films',
    client: 'Toxics Link',
    title: 'Turning Red to Green: Sustainable Periods',
    description:
      'A short animation film on the hazardous impact of sanitary napkins on female bodies and on the planet.',
    role: 'Writer, Director',
    thumbnail: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=700&h=460&fit=crop&auto=format',
  },
  {
    category: 'Films',
    client: 'MAP, Bengaluru',
    title: 'Accessibility Initiatives',
    description:
      'A short film about the accessibility initiatives at the Museum of Art and Photography (MAP), Bengaluru. Also on permanent display at the Museum.',
    role: 'Editor',
    thumbnail: 'https://images.unsplash.com/photo-1580894908361-967195033215?w=700&h=460&fit=crop&auto=format',
  },
  {
    category: 'Films',
    client: 'Vikalp Sangam',
    title: 'Balika Panchayat: The Story of Kunariya',
    description:
      'A short film about the Balika Panchayat of Kunariya, Kutch — a programme led by women and girls aged 10–21 to empower women in the active functioning of the Gram Panchayat.',
    role: 'Associate Director, Co-Editor',
    thumbnail: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=700&h=460&fit=crop&auto=format',
  },
  {
    category: 'Films',
    client: 'ColorSorts',
    title: 'Profile Film',
    description:
      'A short film on ColorSorts, a groundbreaking initiative addressing the garment industry\'s sustainability need by converting cotton waste into new garments through colour sorting.',
    role: 'Director, Editor',
    thumbnail: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=700&h=460&fit=crop&auto=format',
  },

  {
    category: 'Films',
    client: 'Wellcome',
    title: 'Mindscapes',
    description:
      'A short event film on the Mindscapes International Summit held in Bengaluru in 2023, celebrating Wellcome\'s international cultural programme aimed at transforming how we understand, address and talk about mental health.',
    role: 'Editor',
    thumbnail: 'https://images.unsplash.com/photo-1527525443983-6e60c75fff46?w=700&h=460&fit=crop&auto=format',
  },
  {
    category: 'Films',
    client: 'Vikalp Sangam',
    title: 'Homes and Hearth',
    description:
      'A short film about how the people of Ladakh, India\'s northern-most territory, have been searching for sustainable alternatives to promote and maintain their unique heritage and livelihoods, well-suited to the region\'s cold desert and mountainous ecosystems.',
    role: 'Associate Director, Co-Editor',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&h=460&fit=crop&auto=format',
  },
  {
    category: 'Films',
    client: 'NABARD',
    title: 'Rising with Rice',
    description:
      'A short film on Mayyil FPO, known for the miracles they have made in rice production. With NABARD\'s support, mechanisation of paddy farming was done, thus improving the crop yields and livelihoods of the farmers.',
    role: 'Director',
    thumbnail: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=700&h=460&fit=crop&auto=format',
  },

  // ── Series ─────────────────────────────────────────────────────────────────
  {
    category: 'Series',
    client: 'MAP, Bengaluru',
    title: 'Museum without Borders',
    description:
      'An ongoing series by the Museum of Art and Photography (MAP), Bengaluru, that juxtaposes an artwork from MAP with an object from a partner museum.',
    role: 'Director',
    thumbnail: 'https://images.unsplash.com/photo-1580894908361-967195033215?w=700&h=460&fit=crop&auto=format',
  },
  {
    category: 'Series',
    client: 'Deccan Heritage Foundation',
    title: 'Origin and Evolution of Temple Architecture in South India',
    description:
      'Interview series with Anirudh Kanisetti, author of the acclaimed Lords of the Deccan, and Architectural Historian and co-founder of the Deccan Heritage Foundation (DHF), George Michell.',
    role: 'Director, Editor',
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&h=460&fit=crop&auto=format',
  },
  {
    category: 'Series',
    client: 'Deccan Heritage Foundation',
    title: 'Exploring the Medieval Metropolis of Vijayanagar',
    description:
      'Interview series with Anirudh Kanisetti and Architectural Historian George Michell exploring the medieval city of Vijayanagar.',
    role: 'Director, Editor',
    thumbnail: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=700&h=460&fit=crop&auto=format',
  },
  {
    category: 'Series',
    client: 'Newsclick',
    title: 'Bharat ek Mauj',
    description:
      'A bi-monthly political satire show with comedian Sanjay Rajoura.',
    role: 'Director',
    thumbnail: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=700&h=460&fit=crop&auto=format',
  },
  {
    category: 'Series',
    client: 'Newsclick',
    title: 'Gau Patrakar',
    description:
      'A 2-part experimental series where the puppet of a cow reporter travels across Uttar Pradesh and Rajasthan to dig into the cow issues plaguing the region.',
    role: 'Director, Editor',
    thumbnail: 'https://images.unsplash.com/photo-1533228100845-08145b01de14?w=700&h=460&fit=crop&auto=format',
  },
  {
    category: 'Series',
    client: 'Popular Education Initiative',
    title: 'History Lecture Series',
    description:
      'History Lecture series for Popular Education Initiative, a platform to enable people of all social backgrounds, genders and ages to educate themselves and think critically about issues of concern in everyday life.',
    role: 'Director',
    thumbnail: 'https://images.unsplash.com/photo-1461360228754-6e81c478b882?w=700&h=460&fit=crop&auto=format',
  },

  // ── News Features ──────────────────────────────────────────────────────────
  {
    category: 'News Features',
    client: 'Newsclick',
    title: 'Mera Bharat Mahan: Sab Hain Sukhi Main Hu Pareshan',
    description:
      'On 26th January 2018, India will "celebrate" its 69th Republic Day. What do the people who live and work around Red Fort know about Republic Day?',
    role: 'Producer, Editor',
    thumbnail: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=700&h=460&fit=crop&auto=format',
  },
  {
    category: 'News Features',
    client: 'Newsclick',
    title: 'New Year\'s Eve at Shaheen Bagh',
    description:
      'The protests at Shaheen Bagh bring in the New Year 2020.',
    role: 'Producer, Cinematography',
    thumbnail: 'https://images.unsplash.com/photo-1591189863430-ab87e120f312?w=700&h=460&fit=crop&auto=format',
  },
  {
    category: 'News Features',
    client: 'Newsclick',
    title: 'University Under Attack: The Fall of GSCASH and the Dangers of ICC',
    description:
      'The Gender Sensitization Committee Against Sexual Harassment (GSCASH) at the Jawaharlal Nehru University was replaced by the Internal Complaints Committee (ICC) in September 2017.',
    role: 'Producer, Editor',
    thumbnail: 'https://images.unsplash.com/photo-1562774053-701939374585?w=700&h=460&fit=crop&auto=format',
  },
  {
    category: 'News Features',
    client: 'Newsclick',
    title: 'AIBOC Diaries: Journey of a Bank Officers\' Union',
    description:
      'A documentary that traces the history of the Bank Officers\' movement in the country.',
    role: 'Director, Editor',
    thumbnail: 'https://images.unsplash.com/photo-1554774853-719586f82d77?w=700&h=460&fit=crop&auto=format',
  },
  {
    category: 'News Features',
    client: 'Newsclick',
    title: 'Chak de Gajoowas: The Hockey Playing Girls of Rajasthan',
    description:
      'In Rajasthan\'s Gajoowas village, girls and boys are proving themselves in hockey.',
    role: 'Editor',
    thumbnail: 'https://images.unsplash.com/photo-1607627000458-210e8d2bdb1d?w=700&h=460&fit=crop&auto=format',
  },
  {
    category: 'News Features',
    client: 'Newsclick',
    title: 'The Dirty War in Kashmir',
    description:
      'Leftword curated a compilation of Shujaat Bukhari\'s reports from May 2017 to his assassination titled \'The Dirty War in Kashmir\'. Excerpts of the book read to archival footage of the valley bring to life the Kashmir that Shujaat writes about in these Frontline reports.',
    role: 'Producer, Editor',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&h=460&fit=crop&auto=format',
  },

  {
    category: 'News Features',
    client: 'Newsclick',
    title: 'From Shaheen Bagh, With Love',
    description: 'At Shaheen Bagh, protestors write messages to the Supreme Court as part of the 100K Postcard Project during the CAA–NRC protests.',
    role: 'Producer, Editor',
    thumbnail: 'https://images.unsplash.com/photo-1591189863430-ab87e120f312?w=700&h=460&fit=crop&auto=format',
  },
  {
    category: 'News Features',
    client: 'Newsclick',
    title: 'Can Biomining Save Delhi from a Garbage Crisis?',
    description: "As Delhi grapples with its growing garbage mountains, bio-mining has emerged as a potential solution. Proven effective in Indore, the question remains: can it work in a mega city that generates waste on an entirely different scale?",
    role: 'Producer, Editor',
    thumbnail: 'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=700&h=460&fit=crop&auto=format',
  },
  {
    category: 'News Features',
    client: 'Newsclick',
    title: 'Real Football in Kashmir: Giving Girls a Chance',
    description: 'Following the first batch of girls from Kashmir as they step onto the competitive football field in a tournament bringing together players from across Jammu and Kashmir.',
    role: 'Editor',
    thumbnail: 'https://images.unsplash.com/photo-1607627000458-210e8d2bdb1d?w=700&h=460&fit=crop&auto=format',
  },

  // ── Music Video ────────────────────────────────────────────────────────────
  {
    category: 'Music Video',
    client: 'Ayachit Pictures',
    title: 'O Nana Chetana by MD Pallavi',
    description: 'Music video with MD Pallavi visualised to the song O Nana Chetana, a poem by Kuvempu.',
    role: 'Production and Camera Associate',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=700&h=460&fit=crop&auto=format',
  },
  {
    category: 'Music Video',
    client: 'Falana Films',
    title: 'Nams by Malli',
    description: 'The cross-continental collaboration between the band Malli and the women-led film and animation studio Falana Films. "Nams" is a celebration of female camaraderie and the enduring power of friendship.',
    role: 'Creative Producer, 1st AD',
    thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=700&h=460&fit=crop&auto=format',
  },
  {
    category: 'Music Video',
    client: 'Newsclick',
    title: 'Bharat ek Mauj Title Song',
    description: 'Opening title song for Bharat Ek Mauj, a bi-monthly political satire show hosted by Sanjay Rajoura.',
    role: 'Director, Editor',
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=700&h=460&fit=crop&auto=format',
  },

  // ── Reels ──────────────────────────────────────────────────────────────────
  {
    category: 'Reels',
    client: 'Falana Films',
    title: 'OffRoad',
    description: "A short independent mockumentary that satirizes Bangalore's perpetual cycle of roadworks and excavation.",
    role: 'Director, Editor',
    thumbnail: 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=700&h=460&fit=crop&auto=format',
  },
  {
    category: 'Reels',
    client: 'The Local',
    title: 'Cheers to Voting',
    description: 'Short reel for The Local celebrating the act of voting during the 2024 Parliamentary Elections.',
    role: 'Editor, Co-director',
    thumbnail: 'https://images.unsplash.com/photo-1587560699334-cc4ff634909a?w=700&h=460&fit=crop&auto=format',
  },
  {
    category: 'Reels',
    client: 'QRave',
    title: 'Flower Tools',
    description: 'Event reel for QRave Flower Tools workshop.',
    role: 'Editor',
    thumbnail: 'https://images.unsplash.com/photo-1490750967868-88df5691cc48?w=700&h=460&fit=crop&auto=format',
  },
  {
    category: 'Reels',
    client: 'Sandbox Collective',
    title: 'Gender Bender 2023',
    description: 'Event reel for Gender Bender 2023, a festival exploring gender through art and culture.',
    role: 'Director, Editor',
    thumbnail: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=700&h=460&fit=crop&auto=format',
  },

  // ── Writing ────────────────────────────────────────────────────────────────
  {
    category: 'Writing',
    client: 'ASAP I art',
    title: 'Foregrounding the Background',
    tags: ['Film & Archives'],
    description: 'Article on the panel "Forgotten Genres, Publics and Practices: The Understated Ecosystem of Indian Cinema" at IFA\'s Past Forward: The Pleasure, Purpose and Practice of Arts Research.',
    role: 'Writer',
    thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=700&h=460&fit=crop&auto=format',
  },
  {
    category: 'Writing',
    client: 'ASAP I art',
    title: 'Modes of Self Reflection',
    tags: ['Film & Archives'],
    description: "Article on filmmaker Avijit Mukul Kishore's talk exploring the history of genre-fluid essay films through the lenses of queerness and visual impairment.",
    role: 'Writer',
    thumbnail: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=700&h=460&fit=crop&auto=format',
  },
  {
    category: 'Writing',
    client: 'ASAP I art',
    title: 'Film as Archive',
    tags: ['Film & Archives'],
    description: 'Written reflection on Ila Aby (To My Father), a documentary that pieces together a visual history of Palestine through family archives, news reports, and the memories of photographers.',
    role: 'Writer',
    thumbnail: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=700&h=460&fit=crop&auto=format',
  },
  {
    category: 'Writing',
    client: 'The Better India',
    title: 'From India to Canada, These 5 Visually Impaired Comedians Have Broken All Kinds of Disability Myths',
    tags: ['Disability'],
    description: 'Feature article on five blind and visually impaired comedians making their mark in the world of stand-up comedy.',
    role: 'Writer',
    thumbnail: 'https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=700&h=460&fit=crop&auto=format',
  },
  {
    category: 'Writing',
    client: 'The Better India',
    title: 'The Inspiring and Astounding Work of Visually Impaired Indian Photographers',
    tags: ['Disability'],
    description: 'Article exploring how blind and visually impaired photographers in India challenge conventional notions of seeing through their photographic practice.',
    role: 'Writer',
    thumbnail: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=700&h=460&fit=crop&auto=format',
  },
  {
    category: 'Writing',
    client: 'Economic & Political Weekly',
    title: 'A Different Beauty',
    tags: ['Disability'],
    description: 'An exploration of how blind and visually impaired photographers create images, challenging conventional ideas of vision and photography.',
    role: 'Writer',
    thumbnail: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=700&h=460&fit=crop&auto=format',
  },

  // ── Exhibitions ────────────────────────────────────────────────────────────
  {
    category: 'Exhibitions',
    client: 'NCBS Archives',
    title: 'Ever Met An Ugly Flower',
    description: "Collaborated on an exhibition titled 'Ever Met an Ugly Flower' at the NCBS archives as part of the team awarded the 2022 Push/Pull Grant.",
    role: 'Video Installation, Film, Curation, Writing, Exhibition Design',
    thumbnail: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=700&h=460&fit=crop&auto=format',
  },
  {
    category: 'Exhibitions',
    client: 'Bangalore International Centre (BIC)',
    title: 'Go with the Flow(ers)',
    description: "Selected for B·LORE 2023, Bangalore International Centre's programme showcasing visual narratives about the city of Bangalore.",
    role: 'Director and Editor',
    thumbnail: 'https://images.unsplash.com/photo-1490750967868-88df5691cc48?w=700&h=460&fit=crop&auto=format',
  },

  // ── Workshops & Teaching ───────────────────────────────────────────────────
  {
    category: 'Workshops & Teaching',
    client: 'BML Munjal University',
    title: 'Cyanotype Workshop',
    description: 'Half-day workshop with undergraduate students on how to make cyanotype prints. The prints produced at the workshop were later turned into a calendar by the university.',
    role: 'Concept, Facilitation',
    thumbnail: '/workshop-cyanotype.jpg',
  },
  {
    category: 'Workshops & Teaching',
    client: 'Museum of Art and Photography (MAP)',
    title: 'Framing the Archives',
    description: 'Conceived and conducted an archives and stop motion/essay film workshop in collaboration with MAP & Falana Films. Also blended Improv to the mix.',
    role: 'Concept, Facilitation',
    thumbnail: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=700&h=460&fit=crop&auto=format',
  },
  {
    category: 'Workshops & Teaching',
    client: 'Srishti School of Art & Design',
    title: 'Mobile Filmmaking Workshop',
    description: 'Mobile Filmmaking workshop for students at Government College, Killar, Himachal Pradesh in collaboration with Srishti Films for UNDP Secure Himalayas Project.',
    role: 'Facilitation',
    thumbnail: '/workshop-himalayas.jpg',
  },

  // ── Improv ─────────────────────────────────────────────────────────────────
  {
    category: 'Improv',
    client: 'Kaivalya Plays',
    title: 'India Improv Ensemble',
    description: 'Selected for India Improv Ensemble Team in 2022, an online Improv group that included members from across the country. The Ensemble had weekly training sessions and performed live on Facebook every week as part of the India Improv Sxene.',
    thumbnail: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=700&h=460&fit=crop&auto=format',
  },
  {
    category: 'Improv',
    client: 'Pranshu Shramali',
    title: 'Improv 101',
    description: 'Completed two beginner level workshops on improvisation and theatre games in 2022 with Theatre/Improv Artist Pranshu Shrimali.',
    thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=700&h=460&fit=crop&auto=format',
  },

  // ── Cyanotypes ─────────────────────────────────────────────────────────────
  // These render as a gallery, not standard project cards.
  {
    category: 'Cyanotypes',
    title: 'Untitled — Window',
    description: 'Cyanotype print.',
    thumbnail: '/cyano-window.jpg',
  },
  {
    category: 'Cyanotypes',
    title: 'Untitled — Grass',
    description: 'Cyanotype print.',
    thumbnail: '/cyano-grass.jpg',
  },
  {
    category: 'Cyanotypes',
    title: 'Untitled — Fern',
    description: 'Cyanotype print.',
    thumbnail: '/cyano-fern.jpg',
  },
  {
    category: 'Cyanotypes',
    title: 'Untitled — Flower',
    description: 'Cyanotype print.',
    thumbnail: '/cyano-flower.jpg',
  },
  {
    category: 'Cyanotypes',
    title: 'Untitled — Hand',
    description: 'Cyanotype print.',
    thumbnail: '/cyano-hand.jpg',
  },
]

const education = [
  {
    degree: 'P.G Certificate in Screenplay Writing',
    year: '2011',
    institution: 'Films and Television Institute of India, Pune',
  },
  {
    degree: 'P.G Diploma in TV and Video Production',
    year: '2009',
    institution: 'Xavier Institute of Communication, Mumbai',
  },
  {
    degree: 'B.A (Hons) Psychology',
    year: '2008',
    institution: 'Jesus and Mary College, Delhi University',
  },
]

// ─── Themes ───────────────────────────────────────────────────────────────────

interface Theme {
  id: 'light' | 'dark' | 'funk'
  label: string
  swatch: string
  bg: string
  surface: string
  muted: string
  text: string
  textMuted: string
  textFaint: string
  border: string
  divider: string
  accent: string
  accentFg: string
  navBg: string
  tagBg: string
  tagText: string
}

const THEMES: Theme[] = [
  {
    id: 'light',
    label: 'Light',
    swatch: '#F8F6F2',
    bg: '#F8F6F2',
    surface: '#FFFFFF',
    muted: '#EDE9E3',
    text: '#1A1714',
    textMuted: '#5C5751',
    textFaint: '#9A948E',
    border: '#E5E0D8',
    divider: '#EDE9E3',
    accent: '#1A1714',
    accentFg: '#F8F6F2',
    navBg: 'rgba(248,246,242,0.92)',
    tagBg: '#E8E3DC',
    tagText: '#6B6560',
  },
  {
    id: 'dark',
    label: 'Dark',
    swatch: '#141210',
    bg: '#141210',
    surface: '#1F1C19',
    muted: '#272420',
    text: '#EDE8E1',
    textMuted: '#8A8078',
    textFaint: '#564E48',
    border: '#2E2A26',
    divider: '#272420',
    accent: '#C9A96E',
    accentFg: '#141210',
    navBg: 'rgba(20,18,16,0.92)',
    tagBg: '#2E2A26',
    tagText: '#8A8078',
  },
]

// ─── Components ───────────────────────────────────────────────────────────────

function ProjectCard({ project, t: tProp }: { project: Project; t: Theme }) {
  const t = tProp ?? THEMES[0]
  const [hovered, setHovered] = useState(false)

  return (
    <article
      className="group flex flex-col overflow-hidden transition-all duration-300"
      style={{
        background: t.surface,
        boxShadow: hovered
          ? `0 8px 32px rgba(0,0,0,${t.id === 'light' ? '0.10' : '0.30'})`
          : `0 1px 4px rgba(0,0,0,${t.id === 'light' ? '0.06' : '0.20'})`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative overflow-hidden aspect-video" style={{ background: t.muted }}>
        {project.thumbnail && (
          <img
            src={project.thumbnail}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="flex flex-col flex-1 p-5 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {project.client && (
            <p className="text-xs font-medium tracking-widest uppercase" style={{ color: t.textFaint }}>
              {project.client}
            </p>
          )}
          {project.tags?.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: t.tagBg, color: t.tagText }}
            >
              {tag}
            </span>
          ))}
        </div>
        <h3
          className="text-lg leading-snug"
          style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 400, color: t.text }}
        >
          {project.title}
        </h3>
        <p className="text-sm leading-relaxed flex-1" style={{ color: t.textMuted }}>
          {project.description}
        </p>
        {project.role && (
          <p
            className="text-xs font-medium pt-2"
            style={{ color: t.textMuted, borderTop: `1px solid ${t.border}` }}
          >
            Role: {project.role}
          </p>
        )}
        {project.year && (
          <p className="text-xs" style={{ color: t.textFaint }}>{project.year}</p>
        )}
      </div>
    </article>
  )
}

function CategoryBar({
  active,
  onChange,
  t: tProp,
}: {
  active: Category
  onChange: (c: Category) => void
  t: Theme
}) {
  const t = tProp ?? THEMES[0]
  const scrollRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const el = activeRef.current
      const container = scrollRef.current
      container.scrollTo({
        left: el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2,
        behavior: 'smooth',
      })
    }
  }, [active])

  return (
    <div
      ref={scrollRef}
      className="flex gap-1 overflow-x-auto pb-0.5"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
    >
      {ALL_CATEGORIES.map((cat) => {
        const isActive = cat === active
        const count = projects.filter(
          (p) => p.category === cat && p.title !== 'Coming Soon'
        ).length
        return (
          <button
            key={cat}
            ref={isActive ? activeRef : undefined}
            onClick={() => onChange(cat)}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap"
            style={{
              background: isActive ? t.accent : 'transparent',
              color: isActive ? t.accentFg : t.textFaint,
              border: isActive ? `1px solid ${t.accent}` : `1px solid transparent`,
            }}
          >
            {cat}
            {count > 0 && (
              <span
                className="text-xs px-1.5 py-0.5 rounded-full"
                style={{
                  background: isActive ? 'rgba(255,255,255,0.2)' : t.tagBg,
                  color: isActive ? t.accentFg : t.tagText,
                }}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

function ThemeSwitcher({ current, onChange }: { current: Theme; onChange: (t: Theme) => void }) {
  return (
    <div className="flex items-center gap-2">
      {THEMES.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t)}
          title={t.label}
          className="relative transition-transform duration-150 hover:scale-110"
          style={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: t.swatch,
            border: current.id === t.id
              ? `2px solid ${current.accent}`
              : `2px solid ${current.border}`,
            boxShadow: current.id === t.id ? `0 0 0 2px ${current.bg}` : 'none',
          }}
          aria-label={`Switch to ${t.label} theme`}
        />
      ))}
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<Category>('Films')
  const [writingFilter, setWritingFilter] = useState<string | null>(null)
  const [theme, setTheme] = useState<Theme>(() => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches
    if (isMobile) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      return prefersDark ? THEMES[1] : THEMES[0]
    }
    return THEMES[1] // dark by default on desktop
  })

  const filtered = projects.filter((p) => {
    if (p.category !== activeCategory) return false
    if (activeCategory === 'Writing' && writingFilter) return p.tags?.includes(writingFilter)
    return true
  })
  const hasReal = filtered.some((p) => p.title !== 'Coming Soon')

  const t = theme

  return (
    <div
      className="min-h-screen transition-colors duration-500"
      style={{ background: t.bg, color: t.text }}
    >
      {/* Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-colors duration-500"
        style={{ background: t.navBg, borderBottom: `1px solid ${t.border}`, backdropFilter: 'blur(8px)' }}
      >
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
          <a
            href="#"
            className="text-sm font-medium shrink-0"
            style={{ letterSpacing: '0.12em', textTransform: 'uppercase', color: t.text }}
          >
            Anoushka Mathews
          </a>

          {/* Desktop links + switcher */}
          <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: t.textMuted }}>
            <a href="#work" className="transition-colors" style={{ color: t.textMuted }}>Work</a>
            <a href="#about" className="transition-colors hover:opacity-100" style={{ color: t.textMuted }}>About</a>
            <a href="#contact" className="transition-colors" style={{ color: t.textMuted }}>Contact</a>
            <ThemeSwitcher current={t} onChange={setTheme} />
          </div>

          {/* Mobile: switcher + hamburger */}
          <div className="md:hidden flex items-center gap-3">
            <ThemeSwitcher current={t} onChange={setTheme} />
            <button
              className="p-1 transition-colors"
              style={{ color: t.textMuted }}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                {menuOpen ? (
                  <path d="M4 4l14 14M18 4L4 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                ) : (
                  <>
                    <line x1="3" y1="7" x2="19" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="3" y1="13" x2="19" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div
            className="md:hidden px-6 py-4 flex flex-col gap-4 text-sm"
            style={{ borderTop: `1px solid ${t.border}`, background: t.surface, color: t.textMuted }}
          >
            <a href="#work" onClick={() => setMenuOpen(false)}>Work</a>
            <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
            <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-14">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 min-h-[88vh] items-center gap-12 py-20">
          <div className="flex flex-col gap-6 order-2 md:order-1">
            <p className="text-xs font-medium tracking-widest uppercase" style={{ color: t.textFaint }}>
              Filmmaker · Writer · Cyanotype Artist
            </p>
            <h1
              className="text-6xl sm:text-7xl lg:text-8xl leading-none"
              style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 300, color: t.text }}
            >
              Anoushka
              <br />
              <span style={{ fontStyle: 'italic' }}>Mathews</span>
            </h1>
            <p className="text-lg leading-relaxed max-w-sm" style={{ color: t.textMuted }}>
              Bangalore-based documentary filmmaker with 12 years of directing, writing, and teaching across India.
            </p>
            <div className="flex gap-4 pt-2">
              <a
                href="#work"
                className="px-6 py-3 text-sm font-medium transition-colors"
                style={{ background: t.accent, color: t.accentFg }}
              >
                View Work
              </a>
              <a
                href="#contact"
                className="px-6 py-3 text-sm font-medium transition-colors"
                style={{ color: t.textMuted, border: `1px solid ${t.border}` }}
              >
                Get in Touch
              </a>
            </div>
          </div>
          <div className="order-1 md:order-2 flex justify-center md:justify-end">
            <div
              className="relative overflow-hidden"
              style={{ width: 'min(420px, 100%)', aspectRatio: '3/4' }}
            >
              <img
                src="/anoushka-portrait.jpg"
                alt="Anoushka Mathews"
                className="w-full h-full object-cover"
              />
              {t.id === 'dark' && (
                <div className="absolute inset-0 mix-blend-multiply" style={{ background: 'rgba(20,18,16,0.15)' }} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Selected Work */}
      <section id="work" className="py-24" style={{ borderTop: `1px solid ${t.border}` }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-10">
            <p className="text-xs font-medium tracking-widest uppercase mb-3" style={{ color: t.textFaint }}>
              Selected Work
            </p>
            <h2
              className="text-4xl sm:text-5xl"
              style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 300, color: t.text }}
            >
              Portfolio
            </h2>
          </div>

          {/* Category filter */}
          <div className="mb-10 pb-0" style={{ borderBottom: `1px solid ${t.border}` }}>
            <CategoryBar active={activeCategory} onChange={(c) => { setActiveCategory(c); setWritingFilter(null) }} t={t} />
          </div>

          {/* Writing sub-filter */}
          {activeCategory === 'Writing' && (
            <div className="flex gap-2 mb-8">
              {[null, 'Film & Archives', 'Disability'].map((tag) => (
                <button
                  key={String(tag)}
                  onClick={() => setWritingFilter(tag)}
                  className="px-4 py-1.5 text-xs font-medium transition-all duration-150 rounded-full"
                  style={{
                    background: writingFilter === tag ? t.accent : t.muted,
                    color: writingFilter === tag ? t.accentFg : t.textMuted,
                  }}
                >
                  {tag ?? 'All'}
                </button>
              ))}
            </div>
          )}

          {/* Cyanotypes gallery */}
          {activeCategory === 'Cyanotypes' && hasReal ? (
            <div>
              <p className="text-sm mb-8 max-w-lg" style={{ color: t.textFaint }}>
                Samples of original cyanotype prints — a photographic process using UV light and iron-based chemistry to produce Prussian blue images on paper.
              </p>
              <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
                {filtered.map((p) => (
                  <div key={p.title} className="break-inside-avoid overflow-hidden group" style={{ background: t.muted }}>
                    <img
                      src={p.thumbnail}
                      alt={p.title}
                      className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </div>

          ) : hasReal ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered
                .filter((p) => p.title !== 'Coming Soon')
                .map((p) => (
                  <ProjectCard key={p.title + p.client} project={p} t={t} />
                ))}
            </div>

          ) : (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
              <p
                className="text-3xl"
                style={{ fontFamily: 'Fraunces, Georgia, serif', fontStyle: 'italic', color: t.textFaint }}
              >
                Coming soon
              </p>
              <p className="text-sm max-w-xs" style={{ color: t.textFaint }}>
                {activeCategory} work will be added here shortly.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24" style={{ borderTop: `1px solid ${t.border}` }}>
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-[220px_1fr] gap-12 lg:gap-20">
          <div>
            <h2 className="text-xs font-medium tracking-widest uppercase" style={{ color: t.textFaint }}>About</h2>
          </div>
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-4">
              <p className="text-xl leading-relaxed" style={{ color: t.textMuted }}>
                Anoushka Mathews is a Bangalore-based filmmaker, writer, and cyanotype artist who has grown up across the country.
              </p>
              <p className="leading-relaxed" style={{ color: t.textMuted }}>
                Over the past 12 years, she has directed and edited both short and feature-length documentaries, and non-fiction films for multiple organisations and institutions.
              </p>
              <p className="leading-relaxed" style={{ color: t.textMuted }}>
                She has also written for multiple print and online publications, and has taught, mentored, and facilitated workshops for diverse audiences.
              </p>
            </div>

            <div className="pt-10" style={{ borderTop: `1px solid ${t.border}` }}>
              <h3 className="text-xs font-medium tracking-widest uppercase mb-6" style={{ color: t.textFaint }}>Education</h3>
              <div className="flex flex-col">
                {education.map((edu) => (
                  <div
                    key={edu.degree}
                    className="py-5 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1"
                    style={{ borderBottom: `1px solid ${t.divider}` }}
                  >
                    <div>
                      <p className="text-sm" style={{ color: t.textMuted }}>{edu.degree}</p>
                      <p className="text-sm font-medium mt-0.5" style={{ color: t.text }}>{edu.institution}</p>
                    </div>
                    <span className="text-xs shrink-0" style={{ color: t.textFaint }}>{edu.year}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24" style={{ borderTop: `1px solid ${t.border}` }}>
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-[220px_1fr] gap-12 lg:gap-20">
          <div>
            <h2 className="text-xs font-medium tracking-widest uppercase" style={{ color: t.textFaint }}>Contact</h2>
          </div>
          <div className="flex flex-col gap-8">
            <p
              className="text-3xl sm:text-4xl leading-snug"
              style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 300, color: t.text }}
            >
              Let's work
              <br />
              <span style={{ fontStyle: 'italic' }}>together.</span>
            </p>
            <div className="flex flex-col">
              {[
                { label: 'Phone', value: '+91-7042845737', href: 'tel:+917042845737' },
                { label: 'Email', value: 'anoushka.mathews@gmail.com', href: 'mailto:anoushka.mathews@gmail.com' },
                { label: 'Instagram', value: '@punoushka', href: 'https://instagram.com/punoushka' },
              ].map(({ label, value, href }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="group flex items-center gap-4 py-4 transition-colors"
                  style={{ borderBottom: `1px solid ${t.border}` }}
                >
                  <span
                    className="text-xs font-medium tracking-widest uppercase w-20 shrink-0"
                    style={{ color: t.textFaint }}
                  >
                    {label}
                  </span>
                  <span className="text-sm transition-colors" style={{ color: t.textMuted }}>
                    {value}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8" style={{ borderTop: `1px solid ${t.border}` }}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-xs" style={{ color: t.textFaint }}>© 2024 Anoushka Mathews</p>
          <p className="text-xs" style={{ color: t.textFaint }}>Filmmaker · Writer · Cyanotype Artist · Bangalore</p>
        </div>
      </footer>
    </div>
  )
}
