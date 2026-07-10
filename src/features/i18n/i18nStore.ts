import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AgeBand, LearningWorldId } from '@/features/learning/learningWorlds'

export type LocaleId = 'en-US' | 'es-ES' | 'ja-JP' | 'fr-FR' | 'de-DE' | 'hi-IN'

export const LOCALE_OPTIONS: { id: LocaleId; label: string; localLabel: string }[] = [
  { id: 'en-US', label: 'English', localLabel: 'English' },
  { id: 'es-ES', label: 'Spanish', localLabel: 'Español' },
  { id: 'ja-JP', label: 'Japanese', localLabel: '日本語' },
  { id: 'fr-FR', label: 'French', localLabel: 'Français' },
  { id: 'de-DE', label: 'German', localLabel: 'Deutsch' },
  { id: 'hi-IN', label: 'Hindi', localLabel: 'हिन्दी' },
]

type TranslationKey =
  | 'app.tagline'
  | 'profile.greeting'
  | 'profile.babies'
  | 'profile.levelsDone'
  | 'profile.badges'
  | 'profile.gold'
  | 'profile.yearsOld'
  | 'profile.rescues'
  | 'button.switch'
  | 'button.tools'
  | 'button.active'
  | 'button.pick'
  | 'button.team'
  | 'button.rewards'
  | 'button.settings'
  | 'button.jump'
  | 'button.startOver'
  | 'button.deletePlayer'
  | 'button.clearData'
  | 'signup.addPlayer'
  | 'signup.nameQuestion'
  | 'signup.namePlaceholder'
  | 'signup.firstFriend'
  | 'signup.playing'
  | 'signup.tap'
  | 'signup.letsGo'
  | 'worlds.title'
  | 'worlds.choose'
  | 'age.title'
  | 'age.birthday'
  | 'age.trainer'
  | 'settings.rockTimer'
  | 'settings.on'
  | 'settings.off'
  | 'tools.title'
  | 'tools.language'
  | 'tools.rescuePreview'
  | 'tools.ageBoss'
  | 'tools.secretCode'
  | 'tools.replayUnlocked'
  | 'tools.level'
  | 'profiles.title'

type LocalePack = Record<TranslationKey, string> & {
  ageBands: Record<AgeBand, string>
  worlds: Record<LearningWorldId, { name: string; detail: string; shortDetail: string; subtitle: string }>
}

