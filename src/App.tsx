import {
  Archive,
  BadgeCheck,
  Bookmark,
  BrainCircuit,
  Check,
  Copy,
  Database,
  FileText,
  Gauge,
  Globe,
  KeyRound,
  Languages,
  Palette,
  Radar,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  WandSparkles,
  XCircle
} from "lucide-react";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type DesignId = "studio" | "radar" | "atelier";
type Availability = "available" | "review" | "taken" | "unchecked";
type Trademark = "clear" | "watch" | "conflict";
type ApiMode = "local" | "live" | "fallback" | "error";
type BlendMode = "2li" | "3lu" | "auto";
type DomainFilter = "all" | "anyAvailable" | "comAvailable" | "unchecked" | "hideTaken";

type BrandStory = {
  origin: string;
  pitch: string;
  taglines: string[];
  audience: string;
  hero: string;
  founder: string;
  socialBio: string;
};

type Root = {
  sound: string;
  source: string;
  meaning: string;
};

type Candidate = {
  name: string;
  score: number;
  roots: string;
  note: string;
  context: string;
  tags: string[];
  domains: Record<string, Availability>;
  trademarks: Record<string, Trademark>;
  story?: BrandStory;
};

type AiCandidate = {
  name?: string;
  roots?: string;
  note?: string;
  context?: string;
  tags?: string[];
};

type LanguageOption = {
  id: string;
  label: string;
  group: "Günümüz" | "Eski" | "Mit / Destan" | "Yeni";
};

type DesignOption = {
  id: DesignId;
  title: string;
  label: string;
  note: string;
  Icon: LucideIcon;
};

type AppProps = {
  clerkEnabled?: boolean;
};

const designs: DesignOption[] = [
  {
    id: "studio",
    title: "Studio",
    label: "Sakin SaaS",
    note: "Kurumsal, net, satılabilir.",
    Icon: Palette
  },
  {
    id: "radar",
    title: "Radar",
    label: "Yoğun Kontrol",
    note: "Risk ve uygunluk odaklı.",
    Icon: Radar
  },
  {
    id: "atelier",
    title: "Atölye",
    label: "Yaratıcı Masa",
    note: "Dil, kök ve çağrışım öncelikli.",
    Icon: Archive
  }
];

const languageOptions: LanguageOption[] = [
  { id: "turkic", label: "Türkçe", group: "Günümüz" },
  { id: "english", label: "İngilizce", group: "Günümüz" },
  { id: "spanish", label: "İspanyolca", group: "Günümüz" },
  { id: "french", label: "Fransızca", group: "Günümüz" },
  { id: "italian", label: "İtalyanca", group: "Günümüz" },
  { id: "german", label: "Almanca", group: "Günümüz" },
  { id: "portuguese", label: "Portekizce", group: "Günümüz" },
  { id: "dutch", label: "Felemenkçe", group: "Günümüz" },
  { id: "nordic", label: "Nordik", group: "Günümüz" },
  { id: "slavic", label: "Slav dilleri", group: "Günümüz" },
  { id: "hindi", label: "Hintçe", group: "Günümüz" },
  { id: "korean", label: "Korece", group: "Günümüz" },
  { id: "chinese", label: "Çince", group: "Günümüz" },
  { id: "swahili", label: "Svahili", group: "Günümüz" },
  { id: "indonesian", label: "Endonezce", group: "Günümüz" },
  { id: "vietnamese", label: "Vietnamca", group: "Günümüz" },
  { id: "thai", label: "Tayca", group: "Günümüz" },
  { id: "hebrew", label: "İbranice", group: "Günümüz" },
  { id: "finnic", label: "Fince / Estonca", group: "Günümüz" },
  { id: "basque", label: "Baskça", group: "Günümüz" },
  { id: "gaelic", label: "İrlanda / Gal", group: "Günümüz" },
  { id: "bantu", label: "Zulu / Bantu", group: "Günümüz" },
  { id: "austronesian", label: "Maori / Tagalog", group: "Günümüz" },
  { id: "latin", label: "Latince", group: "Eski" },
  { id: "greek", label: "Yunanca", group: "Eski" },
  { id: "sanskrit", label: "Sanskrit", group: "Eski" },
  { id: "arabic", label: "Arapça", group: "Eski" },
  { id: "persian", label: "Farsça", group: "Eski" },
  { id: "celtic", label: "Keltik", group: "Eski" },
  { id: "sumerian", label: "Sümer", group: "Eski" },
  { id: "egyptian", label: "Mısır", group: "Eski" },
  { id: "akkadian", label: "Akad", group: "Eski" },
  { id: "etruscan", label: "Etrüsk", group: "Eski" },
  { id: "nahuatl", label: "Aztek / Nahuatl", group: "Mit / Destan" },
  { id: "mayan", label: "Maya", group: "Mit / Destan" },
  { id: "inca", label: "İnka / Quechua", group: "Mit / Destan" },
  { id: "norse", label: "Norse destan", group: "Mit / Destan" },
  { id: "anatolian", label: "Anadolu destan", group: "Mit / Destan" },
  { id: "mesopotamian", label: "Mezopotamya", group: "Mit / Destan" },
  { id: "japanese", label: "Japonca", group: "Günümüz" },
  { id: "invented", label: "Yeni dil", group: "Yeni" },
  { id: "cyber", label: "Tekno fonetik", group: "Yeni" },
  { id: "softcoin", label: "Soft coinage", group: "Yeni" }
];

const extensionOptions = [".com", ".ai", ".io", ".co", ".app", ".com.tr"];
const regionOptions = ["Türkiye", "ABD", "Avrupa"];
const domainFilterOptions: { value: DomainFilter; label: string }[] = [
  { value: "all", label: "Tümü" },
  { value: "anyAvailable", label: "Boş domain var" },
  { value: "comAvailable", label: ".com boş" },
  { value: "hideTaken", label: "Dolu hariç" },
  { value: "unchecked", label: "Kontrol bekleyen" }
];

const toneOptions = [
  "Global ve kısa",
  "Premium",
  "Teknolojik",
  "Samimi",
  "Ritüel hissi",
  "Güvenilir"
];

const languageGroups = ["Günümüz", "Eski", "Mit / Destan", "Yeni"] as const;

const languagePresets = [
  {
    label: "Günümüz",
    values: languageOptions.filter((option) => option.group === "Günümüz").map((option) => option.id)
  },
  {
    label: "Antik",
    values: languageOptions.filter((option) => option.group === "Eski").map((option) => option.id)
  },
  {
    label: "Destan",
    values: languageOptions.filter((option) => option.group === "Mit / Destan").map((option) => option.id)
  },
  {
    label: "Hepsi",
    values: languageOptions.map((option) => option.id)
  }
];

const apiProviders = ["OpenAI uyumlu", "Anthropic", "Google Gemini", "Mistral", "Yerel model"];
const API_BASE = import.meta.env.VITE_NAMEFORGE_API_BASE || "http://127.0.0.1:8787";
const DOMAIN_PENDING_TEXT =
  "Domainler canlı RDAP kontrolü bekliyor; Boş/Dolu sadece doğrulama sonrası gösterilir.";

const turkishMap: Record<string, string> = {
  ç: "c",
  ğ: "g",
  ı: "i",
  ö: "o",
  ş: "s",
  ü: "u",
  Ç: "c",
  Ğ: "g",
  İ: "i",
  I: "i",
  Ö: "o",
  Ş: "s",
  Ü: "u"
};

