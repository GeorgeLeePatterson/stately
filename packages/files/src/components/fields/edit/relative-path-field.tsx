import { ExternalLink, FilePlus2, FileSearch2, FileText } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Editor } from '@/components/views/editor';
import { type FileUploadResponse, useSaveFile } from '@/hooks/use-save-file';
import { cn } from '@/lib/utils';
import { VersionedDataField } from './versioned-data-field';

type RelativePathMode = 'external' | 'managed' | 'compose';

export const RELATIVE_PATH_MODES = [
  {
    value: 'external' as const,
    icon: ExternalLink,
    label: 'External',
    description: 'External path',
  },
  {
    value: 'managed' as const,
    icon: FileSearch2,
    label: 'Managed',
    description: 'Upload directory',
  },
  {
    value: 'compose' as const,
    icon: FilePlus2,
    label: 'Compose',
    description: 'Create file inline',
  },
] as const;

interface RelativePathFieldProps {
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
        <Select value={mode} onValueChange={v => setMode(v as RelativePathMode)}>
          <SelectTrigger
            id={`select-${formId}`}
            className="w-auto min-w-[3rem] gap-1.5 bg-background"
          >
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
          id={formId}
          value={isExternalPath ? value : ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder || 'Enter external path...'}
          className="min-w-0 flex-1 bg-background min-h-1 rounded-md"
        />
      )}

      {/* Browse mode - file browser popover */}
      {mode === 'managed' && (
        <VersionedDataField formId={formId} value={value} onChange={onChange} />
      )}

      {/* Compose mode - inline editor */}
      {mode === 'compose' && (
        <div className={cn('min-w-0 w-full h-full flex flex-col gap-1 flex-1')}>
          <Input
            id={`primary-string-editor-${formId}`}
            placeholder="Name (required) eg. config.json"
            value={filename}
            onChange={e => setFilename(e.target.value)}
            className="text-sm bg-background"
            disabled={saveMutation.isPending}
          />
          <Editor
            formId={formId}
            content={content}
            onContent={setContent}
            placeholder="Type or paste content..."
            isLoading={saveMutation.isPending}
            saveButton={
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="cursor-pointer"
                onClick={onCompose}
                disabled={!filename || !content || saveMutation.isPending}
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
