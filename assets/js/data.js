// Thai learning dataset.
// Every item has a stable `id` so progress can be tracked across sessions.
// `class` for consonants is the tone class (low/mid/high) which affects tone rules.
// Vowels/tones use ◌ (U+25CC dotted circle) to show placement around a base consonant.

const DOTTED = '◌';

const CONSONANTS = [
  { id: 'c-ko-kai',        char: 'ก', name: 'ko kai',        thaiName: 'ก ไก่',      meaning: 'chicken',        initial: 'k',  final: 'k',  class: 'mid'  },
  { id: 'c-kho-khai',      char: 'ข', name: 'kho khai',      thaiName: 'ข ไข่',      meaning: 'egg',            initial: 'kh', final: 'k',  class: 'high' },
  { id: 'c-kho-khuat',     char: 'ฃ', name: 'kho khuat',     thaiName: 'ฃ ขวด',     meaning: 'bottle (obsolete)', initial: 'kh', final: 'k', class: 'high', rare: true },
  { id: 'c-kho-khwai',     char: 'ค', name: 'kho khwai',     thaiName: 'ค ควาย',    meaning: 'buffalo',        initial: 'kh', final: 'k',  class: 'low'  },
  { id: 'c-kho-khon',      char: 'ฅ', name: 'kho khon',      thaiName: 'ฅ คน',       meaning: 'person (obsolete)', initial: 'kh', final: 'k', class: 'low', rare: true },
  { id: 'c-kho-rakhang',   char: 'ฆ', name: 'kho ra-khang',  thaiName: 'ฆ ระฆัง',   meaning: 'bell',           initial: 'kh', final: 'k',  class: 'low'  },
  { id: 'c-ngo-ngu',       char: 'ง', name: 'ngo ngu',       thaiName: 'ง งู',       meaning: 'snake',          initial: 'ng', final: 'ng', class: 'low'  },
  { id: 'c-cho-chan',      char: 'จ', name: 'cho chan',      thaiName: 'จ จาน',     meaning: 'plate',          initial: 'ch', final: 't',  class: 'mid'  },
  { id: 'c-cho-ching',     char: 'ฉ', name: 'cho ching',     thaiName: 'ฉ ฉิ่ง',     meaning: 'cymbals',        initial: 'ch', final: '-',  class: 'high' },
  { id: 'c-cho-chang',     char: 'ช', name: 'cho chang',     thaiName: 'ช ช้าง',    meaning: 'elephant',       initial: 'ch', final: 't',  class: 'low'  },
  { id: 'c-so-so',         char: 'ซ', name: 'so so',         thaiName: 'ซ โซ่',      meaning: 'chain',          initial: 's',  final: 't',  class: 'low'  },
  { id: 'c-cho-choe',      char: 'ฌ', name: 'cho choe',      thaiName: 'ฌ เฌอ',     meaning: 'tree',           initial: 'ch', final: '-',  class: 'low'  },
  { id: 'c-yo-ying',       char: 'ญ', name: 'yo ying',       thaiName: 'ญ หญิง',    meaning: 'woman',          initial: 'y',  final: 'n',  class: 'low'  },
  { id: 'c-do-chada',      char: 'ฎ', name: 'do cha-da',     thaiName: 'ฎ ชฎา',     meaning: 'headdress',      initial: 'd',  final: 't',  class: 'mid'  },
  { id: 'c-to-patak',      char: 'ฏ', name: 'to pa-tak',     thaiName: 'ฏ ปฏัก',    meaning: 'goad / spear',   initial: 't',  final: 't',  class: 'mid'  },
  { id: 'c-tho-than',      char: 'ฐ', name: 'tho than',      thaiName: 'ฐ ฐาน',     meaning: 'pedestal',       initial: 'th', final: 't',  class: 'high' },
  { id: 'c-tho-montho',    char: 'ฑ', name: 'tho montho',    thaiName: 'ฑ มณโฑ',    meaning: 'Montho (character)', initial: 'th', final: 't', class: 'low' },
  { id: 'c-tho-phuthao',   char: 'ฒ', name: 'tho phu-thao',  thaiName: 'ฒ ผู้เฒ่า',  meaning: 'elder',          initial: 'th', final: 't',  class: 'low'  },
  { id: 'c-no-nen',        char: 'ณ', name: 'no nen',        thaiName: 'ณ เณร',     meaning: 'novice monk',    initial: 'n',  final: 'n',  class: 'low'  },
  { id: 'c-do-dek',        char: 'ด', name: 'do dek',        thaiName: 'ด เด็ก',    meaning: 'child',          initial: 'd',  final: 't',  class: 'mid'  },
  { id: 'c-to-tao',        char: 'ต', name: 'to tao',        thaiName: 'ต เต่า',    meaning: 'turtle',         initial: 't',  final: 't',  class: 'mid'  },
  { id: 'c-tho-thung',     char: 'ถ', name: 'tho thung',     thaiName: 'ถ ถุง',     meaning: 'sack',           initial: 'th', final: 't',  class: 'high' },
  { id: 'c-tho-thahan',    char: 'ท', name: 'tho thahan',    thaiName: 'ท ทหาร',    meaning: 'soldier',        initial: 'th', final: 't',  class: 'low'  },
  { id: 'c-tho-thong',     char: 'ธ', name: 'tho thong',     thaiName: 'ธ ธง',       meaning: 'flag',           initial: 'th', final: 't',  class: 'low'  },
  { id: 'c-no-nu',         char: 'น', name: 'no nu',         thaiName: 'น หนู',     meaning: 'mouse',          initial: 'n',  final: 'n',  class: 'low'  },
  { id: 'c-bo-baimai',     char: 'บ', name: 'bo baimai',     thaiName: 'บ ใบไม้',   meaning: 'leaf',           initial: 'b',  final: 'p',  class: 'mid'  },
  { id: 'c-po-pla',        char: 'ป', name: 'po pla',        thaiName: 'ป ปลา',     meaning: 'fish',           initial: 'p',  final: 'p',  class: 'mid'  },
  { id: 'c-pho-phueng',    char: 'ผ', name: 'pho phueng',    thaiName: 'ผ ผึ้ง',     meaning: 'bee',            initial: 'ph', final: '-',  class: 'high' },
  { id: 'c-fo-fa',         char: 'ฝ', name: 'fo fa',         thaiName: 'ฝ ฝา',       meaning: 'lid',            initial: 'f',  final: '-',  class: 'high' },
  { id: 'c-pho-phan',      char: 'พ', name: 'pho phan',      thaiName: 'พ พาน',     meaning: 'tray / phan',    initial: 'ph', final: 'p',  class: 'low'  },
  { id: 'c-fo-fan',        char: 'ฟ', name: 'fo fan',        thaiName: 'ฟ ฟัน',     meaning: 'teeth',          initial: 'f',  final: 'p',  class: 'low'  },
  { id: 'c-pho-samphao',   char: 'ภ', name: 'pho samphao',   thaiName: 'ภ สำเภา',   meaning: 'sailboat',       initial: 'ph', final: 'p',  class: 'low'  },
  { id: 'c-mo-ma',         char: 'ม', name: 'mo ma',         thaiName: 'ม ม้า',      meaning: 'horse',          initial: 'm',  final: 'm',  class: 'low'  },
  { id: 'c-yo-yak',        char: 'ย', name: 'yo yak',        thaiName: 'ย ยักษ์',   meaning: 'giant',          initial: 'y',  final: 'y',  class: 'low'  },
  { id: 'c-ro-ruea',       char: 'ร', name: 'ro ruea',       thaiName: 'ร เรือ',    meaning: 'boat',           initial: 'r',  final: 'n',  class: 'low'  },
  { id: 'c-lo-ling',       char: 'ล', name: 'lo ling',       thaiName: 'ล ลิง',     meaning: 'monkey',         initial: 'l',  final: 'n',  class: 'low'  },
  { id: 'c-wo-waen',       char: 'ว', name: 'wo waen',       thaiName: 'ว แหวน',    meaning: 'ring',           initial: 'w',  final: 'w',  class: 'low'  },
  { id: 'c-so-sala',       char: 'ศ', name: 'so sala',       thaiName: 'ศ ศาลา',    meaning: 'pavilion',       initial: 's',  final: 't',  class: 'high' },
  { id: 'c-so-ruesi',      char: 'ษ', name: 'so ruesi',      thaiName: 'ษ ฤๅษี',    meaning: 'hermit',         initial: 's',  final: 't',  class: 'high' },
  { id: 'c-so-suea',       char: 'ส', name: 'so suea',       thaiName: 'ส เสือ',    meaning: 'tiger',          initial: 's',  final: 't',  class: 'high' },
  { id: 'c-ho-hip',        char: 'ห', name: 'ho hip',        thaiName: 'ห หีบ',     meaning: 'chest / box',    initial: 'h',  final: '-',  class: 'high' },
  { id: 'c-lo-chula',      char: 'ฬ', name: 'lo chula',      thaiName: 'ฬ จุฬา',    meaning: 'kite',           initial: 'l',  final: 'n',  class: 'low'  },
  { id: 'c-o-ang',         char: 'อ', name: 'o ang',         thaiName: 'อ อ่าง',    meaning: 'basin',          initial: '-',  final: '-',  class: 'mid'  },
  { id: 'c-ho-nokhuk',     char: 'ฮ', name: 'ho nokhuk',     thaiName: 'ฮ นกฮูก',   meaning: 'owl',            initial: 'h',  final: '-',  class: 'low'  }
];