const ROOTS: Record<string, Root[]> = {
  turkic: [
    { sound: "ada", source: "Türkçe", meaning: "yer, sakinlik" },
    { sound: "ay", source: "Türkçe", meaning: "ışık, döngü" },
    { sound: "ora", source: "Eski Türkçe", meaning: "merkez, yön" },
    { sound: "tura", source: "Eski Türkçe", meaning: "iz, işaret" },
    { sound: "yel", source: "Türkçe", meaning: "hız, hareket" },
    { sound: "kora", source: "Türkçe türetim", meaning: "koruma, çekirdek" },
    { sound: "kut", source: "Türkçe esin", meaning: "uğur, güç" },
    { sound: "arsu", source: "Türkçe esin", meaning: "akış, berraklık" },
    { sound: "erin", source: "Türkçe esin", meaning: "olgunluk, sakin güç" }
  ],
  english: [
    { sound: "bright", source: "İngilizce esin", meaning: "parlaklık" },
    { sound: "swift", source: "İngilizce esin", meaning: "hız" },
    { sound: "clear", source: "İngilizce esin", meaning: "açıklık" },
    { sound: "craft", source: "İngilizce esin", meaning: "ustalık" },
    { sound: "noble", source: "İngilizce esin", meaning: "seçkinlik" },
    { sound: "kind", source: "İngilizce esin", meaning: "yakınlık" }
  ],
  spanish: [
    { sound: "claro", source: "İspanyolca", meaning: "aydınlık, net" },
    { sound: "alto", source: "İspanyolca", meaning: "yüksek" },
    { sound: "brio", source: "İspanyolca esin", meaning: "canlılık" },
    { sound: "nube", source: "İspanyolca", meaning: "bulut" },
    { sound: "lazo", source: "İspanyolca", meaning: "bağ" },
    { sound: "oro", source: "İspanyolca", meaning: "altın" }
  ],
  french: [
    { sound: "belle", source: "Fransızca esin", meaning: "zarafet" },
    { sound: "clair", source: "Fransızca", meaning: "aydınlık" },
    { sound: "lien", source: "Fransızca", meaning: "bağ" },
    { sound: "rive", source: "Fransızca", meaning: "kıyı" },
    { sound: "nou", source: "Fransızca türetim", meaning: "yeni" },
    { sound: "vrai", source: "Fransızca", meaning: "gerçek" }
  ],
  italian: [
    { sound: "vita", source: "İtalyanca", meaning: "yaşam" },
    { sound: "luce", source: "İtalyanca", meaning: "ışık" },
    { sound: "alto", source: "İtalyanca", meaning: "yüksek" },
    { sound: "nido", source: "İtalyanca", meaning: "yuva" },
    { sound: "vento", source: "İtalyanca", meaning: "rüzgar" },
    { sound: "vero", source: "İtalyanca", meaning: "doğru" }
  ],
  german: [
    { sound: "klar", source: "Almanca", meaning: "net" },
    { sound: "wert", source: "Almanca", meaning: "değer" },
    { sound: "kraft", source: "Almanca", meaning: "güç" },
    { sound: "licht", source: "Almanca", meaning: "ışık" },
    { sound: "weg", source: "Almanca", meaning: "yol" },
    { sound: "neu", source: "Almanca", meaning: "yeni" }
  ],
  portuguese: [
    { sound: "lume", source: "Portekizce", meaning: "ışık" },
    { sound: "ponte", source: "Portekizce", meaning: "köprü" },
    { sound: "brisa", source: "Portekizce", meaning: "esinti" },
    { sound: "viva", source: "Portekizce", meaning: "canlı" },
    { sound: "porto", source: "Portekizce", meaning: "liman" },
    { sound: "raio", source: "Portekizce", meaning: "ışın" }
  ],
  dutch: [
    { sound: "licht", source: "Felemenkçe", meaning: "ışık" },
    { sound: "brug", source: "Felemenkçe", meaning: "köprü" },
    { sound: "kern", source: "Felemenkçe", meaning: "çekirdek" },
    { sound: "mooi", source: "Felemenkçe", meaning: "güzel" },
    { sound: "vlug", source: "Felemenkçe", meaning: "çevik" },
    { sound: "waarde", source: "Felemenkçe", meaning: "değer" }
  ],
  nordic: [
    { sound: "lysa", source: "Nordik esin", meaning: "ışık" },
    { sound: "nord", source: "Nordik esin", meaning: "kuzey" },
    { sound: "saga", source: "Nordik esin", meaning: "anlatı" },
    { sound: "vann", source: "Nordik esin", meaning: "su" },
    { sound: "bjorn", source: "Nordik esin", meaning: "dayanıklılık" },
    { sound: "heim", source: "Nordik esin", meaning: "ev, alan" }
  ],
  slavic: [
    { sound: "svet", source: "Slav dilleri", meaning: "ışık, dünya" },
    { sound: "mir", source: "Slav dilleri", meaning: "barış, evren" },
    { sound: "nova", source: "Slav dilleri", meaning: "yeni" },
    { sound: "zora", source: "Slav dilleri", meaning: "şafak" },
    { sound: "vera", source: "Slav dilleri", meaning: "inanç" },
    { sound: "rad", source: "Slav dilleri", meaning: "sevinç" }
  ],
  hindi: [
    { sound: "rosh", source: "Hintçe esin", meaning: "ışık" },
    { sound: "naya", source: "Hintçe", meaning: "yeni" },
    { sound: "sathi", source: "Hintçe", meaning: "yoldaş" },
    { sound: "tez", source: "Hintçe esin", meaning: "hızlı, keskin" },
    { sound: "manas", source: "Hintçe esin", meaning: "zihin" },
    { sound: "sukh", source: "Hintçe esin", meaning: "iyi oluş" }
  ],
  korean: [
    { sound: "nara", source: "Korece", meaning: "ülke, alan" },
    { sound: "bit", source: "Korece esin", meaning: "ışık" },
    { sound: "hana", source: "Korece", meaning: "birlik" },
    { sound: "dari", source: "Korece esin", meaning: "köprü" },
    { sound: "baram", source: "Korece", meaning: "rüzgar" },
    { sound: "sae", source: "Korece", meaning: "yeni" }
  ],
  chinese: [
    { sound: "ming", source: "Çince esin", meaning: "parlaklık" },
    { sound: "xin", source: "Çince esin", meaning: "yeni, kalp" },
    { sound: "dao", source: "Çince esin", meaning: "yol" },
    { sound: "ling", source: "Çince esin", meaning: "zarif sinyal" },
    { sound: "yun", source: "Çince esin", meaning: "bulut, ritim" },
    { sound: "zhen", source: "Çince esin", meaning: "gerçek" }
  ],
  swahili: [
    { sound: "nuru", source: "Svahili", meaning: "ışık" },
    { sound: "safi", source: "Svahili", meaning: "temiz" },
    { sound: "moja", source: "Svahili", meaning: "birlik" },
    { sound: "zuri", source: "Svahili", meaning: "güzel" },
    { sound: "amini", source: "Svahili", meaning: "güven" },
    { sound: "haraka", source: "Svahili", meaning: "hız" }
  ],
  indonesian: [
    { sound: "cahya", source: "Endonezce esin", meaning: "ışık" },
    { sound: "bina", source: "Endonezce esin", meaning: "inşa, gelişim" },
    { sound: "jaya", source: "Endonezce esin", meaning: "başarı" },
    { sound: "rasa", source: "Endonezce", meaning: "his, tat" },
    { sound: "daya", source: "Endonezce", meaning: "güç, kaynak" },
    { sound: "laju", source: "Endonezce esin", meaning: "hızlı akış" }
  ],
  vietnamese: [
    { sound: "minh", source: "Vietnamca esin", meaning: "parlak, zeki" },
    { sound: "an", source: "Vietnamca esin", meaning: "huzur" },
    { sound: "linh", source: "Vietnamca esin", meaning: "çevik ruh" },
    { sound: "tam", source: "Vietnamca esin", meaning: "kalp, merkez" },
    { sound: "viet", source: "Vietnamca esin", meaning: "aşan, geçen" },
    { sound: "son", source: "Vietnamca esin", meaning: "dağ" }
  ],
  thai: [
    { sound: "sabai", source: "Tayca esin", meaning: "rahatlık" },
    { sound: "dao", source: "Tayca esin", meaning: "yıldız" },
    { sound: "suk", source: "Tayca esin", meaning: "mutluluk" },
    { sound: "chai", source: "Tayca esin", meaning: "zafer, kalp" },
    { sound: "niran", source: "Tayca esin", meaning: "süreklilik" },
    { sound: "mali", source: "Tayca esin", meaning: "çiçek" }
  ],
  hebrew: [
    { sound: "or", source: "İbranice esin", meaning: "ışık" },
    { sound: "lev", source: "İbranice esin", meaning: "kalp" },
    { sound: "emet", source: "İbranice esin", meaning: "gerçek" },
    { sound: "noa", source: "İbranice esin", meaning: "hareket, rahatlık" },
    { sound: "ziv", source: "İbranice esin", meaning: "parıltı" },
    { sound: "eden", source: "İbranice esin", meaning: "verim, keyif" }
  ],
  finnic: [
    { sound: "valo", source: "Fince", meaning: "ışık" },
    { sound: "sisu", source: "Fince", meaning: "direnç" },
    { sound: "uusi", source: "Fince", meaning: "yeni" },
    { sound: "meri", source: "Fince", meaning: "deniz" },
    { sound: "tark", source: "Estonca esin", meaning: "akıllı" },
    { sound: "laine", source: "Fince esin", meaning: "dalga" }
  ],
  basque: [
    { sound: "argi", source: "Baskça esin", meaning: "ışık, açık" },
    { sound: "bizi", source: "Baskça esin", meaning: "yaşam" },
    { sound: "ondo", source: "Baskça esin", meaning: "iyi" },
    { sound: "izar", source: "Baskça esin", meaning: "yıldız" },
    { sound: "bide", source: "Baskça esin", meaning: "yol" },
    { sound: "arin", source: "Baskça esin", meaning: "hafif, hızlı" }
  ],
  gaelic: [
    { sound: "aon", source: "İrlanda esin", meaning: "birlik" },
    { sound: "solas", source: "İrlanda esin", meaning: "ışık" },
    { sound: "glas", source: "Kelt/Gal esin", meaning: "yeşil, canlı" },
    { sound: "bryn", source: "Galce esin", meaning: "tepe" },
    { sound: "cari", source: "Galce esin", meaning: "sevgi, yakınlık" },
    { sound: "eira", source: "Galce esin", meaning: "saflık" }
  ],
  bantu: [
    { sound: "ubuntu", source: "Bantu esin", meaning: "birlik, insanlık" },
    { sound: "zola", source: "Zulu esin", meaning: "sakinlik" },
    { sound: "langa", source: "Zulu esin", meaning: "güneş" },
    { sound: "thula", source: "Zulu esin", meaning: "dinginlik" },
    { sound: "kazi", source: "Bantu esin", meaning: "iş, üretim" },
    { sound: "beka", source: "Bantu esin", meaning: "bakış, koruma" }
  ],
  austronesian: [
    { sound: "mana", source: "Pasifik esin", meaning: "etki, güç" },
    { sound: "aroha", source: "Maori esin", meaning: "sevgi" },
    { sound: "moana", source: "Maori esin", meaning: "okyanus" },
    { sound: "tala", source: "Tagalog esin", meaning: "yıldız" },
    { sound: "liwa", source: "Tagalog esin", meaning: "ışık, alan" },
    { sound: "malu", source: "Pasifik esin", meaning: "dingin koruma" }
  ],
  latin: [
    { sound: "luma", source: "Latince", meaning: "ışık" },
    { sound: "vera", source: "Latince", meaning: "doğru, gerçek" },
    { sound: "nova", source: "Latince", meaning: "yeni" },
    { sound: "aura", source: "Latince", meaning: "hava, etki" },
    { sound: "via", source: "Latince", meaning: "yol" },
    { sound: "sola", source: "Latince", meaning: "güneş, tekil" },
    { sound: "arca", source: "Latince esin", meaning: "saklı alan" },
    { sound: "axis", source: "Latince", meaning: "eksen" }
  ],
  greek: [
    { sound: "kali", source: "Yunanca", meaning: "iyi, güzel" },
    { sound: "neo", source: "Yunanca", meaning: "yeni" },
    { sound: "doxa", source: "Yunanca", meaning: "itibar, görüş" },
    { sound: "ora", source: "Yunanca", meaning: "görmek, zaman" },
    { sound: "syra", source: "Yunanca türetim", meaning: "akış" },
    { sound: "thea", source: "Yunanca", meaning: "bakış, sahne" }
  ],
  sanskrit: [
    { sound: "veda", source: "Sanskrit", meaning: "bilgi" },
    { sound: "soma", source: "Sanskrit", meaning: "öz, iksir" },
    { sound: "tara", source: "Sanskrit", meaning: "yıldız, geçiş" },
    { sound: "maya", source: "Sanskrit", meaning: "ölçü, imge" },
    { sound: "nava", source: "Sanskrit", meaning: "yeni" },
    { sound: "isha", source: "Sanskrit", meaning: "yöneten güç" }
  ],
  arabic: [
    { sound: "nur", source: "Arapça", meaning: "ışık" },
    { sound: "safi", source: "Arapça", meaning: "temiz, berrak" },
    { sound: "amal", source: "Arapça", meaning: "umut" },
    { sound: "zayn", source: "Arapça", meaning: "güzellik" },
    { sound: "hadi", source: "Arapça", meaning: "rehber" },
    { sound: "raya", source: "Arapça türetim", meaning: "bayrak, iz" }
  ],
  persian: [
    { sound: "roshan", source: "Farsça", meaning: "aydınlık" },
    { sound: "mehr", source: "Farsça", meaning: "sevgi, güneş" },
    { sound: "nav", source: "Farsça esin", meaning: "yeni" },
    { sound: "azar", source: "Farsça esin", meaning: "ateş" },
    { sound: "darya", source: "Farsça", meaning: "deniz" },
    { sound: "seda", source: "Farsça", meaning: "ses" }
  ],
  celtic: [
    { sound: "aval", source: "Keltik esin", meaning: "ada, bereket" },
    { sound: "brin", source: "Keltik esin", meaning: "tepe" },
    { sound: "nara", source: "Keltik türetim", meaning: "akış" },
    { sound: "lugh", source: "Keltik esin", meaning: "ışık, zanaat" },
    { sound: "eir", source: "Keltik esin", meaning: "barış" },
    { sound: "cair", source: "Keltik esin", meaning: "taş işaret" }
  ],
  sumerian: [
    { sound: "ki", source: "Sümer esin", meaning: "yer" },
    { sound: "en", source: "Sümer esin", meaning: "yönetici" },
    { sound: "ama", source: "Sümer esin", meaning: "ana" },
    { sound: "utu", source: "Sümer esin", meaning: "güneş" },
    { sound: "nammu", source: "Sümer esin", meaning: "başlangıç suyu" },
    { sound: "edin", source: "Sümer esin", meaning: "ova, alan" }
  ],
  egyptian: [
    { sound: "ra", source: "Mısır esin", meaning: "güneş" },
    { sound: "ka", source: "Mısır esin", meaning: "yaşam özü" },
    { sound: "maat", source: "Mısır esin", meaning: "denge, düzen" },
    { sound: "seta", source: "Mısır türetim", meaning: "güçlü işaret" },
    { sound: "nefer", source: "Mısır esin", meaning: "güzel, iyi" },
    { sound: "ankh", source: "Mısır esin", meaning: "yaşam" }
  ],
  akkadian: [
    { sound: "ilu", source: "Akad esin", meaning: "yüksek güç" },
    { sound: "shar", source: "Akad esin", meaning: "kral, merkez" },
    { sound: "nabu", source: "Akad esin", meaning: "yazı, bilgelik" },
    { sound: "bel", source: "Akad esin", meaning: "sahip, usta" },
    { sound: "esh", source: "Akad esin", meaning: "yeni ateş" },
    { sound: "mard", source: "Akad türetim", meaning: "düzen kuran" }
  ],
  etruscan: [
    { sound: "vela", source: "Etrüsk esin", meaning: "gizli soyluluk" },
    { sound: "lar", source: "Etrüsk esin", meaning: "koruyucu ev" },
    { sound: "tarch", source: "Etrüsk esin", meaning: "kurucu iz" },
    { sound: "zila", source: "Etrüsk esin", meaning: "düzen" },
    { sound: "clan", source: "Etrüsk esin", meaning: "aidiyet" },
    { sound: "spur", source: "Etrüsk esin", meaning: "şehir" }
  ],
  nahuatl: [
    { sound: "tona", source: "Nahuatl esin", meaning: "güneş, sıcaklık" },
    { sound: "xochi", source: "Nahuatl esin", meaning: "çiçek" },
    { sound: "atl", source: "Nahuatl esin", meaning: "su" },
    { sound: "quetza", source: "Aztek esin", meaning: "parlak tüy, yükseliş" },
    { sound: "ollin", source: "Nahuatl esin", meaning: "hareket" },
    { sound: "citla", source: "Nahuatl esin", meaning: "yıldız" }
  ],
  mayan: [
    { sound: "kin", source: "Maya esin", meaning: "güneş, gün" },
    { sound: "ix", source: "Maya esin", meaning: "yaratıcı dişil güç" },
    { sound: "balam", source: "Maya esin", meaning: "koruyucu güç" },
    { sound: "chaak", source: "Maya esin", meaning: "yağmur, bereket" },
    { sound: "itz", source: "Maya esin", meaning: "öz, iksir" },
    { sound: "yax", source: "Maya esin", meaning: "ilk, yeni, yeşil" }
  ],
  inca: [
    { sound: "inti", source: "Quechua esin", meaning: "güneş" },
    { sound: "killa", source: "Quechua esin", meaning: "ay" },
    { sound: "sumaq", source: "Quechua esin", meaning: "güzel" },
    { sound: "pacha", source: "Quechua esin", meaning: "dünya, zaman" },
    { sound: "yaku", source: "Quechua esin", meaning: "su" },
    { sound: "apu", source: "İnka esin", meaning: "yüksek koruyucu" }
  ],
  norse: [
    { sound: "odin", source: "Norse destan", meaning: "bilgelik" },
    { sound: "frey", source: "Norse destan", meaning: "bolluk" },
    { sound: "run", source: "Norse destan", meaning: "gizli işaret" },
    { sound: "ygg", source: "Norse destan", meaning: "evren ağacı esini" },
    { sound: "val", source: "Norse destan", meaning: "seçim, güç" },
    { sound: "skald", source: "Norse destan", meaning: "anlatıcı" }
  ],
  anatolian: [
    { sound: "asena", source: "Anadolu destan", meaning: "kurucu anlatı" },
    { sound: "erga", source: "Anadolu esin", meaning: "iş, üretim" },
    { sound: "arinna", source: "Hitit esin", meaning: "güneş alanı" },
    { sound: "kibele", source: "Anadolu esin", meaning: "bereket, ana güç" },
    { sound: "tarku", source: "Anadolu esin", meaning: "güç, koruma" },
    { sound: "alaz", source: "Anadolu esin", meaning: "ateş, canlılık" }
  ],
  mesopotamian: [
    { sound: "gilga", source: "Mezopotamya destan", meaning: "yolculuk, arayış" },
    { sound: "enkidu", source: "Mezopotamya destan", meaning: "doğa, eşlik" },
    { sound: "ishta", source: "Mezopotamya esin", meaning: "çekim, parıltı" },
    { sound: "nanna", source: "Mezopotamya esin", meaning: "ay" },
    { sound: "eresh", source: "Mezopotamya esin", meaning: "derin alan" },
    { sound: "tigris", source: "Mezopotamya esin", meaning: "akış, sınır" }
  ],
  japanese: [
    { sound: "mori", source: "Japonca", meaning: "orman" },
    { sound: "sora", source: "Japonca", meaning: "gökyüzü" },
    { sound: "kira", source: "Japonca çağrışım", meaning: "parıltı" },
    { sound: "nami", source: "Japonca", meaning: "dalga" },
    { sound: "tomo", source: "Japonca", meaning: "arkadaş" },
    { sound: "yori", source: "Japonca", meaning: "yakınlık" }
  ],
  invented: [
    { sound: "zeni", source: "Yeni dil", meaning: "hızlı, zeki" },
    { sound: "voro", source: "Yeni dil", meaning: "cesur alan" },
    { sound: "elvi", source: "Yeni dil", meaning: "ince enerji" },
    { sound: "qira", source: "Yeni dil", meaning: "seçkin sinyal" },
    { sound: "mavo", source: "Yeni dil", meaning: "yumuşak güç" },
    { sound: "nexo", source: "Yeni dil", meaning: "bağlantı" },
    { sound: "orvi", source: "Yeni dil", meaning: "dengeli evren" },
    { sound: "luno", source: "Yeni dil", meaning: "yumuşak ışık" }
  ],
  cyber: [
    { sound: "syn", source: "Tekno fonetik", meaning: "sentez" },
    { sound: "quant", source: "Tekno fonetik", meaning: "keskin zeka" },
    { sound: "nexa", source: "Tekno fonetik", meaning: "bağlantı" },
    { sound: "vect", source: "Tekno fonetik", meaning: "yön, vektör" },
    { sound: "byte", source: "Tekno fonetik", meaning: "dijital çekirdek" },
    { sound: "flux", source: "Tekno fonetik", meaning: "akış, değişim" }
  ],
  softcoin: [
    { sound: "mila", source: "Soft coinage", meaning: "yakın, kolay" },
    { sound: "oro", source: "Soft coinage", meaning: "değerli ses" },
    { sound: "vella", source: "Soft coinage", meaning: "ipeksi kalite" },
    { sound: "lira", source: "Soft coinage", meaning: "ritim, akış" },
    { sound: "evo", source: "Soft coinage", meaning: "gelişim" },
    { sound: "ami", source: "Soft coinage", meaning: "dostça bağ" }
  ]
};

