import { basicSetup } from '@uiw/codemirror-extensions-basic-setup';
import { langs } from '@uiw/codemirror-extensions-langs';
import { githubDark } from '@uiw/codemirror-theme-github';
import { gruvboxDark } from '@uiw/codemirror-theme-gruvbox-dark';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { Check, Code, Maximize, Text } from 'lucide-react';
import { lazy, Suspense, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { InputGroup, InputGroupAddon, InputGroupTextarea } from '@/components/ui/input-group';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';

const CodeMirror = lazy(() => import('@uiw/react-codemirror'));

const themes = [
  { key: 'github-dark' as const, label: 'GitHub Dark', value: githubDark },
  { key: 'vscode' as const, label: 'Vscode', value: vscodeDark },
  { key: 'gruvbox' as const, label: 'Gruvbox Dark', value: gruvboxDark },
];

type ThemeKey = (typeof themes)[number]['key'];

export type SupportedLanguage = 'yaml' | 'json' | 'bash' | 'toml' | 'sql';
export const DEFAULT_LANGUAGES: SupportedLanguage[] = ['bash', 'yaml', 'json', 'toml', 'sql'];

// Helper to get the language extension based on selected language
const getLanguageExtension = (language: SupportedLanguage) => {
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
      return langs.bash(); // fallback
  }
};

export interface EditorProps {
  formId?: string;
  content?: string;
  onContent: (value: string) => void;
  placeholder: string;
  supportedLanguages?: SupportedLanguage[];
  saveButton?: React.ReactNode;
  isLoading?: boolean;
}

export function Editor({
  formId,
  content,
  placeholder,
  supportedLanguages,
  saveButton,
  isLoading,
  onContent,
  ...rest
}: EditorProps & React.ComponentProps<typeof InputGroup>) {
  const [editorOpen, setEditorOpen] = useState<boolean>(false);

  const editorView = (
    <EditorContent
      formId={formId}
      content={content}
      setContent={onContent}
      defaultMode={editorOpen ? 'code' : 'text'}
      placeholder={placeholder}
      isLoading={isLoading}
      supportedLanguages={supportedLanguages}
      saveButton={saveButton}
      modalTrigger={
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            onClick={() => setEditorOpen(!editorOpen)}
            size="sm"
            className="cursor-pointer"
            disabled={isLoading}
          >
            {editorOpen ? <Check /> : <Maximize />}
            {editorOpen ? 'Done' : 'Open Editor'}
          </Button>
        </DialogTrigger>
      }
      {...rest}
    />
  );

  return (
    <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
      {editorOpen ? (
        <DialogContent
          className="min-w-[70vw] min-h-[70vh] h-dvh md:max-h-[80vh]"
          onEscapeKeyDown={e => e.preventDefault()}
        >
          <div className="flex flex-col h-full overflow-hidden">
            <DialogHeader>
              <DialogTitle>Upload Content</DialogTitle>
              <DialogDescription>Enter text content directly for upload.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col h-full flex-1 overflow-hidden">{editorView}</div>
          </div>
        </DialogContent>
      ) : (
        editorView
      )}
    </Dialog>
  );
}

interface EditorContentProps {
  formId?: string;
  content?: string;
  setContent: (content: string) => void;
  defaultMode: 'text' | 'code';
  supportedLanguages?: SupportedLanguage[];
  modalTrigger: React.ReactNode;
  saveButton?: React.ReactNode;
  placeholder: string;
  isLoading?: boolean;
}

function EditorContent({
  formId,
  content,
  defaultMode,
  supportedLanguages,
  modalTrigger,
  saveButton,
  placeholder,
  isLoading,
  setContent,
  ...rest
}: EditorContentProps & React.ComponentProps<typeof InputGroup>) {
  const languages =
    supportedLanguages && supportedLanguages.length > 0 ? supportedLanguages : DEFAULT_LANGUAGES;

  const [mode, setMode] = useState<'text' | 'code'>(defaultMode);
  const [lang, setLang] = useState<SupportedLanguage>(languages[0]);
  const [theme, setTheme] = useState<ThemeKey>(themes[0].key);

  const extensions = useMemo(
    () => [basicSetup({ tabSize: 2, foldGutter: false }), getLanguageExtension(lang)],
    [lang],
  );

  const loader = (
    <div className="h-full w-full flex-1 flex flex-col justify-center items-center">
      <Spinner />
    </div>
  );

  return (
    <InputGroup {...rest} className={cn('min-w-0 min-h-48 flex-1', rest?.className)}>
      {/* Mode toggle */}
      {mode === 'text' ? (
        <InputGroupTextarea
          id={`textarea-content-${formId}`}
          placeholder={placeholder}
          value={content || ''}
          onChange={e => setContent(e.target.value)}
          rows={6}
          className={cn('bg-background font-mono text-xs resize-y rounded-t-md')}
          disabled={isLoading}
        />
      ) : (
        <Suspense fallback={loader}>
          <div
            className={cn(
              'w-full h-full flex flex-col overflow-hidden',
              defaultMode === 'text' ? 'max-h-64' : '',
            )}
          >
            <CodeMirror
              className={cn('w-full h-full flex-1 overflow-auto')}
              value={content || ''}
              theme={(themes.find(t => t.key === theme) || themes[0]).value}
              height="100%"
              minHeight="6rem"
              width="100%"
              minWidth="100%"
              placeholder={placeholder}
              onChange={setContent}
              extensions={extensions}
              readOnly={isLoading}
              basicSetup={{ autocompletion: true }}
              indentWithTab
            />
          </div>
        </Suspense>
      )}

      {mode === 'code' && (
        <InputGroupAddon align="block-start" className="flex w-full justify-between">
          {/* Language toggle */}
          {languages.length > 1 && (
            <Select value={lang} onValueChange={val => setLang(val as SupportedLanguage)}>
              <SelectTrigger
                id={`select-language-${formId}`}
                size="sm"
                className="w-[180px] text-xs h-7!"
                disabled={isLoading}
              >
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map(lang => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Theme toggle */}
          <Select value={theme} onValueChange={t => setTheme(t as ThemeKey)}>
            <SelectTrigger
              id={`select-theme-${formId}`}
              size="sm"
              className="w-[180px] text-xs h-7!"
              disabled={isLoading}
            >
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              {themes.map(config => (
                <SelectItem key={`theme-${config.key}`} value={config.key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </InputGroupAddon>
      )}

      <InputGroupAddon align="block-end" className="flex justify-between items-center">
        {saveButton}

        {/* Toggle mode */}
        <ToggleGroup
          variant="outline"
          type="single"
          size="sm"
          value={mode}
          onValueChange={(m: any) => setMode(m as 'text' | 'code')}
          disabled={isLoading}
        >
          {/* Text */}
          <ToggleGroupItem aria-label="Toggle text" value="text" className={cn('cursor-pointer')}>
            <Text className="h-4 w-4" />
          </ToggleGroupItem>

          {/* Code */}
          <ToggleGroupItem aria-label="Toggle code" value="code" className={cn('cursor-pointer')}>
            <Code className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>

        {modalTrigger}
      </InputGroupAddon>
    </InputGroup>
  );
}