const VOWELS = [
  { id: 'v-a',       char: DOTTED + 'ะ',        name: 'sara a',        sound: 'a',   length: 'short', note: 'short "a" as in "ah" cut off' },
  { id: 'v-aa',      char: DOTTED + 'า',        name: 'sara aa',       sound: 'aa',  length: 'long',  note: 'long "aa" as in "father"' },
  { id: 'v-i',       char: DOTTED + 'ิ',         name: 'sara i',        sound: 'i',   length: 'short', note: 'short "i" as in "sit"' },
  { id: 'v-ii',      char: DOTTED + 'ี',         name: 'sara ii',       sound: 'ii',  length: 'long',  note: 'long "ee" as in "see"' },
  { id: 'v-ue',      char: DOTTED + 'ึ',         name: 'sara ue',       sound: 'ue',  length: 'short', note: 'short unrounded "u" (no English equivalent)' },
  { id: 'v-uue',     char: DOTTED + 'ื',         name: 'sara uue',      sound: 'ue',  length: 'long',  note: 'long unrounded "u"' },
  { id: 'v-u',       char: DOTTED + 'ุ',         name: 'sara u',        sound: 'u',   length: 'short', note: 'short "u" as in "put"' },
  { id: 'v-uu',      char: DOTTED + 'ู',         name: 'sara uu',       sound: 'uu',  length: 'long',  note: 'long "oo" as in "food"' },
  { id: 'v-e',       char: 'เ' + DOTTED,        name: 'sara e',        sound: 'e',   length: 'long',  note: 'long "e" as in "may"' },
  { id: 'v-ae',      char: 'แ' + DOTTED,        name: 'sara ae',       sound: 'ae',  length: 'long',  note: 'long "ae" as in "cat" stretched' },
  { id: 'v-o',       char: 'โ' + DOTTED,        name: 'sara o',        sound: 'o',   length: 'long',  note: 'long "o" as in "go"' },
  { id: 'v-oe',      char: 'เ' + DOTTED + 'อ',  name: 'sara oe',       sound: 'oe',  length: 'long',  note: '"er" as in "her" (British)' },
  { id: 'v-ai-maimuan', char: 'ใ' + DOTTED,    name: 'sara ai (mai muan)', sound: 'ai', length: 'short', note: '"ai" as in "Thai" — used in ~20 words' },
  { id: 'v-ai-maimalai', char: 'ไ' + DOTTED,   name: 'sara ai (mai malai)', sound: 'ai', length: 'short', note: '"ai" as in "Thai" — the common one' },
  { id: 'v-am',      char: DOTTED + 'ำ',        name: 'sara am',       sound: 'am',  length: 'short', note: '"am" as in "hum"' },
  { id: 'v-ao',      char: 'เ' + DOTTED + 'า',  name: 'sara ao',       sound: 'ao',  length: 'short', note: '"ao" as in "cow"' }
];

