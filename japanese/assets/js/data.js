// Japanese learning dataset — for Thai speakers learning Japanese.
// Every item has a stable `id` so progress can be tracked across sessions.
//
// Kana are standalone syllables, so (unlike Thai vowels/tone marks) each one is
// pronounceable on its own — the `char` itself is what TTS speaks.
//   romaji : the Hepburn reading, shown as the card's main label.
//   read   : an approximate Thai phonetic hint (เสียงโดยประมาณ) for Thai learners.
//   group  : the gojūon row (a / ka / sa …), used only for light grouping.
//
// This first version teaches the 46 basic hiragana + 46 basic katakana + starter
// vocabulary. Voiced kana (が ざ だ ば …) and combos (きゃ …) appear inside some
// starter words but aren't taught as separate cards yet.

// ---- Hiragana (46 basic gojūon) ----
const HIRAGANA = [
  { id: 'h-a',   char: 'あ', romaji: 'a',   read: 'อะ',  group: 'a'  },
  { id: 'h-i',   char: 'い', romaji: 'i',   read: 'อิ',  group: 'a'  },
  { id: 'h-u',   char: 'う', romaji: 'u',   read: 'อุ',  group: 'a'  },
  { id: 'h-e',   char: 'え', romaji: 'e',   read: 'เอะ', group: 'a'  },
  { id: 'h-o',   char: 'お', romaji: 'o',   read: 'โอะ', group: 'a'  },
  { id: 'h-ka',  char: 'か', romaji: 'ka',  read: 'คะ',  group: 'ka' },
  { id: 'h-ki',  char: 'き', romaji: 'ki',  read: 'คิ',  group: 'ka' },
  { id: 'h-ku',  char: 'く', romaji: 'ku',  read: 'คุ',  group: 'ka' },
  { id: 'h-ke',  char: 'け', romaji: 'ke',  read: 'เคะ', group: 'ka' },
  { id: 'h-ko',  char: 'こ', romaji: 'ko',  read: 'โคะ', group: 'ka' },
  { id: 'h-sa',  char: 'さ', romaji: 'sa',  read: 'ซะ',  group: 'sa' },
  { id: 'h-shi', char: 'し', romaji: 'shi', read: 'ชิ',  group: 'sa' },
  { id: 'h-su',  char: 'す', romaji: 'su',  read: 'ซุ',  group: 'sa' },
  { id: 'h-se',  char: 'せ', romaji: 'se',  read: 'เซะ', group: 'sa' },
  { id: 'h-so',  char: 'そ', romaji: 'so',  read: 'โซะ', group: 'sa' },
  { id: 'h-ta',  char: 'た', romaji: 'ta',  read: 'ทะ',  group: 'ta' },
  { id: 'h-chi', char: 'ち', romaji: 'chi', read: 'จิ',  group: 'ta' },
  { id: 'h-tsu', char: 'つ', romaji: 'tsu', read: 'สึ',  group: 'ta' },
  { id: 'h-te',  char: 'て', romaji: 'te',  read: 'เทะ', group: 'ta' },
  { id: 'h-to',  char: 'と', romaji: 'to',  read: 'โทะ', group: 'ta' },
  { id: 'h-na',  char: 'な', romaji: 'na',  read: 'นะ',  group: 'na' },
  { id: 'h-ni',  char: 'に', romaji: 'ni',  read: 'นิ',  group: 'na' },
  { id: 'h-nu',  char: 'ぬ', romaji: 'nu',  read: 'นุ',  group: 'na' },
  { id: 'h-ne',  char: 'ね', romaji: 'ne',  read: 'เนะ', group: 'na' },
  { id: 'h-no',  char: 'の', romaji: 'no',  read: 'โนะ', group: 'na' },
  { id: 'h-ha',  char: 'は', romaji: 'ha',  read: 'ฮะ',  group: 'ha' },
  { id: 'h-hi',  char: 'ひ', romaji: 'hi',  read: 'ฮิ',  group: 'ha' },
  { id: 'h-fu',  char: 'ふ', romaji: 'fu',  read: 'ฟุ',  group: 'ha' },
  { id: 'h-he',  char: 'へ', romaji: 'he',  read: 'เฮะ', group: 'ha' },
  { id: 'h-ho',  char: 'ほ', romaji: 'ho',  read: 'โฮะ', group: 'ha' },
  { id: 'h-ma',  char: 'ま', romaji: 'ma',  read: 'มะ',  group: 'ma' },
  { id: 'h-mi',  char: 'み', romaji: 'mi',  read: 'มิ',  group: 'ma' },
  { id: 'h-mu',  char: 'む', romaji: 'mu',  read: 'มุ',  group: 'ma' },
  { id: 'h-me',  char: 'め', romaji: 'me',  read: 'เมะ', group: 'ma' },
  { id: 'h-mo',  char: 'も', romaji: 'mo',  read: 'โมะ', group: 'ma' },
  { id: 'h-ya',  char: 'や', romaji: 'ya',  read: 'ยะ',  group: 'ya' },
  { id: 'h-yu',  char: 'ゆ', romaji: 'yu',  read: 'ยุ',  group: 'ya' },
  { id: 'h-yo',  char: 'よ', romaji: 'yo',  read: 'โยะ', group: 'ya' },
  { id: 'h-ra',  char: 'ら', romaji: 'ra',  read: 'ระ',  group: 'ra' },
  { id: 'h-ri',  char: 'り', romaji: 'ri',  read: 'ริ',  group: 'ra' },
  { id: 'h-ru',  char: 'る', romaji: 'ru',  read: 'รุ',  group: 'ra' },
  { id: 'h-re',  char: 'れ', romaji: 're',  read: 'เระ', group: 'ra' },
  { id: 'h-ro',  char: 'ろ', romaji: 'ro',  read: 'โระ', group: 'ra' },
  { id: 'h-wa',  char: 'わ', romaji: 'wa',  read: 'วะ',  group: 'wa' },
  { id: 'h-wo',  char: 'を', romaji: 'wo',  read: 'โวะ', group: 'wa', note: 'ใช้เป็นคำช่วยชี้กรรมเท่านั้น ออกเสียง "โอะ"' },
  { id: 'h-n',   char: 'ん', romaji: 'n',   read: 'อึน', group: 'n',  note: 'เสียง "น/ง" ตัวสะกด อยู่ท้ายพยางค์เท่านั้น' }
];

