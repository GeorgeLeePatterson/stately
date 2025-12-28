import { langs } from '@uiw/codemirror-extensions-langs';
import type { Extension } from '@uiw/react-codemirror';

export type DefaultLanguage = 'yaml' | 'json' | 'bash' | 'toml' | 'sql';
export type SupportedLanguage = DefaultLanguage | keyof typeof langs;
export const DEFAULT_LANGUAGES: SupportedLanguage[] = ['bash', 'yaml', 'json', 'toml', 'sql'];

// Helper to get the language extension based on selected language
export const getLanguageExtension = (language: SupportedLanguage): Extension => {
  switch (language) {
    case 'yaml':
      return langs.yaml();
    case 'json':
      return langs.json();
    case 'bash':
      return langs.bash();
    case 'toml':
      return langs.toml();
    case 'sql':
      return langs.sql();
    default:
      return language in langs ? langs[language]() : langs.bash(); // fallback
  }
};
