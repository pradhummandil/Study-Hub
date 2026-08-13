export interface ActualPinterestAsset {
  pinNumber: number;
  pinId: string;
  pinUrl: string;
  mediaUrl: string;
  localPath: string;
  posterPath?: string;
  type: 'image' | 'video';
  aspectRatio: string;
  description: string;
  intendedPage: string;
  intendedSection: string;
  reusable: boolean;
  notes: string;
}

export const ACTUAL_PINTEREST_ASSETS: Record<string, ActualPinterestAsset> = {
  pin01: {
    pinNumber: 1,
    pinId: '322359285828940269',
    pinUrl: 'https://in.pinterest.com/pin/322359285828940269/',
    mediaUrl: 'https://i.pinimg.com/originals/6f/04/0a/6f040a055d1291f97e371f0c62f24fad.jpg',
    localPath: '/assets/pinterest/actual-pin-322359285828940269.webp',
    type: 'image',
    aspectRatio: '750:938 (4:5)',
    description: 'Man pressing play/pause/rewind buttons inside exposed brain projecting memories.',
    intendedPage: 'Revision / Active Recall',
    intendedSection: 'Spaced Memory Recall & Active Flashcard Engine',
    reusable: true,
    notes: 'Actual visual from Pinterest pin 322359285828940269.'
  },
  pin02: {
    pinNumber: 2,
    pinId: '975521969305585422',
    pinUrl: 'https://in.pinterest.com/pin/975521969305585422/',
    mediaUrl: 'https://v1.pinimg.com/videos/iht/expMp4/22/25/98/222598c9c05e373177a0ff79899b8d10_720w.mp4',
    localPath: '/assets/pinterest/actual-pin-975521969305585422.mp4',
    posterPath: '/assets/pinterest/actual-pin-975521969305585422-poster.webp',
    type: 'video',
    aspectRatio: '1080:1920 (9:16)',
    description: 'Students at night staring into glowing smartphone screens with notification badges floating.',
    intendedPage: 'Focus Room',
    intendedSection: 'Distraction Shield & Digital Wellbeing',
    reusable: true,
    notes: 'Actual video from Pinterest pin 975521969305585422.'
  },
  pin03: {
    pinNumber: 3,
    pinId: '203858320627823184',
    pinUrl: 'https://in.pinterest.com/pin/203858320627823184/',
    mediaUrl: 'https://i.pinimg.com/originals/0f/21/ce/0f21ce07db9d00889d3de2a042a78e0b.jpg',
    localPath: '/assets/pinterest/actual-pin-203858320627823184.webp',
    type: 'image',
    aspectRatio: '1168:1752 (2:3)',
    description: 'Human profile silhouette filled with bookshelves, librarian reaching for golden book on ladder.',
    intendedPage: 'Studio / Resource Hub',
    intendedSection: 'Smart Resource Library & Knowledge Search',
    reusable: true,
    notes: 'Actual visual from Pinterest pin 203858320627823184.'
  },
  pin04: {
    pinNumber: 4,
    pinId: '998743654885257487',
    pinUrl: 'https://in.pinterest.com/pin/998743654885257487/',
    mediaUrl: 'https://v1.pinimg.com/videos/iht/expMp4/05/96/27/0596277055e4df2999073956111675ec_720w.mp4',
    localPath: '/assets/pinterest/actual-pin-998743654885257487.mp4',
    posterPath: '/assets/pinterest/actual-pin-998743654885257487-poster.webp',
    type: 'video',
    aspectRatio: '1080:1920 (9:16)',
    description: 'Stick figure sweating at desk cluttered with papers, laptop, coffee, and ticking clock.',
    intendedPage: 'Exam Simulator',
    intendedSection: 'Pre-Exam Stress to Exam Readiness Unit',
    reusable: true,
    notes: 'Actual video from Pinterest pin 998743654885257487.'
  },
  pin05: {
    pinNumber: 5,
    pinId: '1127025875509575308',
    pinUrl: 'https://in.pinterest.com/pin/1127025875509575308/',
    mediaUrl: 'https://v1.pinimg.com/videos/iht/expMp4/3d/71/3f/3d713fff756fcc403112708f7d81b47e_720w.mp4',
    localPath: '/assets/pinterest/actual-pin-1127025875509575308.mp4',
    posterPath: '/assets/pinterest/actual-pin-1127025875509575308-poster.webp',
    type: 'video',
    aspectRatio: '1080:1920 (9:16)',
    description: 'Stick figure looking up terrified at a giant collapsing stack of heavy textbooks.',
    intendedPage: 'Roadmap',
    intendedSection: 'Overcoming Unstructured Syllabus Mountain',
    reusable: true,
    notes: 'Actual video from Pinterest pin 1127025875509575308.'
  },
  pin06: {
    pinNumber: 6,
    pinId: '574771971205186318',
    pinUrl: 'https://in.pinterest.com/pin/574771971205186318/',
    mediaUrl: 'https://v1.pinimg.com/videos/mc/720p/90/23/7f/90237fc22aad8c1851323ea481e20ba4.mp4',
    localPath: '/assets/pinterest/actual-pin-574771971205186318.mp4',
    posterPath: '/assets/pinterest/actual-pin-574771971205186318-poster.webp',
    type: 'video',
    aspectRatio: '1080:1920 (9:16)',
    description: 'Vector girl with white round glasses peeking over an open mustard-yellow book.',
    intendedPage: 'Practice / PYQ',
    intendedSection: 'Deep Practice & Topic Reading Breakdown',
    reusable: true,
    notes: 'Actual video from Pinterest pin 574771971205186318.'
  },
  pin07: {
    pinNumber: 7,
    pinId: '682858362229488216',
    pinUrl: 'https://in.pinterest.com/pin/682858362229488216/',
    mediaUrl: 'https://v1.pinimg.com/videos/720p/1f/e0/47/1fe04759389dcb9a3414d34cf7258713.mp4',
    localPath: '/assets/pinterest/actual-pin-682858362229488216.mp4',
    posterPath: '/assets/pinterest/actual-pin-682858362229488216-poster.webp',
    type: 'video',
    aspectRatio: '640:640 (1:1)',
    description: 'Girl typing on laptop while riding a yellow skateboard fast with coffee cup.',
    intendedPage: 'Homepage Hero / Flashcards',
    intendedSection: 'High-speed Active Learning & Rapid Flashcards',
    reusable: true,
    notes: 'Actual video from Pinterest pin 682858362229488216.'
  },
  pin08: {
    pinNumber: 8,
    pinId: '1041387113816400123',
    pinUrl: 'https://in.pinterest.com/pin/1041387113816400123/',
    mediaUrl: 'https://v1.pinimg.com/videos/mc/720p/2e/ee/16/2eee16bd0f24dc0a26d643547a02341d.mp4',
    localPath: '/assets/pinterest/actual-pin-1041387113816400123.mp4',
    posterPath: '/assets/pinterest/actual-pin-1041387113816400123-poster.webp',
    type: 'video',
    aspectRatio: '1080:1920 (9:16)',
    description: 'Person juggling multiple floating digital media elements (magnifying eye, screens, mobile).',
    intendedPage: 'Homepage / Ecosystem Overview',
    intendedSection: 'All-In-One Study Ecosystem',
    reusable: true,
    notes: 'Actual video from Pinterest pin 1041387113816400123.'
  },
  pin09: {
    pinNumber: 9,
    pinId: '53972895522938608',
    pinUrl: 'https://in.pinterest.com/pin/53972895522938608/',
    mediaUrl: 'https://v1.pinimg.com/videos/iht/720p/1d/bb/41/1dbb415b03689b0a379792cdb6bb64f3.mp4',
    localPath: '/assets/pinterest/actual-pin-53972895522938608.mp4',
    posterPath: '/assets/pinterest/actual-pin-53972895522938608-poster.webp',
    type: 'video',
    aspectRatio: '480:480 (1:1)',
    description: 'Student reclining back in office chair typing at computer desk with feet up.',
    intendedPage: 'Community',
    intendedSection: 'Virtual Study Rooms & Peer Study Lounge',
    reusable: true,
    notes: 'Actual video from Pinterest pin 53972895522938608.'
  },
  pin10: {
    pinNumber: 10,
    pinId: '909656824725158872',
    pinUrl: 'https://in.pinterest.com/pin/909656824725158872/',
    mediaUrl: 'https://v1.pinimg.com/videos/mc/720p/06/28/98/062898ffea43f411ca21bf826ad11437.mp4',
    localPath: '/assets/pinterest/actual-pin-909656824725158872.mp4',
    posterPath: '/assets/pinterest/actual-pin-909656824725158872-poster.webp',
    type: 'video',
    aspectRatio: '1440:1440 (1:1)',
    description: 'Hand clicking/scrolling mouse on yellow mousepad against blue background.',
    intendedPage: 'Homepage Interactive Product Demo',
    intendedSection: 'Interactive One-Click Feature Launch',
    reusable: true,
    notes: 'Actual video from Pinterest pin 909656824725158872.'
  },
  pin11: {
    pinNumber: 11,
    pinId: '526991593908723703',
    pinUrl: 'https://in.pinterest.com/pin/526991593908723703/',
    mediaUrl: 'https://i.pinimg.com/originals/4b/2b/07/4b2b073f439fe78b30e64c5a837d4aea.png',
    localPath: '/assets/pinterest/actual-pin-526991593908723703.webp',
    type: 'image',
    aspectRatio: '1000:1120 (8:9)',
    description: 'Narrative story artwork "WHAT ARE YOU GOING TO BE WHEN YOU GROW UP?" showing drawing with pencils & dreams.',
    intendedPage: 'About / Founder Story',
    intendedSection: 'Student Future Vision & Founder Story',
    reusable: true,
    notes: 'Actual visual from Pinterest pin 526991593908723703.'
  }
};