// ---- Katakana (46 basic — same sounds, angular forms) ----
const KATAKANA = [
  { id: 'k-a',   char: 'ア', romaji: 'a',   read: 'อะ',  group: 'a'  },
  { id: 'k-i',   char: 'イ', romaji: 'i',   read: 'อิ',  group: 'a'  },
  { id: 'k-u',   char: 'ウ', romaji: 'u',   read: 'อุ',  group: 'a'  },
  { id: 'k-e',   char: 'エ', romaji: 'e',   read: 'เอะ', group: 'a'  },
  { id: 'k-o',   char: 'オ', romaji: 'o',   read: 'โอะ', group: 'a'  },
  { id: 'k-ka',  char: 'カ', romaji: 'ka',  read: 'คะ',  group: 'ka' },
  { id: 'k-ki',  char: 'キ', romaji: 'ki',  read: 'คิ',  group: 'ka' },
  { id: 'k-ku',  char: 'ク', romaji: 'ku',  read: 'คุ',  group: 'ka' },
  { id: 'k-ke',  char: 'ケ', romaji: 'ke',  read: 'เคะ', group: 'ka' },
  { id: 'k-ko',  char: 'コ', romaji: 'ko',  read: 'โคะ', group: 'ka' },
  { id: 'k-sa',  char: 'サ', romaji: 'sa',  read: 'ซะ',  group: 'sa' },
  { id: 'k-shi', char: 'シ', romaji: 'shi', read: 'ชิ',  group: 'sa' },
  { id: 'k-su',  char: 'ス', romaji: 'su',  read: 'ซุ',  group: 'sa' },
  { id: 'k-se',  char: 'セ', romaji: 'se',  read: 'เซะ', group: 'sa' },
  { id: 'k-so',  char: 'ソ', romaji: 'so',  read: 'โซะ', group: 'sa' },
  { id: 'k-ta',  char: 'タ', romaji: 'ta',  read: 'ทะ',  group: 'ta' },
  { id: 'k-chi', char: 'チ', romaji: 'chi', read: 'จิ',  group: 'ta' },
  { id: 'k-tsu', char: 'ツ', romaji: 'tsu', read: 'สึ',  group: 'ta' },
  { id: 'k-te',  char: 'テ', romaji: 'te',  read: 'เทะ', group: 'ta' },
  { id: 'k-to',  char: 'ト', romaji: 'to',  read: 'โทะ', group: 'ta' },
  { id: 'k-na',  char: 'ナ', romaji: 'na',  read: 'นะ',  group: 'na' },
  { id: 'k-ni',  char: 'ニ', romaji: 'ni',  read: 'นิ',  group: 'na' },
  { id: 'k-nu',  char: 'ヌ', romaji: 'nu',  read: 'นุ',  group: 'na' },
  { id: 'k-ne',  char: 'ネ', romaji: 'ne',  read: 'เนะ', group: 'na' },
  { id: 'k-no',  char: 'ノ', romaji: 'no',  read: 'โนะ', group: 'na' },
  { id: 'k-ha',  char: 'ハ', romaji: 'ha',  read: 'ฮะ',  group: 'ha' },
  { id: 'k-hi',  char: 'ヒ', romaji: 'hi',  read: 'ฮิ',  group: 'ha' },
  { id: 'k-fu',  char: 'フ', romaji: 'fu',  read: 'ฟุ',  group: 'ha' },
  { id: 'k-he',  char: 'ヘ', romaji: 'he',  read: 'เฮะ', group: 'ha' },
  { id: 'k-ho',  char: 'ホ', romaji: 'ho',  read: 'โฮะ', group: 'ha' },
  { id: 'k-ma',  char: 'マ', romaji: 'ma',  read: 'มะ',  group: 'ma' },
  { id: 'k-mi',  char: 'ミ', romaji: 'mi',  read: 'มิ',  group: 'ma' },
  { id: 'k-mu',  char: 'ム', romaji: 'mu',  read: 'มุ',  group: 'ma' },
  { id: 'k-me',  char: 'メ', romaji: 'me',  read: 'เมะ', group: 'ma' },
  { id: 'k-mo',  char: 'モ', romaji: 'mo',  read: 'โมะ', group: 'ma' },
  { id: 'k-ya',  char: 'ヤ', romaji: 'ya',  read: 'ยะ',  group: 'ya' },
  { id: 'k-yu',  char: 'ユ', romaji: 'yu',  read: 'ยุ',  group: 'ya' },
  { id: 'k-yo',  char: 'ヨ', romaji: 'yo',  read: 'โยะ', group: 'ya' },
  { id: 'k-ra',  char: 'ラ', romaji: 'ra',  read: 'ระ',  group: 'ra' },
  { id: 'k-ri',  char: 'リ', romaji: 'ri',  read: 'ริ',  group: 'ra' },
  { id: 'k-ru',  char: 'ル', romaji: 'ru',  read: 'รุ',  group: 'ra' },
  { id: 'k-re',  char: 'レ', romaji: 're',  read: 'เระ', group: 'ra' },
  { id: 'k-ro',  char: 'ロ', romaji: 'ro',  read: 'โระ', group: 'ra' },
  { id: 'k-wa',  char: 'ワ', romaji: 'wa',  read: 'วะ',  group: 'wa' },
  { id: 'k-wo',  char: 'ヲ', romaji: 'wo',  read: 'โวะ', group: 'wa', note: 'พบได้น้อยมากในคาตาคานะ' },
  { id: 'k-n',   char: 'ン', romaji: 'n',   read: 'อึน', group: 'n',  note: 'เสียง "น/ง" ตัวสะกด อยู่ท้ายพยางค์เท่านั้น' }
];

