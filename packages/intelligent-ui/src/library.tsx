import { useState } from 'react';
import { defineComponent } from '@openuidev/react-lang';
import { openuiLibrary } from '@openuidev/react-ui';
import { z } from 'zod/v4';

/** Componentes documentais locais registrados no catálogo open source OpenUI. */
const ReaderEvidence = defineComponent({
  name: 'ReaderEvidence',
  description: 'Citação de um trecho extraído de documento com referência verificável.',
  props: z.object({ reference: z.string().max(160), excerpt: z.string().max(1800) }),
  component: ({ props }) => <figure className="reader-evidence"><blockquote>{props.excerpt}</blockquote><figcaption>{props.reference}</figcaption></figure>
});

const ReaderChecklist = defineComponent({
  name: 'ReaderChecklist',
  description: 'Checklist interativo editável localmente, usado para tarefas retiradas do documento.',
  props: z.object({ title: z.string().max(150), items: z.array(z.string().max(400)).max(20) }),
  component: ({ props }) => {
    const [checked, setChecked] = useState<Record<number, boolean>>({});
    return <section className="reader-checklist"><h4>{props.title}</h4>{props.items.map((item, i) => <label key={i}><input type="checkbox" checked={!!checked[i]} onChange={(e) => setChecked((old) => ({ ...old, [i]: e.target.checked }))}/><span className={checked[i] ? 'checked' : ''}>{item}</span></label>)}</section>;
  }
});

const ReaderMetric = defineComponent({
  name: 'ReaderMetric',
  description: 'Métrica verificável do próprio documento, sem inferências externas.',
  props: z.object({ label: z.string().max(100), value: z.string().max(100) }),
  component: ({ props }) => <div className="reader-metric"><span>{props.label}</span><strong>{props.value}</strong></div>
});

/** Runtime real do OpenUI. Não executa HTML/JS fornecidos pelo modelo. */
// Stack/Card in react-ui 0.18 do not expose an extendable union slot.
// Register additional components without slot mutation; OpenUI handles typed
// references in its existing general-purpose document container.
export const documentLibrary = openuiLibrary.extend({
  components: { add: [ReaderEvidence, ReaderChecklist, ReaderMetric] }
});
