import { Save, X } from 'lucide-react';
import { useCallback, useId, useMemo, useState } from 'react';
import { Button } from '@/components/base/button';
import { Label } from '@/components/base/label';
import { Editor } from '@/components/editor';
import { Note } from '@/components/note';
import { cn } from '@/lib/utils';

type JsonStatus = { valid: boolean; error?: string; msg?: string };

export interface JsonEditProps {
  value: any;
  label?: string;
  onSave: (value: any) => void;
}

/**
 * Component for editing entity configuration as raw JSON
 */
export function JsonEdit({
  value,
  onSave,
  label = 'Configuration (JSON)',
  ...rest
}: JsonEditProps & React.HTMLAttributes<HTMLDivElement>) {
  const formId = useId();
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [json, setJson] = useState<string>(JSON.stringify(value || {}, null, 2));

  const handleJsonForm = useCallback((val: string) => {
    setJson(val);
    try {
      JSON.parse(val);
      setIsDirty(true);
    } catch (error) {
      console.error('Invalid JSON syntax', error);
    }
  }, []);

  const status: JsonStatus = useMemo(() => {
    if (!json) {
      return { msg: 'Enter valid JSON', valid: false };
    }

    try {
      JSON.parse(json);
      return { msg: 'Valid JSON', valid: true };
    } catch (error) {
      const msg = 'Invalid JSON syntax';
      const errMsg = error
        ? typeof error === 'object' && 'message' in error
          ? error.message
          : error
        : '';
      return { msg: `${msg}: ${errMsg}`, valid: false };
    }
  }, [json]);

  return (
    <div {...rest} className={cn('p-3', rest.className)}>
      <Note message={status.error || status.msg || ''} mode={status.valid ? 'success' : 'error'} />

      <div className="space-y-2">
        <Label htmlFor="config-json">{label}</Label>
        <Editor
          content={json}
          formId={formId}
          onContent={handleJsonForm}
          placeholder="Enter JSON configuration here"
          supportedLanguages={['json']}
        />
      </div>

      {/* Save/Cancel buttons appear when dirty */}
      <Button
        className={cn(
          'cursor-pointer',
          isDirty && status.valid && 'animate-[save-glow_2s_ease-in-out_infinite]',
        )}
        disabled={!status.valid || !isDirty}
        onClick={() => {
          setIsDirty(false);
          onSave(json);
        }}
        size="sm"
        variant="secondary"
      >
        <Save className="w-4 h-4 mr-2" />
        Submit
      </Button>
      <Button
        className="cursor-pointer"
        onClick={() => {
          setJson(JSON.stringify(value ?? {}));
          setIsDirty(false);
        }}
        size="sm"
        variant="ghost"
      >
        <X className="w-4 h-4 mr-2" />
        Cancel
      </Button>
    </div>
  );
}