// ---- Starter vocabulary (written in kana; Thai meanings). ----
// Some words contain voiced kana (ご ず げ) not taught as separate cards yet — that's fine.
const STARTER_WORDS = [
  { id: 'w-konnichiwa', char: 'こんにちは', romanization: 'konnichiwa', meaning: 'สวัสดี (ตอนกลางวัน)' },
  { id: 'w-arigatou',   char: 'ありがとう', romanization: 'arigatou',   meaning: 'ขอบคุณ' },
  { id: 'w-hai',        char: 'はい',       romanization: 'hai',        meaning: 'ใช่ / ครับ-ค่ะ' },
  { id: 'w-iie',        char: 'いいえ',     romanization: 'iie',        meaning: 'ไม่ / ไม่ใช่' },
  { id: 'w-mizu',       char: 'みず',       romanization: 'mizu',       meaning: 'น้ำ' },
  { id: 'w-gohan',      char: 'ごはん',     romanization: 'gohan',      meaning: 'ข้าว / อาหาร' },
  { id: 'w-neko',       char: 'ねこ',       romanization: 'neko',       meaning: 'แมว' },
  { id: 'w-inu',        char: 'いぬ',       romanization: 'inu',        meaning: 'หมา / สุนัข' },
  { id: 'w-ie',         char: 'いえ',       romanization: 'ie',         meaning: 'บ้าน' },
  { id: 'w-suki',       char: 'すき',       romanization: 'suki',       meaning: 'ชอบ / รัก' },
  { id: 'w-oishii',     char: 'おいしい',   romanization: 'oishii',     meaning: 'อร่อย' },
  { id: 'w-genki',      char: 'げんき',     romanization: 'genki',      meaning: 'สบายดี / แข็งแรง' }
];

