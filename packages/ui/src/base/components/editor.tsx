import { basicSetup } from '@uiw/codemirror-extensions-basic-setup';
import { langs } from '@uiw/codemirror-extensions-langs';
import { githubDark } from '@uiw/codemirror-theme-github';
import { gruvboxDark } from '@uiw/codemirror-theme-gruvbox-dark';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { Check, Code, Maximize, Text } from 'lucide-react';
import { lazy, Suspense, useMemo, useState } from 'react';
import { cn } from '@/base/lib/utils';
import { Button } from '@/base/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/base/ui/dialog';
import { InputGroup, InputGroupAddon, InputGroupTextarea } from '@/base/ui/input-group';
import { Spinner } from '@/base/ui/spinner';
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
      content={content}
      defaultMode={editorOpen ? 'code' : 'text'}
      formId={formId}
      isLoading={isLoading}
      modalTrigger={
        <DialogTrigger asChild>
          <Button
            className="cursor-pointer"
            disabled={isLoading}
            onClick={() => setEditorOpen(!editorOpen)}
            size="sm"
            type="button"
            variant="outline"
          >
            {editorOpen ? <Check /> : <Maximize />}
            <span className="hidden @md/editor:inline">{editorOpen ? 'Done' : 'Open Editor'}</span>
          </Button>
        </DialogTrigger>
      }
      placeholder={placeholder}
      saveButton={saveButton}
      setContent={onContent}
      supportedLanguages={supportedLanguages}
      {...rest}
    />
  );

  return (
    <Dialog onOpenChange={setEditorOpen} open={editorOpen}>
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
    () => [basicSetup({ foldGutter: false, tabSize: 2 }), getLanguageExtension(lang)],
    [lang],
  );

  const loader = (
    <div className="h-full w-full flex-1 flex flex-col justify-center items-center">
      <Spinner />
    </div>
  );

  return (
    <InputGroup
      {...rest}
      className={cn('@container/editor', 'min-w-0 min-h-48 flex-1', rest?.className)}
    >
      {/* Mode toggle */}
      {mode === 'text' ? (
        <InputGroupTextarea
          className={cn('bg-background font-mono text-xs resize-y rounded-t-md')}
          disabled={isLoading}
          id={`textarea-content-${formId}`}
          onChange={e => setContent(e.target.value)}
          placeholder={placeholder}
          rows={6}
          value={content || ''}
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
              basicSetup={{ autocompletion: true }}
              className={cn('w-full h-full flex-1 overflow-auto')}
              extensions={extensions}
              height="100%"
              indentWithTab
              minHeight="6rem"
              minWidth="100%"
              onChange={setContent}
              placeholder={placeholder}
              readOnly={isLoading}
              theme={(themes.find(t => t.key === theme) || themes[0]).value}
              value={content || ''}
              width="100%"
            />
          </div>
        </Suspense>
      )}

      {mode === 'code' && (
        <InputGroupAddon align="block-start" className="flex w-full justify-between">
          {/* Language toggle */}
          {languages.length > 1 && (
            <Select onValueChange={val => setLang(val as SupportedLanguage)} value={lang}>
              <SelectTrigger
                className="w-[180px] text-xs h-7!"
                disabled={isLoading}
                id={`select-language-${formId}`}
                size="sm"
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
          <Select onValueChange={t => setTheme(t as ThemeKey)} value={theme}>
            <SelectTrigger
              className="w-[180px] text-xs h-7!"
              disabled={isLoading}
              id={`select-theme-${formId}`}
              size="sm"
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
          disabled={isLoading}
          onValueChange={(m: any) => setMode(m as 'text' | 'code')}
          size="sm"
          type="single"
          value={mode}
          variant="outline"
        >
          {/* Text */}
          <ToggleGroupItem aria-label="Toggle text" className={cn('cursor-pointer')} value="text">
            <Text className="h-4 w-4" />
          </ToggleGroupItem>

          {/* Code */}
          <ToggleGroupItem aria-label="Toggle code" className={cn('cursor-pointer')} value="code">
            <Code className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>

        {modalTrigger}
      </InputGroupAddon>
    </InputGroup>
  );
}
