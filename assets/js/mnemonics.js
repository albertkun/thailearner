// Built-in memory hooks, keyed by item id.
//
// Each entry is a short "picture" that ties the SHAPE you are drawing to the NAME
// and SOUND of the letter. They are deliberately silly — silly sticks.
// The user can add their own note per item on top of this (see Store.getTip).
//
// Thai letters are written in (mostly) one continuous stroke: if the letter has a
// head — the little loop — you start there and the loop tells you which way to go.
// That general rule is shown alongside these, so entries here stay about meaning.

const MNEMONICS = {
  // ---- consonants ----
  'c-ko-kai':      'A chicken (ไก่) facing left: flat back, and the tail flicking up on the right. "K" for chicken-Kai.',
  'c-kho-khai':    'ข is ก wearing an egg (ไข่) — the little loop at the top left is the egg it just laid.',
  'c-kho-khuat':   'The obsolete bottle: ข with a dent in its back, like a bottle you can grip. You will almost never write it.',
  'c-kho-khwai':   'Buffalo horns curving up out of its head. Same "kh" as ข, but low class — the buffalo is the heavy, low one.',
  'c-kho-khon':    'Obsolete "person": ค with a straight back, standing up like a person. Retired from the alphabet.',
  'c-kho-rakhang': 'A bell (ระฆัง) with an extra swing on the right — it just got rung and is still wobbling.',
  'c-ngo-ngu':     'A snake (งู): the body loops around and the tail slides off to the right. Say "ng" like the end of "sing".',
  'c-cho-chan':    'A plate (จาน) resting on a stand — the curve is the plate, the tail is the pedestal.',
  'c-cho-ching':   'Two small cymbals (ฉิ่ง) clapping: the little loop is one, the big curve the other. High class = high ching sound.',
  'c-cho-chang':   'An elephant (ช้าง) — the tall final stroke on the right is its raised trunk.',
  'c-so-so':       'A chain (โซ่): same body as ช but the trunk has been bent over into a hook — a link hanging.',
  'c-cho-choe':    'A tree (เฌอ) — ช with an extra branch. Rare: mostly in old/Khmer-derived words.',
  'c-yo-ying':     'A woman (หญิง) in a long skirt — the ruffle hanging below the line is the hem.',
  'c-do-chada':    'A dancer\'s headdress (ชฎา): tall and ornate, pointing up like a temple spire.',
  'c-to-patak':    'A goad/spear (ปฏัก): like ฎ but the bottom tail is straight — a spear has a straight point.',
  'c-tho-than':    'A pedestal (ฐาน) — wide, flat and stable at the bottom, exactly what a pedestal must be.',
  'c-tho-montho':  'Montho, the queen: ฑ has a rounded, regal wave — a lady with elaborate hair.',
  'c-tho-phuthao': 'An elder (ผู้เฒ่า): ฒ is ฑ hunched forward with a walking stick sticking up.',
  'c-no-nen':      'A novice monk (เณร) — ณ has the same little "n" body as น, but dressed up in robes (extra curls).',
  'c-do-dek':      'A child (เด็ก) — ด is small and round, and the loop is the kid\'s head. Pairs with ต.',
  'c-to-tao':      'A turtle (เต่า) — ต is ด with a head poking out of the shell on the right.',
  'c-tho-thung':   'A sack (ถุง) — ถ is a bag with the top folded over, tied shut on the left.',
  'c-tho-thahan':  'A soldier (ทหาร) standing at attention — ท has straight shoulders and a flat cap.',
  'c-tho-thong':   'A flag (ธง) — ธ is ท with a pole and pennant flying off the top.',
  'c-no-nu':       'A mouse (หนู) — น is a little creature with a curly tail on the right.',
  'c-bo-baimai':   'A leaf (ใบไม้) — บ is an open cup/leaf. Nothing on top: "B" is Bare.',
  'c-po-pla':      'A fish (ปลา) — ป is บ with a fishing rod sticking up on the right. B → P: add the rod.',
  'c-pho-phueng':  'A bee (ผึ้ง) — ผ is ป with the stinger bent back over its head. Aspirated "ph", like a puff.',
  'c-fo-fa':       'A lid (ฝา) — ฝ is ผ with a handle on the left so you can lift the lid.',
  'c-pho-phan':    'A tray/phan (พาน) — พ is ผ with a third prong: a tray holding offerings.',
  'c-fo-fan':      'Teeth (ฟัน) — ฟ is พ with an extra tooth on the left. Count the teeth: ฝ then ฟ.',
  'c-pho-samphao': 'A sailboat (สำเภา) — ภ has a sail on the left and the hull curving underneath.',
  'c-mo-ma':       'A horse (ม้า) — ม is a horse\'s head with a loop for the eye and a mane trailing right.',
  'c-yo-yak':      'A giant/yak (ยักษ์) — ย is tall with a big open mouth on the right.',
  'c-ro-ruea':     'A boat (เรือ) — ร is a mast with the hull curving away. Rolled "r", often said as "l" in speech.',
  'c-lo-ling':     'A monkey (ลิง) — ล is ร with its tail curled over the top: a monkey hanging by its tail.',
  'c-wo-waen':     'A ring (แหวน) — ว is one clean open loop, the shape of a ring you slide on.',
  'c-so-sala':     'A pavilion (ศาลา) — ศ has a roof line on top; a shelter to sit under.',
  'c-so-ruesi':    'A hermit (ฤๅษี) — ษ is ศ with a hook: the hermit\'s hunched back in the forest.',
  'c-so-suea':     'A tiger (เสือ) — ส is the everyday "s". If you have to guess an "s", guess ส.',
  'c-ho-hip':      'A chest/box (หีบ) — ห is a box with the lid propped open on the right. Also the silent "h" that makes a low letter follow high-class tone rules.',
  'c-lo-chula':    'A kite (จุฬา) — ฬ is a star-kite with a long tail streaming down. Rare; ล does the everyday work.',
  'c-o-ang':       'A basin (อ่าง) — อ is an empty bowl. It is the silent carrier: a vowel needs a consonant to sit on, and อ volunteers.',
  'c-ho-nokhuk':   'An owl (นกฮูก) — ฮ is ห with an eyebrow: the owl\'s brow. Low-class twin of ห.',

  // ---- vowels ----
  'v-a':        'ะ is two dots after the letter — a full stop that cuts the "a" short. Short vowel, written AFTER.',
  'v-aa':       'า is a long pole after the letter — long pole, long "aa".',
  'v-i':        'ิ is a small flag ABOVE, leaning right — short "i" as in "sit".',
  'v-ii':       'ี is the same flag with a longer tail: one extra tick = one longer sound, "ee".',
  'v-ue':       'ึ is the "i" flag with a tiny loop on top — a strangled short "ue". Purse your lips into "oo" but say "ee".',
  'v-uue':      'ื is ึ stretched, and usually gets an อ after it — long "ue".',
  'v-u':        'ุ hangs BELOW the letter, pointing down — "u" as in "put". Down = "u".',
  'v-uu':       'ู is ุ with a second tail below: longer tail, longer "oo".',
  'v-e':        'เ goes BEFORE the letter (you say the consonant first anyway). One เ = "e" as in "may".',
  'v-ae':       'แ is two เ side by side — two strokes stretch the sound wider into "ae".',
  'v-o':        'โ is a pole with a hook, written BEFORE — round "o" as in "go". The hook is the round mouth.',
  'v-oe':       'เ◌อ = "e" in front plus the basin อ behind: the "er" in "her".',
  'v-ai-maimuan':  'ใ has the curl "rolled up" (ม้วน = rolled). Only ~20 words use it — learn them as a list.',
  'v-ai-maimalai': 'ไ is the flat/plain one (มลาย). If it is "ai" and you are unsure, it is almost always this one.',
  'v-am':       'ำ is a circle plus า: the circle is the "m" humming at the end — "am".',
  'v-ao':       'เ◌า = "e" in front plus า behind, and together they say "ao" like "cow".',

  // ---- tone marks ----
  't-mai-ek':       'ไม้เอก is one simple stroke — mark #1. Count the strokes to remember the number.',
  't-mai-tho':      'ไม้โท looks like a little "2" lying down — mark #2.',
  't-mai-tri':      'ไม้ตรี is a "3"-ish squiggle with three peaks — mark #3.',
  't-mai-chattawa': 'ไม้จัตวา is a tiny "+" — the 4th mark, and the plus lifts your voice up (rising).',
  't-thanthakhat':  'ทัณฑฆาต is the killer: it sits on a letter and murders its sound. Common in loanwords like ยักษ์.',

  // ---- starter words ----
  'w-sawatdee': 'สวัสดี = ส + ว + ั + ส + ด + ี. Two ส wrap the word, like two hands in a wai.',
  'w-khopkhun': 'ขอบคุณ — ขอบ ("edge") + คุณ ("you"). Thanking you to the very edge.',
  'w-chai':     'ใช่ uses the RARE ใ (mai muan) — "yes" is special enough to earn the rare vowel.',
  'w-mai':      'ไม่ uses the common ไ, with ไม้เอก on top. ไม่ (no) vs ใช่ (yes): different ai, opposite answers.',
  'w-nam':      'น้ำ — the ำ hums the "m", ไม้โท makes it high. Tiny word, whole glass of water.',
  'w-ahan':     'อาหาร starts with the empty basin อ and ends with ร — an empty bowl waiting for food.',
  'w-maew':     'แมว literally sounds like a cat: "mɛɛw" = meow. The word IS the noise.',
  'w-maa':      'หมา — the silent ห in front is a tone-lifter, not a sound. Say "mǎa", rising, like calling a dog.',
  'w-baan':     'บ้าน — บ is the open leaf/cup: a home is a cup that holds you.',
  'w-rak':      'รัก = boat ร + ั + chicken ก. Short and sharp, high tone: "rák".',
  'w-aroi':     'อร่อย — อ starts and อ appears again inside; the basin keeps coming back for more food.',
  'w-sabai':    'สบาย = tiger ส + leaf บ + า + ย. Relaxed word, relaxed open sound: "sà-baai".'
};

// The universal stroke rule, shown as the "how to draw it" line.
const STROKE_TIPS = {
  consonant: 'Find the head — the little loop. Start your pen there and draw in ONE continuous stroke, letting the loop tell you which way to curl. No head? Start at the top-left. Ascenders and descenders go last.',
  vowel:     'Draw the consonant first, then place the vowel around it: ◌ marks where the consonant goes. Marks above/below are small — keep them clearly smaller than the letter.',
  tone:      'Tone marks sit ABOVE the consonant (above any upper vowel too). Keep them small and to the right of centre.',
  word:      'Write left to right, but say it in sound order: a leading เ แ โ ใ ไ is written first and pronounced after the consonant.',
  myword:    'Write left to right, but say it in sound order: a leading เ แ โ ใ ไ is written first and pronounced after the consonant.'
};

window.Mnemonics = {
  get(id) { return MNEMONICS[id] || null; },
  strokeTip(category) { return STROKE_TIPS[category] || STROKE_TIPS.word; }
};