// ---- Voiced (dakuten ゛) and semi-voiced (handakuten ゜) kana ----
// [idSuffix, romaji, read, hira, kata, baseHira, baseKata, mark]
const _DAKUTEN = [
  ['ga', 'ga', 'กะ',  'が', 'ガ', 'か', 'カ', 'dakuten'],
  ['gi', 'gi', 'กิ',  'ぎ', 'ギ', 'き', 'キ', 'dakuten'],
  ['gu', 'gu', 'กุ',  'ぐ', 'グ', 'く', 'ク', 'dakuten'],
  ['ge', 'ge', 'เกะ', 'げ', 'ゲ', 'け', 'ケ', 'dakuten'],
  ['go', 'go', 'โกะ', 'ご', 'ゴ', 'こ', 'コ', 'dakuten'],
  ['za', 'za', 'ซะ',  'ざ', 'ザ', 'さ', 'サ', 'dakuten'],
  ['ji', 'ji', 'จิ',  'じ', 'ジ', 'し', 'シ', 'dakuten'],
  ['zu', 'zu', 'ซุ',  'ず', 'ズ', 'す', 'ス', 'dakuten'],
  ['ze', 'ze', 'เซะ', 'ぜ', 'ゼ', 'せ', 'セ', 'dakuten'],
  ['zo', 'zo', 'โซะ', 'ぞ', 'ゾ', 'そ', 'ソ', 'dakuten'],
  ['da', 'da', 'ดะ',  'だ', 'ダ', 'た', 'タ', 'dakuten'],
  ['di', 'ji', 'จิ',  'ぢ', 'ヂ', 'ち', 'チ', 'dakuten'],
  ['du', 'zu', 'ซุ',  'づ', 'ヅ', 'つ', 'ツ', 'dakuten'],
  ['de', 'de', 'เดะ', 'で', 'デ', 'て', 'テ', 'dakuten'],
  ['do', 'do', 'โดะ', 'ど', 'ド', 'と', 'ト', 'dakuten'],
  ['ba', 'ba', 'บะ',  'ば', 'バ', 'は', 'ハ', 'dakuten'],
  ['bi', 'bi', 'บิ',  'び', 'ビ', 'ひ', 'ヒ', 'dakuten'],
  ['bu', 'bu', 'บุ',  'ぶ', 'ブ', 'ふ', 'フ', 'dakuten'],
  ['be', 'be', 'เบะ', 'べ', 'ベ', 'へ', 'ヘ', 'dakuten'],
  ['bo', 'bo', 'โบะ', 'ぼ', 'ボ', 'ほ', 'ホ', 'dakuten'],
  ['pa', 'pa', 'ปะ',  'ぱ', 'パ', 'は', 'ハ', 'handakuten'],
  ['pi', 'pi', 'ปิ',  'ぴ', 'ピ', 'ひ', 'ヒ', 'handakuten'],
  ['pu', 'pu', 'ปุ',  'ぷ', 'プ', 'ふ', 'フ', 'handakuten'],
  ['pe', 'pe', 'เปะ', 'ぺ', 'ペ', 'へ', 'ヘ', 'handakuten'],
  ['po', 'po', 'โปะ', 'ぽ', 'ポ', 'ほ', 'ホ', 'handakuten']
];

