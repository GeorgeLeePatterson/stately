import { InputGroupAddon } from '@statelyjs/ui/components/base/input-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@statelyjs/ui/components/base/select';
import { Spinner } from '@statelyjs/ui/components/base/spinner';
import type { BaseEditorProps } from '@statelyjs/ui/components/editor';
import { cn } from '@statelyjs/ui/lib/utils';
import { basicSetup } from '@uiw/codemirror-extensions-basic-setup';
import type { ReactCodeMirrorProps } from '@uiw/react-codemirror';
import { Suspense, useEffect, useId, useMemo, useRef, useState } from 'react';
import { log } from '@/utils';
import { DEFAULT_LANGUAGES, getLanguageExtension, type SupportedLanguage } from './languages';
import { defaultTheme, loadDefaultThemes, type ThemeOption } from './themes';

export interface CodemirrorEditorThemeOptions {
  /**
   * Include bundled optional themes (VSCode Dark, Gruvbox Dark).
   * These are lazy-loaded only when this option is true.
   * @default false
   */
  includeDefaults?: boolean;

  /**
   * Custom themes to include in the theme selector.
   */
  custom?: ThemeOption[];
}

export interface CodemirrorEditorBaseProps {
  containerProps?: React.HTMLAttributes<HTMLDivElement>;
  codemirrorProps?: ReactCodeMirrorProps;
  /**
   * Languages to support in the language selector.
   * @default ['bash', 'yaml', 'json', 'toml', 'sql']
   */
  supportedLanguages?: SupportedLanguage[];
  themeOptions?: CodemirrorEditorThemeOptions;
}

interface CodemirrorEditorProps extends CodemirrorEditorBaseProps, BaseEditorProps {
  Codemirror: React.LazyExoticComponent<React.ComponentType<ReactCodeMirrorProps>>;
}

/**
 * CodeMirror editor component with theme and language selection.
 *
 * This component is used internally by `codemirrorPlugin`. You typically
 * don't need to use this directly - use the plugin instead.
 *
 * The component expected to be wrapped by EditorWrapper ({@link @statelyjs/ui/components/editor/EditorWrapper}).
 * If not using that component, ensure that it is wrapped in an InputGroup ({@link @statelyjs/ui/components/base/input-group/InputGroup}).
 *
 * @see {@link codemirrorPlugin} for the recommended way to enable CodeMirror.
 *
 * @internal
 */
export function CodemirrorEditor({
  Codemirror,
  formId,
  placeholder,
  content,
  onContent,
  containerProps,
  codemirrorProps,
  supportedLanguages,
  themeOptions,
  isLoading,
}: CodemirrorEditorProps) {
  const languages =
    supportedLanguages && supportedLanguages.length > 0 ? supportedLanguages : DEFAULT_LANGUAGES;

  const themesLoaded = useRef<boolean>(false);
  const [themesLoading, setThemesLoading] = useState<boolean>(false);
  const [availableThemes, setAvailableThemes] = useState<ThemeOption[]>([
    defaultTheme,
    ...(themeOptions?.custom ?? []),
  ]);

  const [theme, setTheme] = useState<string>(defaultTheme.key);
  const [lang, setLang] = useState<SupportedLanguage>(languages[0]);

  const formId_ = useId();

  useEffect(() => {
    if (!themesLoaded.current) {
      themesLoaded.current = true;
      if (themeOptions?.includeDefaults) {
        setThemesLoading(true);
        loadDefaultThemes()
          .then(defaultThemes => {
            setAvailableThemes(themes => [
              ...themes,
              ...defaultThemes.filter(theme => !themes.some(t => t.key === theme.key)),
            ]);
          })
          .catch(error => log.error('CodemirrorPlugin', 'Failed to load default themes', { error }))
          .finally(() => setThemesLoading(false));
      }
    }
  }, [themeOptions?.includeDefaults]);

  const extensions = useMemo(() => [getLanguageExtension(lang)], [lang]);

  const loader = (
    <div className="h-full w-full flex-1 flex flex-col justify-center items-center">
      <Spinner />
    </div>
  );

  return (
    <>
      <InputGroupAddon align="block-start" className="flex w-full justify-between">
        {/* Language toggle */}
        {languages.length > 1 && (
          <Select onValueChange={val => setLang(val as SupportedLanguage)} value={lang}>
            <SelectTrigger
              className="w-45 text-xs h-7!"
              disabled={isLoading}
              id={`select-language-${formId ?? formId_}`}
              size="sm"
            >
              <SelectValue>{value => value || 'Language'}</SelectValue>
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
        <Select onValueChange={t => setTheme(t ?? defaultTheme.key)} value={theme}>
          <SelectTrigger
            className="w-45 text-xs h-7!"
            disabled={isLoading}
            id={`select-theme-${formId ?? formId_}`}
            size="sm"
          >
            <SelectValue>
              {value => (
                <>
                  {themesLoading ? <Spinner className="mr-2 w-3.5 h-3.5" /> : null}
                  {availableThemes.find(t => t.key === value)?.label || defaultTheme.label}
                </>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {availableThemes.map(config => (
              <SelectItem key={`theme-${config.key}`} value={config.key}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </InputGroupAddon>

      <Suspense fallback={loader}>
        <div
          className={cn('w-full h-full flex flex-col overflow-hidden', containerProps?.className)}
        >
          <Codemirror
            basicSetup={{ autocompletion: true, ...basicSetup({ foldGutter: false, tabSize: 2 }) }}
            extensions={extensions}
            height="100%"
            indentWithTab
            minHeight="6rem"
            minWidth="100%"
            onChange={onContent}
            placeholder={placeholder}
            {...codemirrorProps}
            className={cn('w-full h-full flex-1 overflow-auto', codemirrorProps?.className)}
            readOnly={isLoading ?? codemirrorProps?.readOnly}
            theme={(availableThemes.find(t => t.key === theme) || availableThemes[0]).extension}
            value={content || ''}
            width="100%"
          />
        </div>
      </Suspense>
    </>
  );
}
