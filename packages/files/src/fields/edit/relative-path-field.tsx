import { Editor } from '@stately/ui/base/components';
import { cn } from '@stately/ui/base/lib/utils';
import {
  Button,
  ButtonGroup,
  Input,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  Spinner,
} from '@stately/ui/base/ui';
import { ExternalLink, FilePlus2, FileSearch2, FileText } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useSaveFile } from '@/hooks/use-save-file';
import type { FileUploadResponse } from '@/types/api';
import { VersionedDataField } from './versioned-data-field';

export type RelativePathMode = 'external' | 'managed' | 'compose';

export const RELATIVE_PATH_MODES = [
  {
    description: 'External path',
    icon: ExternalLink,
    label: 'External',
    value: 'external' as const,
  },
  {
    description: 'Upload directory',
    icon: FileSearch2,
    label: 'Managed',
    value: 'managed' as const,
  },
  {
    description: 'Create file inline',
    icon: FilePlus2,
    label: 'Compose',
    value: 'compose' as const,
  },
] as const;

export interface RelativePathFieldProps {
  formId: string;
  value?: any;
  onChange: (value: any) => void;
  placeholder?: string;
  standalone?: boolean;
}

export function RelativePathField({
  formId,
  value,
  onChange,
  placeholder,
  standalone,
}: RelativePathFieldProps) {
  // Detect if value is an upload path object (versioned)
  const isUploadPath =
    typeof value === 'object' && value !== null && 'dir' in value && value.dir === 'upload';

  // Detect if value is an external string
  const isExternalPath = typeof value === 'string';

  const [mode, setMode] = useState<RelativePathMode>(isUploadPath ? 'managed' : 'external');
  const [filename, setFilename] = useState(''); // Used only in compose
  const [content, setContent] = useState(''); // Used only in compose

  const currentModeConfig = RELATIVE_PATH_MODES.find(m => m.value === mode);

  const onSuccess = useCallback(
    (data: FileUploadResponse) => {
      console.debug('Successfully uploaded file: ', { data });
      onChange({ dir: 'upload', path: data.path });
    },
    [onChange],
  );

  const saveMutation = useSaveFile({ onSuccess });
  const onCompose = useCallback(async () => {
    if (!filename || !content) {
      toast.info('Enter a filename and content before saving');
      return;
    }
    try {
      await saveMutation.mutateAsync({ content, filename });
    } catch (error) {
      console.error('Error saving content:', error);
    }
  }, [filename, content, saveMutation]);

  // Mode selector dropdown (same for all cases)
  const modeSelector = useMemo(() => {
    const Icon = currentModeConfig?.icon ?? FileText;
    return (
      <ButtonGroup>
        <Select onValueChange={v => setMode(v as RelativePathMode)} value={mode}>
          <SelectTrigger className="w-auto min-w-12 gap-1.5 bg-background" id={`select-${formId}`}>
            <Icon />
          </SelectTrigger>
          <SelectContent className="min-w-40">
            <SelectGroup>
              <SelectLabel>Path Type</SelectLabel>
              {RELATIVE_PATH_MODES.map(m => {
                const ModeIcon = m.icon;
                return (
                  <SelectItem key={m.value} value={m.value}>
                    <div className="flex items-center gap-2">
                      <ModeIcon />
                      <span>{m.label}</span>
                      <span className="text-muted-foreground text-xs">• {m.description}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectGroup>
          </SelectContent>
        </Select>
      </ButtonGroup>
    );
  }, [mode, formId, currentModeConfig?.icon]);

  // For all other cases (external, or undefined, or switching modes)
  return (
    <ButtonGroup className="flex-1 min-w-0 w-full">
      {standalone && modeSelector}

      {/* External mode - text input */}
      {mode === 'external' && (
        <Input
          className="min-w-0 flex-1 bg-background min-h-1 rounded-md"
          id={formId}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder || 'Enter external path...'}
          value={isExternalPath ? value : ''}
        />
      )}

      {/* Browse mode - file browser popover */}
      {mode === 'managed' && (
        <VersionedDataField formId={formId} onChange={onChange} value={value} />
      )}

      {/* Compose mode - inline editor */}
      {mode === 'compose' && (
        <div className={cn('min-w-0 w-full h-full flex flex-col gap-1 flex-1')}>
          <Input
            className="text-sm bg-background"
            disabled={saveMutation.isPending}
            id={`primary-string-editor-${formId}`}
            onChange={e => setFilename(e.target.value)}
            placeholder="Name (required) eg. config.json"
            value={filename}
          />
          <Editor
            content={content}
            formId={formId}
            isLoading={saveMutation.isPending}
            onContent={setContent}
            placeholder="Type or paste content..."
            saveButton={
              <Button
                className="cursor-pointer"
                disabled={!filename || !content || saveMutation.isPending}
                onClick={onCompose}
                size="sm"
                type="button"
                variant="outline"
              >
                <span className="flex flex-row items-center gap-2">
                  {saveMutation.isPending ? (
                    <Spinner className="w-3.5 h-3.5" />
                  ) : (
                    <FileText className="w-3.5 h-3.5" />
                  )}
                  {saveMutation.isPending ? 'Saving...' : 'Save'}
                </span>
              </Button>
            }
          />
        </div>
      )}

      {!standalone && modeSelector}
    </ButtonGroup>
  );
}