// ---- Contracted sounds (yōon: an i-row kana + small ゃ/ゅ/ょ) ----
// [idSuffix, romaji, read, hira, kata]  — base + small char are derived from the string.
const _YOON = [
  ['kya', 'kya', 'เคียะ', 'きゃ', 'キャ'],
  ['kyu', 'kyu', 'คิว',   'きゅ', 'キュ'],
  ['kyo', 'kyo', 'เคียว', 'きょ', 'キョ'],
  ['sha', 'sha', 'ชะ',    'しゃ', 'シャ'],
  ['shu', 'shu', 'ชุ',    'しゅ', 'シュ'],
  ['sho', 'sho', 'โชะ',   'しょ', 'ショ'],
  ['cha', 'cha', 'จะ',    'ちゃ', 'チャ'],
  ['chu', 'chu', 'จุ',    'ちゅ', 'チュ'],
  ['cho', 'cho', 'โจะ',   'ちょ', 'チョ'],
  ['nya', 'nya', 'เนียะ', 'にゃ', 'ニャ'],
  ['nyu', 'nyu', 'นิว',   'にゅ', 'ニュ'],
  ['nyo', 'nyo', 'เนียว', 'にょ', 'ニョ'],
  ['hya', 'hya', 'เฮียะ', 'ひゃ', 'ヒャ'],
  ['hyu', 'hyu', 'ฮิว',   'ひゅ', 'ヒュ'],
  ['hyo', 'hyo', 'เฮียว', 'ひょ', 'ヒョ'],
  ['mya', 'mya', 'เมียะ', 'みゃ', 'ミャ'],
  ['myu', 'myu', 'มิว',   'みゅ', 'ミュ'],
  ['myo', 'myo', 'เมียว', 'みょ', 'ミョ'],
  ['rya', 'rya', 'เรียะ', 'りゃ', 'リャ'],
  ['ryu', 'ryu', 'ริว',   'りゅ', 'リュ'],
  ['ryo', 'ryo', 'เรียว', 'りょ', 'リョ'],
  ['gya', 'gya', 'เกียะ', 'ぎゃ', 'ギャ'],
  ['gyu', 'gyu', 'กิว',   'ぎゅ', 'ギュ'],
  ['gyo', 'gyo', 'เกียว', 'ぎょ', 'ギョ'],
  ['ja',  'ja',  'จะ',    'じゃ', 'ジャ'],
  ['ju',  'ju',  'จุ',    'じゅ', 'ジュ'],
  ['jo',  'jo',  'โจะ',   'じょ', 'ジョ'],
  ['bya', 'bya', 'เบียะ', 'びゃ', 'ビャ'],
  ['byu', 'byu', 'บิว',   'びゅ', 'ビュ'],
  ['byo', 'byo', 'เบียว', 'びょ', 'ビョ'],
  ['pya', 'pya', 'เปียะ', 'ぴゃ', 'ピャ'],
  ['pyu', 'pyu', 'ปิว',   'ぴゅ', 'ピュ'],
  ['pyo', 'pyo', 'เปียว', 'ぴょ', 'ピョ']
];

// Tag the basic kana, then append the derived voiced/contracted sets to each script.
HIRAGANA.forEach(k => { k.sub = 'basic'; });
KATAKANA.forEach(k => { k.sub = 'basic'; });

const _romajiByChar = {};
HIRAGANA.forEach(k => { _romajiByChar[k.char] = k.romaji; });
KATAKANA.forEach(k => { _romajiByChar[k.char] = k.romaji; });

_DAKUTEN.forEach(([sfx, romaji, read, hira, kata, bh, bk, mark]) => {
  const note = (sfx === 'di' || sfx === 'du')
    ? 'พบน้อย มักใช้ ' + (sfx === 'di' ? 'じ/ジ' : 'ず/ズ') + ' แทน'
    : undefined;
  HIRAGANA.push({ id: 'h-' + sfx, char: hira, romaji, read, group: 'dakuten', sub: 'dakuten', mark, baseChar: bh, baseRomaji: _romajiByChar[bh], note });
  KATAKANA.push({ id: 'k-' + sfx, char: kata, romaji, read, group: 'dakuten', sub: 'dakuten', mark, baseChar: bk, baseRomaji: _romajiByChar[bk], note });
});

_YOON.forEach(([sfx, romaji, read, hira, kata]) => {
  HIRAGANA.push({ id: 'h-' + sfx, char: hira, romaji, read, group: 'yoon', sub: 'yoon', mark: 'yoon', baseChar: hira[0], smallChar: hira[1] });
  KATAKANA.push({ id: 'k-' + sfx, char: kata, romaji, read, group: 'yoon', sub: 'yoon', mark: 'yoon', baseChar: kata[0], smallChar: kata[1] });
});

// Category metadata drives the tabs/sections in the Learn view. Labels are Thai.
const CATEGORIES = [
  { key: 'hiragana', label: 'ฮิรางานะ', items: HIRAGANA },
  { key: 'katakana', label: 'คาตาคานะ', items: KATAKANA },
  { key: 'word',     label: 'คำศัพท์',   items: STARTER_WORDS }
];

// Flatten to a lookup by id (built-in items only; custom words handled in storage).
const ITEMS_BY_ID = {};
CATEGORIES.forEach(cat => {
  cat.items.forEach(item => {
    ITEMS_BY_ID[item.id] = Object.assign({ category: cat.key }, item);
  });
});

// The plain (speakable) text for an item. Kana and words are spoken as-is.
function speakableText(item) {
  return item.char;
}

window.JPData = { HIRAGANA, KATAKANA, STARTER_WORDS, CATEGORIES, ITEMS_BY_ID, speakableText };
