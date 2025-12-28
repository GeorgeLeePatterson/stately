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
import type { ReactCodeMirrorProps } from '@uiw/react-codemirror';
import { CodemirrorEditor, type CodemirrorEditorBaseProps } from './editor';

/**
 * Module level flag providing lazy Codemirror if loaded
 */
let LazyCodemirror:
  | React.LazyExoticComponent<React.ComponentType<ReactCodeMirrorProps>>
  | undefined;

export function setLazyCodemirror(
  lazyCodemirror: React.LazyExoticComponent<React.ComponentType<ReactCodeMirrorProps>>,
) {
  LazyCodemirror = lazyCodemirror;
}

export interface CodemirrorEditorToggleProps extends CodemirrorEditorBaseProps, BaseEditorProps {
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
  editorWrapperProps,
  // Specific props
  defaultMode,
  codeIcon,
  // Codemirror specific
  ...rest
}: CodemirrorEditorToggleProps) {
  const codemirrorComponent = (props: BaseEditorProps) =>
    LazyCodemirror ? (
      <CodemirrorEditor
        Codemirror={LazyCodemirror}
        placeholder={placeholder}
        {...rest}
        {...props}
      />
    ) : null;

  return (
    <>
      {!LazyCodemirror ? (
        <BaseEditor
          {...editorWrapperProps}
          content={content}
          formId={formId}
          isLoading={isLoading}
          onContent={onContent}
          placeholder={placeholder}
        />
      ) : (
        <ToggledEditor
          {...editorWrapperProps}
          content={content}
          defaultMode={defaultMode}
          formId={formId}
          isLoading={isLoading}
          onContent={onContent}
          placeholder={placeholder}
          render={codemirrorComponent}
        />
      )}
    </>
  );
}
