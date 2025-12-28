import { Check, Code, Maximize, Text } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/base/dialog';
import { InputGroup, InputGroupAddon, InputGroupTextarea } from '@/components/base/input-group';
import { Spinner } from '@/components/base/spinner';
import { cn } from '@/lib/utils';
import { Button } from './base/button';
import { ToggleGroup, ToggleGroupItem } from './base/toggle-group';

export interface BaseEditorProps {
  formId?: string;
  content?: string;
  onContent: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
}

export type EditorWrapperProps = React.PropsWithChildren<{
  saveButton?: React.ReactNode;
  toggleButton?: React.ReactNode;
  isLoading?: boolean;
  inputGroupProps?: React.ComponentProps<typeof InputGroup>;
}>;

/**
 * A simple, styled textarea component for editing multiline text
 *
 * @param props - TextEditor props (see {@link BaseEditorProps})
 * @returns JSX.Element
 */
export function TextEditor({
  content,
  onContent,
  isLoading,
  placeholder,
  ...rest
}: BaseEditorProps &
  Omit<React.ComponentProps<typeof InputGroupTextarea>, 'onChange' | 'value' | 'placeholder'>) {
  return (
    <InputGroupTextarea
      {...rest}
      className={cn('bg-background font-mono text-xs resize-y rounded-t-md', rest.className)}
      disabled={rest.disabled ?? isLoading}
      onChange={e => onContent(e.target.value)}
      placeholder={placeholder}
      rows={rest.rows ?? 6}
      value={content || ''}
    />
  );
}

/**
 * Wraps an editor with controls allowing for opening into a dialog.
 *
 * @param props - EditorWrapper props (see {@link EditorWrapperProps} & {@link InputGroupProps})
 * @returns JSX.Element
 */
export function EditorWrapper({
  saveButton,
  toggleButton,
  isLoading,
  children,
  inputGroupProps,
}: EditorWrapperProps) {
  const [editorOpen, setEditorOpen] = useState<boolean>(false);
  const editorView = (
    <InputGroup
      {...(inputGroupProps ?? {})}
      className={cn('@container/editor', 'min-w-0 min-h-48 flex-1', inputGroupProps?.className)}
    >
      {children}

      <InputGroupAddon align="block-end" className="flex justify-between items-center">
        {saveButton}

        {/* Toggle mode */}
        {isLoading ? <Spinner /> : toggleButton}

        <DialogTrigger
          render={
            <Button
              className="cursor-pointer"
              disabled={isLoading}
              onClick={() => setEditorOpen(!editorOpen)}
              size="sm"
              type="button"
              variant="outline"
            />
          }
        >
          {editorOpen ? <Check /> : <Maximize />}
          <span className="hidden @md/editor:inline">{editorOpen ? 'Done' : 'Open Editor'}</span>
        </DialogTrigger>
      </InputGroupAddon>
    </InputGroup>
  );

  return (
    <Dialog
      onOpenChange={(open, eventDetails) => {
        // Prevent closing on Escape key (reason from @base-ui/react internal REASONS.escapeKey)
        if (!open && eventDetails.reason === 'escape-key') {
          return;
        }
        setEditorOpen(open);
      }}
      open={editorOpen}
    >
      {editorOpen ? (
        <DialogContent className="min-w-[70vw] min-h-[70vh] h-dvh md:max-h-[80vh]">
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

/**
 * Implementation of `TextEditor` with `EditorWrapper`
 *
 * @param props - BaseEditor props (see {@link BaseEditorProps} & {@link EditorWrapperProps})
 * @returns JSX.Element
 */
export function BaseEditor({
  // Base editor
  formId,
  placeholder,
  content,
  onContent,
  isLoading,
  // Editor wrapper
  ...rest
}: BaseEditorProps & Omit<EditorWrapperProps, 'children'>) {
  return (
    <EditorWrapper isLoading={isLoading} {...rest}>
      <TextEditor
        content={content}
        disabled={isLoading}
        id={`textarea-content-${formId}`}
        onContent={onContent}
        placeholder={placeholder}
      />
    </EditorWrapper>
  );
}

export interface ToggleEditorProps {
  defaultMode?: 'simple' | 'alt';
  altIcon?: React.ReactNode;
  render: React.ComponentType<BaseEditorProps>;
}

export function ToggledEditor({
  // Toggle editor
  defaultMode,
  altIcon,
  render: AltEditor,
  // Base editor
  placeholder,
  content,
  onContent,
  isLoading,
  // Editor wrapper
  formId,
  ...rest
}: ToggleEditorProps & BaseEditorProps & Omit<EditorWrapperProps, 'children'>) {
  const [mode, setMode] = useState<'simple' | 'alt'>(defaultMode || 'simple');

  return (
    <EditorWrapper
      {...rest}
      isLoading={isLoading}
      toggleButton={
        <>
          {rest.toggleButton ?? (
            <ToggleGroup
              disabled={isLoading}
              multiple={false}
              onValueChange={value => {
                if (value.length > 0) setMode(value[0] as 'simple' | 'alt');
              }}
              size="sm"
              value={[mode]}
              variant="outline"
            >
              {/* Text */}
              <ToggleGroupItem
                aria-label="Toggle text"
                className={cn('cursor-pointer')}
                value="simple"
              >
                <Text className="h-4 w-4" />
              </ToggleGroupItem>

              {/* Code */}
              <ToggleGroupItem
                aria-label="Toggle code"
                className={cn('cursor-pointer')}
                value="alt"
              >
                {altIcon ?? <Code className="h-4 w-4" />}
              </ToggleGroupItem>
            </ToggleGroup>
          )}
        </>
      }
    >
      {mode === 'simple' ? (
        <TextEditor
          content={content}
          disabled={isLoading}
          id={`textarea-content-${formId}`}
          onContent={onContent}
          placeholder={placeholder}
        />
      ) : (
        <AltEditor
          content={content}
          isLoading={isLoading}
          onContent={onContent}
          placeholder={placeholder}
        />
      )}
    </EditorWrapper>
  );
}