const packs: Record<LocaleId, LocalePack> = {
  'en-US': {
    'app.tagline': 'Bead by bead, level by level!',
    'profile.greeting': 'Hi, {name}!',
    'profile.babies': '{count} babies',
    'profile.levelsDone': '{count} levels done',
    'profile.badges': '{count} badges',
    'profile.gold': '{count} gold',
    'profile.yearsOld': '{count} years old',
    'profile.rescues': '{count}/{total} rescues',
    'button.switch': 'Switch',
    'button.tools': 'Tools',
    'button.active': 'Active',
    'button.pick': 'Pick',
    'button.team': 'Team',
    'button.rewards': 'Rewards',
    'button.settings': 'Settings',
    'button.jump': 'Jump',
    'button.startOver': 'Start this player over',
    'button.deletePlayer': 'Delete this player',
    'button.clearData': 'Clear all app data',
    'signup.addPlayer': 'Add a player',
    'signup.nameQuestion': "What's your name?",
    'signup.namePlaceholder': 'Type your name...',
    'signup.firstFriend': 'Pick your first friend',
    'signup.playing': 'Playing!',
    'signup.tap': 'Tap',
    'signup.letsGo': "Let's go!",
    'worlds.title': 'Learning Worlds',
    'worlds.choose': 'Choose a world',
    'age.title': 'Player Fit',
    'age.birthday': 'Birthday',
    'age.trainer': 'Trainer tune-up for {world}',
    'settings.rockTimer': 'Rock timer: {state}',
    'settings.on': 'On',
    'settings.off': 'Off',
    'tools.title': 'Grown-Up Tools',
    'tools.language': 'Language',
    'tools.rescuePreview': 'Rescue preview',
    'tools.ageBoss': 'Age boss: {title} at level {level}. Try codes: rescue, mooncalf, coraldragon, gearfox, mewtwo, or level12.',
    'tools.secretCode': 'secret code',
    'tools.replayUnlocked': 'Replay unlocked level',
    'tools.level': 'Level {level}',
    'profiles.title': "Who's playing?",
    ageBands: {
      little: 'Ages 4-5',
      early: 'Ages 6-7',
      growing: 'Ages 8-9',
      big: 'Ages 10-14',
      master: 'Ages 15+',
    },
    worlds: {
      pacabacus: {
        name: 'PacAbacus',
        detail: 'Soroban, counting, and bead thinking',
        shortDetail: 'Abacus adventure',
        subtitle: 'Soroban Adventure',
      },
      pacwords: {
        name: 'PacWords',
        detail: 'Letters, spelling, and sight words',
        shortDetail: 'Words and letters',
        subtitle: 'Word Adventure',
      },
      pactables: {
        name: 'PacTables',
        detail: 'Times tables and skip counting',
        shortDetail: 'Multiplication facts',
        subtitle: 'Tables Adventure',
      },
      pacmath: {
        name: 'PacMath',
        detail: 'Standard math without abacus controls',
        shortDetail: 'Regular math',
        subtitle: 'Mental Math',
      },
    },
  },
  'es-ES': {
    'app.tagline': 'Cuenta con cuentas, nivel por nivel.',
    'profile.greeting': 'Hola, {name}!',
    'profile.babies': '{count} bebes',
    'profile.levelsDone': '{count} niveles',
    'profile.badges': '{count} insignias',
    'profile.gold': '{count} oro',
    'profile.yearsOld': '{count} anos',
    'profile.rescues': '{count}/{total} rescates',
    'button.switch': 'Cambiar',
    'button.tools': 'Herramientas',
    'button.active': 'Activo',
    'button.pick': 'Elegir',
    'button.team': 'Equipo',
    'button.rewards': 'Premios',
    'button.settings': 'Ajustes',
    'button.jump': 'Saltar',
    'button.startOver': 'Empezar de nuevo',
    'button.deletePlayer': 'Borrar jugador',
    'button.clearData': 'Borrar datos',
    'signup.addPlayer': 'Agregar jugador',
    'signup.nameQuestion': 'Como te llamas?',
    'signup.namePlaceholder': 'Escribe tu nombre...',
    'signup.firstFriend': 'Elige tu primer amigo',
    'signup.playing': 'Jugando!',
    'signup.tap': 'Toca',
    'signup.letsGo': 'Vamos!',
    'worlds.title': 'Mundos de aprendizaje',
    'worlds.choose': 'Elige un mundo',
    'age.title': 'Nivel del jugador',
    'age.birthday': 'Cumpleanos',
    'age.trainer': 'Entrenador para {world}',
    'settings.rockTimer': 'Rocas: {state}',
    'settings.on': 'Si',
    'settings.off': 'No',
    'tools.title': 'Herramientas adultas',
    'tools.language': 'Idioma',
    'tools.rescuePreview': 'Vista de rescate',
    'tools.ageBoss': 'Jefe por edad: {title} en nivel {level}. Codigos: rescue, mooncalf, coraldragon, gearfox, mewtwo, o level12.',
    'tools.secretCode': 'codigo secreto',
    'tools.replayUnlocked': 'Repetir nivel',
    'tools.level': 'Nivel {level}',
    'profiles.title': 'Quien juega?',
    ageBands: {
      little: 'Edades 4-5',
      early: 'Edades 6-7',
      growing: 'Edades 8-9',
      big: 'Edades 10-14',
      master: 'Edades 15+',
    },
    worlds: {
      pacabacus: { name: 'PacAbacus', detail: 'Soroban, conteo y pensamiento con cuentas', shortDetail: 'Aventura de abaco', subtitle: 'Aventura Soroban' },
      pacwords: { name: 'PacWords', detail: 'Letras, ortografia y palabras frecuentes', shortDetail: 'Palabras y letras', subtitle: 'Aventura de palabras' },
      pactables: { name: 'PacTables', detail: 'Tablas de multiplicar y conteo por saltos', shortDetail: 'Multiplicacion', subtitle: 'Aventura de tablas' },
      pacmath: { name: 'PacMath', detail: 'Matematicas normales sin abaco', shortDetail: 'Matematicas', subtitle: 'Calculo mental' },
    },
  },
  'ja-JP': {
    'app.tagline': 'そろばんで、ひとつずつレベルアップ!',
    'profile.greeting': 'こんにちは、{name}!',
    'profile.babies': 'ベビー {count}',
    'profile.levelsDone': '{count} レベル',
    'profile.badges': 'バッジ {count}',
    'profile.gold': 'ゴールド {count}',
    'profile.yearsOld': '{count}さい',
    'profile.rescues': 'レスキュー {count}/{total}',
    'button.switch': 'きりかえ',
    'button.tools': 'ツール',
    'button.active': 'プレイ中',
    'button.pick': 'えらぶ',
    'button.team': 'チーム',
    'button.rewards': 'ごほうび',
    'button.settings': 'せってい',
    'button.jump': 'ジャンプ',
    'button.startOver': 'さいしょから',
    'button.deletePlayer': 'プレイヤーをけす',
    'button.clearData': 'データをけす',
    'signup.addPlayer': 'プレイヤーを追加',
    'signup.nameQuestion': 'なまえは?',
    'signup.namePlaceholder': 'なまえをいれてね...',
    'signup.firstFriend': 'はじめのともだち',
    'signup.playing': 'プレイ中!',
    'signup.tap': 'タップ',
    'signup.letsGo': 'はじめる!',
    'worlds.title': 'まなびのワールド',
    'worlds.choose': 'ワールドをえらぶ',
    'age.title': 'プレイヤー設定',
    'age.birthday': 'たんじょうび',
    'age.trainer': '{world} のトレーナー',
    'settings.rockTimer': 'いわタイマー: {state}',
    'settings.on': 'オン',
    'settings.off': 'オフ',
    'tools.title': 'おとなツール',
    'tools.language': 'ことば',
    'tools.rescuePreview': 'レスキュー確認',
    'tools.ageBoss': '年齢ボス: {title} レベル {level}。コード: rescue, mooncalf, coraldragon, gearfox, mewtwo, level12。',
    'tools.secretCode': 'ひみつコード',
    'tools.replayUnlocked': 'レベルをもういちど',
    'tools.level': 'レベル {level}',
    'profiles.title': 'だれがあそぶ?',
    ageBands: {
      little: '4-5さい',
      early: '6-7さい',
      growing: '8-9さい',
      big: '10-14さい',
      master: '15さい+',
    },
    worlds: {
      pacabacus: { name: 'PacAbacus', detail: 'そろばん、かぞえる力、珠算の考え方', shortDetail: 'そろばん冒険', subtitle: 'そろばんアドベンチャー' },
      pacwords: { name: 'PacWords', detail: '文字、つづり、ことば', shortDetail: 'ことばと文字', subtitle: 'ことばアドベンチャー' },
      pactables: { name: 'PacTables', detail: '九九とかけ算の練習', shortDetail: 'かけ算', subtitle: '九九アドベンチャー' },
      pacmath: { name: 'PacMath', detail: 'そろばんなしの算数', shortDetail: '算数', subtitle: '暗算チャレンジ' },
    },
  },
  'fr-FR': {
    'app.tagline': 'Boule apres boule, niveau apres niveau!',
    'profile.greeting': 'Bonjour, {name}!',
    'profile.babies': '{count} bebes',
    'profile.levelsDone': '{count} niveaux',
    'profile.badges': '{count} badges',
    'profile.gold': '{count} or',
    'profile.yearsOld': '{count} ans',
    'profile.rescues': '{count}/{total} sauvetages',
    'button.switch': 'Changer',
    'button.tools': 'Outils',
    'button.active': 'Actif',
    'button.pick': 'Choisir',
    'button.team': 'Equipe',
    'button.rewards': 'Recompenses',
    'button.settings': 'Reglages',
    'button.jump': 'Aller',
    'button.startOver': 'Recommencer',
    'button.deletePlayer': 'Supprimer joueur',
    'button.clearData': 'Effacer les donnees',
    'signup.addPlayer': 'Ajouter un joueur',
    'signup.nameQuestion': 'Comment tu t appelles?',
    'signup.namePlaceholder': 'Ecris ton nom...',
    'signup.firstFriend': 'Choisis ton premier ami',
    'signup.playing': 'En jeu!',
    'signup.tap': 'Toucher',
    'signup.letsGo': 'C est parti!',
    'worlds.title': 'Mondes d apprentissage',
    'worlds.choose': 'Choisir un monde',
    'age.title': 'Profil joueur',
    'age.birthday': 'Anniversaire',
    'age.trainer': 'Entrainement pour {world}',
    'settings.rockTimer': 'Minuteur roches: {state}',
    'settings.on': 'Oui',
    'settings.off': 'Non',
    'tools.title': 'Outils adulte',
    'tools.language': 'Langue',
    'tools.rescuePreview': 'Apercu sauvetage',
    'tools.ageBoss': 'Boss d age: {title} au niveau {level}. Codes: rescue, mooncalf, coraldragon, gearfox, mewtwo, ou level12.',
    'tools.secretCode': 'code secret',
    'tools.replayUnlocked': 'Rejouer un niveau',
    'tools.level': 'Niveau {level}',
    'profiles.title': 'Qui joue?',
    ageBands: {
      little: 'Ages 4-5',
      early: 'Ages 6-7',
      growing: 'Ages 8-9',
      big: 'Ages 10-14',
      master: 'Ages 15+',
    },
    worlds: {
      pacabacus: { name: 'PacAbacus', detail: 'Soroban, compter et penser avec les boules', shortDetail: 'Aventure abaque', subtitle: 'Aventure Soroban' },
      pacwords: { name: 'PacWords', detail: 'Lettres, orthographe et mots courants', shortDetail: 'Mots et lettres', subtitle: 'Aventure mots' },
      pactables: { name: 'PacTables', detail: 'Tables de multiplication et suites', shortDetail: 'Multiplication', subtitle: 'Aventure tables' },
      pacmath: { name: 'PacMath', detail: 'Maths sans controle abaque', shortDetail: 'Maths', subtitle: 'Calcul mental' },
    },
  },
  'de-DE': {
    'app.tagline': 'Perle fur Perle, Level fur Level!',
    'profile.greeting': 'Hallo, {name}!',
    'profile.babies': '{count} Babys',
    'profile.levelsDone': '{count} Level',
    'profile.badges': '{count} Abzeichen',
    'profile.gold': '{count} Gold',
    'profile.yearsOld': '{count} Jahre alt',
    'profile.rescues': '{count}/{total} Rettungen',
    'button.switch': 'Wechseln',
    'button.tools': 'Tools',
    'button.active': 'Aktiv',
    'button.pick': 'Wahlen',
    'button.team': 'Team',
    'button.rewards': 'Belohnungen',
    'button.settings': 'Einstellungen',
    'button.jump': 'Springen',
    'button.startOver': 'Neu starten',
    'button.deletePlayer': 'Spieler loschen',
    'button.clearData': 'Alle Daten loschen',
    'signup.addPlayer': 'Spieler hinzufugen',
    'signup.nameQuestion': 'Wie heisst du?',
    'signup.namePlaceholder': 'Name eingeben...',
    'signup.firstFriend': 'Ersten Freund wahlen',
    'signup.playing': 'Spielt!',
    'signup.tap': 'Tippen',
    'signup.letsGo': 'Los gehts!',
    'worlds.title': 'Lernwelten',
    'worlds.choose': 'Welt wahlen',
    'age.title': 'Spieler-Level',
    'age.birthday': 'Geburtstag',
    'age.trainer': 'Trainer fur {world}',
    'settings.rockTimer': 'Stein-Timer: {state}',
    'settings.on': 'An',
    'settings.off': 'Aus',
    'tools.title': 'Erwachsenen-Tools',
    'tools.language': 'Sprache',
    'tools.rescuePreview': 'Rettungsvorschau',
    'tools.ageBoss': 'Altersboss: {title} bei Level {level}. Codes: rescue, mooncalf, coraldragon, gearfox, mewtwo oder level12.',
    'tools.secretCode': 'Geheimcode',
    'tools.replayUnlocked': 'Level wiederholen',
    'tools.level': 'Level {level}',
    'profiles.title': 'Wer spielt?',
    ageBands: {
      little: 'Alter 4-5',
      early: 'Alter 6-7',
      growing: 'Alter 8-9',
      big: 'Alter 10-14',
      master: 'Alter 15+',
    },
    worlds: {
      pacabacus: { name: 'PacAbacus', detail: 'Soroban, Zahlen und Denken mit Perlen', shortDetail: 'Abakus-Abenteuer', subtitle: 'Soroban-Abenteuer' },
      pacwords: { name: 'PacWords', detail: 'Buchstaben, Rechtschreibung und Sichtworter', shortDetail: 'Worter und Buchstaben', subtitle: 'Worter-Abenteuer' },
      pactables: { name: 'PacTables', detail: 'Einmaleins und Zahlensprunge', shortDetail: 'Multiplikation', subtitle: 'Tabellen-Abenteuer' },
      pacmath: { name: 'PacMath', detail: 'Normale Mathe ohne Abakus', shortDetail: 'Mathe', subtitle: 'Kopfrechnen' },
    },
  },
  'hi-IN': {
    'app.tagline': 'हर मोती के साथ, हर स्तर आगे!',
    'profile.greeting': 'नमस्ते, {name}!',
    'profile.babies': '{count} छोटे साथी',
    'profile.levelsDone': '{count} स्तर पूरे',
    'profile.badges': '{count} बैज',
    'profile.gold': '{count} सोना',
    'profile.yearsOld': '{count} वर्ष',
    'profile.rescues': '{count}/{total} बचाव',
    'button.switch': 'बदलें',
    'button.tools': 'टूल्स',
    'button.active': 'सक्रिय',
    'button.pick': 'चुनें',
    'button.team': 'टीम',
    'button.rewards': 'इनाम',
    'button.settings': 'सेटिंग',
    'button.jump': 'जाएं',
    'button.startOver': 'फिर से शुरू करें',
    'button.deletePlayer': 'खिलाड़ी हटाएं',
    'button.clearData': 'सारा डेटा मिटाएं',
    'signup.addPlayer': 'खिलाड़ी जोड़ें',
    'signup.nameQuestion': 'आपका नाम?',
    'signup.namePlaceholder': 'नाम लिखें...',
    'signup.firstFriend': 'पहला दोस्त चुनें',
    'signup.playing': 'खेल रहे हैं!',
    'signup.tap': 'टैप',
    'signup.letsGo': 'चलो!',
    'worlds.title': 'सीखने की दुनिया',
    'worlds.choose': 'दुनिया चुनें',
    'age.title': 'खिलाड़ी स्तर',
    'age.birthday': 'जन्मदिन',
    'age.trainer': '{world} ट्रेनर',
    'settings.rockTimer': 'रॉक टाइमर: {state}',
    'settings.on': 'चालू',
    'settings.off': 'बंद',
    'tools.title': 'बड़े लोगों के टूल्स',
    'tools.language': 'भाषा',
    'tools.rescuePreview': 'बचाव preview',
    'tools.ageBoss': 'उम्र बॉस: {title}, स्तर {level}. कोड: rescue, mooncalf, coraldragon, gearfox, mewtwo, या level12.',
    'tools.secretCode': 'गुप्त कोड',
    'tools.replayUnlocked': 'स्तर फिर खेलें',
    'tools.level': 'स्तर {level}',
    'profiles.title': 'कौन खेलेगा?',
    ageBands: {
      little: 'उम्र 4-5',
      early: 'उम्र 6-7',
      growing: 'उम्र 8-9',
      big: 'उम्र 10-14',
      master: 'उम्र 15+',
    },
    worlds: {
      pacabacus: { name: 'PacAbacus', detail: 'Soroban, गिनती, और abacus सोच', shortDetail: 'Abacus adventure', subtitle: 'Soroban Adventure' },
      pacwords: { name: 'PacWords', detail: 'अक्षर, spelling, और sight words', shortDetail: 'Words and letters', subtitle: 'Word Adventure' },
      pactables: { name: 'PacTables', detail: 'पहाड़े और skip counting', shortDetail: 'Multiplication facts', subtitle: 'Tables Adventure' },
      pacmath: { name: 'PacMath', detail: 'बिना abacus के math', shortDetail: 'Regular math', subtitle: 'Mental Math' },
    },
  },
}

