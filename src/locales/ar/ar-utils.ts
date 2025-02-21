
// les systèles de transcription de l'arabe vers l'alphabet latin

import { splitIntoCodePoints } from "../../utils/unicode";

// Comparaison des systèmes :
// Système	    Précision	Lisibilité  Usage principal
// ISO 233	    Très élevée	Moyenne	    Recherches académiques
// ALA-LC	    Élevée	    Élevée	    Catalogage de bibliothèques
// UNGEGN	    Moyenne	    Élevée	    Noms géographiques
// Buckwalter	Moyenne	    Faible	    Traitement automatique des langues
// DIN 31635	Élevée	    Moyenne	    Recherches académiques (Allemagne)
// DMG	        Élevée	    Moyenne	    Études orientales (Allemagne)
// AIBL 

export const ARABIC_TRANSLITERATORS = [
    transliterateArabicToISO233,
    transliterateArabicToAIBL,
    transliterateArabicToALALC,
    transliterateArabicToBuckwalter
]

//#region "ISO 233"
// Table de translittération ISO 233-1
const iso233Map: { [key: string]: string } = {
    'ا': 'ā', 'ب': 'b', 'ت': 't', 'ث': 'ṯ', 'ج': 'ǧ',
    'ح': 'ḥ', 'خ': 'ḫ', 'د': 'd', 'ذ': 'ḏ', 'ر': 'r',
    'ز': 'z', 'س': 's', 'ش': 'š', 'ص': 'ṣ', 'ض': 'ḍ',
    'ط': 'ṭ', 'ظ': 'ẓ', 'ع': 'ʿ', 'غ': 'ġ', 'ف': 'f',
    'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
    'ه': 'h', 'و': 'w', 'ي': 'y', 'ء': 'ʾ', 'ى': 'ā',
    'ة': 'h', // Peut être "t" selon le contexte, ajustable
    'َ': 'a', 'ِ': 'i', 'ُ': 'u', 'ً': 'an', 'ٍ': 'in',
    'ٌ': 'un', 'ْ': '', // Absence de voyelle
    'ٓ': '' // (Ignore les caractères spéciaux inutiles)
  };
  
  // Fonction de translittération ISO 233-1
  export function transliterateArabicToISO233(input: string): string {
    return splitIntoCodePoints(input) // Diviser le texte en codepoints individuels
      .map(char => iso233Map[char] || char) // Remplacer ou conserver
      .join(''); // Reconstituer le texte translittéré
  }
//€endregion

//#region "AIBL"
// (Arabic Internet-Based Latinization)
// Phonétique simplifiée : Chaque son arabe est représenté par un caractère latin ou un chiffre.
// Chiffres spécifiques : Les chiffres représentent des lettres arabes qui n'ont pas d'équivalent direct en alphabet latin.

const aiblMap:Record<string,string> = { 'ا': 'a', 'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'dj', 'ح': 'ḥ', 'خ': 'kh', 'د': 'd',
    'ذ': 'dh', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh', 'ص': 'ṣ', 'ض': 'ḍ', 'ط': 'ṭ', 
    'ظ': 'ẓ', 'ع': 'ʿ', 'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 
    'ن': 'n', 'ه': 'h', 'و': 'w', 'ي': 'y', 'ء': 'ʾ', 'آ': 'ā', 'أ': 'a', 'ؤ': 'u', 
    'إ': 'i', 'ئ': 'i', 'ى': 'ā', 'ة': 'h', 'َ': 'a', 'ُ': 'u', 'ِ': 'i', 'ً': 'an', 'ٌ': 'un', 
    'ٍ': 'in', 'ْ': '', 'ّ': '' }; 


export function transliterateArabicToAIBL(text:string) { 
   return text.split('').map(char => aiblMap[char] || char).join('')
}

// #endregion


// #region ALALC 
// Table de translittération ALA-LC
const alalcMap: { [key: string]: string } = {
    'ا': 'ā', 'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': 'ḥ', 'خ': 'kh', 'د': 'd', 'ذ': 'dh',
    'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh', 'ص': 'ṣ', 'ض': 'ḍ', 'ط': 'ṭ', 'ظ': 'ẓ', 'ع': 'ʿ',
    'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ه': 'h', 'و': 'w',
    'ي': 'y', 'ء': 'ʾ', 'ى': 'ā', 'ة': 'h', // Cas particulier pour le ta marbouta
  };
  
  // Fonction de translittération
  function transliterateArabicToALALC(input: string): string {
    return splitIntoCodePoints(input) // Diviser le texte en codepoints individuels
      .map(char => alalcMap[char] || char) // Remplacer selon la table ou garder le caractère
      .join(''); // Reconstituer le texte translittéré
  }
//   #endregion


//#region Buckwalter
// Table de translittération Buckwalter
const buckwalterMap: { [key: string]: string } = {
    'ء': "'", 'آ': "|", 'أ': ">", 'إ': "<", 'ئ': "}",
    'ب': "b", 'ت': "t", 'ث': "_", 'ج': "j", 'ح': "H",
    'خ': "x", 'د': "d", 'ذ': "*", 'ر': "r", 'ز': "z",
    'س': "s", 'ش': "$", 'ص': "S", 'ض': "D", 'ط': "T",
    'ظ': "Z", 'ع': "E", 'غ': "g", 'ف': "f", 'ق': "q",
    'ك': "k", 'ل': "l", 'م': "m", 'ن': "n", 'ه': "h",
    'و': "w", 'ي': "y", 'ى': "Y", 'ة': "p",
    'َ': "a", 'ِ': "i", 'ُ': "u", 'ً': "F", 'ٍ': "K",
    'ٌ': "N", 'ْ': "o", 'ٰ': "`"
  };
  
  // Fonction de transcription
  export function transliterateArabicToBuckwalter(input: string): string {
    return splitIntoCodePoints(input) // Diviser le texte en codepoints individuels
      .map(char => buckwalterMap[char] || char) // Transcrire ou garder tel quel
      .join(''); // Reconstituer le texte
  }
//#endregion
