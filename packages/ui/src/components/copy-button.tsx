import { Check, Copy } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from './base/button';

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [value]);

  return (
    <Button
      aria-label="Copy value"
      className="h-6 w-6 shrink-0"
      onClick={handleCopy}
      size="icon"
      variant="ghost"
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </Button>
  );
}