const semanticRootBank: Root[] = [
  { sound: "aero", source: "Evrensel kök", meaning: "hava, hareket" },
  { sound: "alma", source: "Evrensel kök", meaning: "öz, ruh" },
  { sound: "alto", source: "Evrensel kök", meaning: "yükseklik" },
  { sound: "argo", source: "Evrensel kök", meaning: "yolculuk, taşıma" },
  { sound: "aria", source: "Evrensel kök", meaning: "ses, açıklık" },
  { sound: "atlas", source: "Evrensel kök", meaning: "kapsam, harita" },
  { sound: "aura", source: "Evrensel kök", meaning: "etki alanı" },
  { sound: "bloom", source: "Evrensel kök", meaning: "büyüme" },
  { sound: "brio", source: "Evrensel kök", meaning: "canlı enerji" },
  { sound: "canto", source: "Evrensel kök", meaning: "ses, ritim" },
  { sound: "certa", source: "Evrensel kök", meaning: "kesinlik" },
  { sound: "cora", source: "Evrensel kök", meaning: "kalp, çekirdek" },
  { sound: "dawn", source: "Evrensel kök", meaning: "başlangıç" },
  { sound: "echo", source: "Evrensel kök", meaning: "yansıma, akılda kalma" },
  { sound: "elev", source: "Evrensel kök", meaning: "yükseltme" },
  { sound: "ember", source: "Evrensel kök", meaning: "canlı kıvılcım" },
  { sound: "ever", source: "Evrensel kök", meaning: "süreklilik" },
  { sound: "flow", source: "Evrensel kök", meaning: "akış" },
  { sound: "forge", source: "Evrensel kök", meaning: "üretim, şekillendirme" },
  { sound: "gala", source: "Evrensel kök", meaning: "parlak buluşma" },
  { sound: "glow", source: "Evrensel kök", meaning: "parlama" },
  { sound: "haven", source: "Evrensel kök", meaning: "güvenli alan" },
  { sound: "hira", source: "Evrensel kök", meaning: "ince parıltı" },
  { sound: "ion", source: "Evrensel kök", meaning: "enerji parçacığı" },
  { sound: "juno", source: "Evrensel kök", meaning: "soylu koruma" },
  { sound: "kairo", source: "Evrensel kök", meaning: "doğru an" },
  { sound: "kin", source: "Evrensel kök", meaning: "yakınlık, bağ" },
  { sound: "lattice", source: "Evrensel kök", meaning: "örgü, ağ" },
  { sound: "lumen", source: "Evrensel kök", meaning: "ışık ölçüsü" },
  { sound: "maven", source: "Evrensel kök", meaning: "uzmanlık" },
  { sound: "mira", source: "Evrensel kök", meaning: "bakış, hayranlık" },
  { sound: "nexus", source: "Evrensel kök", meaning: "bağlantı merkezi" },
  { sound: "nova", source: "Evrensel kök", meaning: "yeni patlama" },
  { sound: "nuri", source: "Evrensel kök", meaning: "ışık hissi" },
  { sound: "omni", source: "Evrensel kök", meaning: "kapsayıcılık" },
  { sound: "orbit", source: "Evrensel kök", meaning: "döngü, alan" },
  { sound: "prism", source: "Evrensel kök", meaning: "çoklu bakış" },
  { sound: "pulse", source: "Evrensel kök", meaning: "ritim, canlılık" },
  { sound: "quali", source: "Evrensel kök", meaning: "nitelik" },
  { sound: "rally", source: "Evrensel kök", meaning: "toplanma, enerji" },
  { sound: "raya", source: "Evrensel kök", meaning: "ışın, yön" },
  { sound: "relay", source: "Evrensel kök", meaning: "aktarma, hız" },
  { sound: "rise", source: "Evrensel kök", meaning: "yükseliş" },
  { sound: "safra", source: "Evrensel kök", meaning: "berraklık" },
  { sound: "signal", source: "Evrensel kök", meaning: "işaret, iletişim" },
  { sound: "soma", source: "Evrensel kök", meaning: "öz, beden" },
  { sound: "spire", source: "Evrensel kök", meaning: "zirve" },
  { sound: "stride", source: "Evrensel kök", meaning: "ilerleme" },
  { sound: "terra", source: "Evrensel kök", meaning: "zemin, dünya" },
  { sound: "thrive", source: "Evrensel kök", meaning: "serpilme" },
  { sound: "tide", source: "Evrensel kök", meaning: "dalga, ivme" },
  { sound: "true", source: "Evrensel kök", meaning: "doğruluk" },
  { sound: "valen", source: "Evrensel kök", meaning: "güç, değer" },
  { sound: "vanta", source: "Evrensel kök", meaning: "derin alan" },
  { sound: "vector", source: "Evrensel kök", meaning: "yönlü hareket" },
  { sound: "velar", source: "Evrensel kök", meaning: "yumuşak hız" },
  { sound: "vivid", source: "Evrensel kök", meaning: "canlı açıklık" },
  { sound: "way", source: "Evrensel kök", meaning: "yol" },
  { sound: "zen", source: "Evrensel kök", meaning: "sadelik, denge" },
  { sound: "zest", source: "Evrensel kök", meaning: "iştah, enerji" }
];

