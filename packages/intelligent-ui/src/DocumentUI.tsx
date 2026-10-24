import { useMemo } from 'react';
import { Renderer } from '@openuidev/react-lang';
import { documentLibrary } from './library';
import { localDocumentProgram, type DocumentSnapshot } from './local';
import '@openuidev/react-ui/layered/styles/index.css';

export function DocumentUI({ document, query, program, onError }: {
  document: DocumentSnapshot;
  query?: string;
  program?: string;
  onError?: (message: string) => void;
}) {
  const local = useMemo(() => localDocumentProgram(document, query), [document, query]);
  return <div className="document-generated-ui"><Renderer library={documentLibrary} response={program?.trim() || local} isStreaming={false} onError={(errors) => {
    const serious = errors.filter((e) => e.severity !== 'warning');
    if (serious.length) onError?.(serious.map((e) => e.message).join('; '));
  }}/></div>;
}
