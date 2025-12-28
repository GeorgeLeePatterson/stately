/**
 * This module provides a toggleable editor if the codemirror plugin has registered ReactCodeMirror.
 */
import {
  BaseEditor,
  type BaseEditorProps,
  type EditorWrapperProps,
  ToggledEditor,
  type ToggleEditorProps,
} from '@statelyjs/ui/components/editor';
import { useMemo } from 'react';
import { CodemirrorEditor, type CodemirrorEditorProps } from './editor';

export interface CodemirrorEditorToggleProps extends Omit<CodemirrorEditorProps, 'Codemirror'> {
  codeIcon?: React.ReactNode;
  defaultMode?: ToggleEditorProps['defaultMode'];
  editorWrapperProps?: EditorWrapperProps;
}

export function CodemirrorEditorToggle({
  // Base editor props
  formId,
  content,
  onContent,
  placeholder,
  isLoading,
  // Pulled from CodemirrorEditor
  Codemirror,
  // Specific props
  defaultMode,
  codeIcon,
  editorWrapperProps,
  // Codemirror specific
  ...rest
}: CodemirrorEditorToggleProps & Partial<Pick<CodemirrorEditorProps, 'Codemirror'>>) {
  // Memoize the render component to prevent remounting on every render.
  // Only recreate if Codemirror or the codemirror-specific props change.
  const CodemirrorComponent = useMemo(() => {
    if (!Codemirror) return null;

    // Return a stable component that receives BaseEditorProps at render time
    const Component = (props: BaseEditorProps) => (
      <CodemirrorEditor
        Codemirror={Codemirror}
        placeholder={placeholder}
        {...props}
        codemirrorProps={rest.codemirrorProps}
        containerProps={rest.containerProps}
        supportedLanguages={rest.supportedLanguages}
        themeOptions={rest.themeOptions}
      />
    );
    Component.displayName = 'CodemirrorComponent';
    return Component;
  }, [
    Codemirror,
    placeholder,
    rest.supportedLanguages,
    rest.themeOptions,
    rest.codemirrorProps,
    rest.containerProps,
  ]);

  if (!Codemirror || !CodemirrorComponent) {
    return (
      <BaseEditor
        {...editorWrapperProps}
        content={content}
        formId={formId}
        isLoading={isLoading}
        onContent={onContent}
        placeholder={placeholder}
      />
    );
  }

  return (
    <ToggledEditor
      {...editorWrapperProps}
      content={content}
      defaultMode={defaultMode}
      formId={formId}
      isLoading={isLoading}
      onContent={onContent}
      placeholder={placeholder}
      render={CodemirrorComponent}
    />
  );
}
