import { githubDark } from '@uiw/codemirror-theme-github';
import type { Extension } from '@uiw/react-codemirror';

export interface ThemeOption {
  key: string;
  label: string;
  extension: Extension;
}

export const defaultTheme: ThemeOption = {
  extension: githubDark,
  key: 'github-dark' as const,
  label: 'GitHub Dark',
};

export async function loadDefaultThemes(): Promise<ThemeOption[]> {
  const [{ vscodeDark }, { gruvboxDark }] = await Promise.all([
    import('@uiw/codemirror-theme-vscode'),
    import('@uiw/codemirror-theme-gruvbox-dark'),
  ]);

  return [
    { extension: vscodeDark, key: 'vscode' as const, label: 'Vscode' },
    { extension: gruvboxDark, key: 'gruvbox' as const, label: 'Gruvbox Dark' },
  ];
}