const suffixes = [
  "a",
  "o",
  "is",
  "io",
  "ra",
  "en",
  "ora",
  "eva",
  "iq",
  "lyn",
  "ara",
  "eo",
  "ex",
  "um",
  "yx",
  "ivo",
  "ara",
  "iqo",
  "era",
  "via",
  "lo",
  "li",
  "mo",
  "za",
  "ko",
  "ta",
  "ya",
  "on",
  "os",
  "al",
  "io",
  "iva",
  "ora",
  "zen",
  "ora",
  "neo",
  "vex",
  "vox",
  "nix",
  "sol",
  "lum"
];

function hashValue(input: string) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

function makeRng(seed: string) {
  let state = hashValue(seed) || 1;
  return () => {
    state = Math.imul(48271, state) % 2147483647;
    return (state & 2147483647) / 2147483647;
  };
}

function pick<T>(items: T[], rng: () => number) {
  return items[Math.floor(rng() * items.length) % items.length];
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function latinize(value: string) {
  return value
    .replace(/[çğıöşüÇĞİIÖŞÜ]/g, (letter) => turkishMap[letter] ?? letter)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function cleanName(value: string) {
  return latinize(value)
    .replace(/[^a-z]/gi, "")
    .replace(/(.)\1{2,}/g, "$1$1")
    .slice(0, 12);
}

function parseBlendInputs(value: string) {
  return value
    .split(/[,;\n/+&]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((label) => ({
      label,
      sound: cleanName(label).toLowerCase()
    }))
    .filter((item) => item.sound.length >= 2)
    .filter((item, index, arr) => arr.findIndex((other) => other.sound === item.sound) === index)
    .slice(0, 6);
}

function nameRootsFromBlendInput(value: string): Root[] {
  return parseBlendInputs(value).map((item) => ({
    sound: item.sound,
    source: "Girilen isim",
    meaning: `${item.label} ismi/kelimesi`
  }));
}

function blendTwoNames(first: string, second: string, rng: () => number) {
  const firstCut = Math.max(2, Math.ceil(first.length * (rng() > 0.5 ? 0.48 : 0.58)));
  const secondCut = Math.max(1, Math.floor(second.length * (rng() > 0.5 ? 0.42 : 0.34)));
  return titleCase(cleanName(`${first.slice(0, firstCut)}${second.slice(secondCut)}`));
}

function blendThreeNames(first: string, second: string, third: string, rng: () => number) {
  const firstPart = first.slice(0, Math.max(1, Math.ceil(first.length * 0.42)));
  const secondStart = Math.max(0, Math.floor(second.length * 0.28));
  const secondEnd = Math.max(secondStart + 1, Math.ceil(second.length * 0.68));
  const thirdStart = Math.max(1, Math.floor(third.length * (rng() > 0.5 ? 0.45 : 0.36)));
  return titleCase(cleanName(`${firstPart}${second.slice(secondStart, secondEnd)}${third.slice(thirdStart)}`));
}

function blendRoots(first: Root, second: Root, rng: () => number, lengthMode: string) {
  const secondStart = second.sound.slice(Math.max(1, Math.floor(second.sound.length / 2)));
  const suffix = lengthMode === "Kısa" ? "" : pick(suffixes, rng);
  const shouldReverse = rng() > 0.76;
  const raw = shouldReverse
    ? `${second.sound}${first.sound.slice(-2)}${suffix}`
    : `${first.sound}${secondStart}${suffix}`;
  return titleCase(cleanName(raw));
}

function buildAiContext({
  name,
  first,
  second,
  sector,
  keywords,
  aiContextMode,
  aiProvider,
  aiModel,
  apiKey,
  useBackendKey
}: {
  name: string;
  first: Root;
  second: Root;
  sector: string;
  keywords: string;
  aiContextMode: boolean;
  aiProvider: string;
  aiModel: string;
  apiKey: string;
  useBackendKey: boolean;
}) {
  const sectorSignal = sector.split(" ").slice(0, 5).join(" ");
  const keywordSignal = keywords.split(",").slice(0, 3).join(", ");
  if (!aiContextMode) {
    return `${first.source} ve ${second.source} seslerini birleştirir; ${keywordSignal || "netlik"} tarafına yaslanır.`;
  }
  const connector = apiKey.trim() || useBackendKey ? `${aiProvider} / ${aiModel}` : "API anahtarı bekliyor";
  return `${connector}: ${name}, ${sectorSignal.toLowerCase()} için ${first.meaning} ile ${second.meaning} arasında bağlam kurar.`;
}

function domainStatus(name: string, ext: string, risk: number): Availability {
  void name;
  void ext;
  void risk;
  return "unchecked";
}

function trademarkStatus(name: string, region: string, risk: number): Trademark {
  const regionalPressure = region === "ABD" ? 12 : region === "Avrupa" ? 9 : 6;
  const score = (hashValue(`${region}${name}`) + regionalPressure + Math.floor(risk / 6)) % 100;
  if (score < 48) return "clear";
  if (score < 79) return "watch";
  return "conflict";
}

function sectorRoots(sector: string): Root[] {
  const lower = sector.toLowerCase();
  if (lower.includes("kahve") || lower.includes("cafe")) {
    return [
      { sound: "kava", source: "Sektör", meaning: "kahve ritüeli" },
      { sound: "roa", source: "Sektör", meaning: "kavurma" }
    ];
  }
  if (lower.includes("finans") || lower.includes("para")) {
    return [
      { sound: "valo", source: "Sektör", meaning: "değer" },
      { sound: "cora", source: "Sektör", meaning: "güven çekirdeği" }
    ];
  }
  if (lower.includes("sağlık") || lower.includes("wellness")) {
    return [
      { sound: "vita", source: "Sektör", meaning: "yaşam" },
      { sound: "nara", source: "Sektör", meaning: "denge" }
    ];
  }
  if (lower.includes("yapay") || lower.includes("ai") || lower.includes("zeka")) {
    return [
      { sound: "syn", source: "Sektör", meaning: "sentez" },
      { sound: "nexa", source: "Sektör", meaning: "akıllı bağ" }
    ];
  }
  return [
    { sound: "mira", source: "Sektör", meaning: "pazar sinyali" },
    { sound: "vanta", source: "Sektör", meaning: "sağlam alan" }
  ];
}

function makeCandidate({
  name,
  roots,
  note,
  context,
  tags,
  extensions,
  regions,
  risk,
  scoreBoost = 0
}: {
  name: string;
  roots: string;
  note: string;
  context: string;
  tags: string[];
  extensions: string[];
  regions: string[];
  risk: number;
  scoreBoost?: number;
}): Candidate {
  const domains = Object.fromEntries(
    extensions.map((ext) => [ext, domainStatus(name, ext, risk)])
  ) as Record<string, Availability>;
  const trademarks = Object.fromEntries(
    regions.map((region) => [region, trademarkStatus(name, region, risk)])
  ) as Record<string, Trademark>;
  const openDomains = Object.values(domains).filter((status) => status === "available").length;
  const clearMarks = Object.values(trademarks).filter((status) => status === "clear").length;
  const score = Math.min(
    98,
    66 +
      openDomains * 4 +
      clearMarks * 5 -
      Object.values(domains).filter((status) => status === "taken").length * 4 -
      Object.values(trademarks).filter((status) => status === "conflict").length * 6 +
      scoreBoost
  );

  return {
    name,
    score,
    roots,
    note,
    context,
    tags: tags.filter((tag, index, arr) => arr.indexOf(tag) === index).slice(0, 5),
    domains,
    trademarks
  };
}

function generateBlendCandidates({
  blendInput,
  blendMode,
  tone,
  pulse,
  extensions,
  regions,
  risk,
  rng
}: {
  blendInput: string;
  blendMode: BlendMode;
  tone: string;
  pulse: string;
  extensions: string[];
  regions: string[];
  risk: number;
  rng: () => number;
}) {
  const inputs = parseBlendInputs(blendInput);
  if (inputs.length < 2) return [];

  const candidates: Candidate[] = [];
  const seen = new Set<string>();

  function add(name: string, labels: string[]) {
    if (name.length < 4 || seen.has(name)) return;
    seen.add(name);
    candidates.push(
      makeCandidate({
        name,
        roots: `İsim harmanı: ${labels.join(" + ")}`,
        note: `${tone} tonunda, ${labels.length} isimden türetilmiş kısa marka sesi.`,
        context: `${name}, ${labels.join(", ")} isimlerinin hece başı ve sonlarını marka ritmine göre birleştirir.`,
        tags: ["İsim harmanı", `${labels.length} isim`, tone, pulse],
        extensions,
        regions,
        risk,
        scoreBoost: labels.length === 3 ? 12 : 9
      })
    );
  }

  for (let i = 0; i < inputs.length; i += 1) {
    for (let j = 0; j < inputs.length; j += 1) {
      if (i === j) continue;
      if (blendMode === "3lu") continue;
      add(blendTwoNames(inputs[i].sound, inputs[j].sound, rng), [inputs[i].label, inputs[j].label]);
    }
  }

  if (inputs.length >= 3 && blendMode !== "2li") {
    for (let i = 0; i < inputs.length; i += 1) {
      for (let j = 0; j < inputs.length; j += 1) {
        for (let k = 0; k < inputs.length; k += 1) {
          if (i === j || i === k || j === k) continue;
          add(blendThreeNames(inputs[i].sound, inputs[j].sound, inputs[k].sound, rng), [
            inputs[i].label,
            inputs[j].label,
            inputs[k].label
          ]);
        }
      }
    }
  }

  return candidates.sort((a, b) => b.score - a.score).slice(0, 8);
}

function generateCandidates({
  sector,
  keywords,
  blendInput,
  blendMode,
  avoid,
  tone,
  pulse,
  lengthMode,
  languages,
  extensions,
  regions,
  risk,
  round,
  aiContextMode,
  aiProvider,
  aiModel,
  apiKey,
  useBackendKey
}: {
  sector: string;
  keywords: string;
  blendInput: string;
  blendMode: BlendMode;
  avoid: string;
  tone: string;
  pulse: string;
  lengthMode: string;
  languages: string[];
  extensions: string[];
  regions: string[];
  risk: number;
  round: number;
  aiContextMode: boolean;
  aiProvider: string;
  aiModel: string;
  apiKey: string;
  useBackendKey: boolean;
}): Candidate[] {
  const activeLanguages = languages.length ? languages : ["turkic", "latin", "invented", "cyber"];
  const roots = rootsForLanguages(activeLanguages);
  const inputNameRoots = nameRootsFromBlendInput(blendInput);
  const enrichedRoots = [...sectorRoots(`${sector} ${keywords}`), ...inputNameRoots, ...roots];
  const blocked = avoid
    .toLowerCase()
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const rng = makeRng(
    `${sector}|${keywords}|${blendInput}|${blendMode}|${tone}|${pulse}|${lengthMode}|${risk}|${round}|${activeLanguages.join(",")}|${aiProvider}|${aiModel}`
  );
  const seen = new Set<string>();
  const candidates: Candidate[] = generateBlendCandidates({
    blendInput,
    blendMode,
    tone,
    pulse,
    extensions,
    regions,
    risk,
    rng
  }).filter((candidate) => !blocked.some((word) => candidate.name.toLowerCase().includes(word)));
  candidates.forEach((candidate) => seen.add(candidate.name));

  while (candidates.length < 24) {
    const first = pick(enrichedRoots, rng);
    const second = pick(enrichedRoots, rng);
    let name = blendRoots(first, second, rng, lengthMode);
    if (name.length < 4) {
      name = titleCase(`${name}${pick(suffixes, rng)}`);
    }
    if (blocked.some((word) => name.toLowerCase().includes(word)) || seen.has(name)) {
      continue;
    }
    seen.add(name);

    const domains = Object.fromEntries(
      extensions.map((ext) => [ext, domainStatus(name, ext, risk)])
    ) as Record<string, Availability>;
    const trademarks = Object.fromEntries(
      regions.map((region) => [region, trademarkStatus(name, region, risk)])
    ) as Record<string, Trademark>;
    const openDomains = Object.values(domains).filter((status) => status === "available").length;
    const clearMarks = Object.values(trademarks).filter((status) => status === "clear").length;
    const score = Math.min(
      96,
      62 +
        Math.round(rng() * 17) +
        openDomains * 4 +
        clearMarks * 5 -
        Object.values(domains).filter((status) => status === "taken").length * 4 -
        Object.values(trademarks).filter((status) => status === "conflict").length * 6 +
        (first.source !== second.source ? 3 : 0) +
        (aiContextMode ? 2 : 0)
    );

    candidates.push({
      name,
      score,
      roots: `${first.source} "${first.meaning}" + ${second.source} "${second.meaning}"`,
      note: `${tone} tonunda, ${pulse.toLowerCase()} çağrışımı taşıyan kısa marka sesi.`,
      context: buildAiContext({
        name,
        first,
        second,
        sector,
        keywords,
        aiContextMode,
        aiProvider,
        aiModel,
        apiKey,
        useBackendKey
      }),
      tags: [tone, pulse, first.source, second.source, aiContextMode ? "AI bağlam" : "Kök harman"].filter(
        (tag, index, arr) => arr.indexOf(tag) === index
      ),
      domains,
      trademarks
    });
  }

  return candidates.sort((a, b) => b.score - a.score);
}

function availabilityMeta(status: Availability) {
  if (status === "available") return { label: "Boş", className: "good" };
  if (status === "review") return { label: "İncele", className: "warn" };
  if (status === "unchecked") return { label: "Kontrol", className: "warn" };
  return { label: "Dolu", className: "bad" };
}

function trademarkMeta(status: Trademark) {
  if (status === "clear") return { label: "Temiz", className: "good" };
  if (status === "watch") return { label: "İzle", className: "warn" };
  return { label: "Çakışma", className: "bad" };
}

function candidateMatchesDomainFilter(candidate: Candidate, filter: DomainFilter) {
  const statuses = Object.values(candidate.domains);
  if (filter === "anyAvailable") return statuses.includes("available");
  if (filter === "comAvailable") return candidate.domains[".com"] === "available";
  if (filter === "unchecked") return statuses.includes("unchecked");
  if (filter === "hideTaken") return statuses.every((status) => status !== "taken");
  return true;
}

function makeLocalBrandStory({
  candidate,
  sector,
  keywords,
  tone,
  pulse
}: {
  candidate: Candidate;
  sector: string;
  keywords: string;
  tone: string;
  pulse: string;
}): BrandStory {
  const keywordList = keywords
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean)
    .slice(0, 3);
  const signal = keywordList.length ? keywordList.join(", ") : "güven, hız ve özgünlük";
  const availableDomain = Object.entries(candidate.domains).find(([, status]) => status === "available")?.[0];
  const domainLine = availableDomain
    ? `${candidate.name.toLowerCase()}${availableDomain} için canlı RDAP fırsatı da hikayeyi hızlandırır.`
    : "Domain tarafı kesinleşene kadar hikaye, isim hissi ve kategori vaadi üzerinden kurulmalıdır.";

  return {
    origin: `${candidate.name}, gerçek bir tarih iddiası taşımayan kurmaca bir marka anlatısıdır. ${candidate.roots} çizgisinden esinlenir; kısa sesi ${tone.toLowerCase()} bir marka duruşu ve ${pulse.toLowerCase()} hissi verir.`,
    pitch: `${candidate.name}, ${sector.toLowerCase()} alanında ${signal} arayan insanlar için sade ve akılda kalan bir başlangıç noktası sunar. Marka, karmaşık karar anlarını daha net, daha hızlı ve daha güvenilir hissettirmeyi vaat eder.`,
    taglines: [
      `${candidate.name} ile isim netleşir.`,
      "Fikrin sesini bul.",
      "Kısa isim, güçlü hikaye.",
      `${pulse} hissini markaya taşı.`
    ],
    audience: `${candidate.name}, yeni bir ürün, stüdyo, SaaS, ajans veya yaratıcı girişim kurarken premium ama erişilebilir bir isim arayan ekiplerle iyi eşleşir.`,
    hero: `${candidate.name}, marka ismi arayışını sezgisel bir keşfe dönüştürür: anlamı, sesi, domain sinyalini ve tescil riskini aynı masada toplar.`,
    founder: `Kurucu hikayesi ${candidate.name} etrafında şöyle kurulabilir: iyi fikirler çoğu zaman hazırdır, ama doğru isim gelmeden görünür olmaz. Bu marka, o eşiği kısaltmak için doğdu.`,
    socialBio: `${candidate.name} | İsim, anlam ve marka hikayesini aynı yerde bul. ${domainLine}`
  };
}

function uniqueRoots(roots: Root[]) {
  return roots.filter(
    (root, index, arr) =>
      arr.findIndex((other) => other.sound.toLowerCase() === root.sound.toLowerCase()) === index
  );
}

function rootsForLanguages(languages: string[]) {
  const activeLanguages = languages.length ? languages : ["turkic", "latin", "invented", "cyber"];
  return uniqueRoots([
    ...activeLanguages.flatMap((language) => ROOTS[language] ?? []),
    ...semanticRootBank
  ]);
}

function candidateFromAi(
  candidate: AiCandidate,
  index: number,
  {
    extensions,
    regions,
    risk,
    tone,
    pulse
  }: {
    extensions: string[];
    regions: string[];
    risk: number;
    tone: string;
    pulse: string;
  }
): Candidate | null {
  const name = titleCase(cleanName(candidate.name ?? ""));
  if (name.length < 4) return null;
  const domains = Object.fromEntries(
    extensions.map((ext) => [ext, domainStatus(name, ext, risk)])
  ) as Record<string, Availability>;
  const trademarks = Object.fromEntries(
    regions.map((region) => [region, trademarkStatus(name, region, risk)])
  ) as Record<string, Trademark>;
  const openDomains = Object.values(domains).filter((status) => status === "available").length;
  const clearMarks = Object.values(trademarks).filter((status) => status === "clear").length;

  return {
    name,
    score: Math.min(98, 76 + openDomains * 4 + clearMarks * 5 - index),
    roots: candidate.roots || "AI canlı üretim",
    note: candidate.note || `${tone} tonunda, ${pulse.toLowerCase()} hissi taşıyan marka adı.`,
    context: candidate.context || "AI sağlayıcısı anlam ve bağlam önerisi üretti.",
    tags: [
      "AI canlı",
      tone,
      pulse,
      ...(Array.isArray(candidate.tags) ? candidate.tags : [])
    ]
      .filter((tag, tagIndex, arr) => arr.indexOf(tag) === tagIndex)
      .slice(0, 5),
    domains,
    trademarks
  };
}

function ClerkSetupScreen() {
  return (
    <div className="app theme-studio">
      <main className="auth-shell">
        <section className="auth-panel">
          <div className="brand-lockup">
            <div className="mark" aria-hidden="true">
              <Sparkles size={22} />
            </div>
            <div>
              <h1>NameForge AI</h1>
              <span>Clerk giriş sistemi kurulumu</span>
            </div>
          </div>
          <div className="auth-copy">
            <span className="eyebrow">Giriş sistemi</span>
            <h2>Clerk publishable key bekleniyor</h2>
            <p>
              Clerk Dashboard üzerinden publishable key alıp proje kökünde `.env` dosyasına ekle.
              Sonra dev sunucusunu yeniden başlat.
            </p>
          </div>
          <pre className="env-snippet">VITE_CLERK_PUBLISHABLE_KEY=pk_test_...</pre>
        </section>
      </main>
    </div>
  );
}

function AuthLanding() {
  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <div className="brand-lockup">
          <div className="mark" aria-hidden="true">
            <Sparkles size={22} />
          </div>
          <div>
            <h1>NameForge AI</h1>
            <span>Marka isim stüdyosuna giriş</span>
          </div>
        </div>
        <div className="auth-copy">
          <span className="eyebrow">Üye alanı</span>
          <h2>İsim havuzunu, favorileri ve kontrolleri hesabınla yönet</h2>
          <p>Giriş yaptıktan sonra isim üretici, RDAP kontrolü ve kısa liste çalışma alanı açılır.</p>
        </div>
        <div className="auth-actions">
          <SignInButton mode="modal">
            <button className="primary-action" type="button">
              <KeyRound size={18} />
              Giriş yap
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="secondary-action" type="button">
              <Sparkles size={18} />
              Hesap oluştur
            </button>
          </SignUpButton>
        </div>
      </section>
    </main>
  );
}

function App({ clerkEnabled = false }: AppProps) {
  const [design, setDesign] = useState<DesignId>("studio");
  const [sector, setSector] = useState("Yapay zeka destekli marka isimlendirme platformu");
  const [keywords, setKeywords] = useState("özgün, hızlı, güvenilir, global");
  const [blendInput, setBlendInput] = useState("Onur, Mira, Nova");
  const [blendMode, setBlendMode] = useState<BlendMode>("auto");
  const [avoid, setAvoid] = useState("soft, tech, marka");
  const [tone, setTone] = useState(toneOptions[0]);
  const [pulse, setPulse] = useState("Keşif");
  const [lengthMode, setLengthMode] = useState("Kısa");
  const [risk, setRisk] = useState(42);
  const [languages, setLanguages] = useState(() => languageOptions.map((option) => option.id));
  const [extensions, setExtensions] = useState([".com", ".ai", ".io"]);
  const [regions, setRegions] = useState(["Türkiye", "ABD", "Avrupa"]);
  const [aiContextMode, setAiContextMode] = useState(true);
  const [aiProvider, setAiProvider] = useState(apiProviders[0]);
  const [aiEndpoint, setAiEndpoint] = useState("https://api.openai.com/v1");
  const [aiModel, setAiModel] = useState("gpt-4.1-mini");
  const [apiKey, setApiKey] = useState("");
  const [useBackendKey, setUseBackendKey] = useState(true);
  const [apiMode, setApiMode] = useState<ApiMode>("local");
  const [apiStatus, setApiStatus] = useState("Lokal motor hazır; backend env anahtarı denenebilir.");
  const [isGenerating, setIsGenerating] = useState(false);
  const [liveCandidates, setLiveCandidates] = useState<Candidate[] | null>(null);
  const [domainOverrides, setDomainOverrides] = useState<Record<string, Record<string, Availability>>>({});
  const [domainStatusText, setDomainStatusText] = useState(DOMAIN_PENDING_TEXT);
  const [isCheckingDomains, setIsCheckingDomains] = useState(false);
  const [domainFilter, setDomainFilter] = useState<DomainFilter>("all");
  const [stories, setStories] = useState<Record<string, BrandStory>>({});
  const [storyLoading, setStoryLoading] = useState<Record<string, boolean>>({});
  const [storyStatus, setStoryStatus] = useState<Record<string, string>>({});
  const [round, setRound] = useState(1);
  const [saved, setSaved] = useState<Record<string, Candidate>>(() => {
    try {
      const stored = window.localStorage.getItem("nameforge.saved");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  const [copied, setCopied] = useState(false);
  const [copiedName, setCopiedName] = useState("");

  const activeRoots = useMemo(
    () => [...nameRootsFromBlendInput(blendInput), ...rootsForLanguages(languages)],
    [blendInput, languages]
  );

  const localCandidates = useMemo(
    () =>
      generateCandidates({
        sector,
        keywords,
        blendInput,
        blendMode,
        avoid,
        tone,
        pulse,
        lengthMode,
        languages,
        extensions,
        regions,
        risk,
        round,
        aiContextMode,
        aiProvider,
        aiModel,
        apiKey,
        useBackendKey
      }),
    [
      sector,
      keywords,
      blendInput,
      blendMode,
      avoid,
      tone,
      pulse,
      lengthMode,
      languages,
      extensions,
      regions,
      risk,
      round,
      aiContextMode,
      aiProvider,
      aiModel,
      apiKey,
      useBackendKey
    ]
  );

  const candidates = liveCandidates ?? localCandidates;
  const candidatesWithDomains = useMemo(
    () =>
      candidates.map((candidate) => ({
        ...candidate,
        domains: domainOverrides[candidate.name] ?? candidate.domains
      })),
    [candidates, domainOverrides]
  );
  const domainCheckSignature = useMemo(
    () =>
      [
        candidates.map((candidate) => candidate.name).join("|"),
        extensions.join("|")
      ].join("::"),
    [candidates, extensions]
  );
  const filteredCandidates = useMemo(
    () => candidatesWithDomains.filter((candidate) => candidateMatchesDomainFilter(candidate, domainFilter)),
    [candidatesWithDomains, domainFilter]
  );

  const savedItems = Object.values(saved);
  const bestScore = filteredCandidates.length
    ? Math.max(...filteredCandidates.map((candidate) => candidate.score))
    : 0;
  const openDomainCount = filteredCandidates.reduce(
    (total, candidate) =>
      total + Object.values(candidate.domains).filter((status) => status === "available").length,
    0
  );
  const clearTrademarkCount = filteredCandidates.reduce(
    (total, candidate) =>
      total + Object.values(candidate.trademarks).filter((status) => status === "clear").length,
    0
  );
  const rootPoolCount = activeRoots.length;

  useEffect(() => {
    setLiveCandidates(null);
    setDomainOverrides({});
    setDomainStatusText(DOMAIN_PENDING_TEXT);
  }, [
    sector,
    keywords,
    blendInput,
    blendMode,
    avoid,
    tone,
    pulse,
    lengthMode,
    languages,
    extensions,
    regions,
    risk,
    aiContextMode,
    aiProvider,
    aiEndpoint,
    aiModel,
    apiKey,
    useBackendKey
  ]);

  useEffect(() => {
    try {
      window.localStorage.setItem("nameforge.saved", JSON.stringify(saved));
    } catch {
      // Local storage is a convenience layer; generation should keep working without it.
    }
  }, [saved]);

  function toggleArrayValue(value: string, items: string[], setter: (next: string[]) => void) {
    const next = items.includes(value) ? items.filter((item) => item !== value) : [...items, value];
    setter(next);
  }

  function applyLanguagePreset(values: string[]) {
    setLanguages(values);
    setLiveCandidates(null);
    setDomainOverrides({});
    setDomainStatusText(DOMAIN_PENDING_TEXT);
    setRound((value) => value + 1);
  }

  async function handleGenerateNames() {
    setDomainOverrides({});
    setDomainStatusText(DOMAIN_PENDING_TEXT);
    if (!aiContextMode || (!apiKey.trim() && !useBackendKey)) {
      setLiveCandidates(null);
      setApiMode(apiKey.trim() ? "local" : "fallback");
      setApiStatus(
        apiKey.trim()
          ? "AI katmanı kapalı; lokal isim motoru çalıştı."
          : "API anahtarı yok; lokal isim motoru çalıştı."
      );
      setRound((value) => value + 1);
      return;
    }

    setIsGenerating(true);
    setApiMode("local");
    setApiStatus("AI sağlayıcısına bağlanıyor...");
    try {
      const response = await fetch(`${API_BASE}/api/ai/names`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sector,
          keywords,
          blendInput,
          blendMode,
          avoid,
          tone,
          pulse,
          lengthMode,
          languages,
          roots: activeRoots,
          aiProvider,
          aiEndpoint,
          aiModel,
          apiKey: useBackendKey ? "" : apiKey,
          useBackendKey
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "AI endpoint hata verdi");
      }
      if (payload.mode === "fallback") {
        setLiveCandidates(null);
        setRound((value) => value + 1);
        setApiMode("fallback");
        setApiStatus(payload.message || "AI anahtarı bulunamadı; lokal motor çalıştı.");
        return;
      }
      const nextCandidates = (payload.candidates ?? [])
        .map((candidate: AiCandidate, index: number) =>
          candidateFromAi(candidate, index, { extensions, regions, risk, tone, pulse })
        )
        .filter(Boolean) as Candidate[];
      if (!nextCandidates.length) {
        throw new Error("AI geçerli isim döndürmedi");
      }
      setLiveCandidates(nextCandidates);
      setApiMode("live");
      setApiStatus(payload.message || "AI canlı isim seti alındı.");
    } catch (error) {
      setLiveCandidates(null);
      setRound((value) => value + 1);
      setApiMode("error");
      setApiStatus(
        `AI bağlantısı başarısız; lokal motor çalıştı. ${
          error instanceof Error ? error.message : "Bilinmeyen hata"
        }`
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function runLiveDomainCheck(
    targetCandidates: Candidate[],
    mode: "auto" | "manual" = "manual",
    signal?: AbortSignal
  ) {
    if (!extensions.length) {
      setDomainStatusText("Önce en az bir domain uzantısı seç.");
      return;
    }
    if (!targetCandidates.length) {
      setDomainStatusText("Kontrol edilecek isim yok.");
      return;
    }
    setIsCheckingDomains(true);
    setDomainStatusText(
      mode === "auto"
        ? "Domainler resmi RDAP servisleriyle otomatik kontrol ediliyor..."
        : "RDAP canlı domain kontrolü yenileniyor..."
    );
    try {
      const response = await fetch(`${API_BASE}/api/domain-check`, {
        method: "POST",
        signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          names: targetCandidates.map((candidate) => candidate.name),
          extensions
        })
      });
      const payload = await response.json();
      if (signal?.aborted) return;
      if (!response.ok) {
        throw new Error(payload.error || "Domain endpoint hata verdi");
      }
      setDomainOverrides(payload.results ?? {});
      setDomainStatusText(
        `${payload.message || "RDAP canlı domain kontrolü tamamlandı."} ${
          targetCandidates.length * extensions.length
        } domain kontrol edildi.`
      );
    } catch (error) {
      if (signal?.aborted) return;
      setDomainStatusText(
        `Canlı domain kontrolü başarısız; domainler kontrol bekliyor. ${
          error instanceof Error ? error.message : "Bilinmeyen hata"
        }`
      );
    } finally {
      if (!signal?.aborted) {
        setIsCheckingDomains(false);
      }
    }
  }

  async function handleLiveDomainCheck() {
    await runLiveDomainCheck(candidates, "manual");
  }

  useEffect(() => {
    if (!domainCheckSignature || !candidates.length || !extensions.length) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void runLiveDomainCheck(candidates, "auto", controller.signal);
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [domainCheckSignature]);

  function toggleSaved(candidate: Candidate) {
    setSaved((current) => {
      const next = { ...current };
      if (next[candidate.name]) {
        delete next[candidate.name];
      } else {
        next[candidate.name] = { ...candidate, story: stories[candidate.name] ?? candidate.story };
      }
      return next;
    });
  }

  function setStoryForCandidate(candidate: Candidate, story: BrandStory, status: string) {
    setStories((current) => ({ ...current, [candidate.name]: story }));
    setStoryStatus((current) => ({ ...current, [candidate.name]: status }));
    setSaved((current) =>
      current[candidate.name]
        ? { ...current, [candidate.name]: { ...current[candidate.name], story } }
        : current
    );
  }

  async function handleGenerateStory(candidate: Candidate) {
    const fallbackStory = makeLocalBrandStory({ candidate, sector, keywords, tone, pulse });
    setStoryLoading((current) => ({ ...current, [candidate.name]: true }));
    setStoryStatus((current) => ({ ...current, [candidate.name]: "Marka hikayesi hazırlanıyor..." }));

    if (!aiContextMode || (!apiKey.trim() && !useBackendKey)) {
      setStoryForCandidate(candidate, fallbackStory, "Lokal hikaye motoru üretildi.");
      setStoryLoading((current) => ({ ...current, [candidate.name]: false }));
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/ai/story`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate: {
            name: candidate.name,
            roots: candidate.roots,
            note: candidate.note,
            context: candidate.context,
            tags: candidate.tags,
            domains: candidate.domains,
            trademarks: candidate.trademarks
          },
          sector,
          keywords,
          tone,
          pulse,
          aiProvider,
          aiEndpoint,
          aiModel,
          apiKey: useBackendKey ? "" : apiKey,
          useBackendKey
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Hikaye endpoint hata verdi");
      }
      if (payload.mode === "fallback" || !payload.story) {
        setStoryForCandidate(candidate, fallbackStory, "AI anahtarı yok; lokal hikaye üretildi.");
        return;
      }
      setStoryForCandidate(candidate, payload.story as BrandStory, payload.message || "AI marka hikayesi üretildi.");
    } catch (error) {
      setStoryForCandidate(
        candidate,
        fallbackStory,
        `AI hikaye bağlantısı başarısız; lokal hikaye üretildi. ${
          error instanceof Error ? error.message : "Bilinmeyen hata"
        }`
      );
    } finally {
      setStoryLoading((current) => ({ ...current, [candidate.name]: false }));
    }
  }

  async function copyShortlist() {
    const text = savedItems
      .map((item) => {
        const story = item.story ? ` - Hikaye: ${item.story.pitch}` : "";
        return `${item.name} - ${item.score}/100 - ${item.roots} - ${item.context}${story}`;
      })
      .join("\n");
    if (text) {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    }
  }

  async function copyCandidate(candidate: Candidate) {
    const story = stories[candidate.name] ?? candidate.story;
    const firstDomain = Object.entries(candidate.domains)
      .map(([extension, status]) => `${candidate.name.toLowerCase()}${extension}: ${availabilityMeta(status).label}`)
      .join(", ");
    await navigator.clipboard.writeText(
      `${candidate.name}\nSkor: ${candidate.score}/100\nKökler: ${candidate.roots}\nBağlam: ${candidate.context}\nDomain: ${firstDomain}${
        story
          ? `\n\nMarka hikayesi: ${story.origin}\nPitch: ${story.pitch}\nSloganlar: ${story.taglines.join(" / ")}\nHero: ${story.hero}`
          : ""
      }`
    );
    setCopiedName(candidate.name);
    window.setTimeout(() => setCopiedName(""), 1400);
  }

  function rdapUrl(candidate: Candidate) {
    const extension = extensions[0] ?? ".com";
    return `https://rdap.org/domain/${candidate.name.toLowerCase()}${extension}`;
  }

  function trademarkUrl(region: string) {
    if (region === "Türkiye") return "https://www.turkpatent.gov.tr/arastirma-yap?form=trademark&params=";
    if (region === "ABD") return "https://www.uspto.gov/trademarks/search";
    return "https://www.euipo.europa.eu/en/search-ip";
  }

  if (!clerkEnabled) {
    return <ClerkSetupScreen />;
  }

  return (
    <div className={`app theme-${design}`}>
      <SignedOut>
        <AuthLanding />
      </SignedOut>

      <SignedIn>
        <header className="topbar">
        <div className="brand-lockup">
          <div className="mark" aria-hidden="true">
            <Sparkles size={22} />
          </div>
          <div>
            <h1>NameForge AI</h1>
            <span>İsim, domain ve tescil skoru</span>
          </div>
        </div>
        <div className="top-actions">
          <span className={`signal mode-${apiMode}`}>
            <BadgeCheck size={16} />
            {apiMode === "live" ? "AI canlı" : apiMode === "error" ? "Fallback" : "Lokal"}
          </span>
          <button className="icon-button" type="button" title="Kontrolleri yenile">
            <RefreshCw size={18} />
          </button>
          <div className="user-menu">
            <UserButton />
          </div>
        </div>
      </header>

      <main className="page-shell">
        <section className="design-strip" aria-label="Tasarım seçenekleri">
          {designs.map((option) => {
            const Icon = option.Icon;
            return (
              <button
                className={`design-card ${design === option.id ? "selected" : ""}`}
                key={option.id}
                onClick={() => setDesign(option.id)}
                type="button"
              >
                <span className="preview-bars" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="design-title">
                  <Icon size={18} />
                  {option.title}
                </span>
                <strong>{option.label}</strong>
                <small>{option.note}</small>
              </button>
            );
          })}
        </section>

        <section className="workspace">
          <aside className="brief-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Brief</span>
                <h2>Marka DNA</h2>
              </div>
              <SlidersHorizontal size={19} />
            </div>

            <label className="field">
              <span>Sektör / ürün</span>
              <textarea value={sector} onChange={(event) => setSector(event.target.value)} rows={3} />
            </label>

            <label className="field">
              <span>Ana çağrışımlar</span>
              <input value={keywords} onChange={(event) => setKeywords(event.target.value)} />
            </label>

            <div className="blend-panel">
              <div className="block-title">
                <Sparkles size={17} />
                2-3 isim birleştirici
              </div>
              <label className="field">
                <span>Birleştirilecek isimler / kelimeler</span>
                <textarea
                  value={blendInput}
                  onChange={(event) => setBlendInput(event.target.value)}
                  rows={2}
                  placeholder="Örn. Onur, Ece, Nova"
                />
              </label>
              <div className="segmented three" aria-label="İsim birleştirme modu">
                {[
                  { value: "auto", label: "Oto" },
                  { value: "2li", label: "2'li" },
                  { value: "3lu", label: "3'lü" }
                ].map((option) => (
                  <button
                    className={blendMode === option.value ? "active" : ""}
                    key={option.value}
                    onClick={() => setBlendMode(option.value as BlendMode)}
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="helper-line">Virgül, satır veya + ile ayır; harman adayları listeye öncelikli girer.</p>
            </div>

            <label className="field">
              <span>Uzak durulacak kelimeler</span>
              <input value={avoid} onChange={(event) => setAvoid(event.target.value)} />
            </label>

            <div className="field-grid">
              <label className="field">
                <span>Ton</span>
                <select value={tone} onChange={(event) => setTone(event.target.value)}>
                  {toneOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Duygu</span>
                <select value={pulse} onChange={(event) => setPulse(event.target.value)}>
                  {["Keşif", "Güven", "Hız", "Ritüel", "Zarafet", "Cesaret"].map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="segmented" aria-label="İsim uzunluğu">
              {["Kısa", "Orta"].map((option) => (
                <button
                  className={lengthMode === option ? "active" : ""}
                  key={option}
                  onClick={() => setLengthMode(option)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="control-block">
              <div className="block-title">
                <Languages size={17} />
                Dil karışımı
              </div>
              <div className="preset-row">
                {languagePresets.map((preset) => (
                  <button key={preset.label} onClick={() => applyLanguagePreset(preset.values)} type="button">
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="language-stack">
                {languageGroups.map((group) => (
                  <div className="language-group" key={group}>
                    <span>{group}</span>
                    <div className="check-grid">
                      {languageOptions
                        .filter((option) => option.group === group)
                        .map((option) => (
                          <label className="check-pill" key={option.id}>
                            <input
                              checked={languages.includes(option.id)}
                              onChange={() => toggleArrayValue(option.id, languages, setLanguages)}
                              type="checkbox"
                            />
                            <span>{option.label}</span>
                          </label>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="control-block compact">
              <div className="block-title">
                <Globe size={17} />
                Domain
              </div>
              <div className="mini-pills">
                {extensionOptions.map((extension) => (
                  <button
                    className={extensions.includes(extension) ? "active" : ""}
                    key={extension}
                    onClick={() => toggleArrayValue(extension, extensions, setExtensions)}
                    type="button"
                  >
                    {extension}
                  </button>
                ))}
              </div>
            </div>

            <div className="control-block compact">
              <div className="block-title">
                <ShieldCheck size={17} />
                Tescil bölgeleri
              </div>
              <div className="mini-pills">
                {regionOptions.map((region) => (
                  <button
                    className={regions.includes(region) ? "active" : ""}
                    key={region}
                    onClick={() => toggleArrayValue(region, regions, setRegions)}
                    type="button"
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>

            <label className="range-field">
              <span>Risk toleransı</span>
              <input
                max="100"
                min="0"
                onChange={(event) => setRisk(Number(event.target.value))}
                type="range"
                value={risk}
              />
              <b>{risk}</b>
            </label>

            <div className="ai-panel">
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">AI API</span>
                  <h2>Bağlam ajanı</h2>
                </div>
                <BrainCircuit size={19} />
              </div>

              <label className="switch-row">
                <input
                  checked={aiContextMode}
                  onChange={(event) => setAiContextMode(event.target.checked)}
                  type="checkbox"
                />
                <span>AI anlam katmanı</span>
              </label>

              <label className="switch-row">
                <input
                  checked={useBackendKey}
                  onChange={(event) => setUseBackendKey(event.target.checked)}
                  type="checkbox"
                />
                <span>Backend env anahtarı</span>
              </label>

              <div className="field-grid">
                <label className="field">
                  <span>Sağlayıcı</span>
                  <select value={aiProvider} onChange={(event) => setAiProvider(event.target.value)}>
                    {apiProviders.map((provider) => (
                      <option key={provider}>{provider}</option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Model</span>
                  <input value={aiModel} onChange={(event) => setAiModel(event.target.value)} />
                </label>
              </div>

              <label className="field">
                <span>Endpoint</span>
                <input value={aiEndpoint} onChange={(event) => setAiEndpoint(event.target.value)} />
              </label>

              <label className="field api-key-field">
                <span>{useBackendKey ? "Tarayıcı anahtarı kapalı" : "API anahtarı"}</span>
                <input
                  autoComplete="off"
                  disabled={useBackendKey}
                  placeholder="sk-..."
                  type="password"
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                />
                <KeyRound size={16} />
              </label>
              <p className={`api-status mode-${apiMode}`}>{apiStatus}</p>
            </div>

            <button
              className="primary-action"
              disabled={isGenerating}
              onClick={handleGenerateNames}
              type="button"
            >
              <WandSparkles size={19} />
              {isGenerating ? "AI üretiyor..." : "AI destekli isim üret"}
            </button>
          </aside>

          <section className="results-column">
            <div className="metric-row">
              <div className="metric">
                <Gauge size={18} />
                <span>En iyi skor</span>
                <strong>{bestScore}</strong>
              </div>
              <div className="metric">
                <Globe size={18} />
                <span>RDAP boş</span>
                <strong>{openDomainCount}</strong>
              </div>
              <div className="metric">
                <ShieldCheck size={18} />
                <span>Temiz tescil</span>
                <strong>{clearTrademarkCount}</strong>
              </div>
              <div className="metric">
                <Database size={18} />
                <span>Kök havuzu</span>
                <strong>{rootPoolCount}</strong>
              </div>
            </div>

            <div className="results-header">
              <div>
                <span className="eyebrow">AI adayları</span>
                <h2>Özgün isim havuzu ({filteredCandidates.length}/{candidatesWithDomains.length})</h2>
              </div>
              <div className="header-actions">
                <button
                  className="ghost-action"
                  disabled={isCheckingDomains}
                  onClick={handleLiveDomainCheck}
                  type="button"
                >
                  <Globe size={17} />
                  {isCheckingDomains ? "Kontrol..." : "RDAP yenile"}
                </button>
                <button
                  className="ghost-action"
                  onClick={() => {
                    setLiveCandidates(null);
                    setDomainOverrides({});
                    setDomainStatusText(DOMAIN_PENDING_TEXT);
                    setRound((value) => value + 1);
                  }}
                  type="button"
                >
                  <RefreshCw size={17} />
                  Tazele
                </button>
              </div>
            </div>
            <p className="source-line">{domainStatusText}</p>

            <div className="filter-panel" aria-label="Domain sonuç filtresi">
              <div className="filter-title">
                <SlidersHorizontal size={16} />
                <span>Domain filtresi</span>
              </div>
              <div className="filter-actions">
                {domainFilterOptions.map((option) => (
                  <button
                    className={domainFilter === option.value ? "active" : ""}
                    key={option.value}
                    onClick={() => setDomainFilter(option.value)}
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="name-grid">
              {filteredCandidates.map((candidate) => {
                const story = stories[candidate.name] ?? candidate.story;
                const isStoryLoading = Boolean(storyLoading[candidate.name]);
                return (
                <article className="name-card" key={candidate.name}>
                  <div className="card-topline">
                    <div>
                      <h3>{candidate.name}</h3>
                      <span>{candidate.roots}</span>
                    </div>
                    <button
                      className={`save-button ${saved[candidate.name] ? "saved" : ""}`}
                      onClick={() => toggleSaved(candidate)}
                      title={saved[candidate.name] ? "Listeden çıkar" : "Beğenilenlere ekle"}
                      type="button"
                    >
                      <Star size={18} fill={saved[candidate.name] ? "currentColor" : "none"} />
                    </button>
                  </div>
                  <p>{candidate.note}</p>
                  <p className="context-line">{candidate.context}</p>
                  <div className="tag-row">
                    {candidate.tags.slice(0, 5).map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <div className="score-line">
                    <span>Skor</span>
                    <div>
                      <i style={{ width: `${candidate.score}%` }} />
                    </div>
                    <strong>{candidate.score}</strong>
                  </div>
                  <div className="status-table">
                    <div>
                      <span className="table-label">
                        <Globe size={14} />
                        Domain
                      </span>
                      {Object.entries(candidate.domains).map(([extension, status]) => {
                        const meta = availabilityMeta(status);
                        return (
                          <span className={`status ${meta.className}`} key={extension}>
                            {extension} {meta.label}
                          </span>
                        );
                      })}
                    </div>
                    <div>
                      <span className="table-label">
                        <Search size={14} />
                        Marka
                      </span>
                      {Object.entries(candidate.trademarks).map(([region, status]) => {
                        const meta = trademarkMeta(status);
                        return (
                          <span className={`status ${meta.className}`} key={region}>
                            {region} {meta.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div className="card-actions">
                    <button disabled={isStoryLoading} onClick={() => handleGenerateStory(candidate)} type="button">
                      <FileText size={15} />
                      {isStoryLoading ? "Hikaye..." : story ? "Hikayeyi yenile" : "Hikaye üret"}
                    </button>
                    <button onClick={() => copyCandidate(candidate)} type="button">
                      <Copy size={15} />
                      {copiedName === candidate.name ? "Kopyalandı" : "Kopyala"}
                    </button>
                    <a href={rdapUrl(candidate)} rel="noreferrer" target="_blank">
                      <Globe size={15} />
                      RDAP
                    </a>
                    {regions.slice(0, 2).map((region) => (
                      <a href={trademarkUrl(region)} key={region} rel="noreferrer" target="_blank">
                        <ShieldCheck size={15} />
                        {region}
                      </a>
                    ))}
                  </div>
                  {storyStatus[candidate.name] ? <p className="story-note">{storyStatus[candidate.name]}</p> : null}
                  {story ? (
                    <div className="story-panel">
                      <div>
                        <span className="eyebrow">Marka hikayesi</span>
                        <p>{story.origin}</p>
                      </div>
                      <div>
                        <strong>Pitch</strong>
                        <p>{story.pitch}</p>
                      </div>
                      <div>
                        <strong>Slogan</strong>
                        <div className="tag-row">
                          {story.taglines.slice(0, 4).map((tagline) => (
                            <span key={tagline}>{tagline}</span>
                          ))}
                        </div>
                      </div>
                      <div className="story-grid">
                        <div>
                          <strong>Hedef his</strong>
                          <p>{story.audience}</p>
                        </div>
                        <div>
                          <strong>Hero metni</strong>
                          <p>{story.hero}</p>
                        </div>
                      </div>
                      <div>
                        <strong>Kurucu anlatısı</strong>
                        <p>{story.founder}</p>
                      </div>
                      <div>
                        <strong>Sosyal bio</strong>
                        <p>{story.socialBio}</p>
                      </div>
                    </div>
                  ) : null}
                </article>
                );
              })}
            </div>
            {filteredCandidates.length === 0 ? (
              <div className="results-empty">
                <Search size={21} />
                <span>Bu filtrede sonuç yok</span>
                <p>RDAP kontrolü bitince veya farklı uzantı seçince liste yeniden dolar.</p>
              </div>
            ) : null}
          </section>

          <aside className="shortlist-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Seçilenler</span>
                <h2>Favori isimler</h2>
              </div>
              <Bookmark size={19} />
            </div>

            <div className="shortlist">
              {savedItems.length === 0 ? (
                <div className="empty-state">
                  <Star size={22} />
                  <span>Henüz seçim yok</span>
                </div>
              ) : (
                savedItems.map((item) => (
                  <div className="saved-row" key={item.name}>
                    <div>
                      <strong>{item.name}</strong>
                      <span>{item.score}/100</span>
                    </div>
                    <button onClick={() => toggleSaved(item)} title="Kaldır" type="button">
                      <XCircle size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <button className="secondary-action" disabled={savedItems.length === 0} onClick={copyShortlist} type="button">
              {copied ? <Check size={17} /> : <Copy size={17} />}
              {copied ? "Kopyalandı" : "Kısa listeyi kopyala"}
            </button>

            <button
              className="secondary-action"
              disabled={savedItems.length === 0}
              onClick={() => setSaved({})}
              type="button"
            >
              <XCircle size={17} />
              Listeyi temizle
            </button>

            <div className="risk-board">
              <div className="risk-item">
                <span>AI özgünlük</span>
                <strong>{Math.round(bestScore * 0.92)}</strong>
              </div>
              <div className="risk-item">
                <span>RDAP domain</span>
                <strong>{Math.min(99, openDomainCount * 6)}</strong>
              </div>
              <div className="risk-item">
                <span>Tescil rahatlığı</span>
                <strong>{Math.min(99, clearTrademarkCount * 7)}</strong>
              </div>
            </div>

            <div className="integration-panel">
              <span className="eyebrow">Canlı kaynaklar</span>
              <div className="integration-row">
                <Globe size={17} />
                RDAP domain ön kontrolü
              </div>
              <a
                className="integration-row"
                href="https://www.turkpatent.gov.tr/arastirma-yap?form=trademark&params="
                rel="noreferrer"
                target="_blank"
              >
                <ShieldCheck size={17} />
                TÜRKPATENT arama
              </a>
              <a
                className="integration-row"
                href="https://www.uspto.gov/trademarks/search"
                rel="noreferrer"
                target="_blank"
              >
                <ShieldCheck size={17} />
                USPTO arama
              </a>
              <a
                className="integration-row"
                href="https://www.euipo.europa.eu/en/search-ip"
                rel="noreferrer"
                target="_blank"
              >
                <ShieldCheck size={17} />
                EUIPO arama
              </a>
              <div className="integration-row">
                <Sparkles size={17} />
                Backend LLM ajanı
              </div>
            </div>
          </aside>
        </section>
      </main>
      </SignedIn>
    </div>
  );
}

export default App;