interface I18nStore {
  locale: LocaleId
  setLocale: (locale: LocaleId) => void
}

function detectLocale(): LocaleId {
  const language = globalThis.navigator?.language?.toLowerCase() ?? ''
  if (language.startsWith('es')) return 'es-ES'
  if (language.startsWith('ja')) return 'ja-JP'
  if (language.startsWith('fr')) return 'fr-FR'
  if (language.startsWith('de')) return 'de-DE'
  if (language.startsWith('hi')) return 'hi-IN'
  return 'en-US'
}

export const useI18n = create<I18nStore>()(
  persist(
    (set) => ({
      locale: detectLocale(),
      setLocale: (locale) => set({ locale }),
    }),
    { name: 'pacabacus-language' },
  ),
)

export function useTranslations() {
  const locale = useI18n((state) => state.locale)
  const pack = packs[locale] ?? packs['en-US']
  const fallback = packs['en-US']
  const t = (key: TranslationKey, vars: Record<string, string | number> = {}) =>
    format(pack[key] ?? fallback[key] ?? key, vars)
  return {
    locale,
    t,
    ageBandLabel: (ageBand: AgeBand) => pack.ageBands[ageBand] ?? fallback.ageBands[ageBand],
    worldText: (world: LearningWorldId) => pack.worlds[world] ?? fallback.worlds[world],
  }
}

function format(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ''))
}