const TONES = [
  { id: 't-mai-ek',        char: DOTTED + '่', name: 'mai ek',        note: '1st tone mark — often gives low/falling tone' },
  { id: 't-mai-tho',       char: DOTTED + '้', name: 'mai tho',       note: '2nd tone mark — often gives falling/high tone' },
  { id: 't-mai-tri',       char: DOTTED + '๊', name: 'mai tri',       note: '3rd tone mark — high tone (mostly mid-class)' },
  { id: 't-mai-chattawa',  char: DOTTED + '๋', name: 'mai chattawa',  note: '4th tone mark — rising tone (mostly mid-class)' },
  { id: 't-thanthakhat',   char: DOTTED + '์', name: 'thanthakhat',   note: 'silencer — marks a letter as not pronounced' }
];

// Starter vocabulary. Custom words the user adds get category 'myword'.
const STARTER_WORDS = [
  { id: 'w-sawatdee', char: 'สวัสดี',   romanization: 'sà-wàt-dii', meaning: 'hello / goodbye' },
  { id: 'w-khopkhun', char: 'ขอบคุณ',   romanization: 'khɔ̀ɔp-khun', meaning: 'thank you' },
  { id: 'w-chai',     char: 'ใช่',      romanization: 'châi',       meaning: 'yes / correct' },
  { id: 'w-mai',      char: 'ไม่',      romanization: 'mâi',        meaning: 'no / not' },
  { id: 'w-nam',      char: 'น้ำ',      romanization: 'náam',       meaning: 'water' },
  { id: 'w-ahan',     char: 'อาหาร',    romanization: 'aa-hǎan',    meaning: 'food' },
  { id: 'w-maew',     char: 'แมว',      romanization: 'mɛɛw',       meaning: 'cat' },
  { id: 'w-maa',      char: 'หมา',      romanization: 'mǎa',        meaning: 'dog' },
  { id: 'w-baan',     char: 'บ้าน',     romanization: 'bâan',       meaning: 'house / home' },
  { id: 'w-rak',      char: 'รัก',      romanization: 'rák',        meaning: 'to love' },
  { id: 'w-aroi',     char: 'อร่อย',    romanization: 'à-rɔ̀i',      meaning: 'delicious' },
  { id: 'w-sabai',    char: 'สบาย',     romanization: 'sà-baai',    meaning: 'comfortable / well' }
];

// Category metadata drives the tabs/sections in the Learn view.
const CATEGORIES = [
  { key: 'consonant', label: 'Consonants', items: CONSONANTS },
  { key: 'vowel',     label: 'Vowels',     items: VOWELS },
  { key: 'tone',      label: 'Tone marks', items: TONES },
  { key: 'word',      label: 'Words',      items: STARTER_WORDS }
];

// Flatten to a lookup by id (built-in items only; custom words handled in storage).
const ITEMS_BY_ID = {};
CATEGORIES.forEach(cat => {
  cat.items.forEach(item => {
    ITEMS_BY_ID[item.id] = Object.assign({ category: cat.key }, item);
  });
});

// The plain (speakable) text for an item — strip the dotted circle placeholder.
function speakableText(item) {
  if (item.category === 'word' || item.category === 'myword') return item.char;
  // For consonants, speak the full name-word (e.g. "ก ไก่") which is clearer than the bare glyph.
  if (item.category === 'consonant' && item.thaiName) return item.thaiName;
  return item.char.replace(new RegExp(DOTTED, 'g'), '');
}

window.ThaiData = { DOTTED, CONSONANTS, VOWELS, TONES, STARTER_WORDS, CATEGORIES, ITEMS_BY_ID, speakableText };
