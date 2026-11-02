import React from 'react';
import { createRoot } from 'react-dom/client';
import { Capacitor } from '@capacitor/core';

// Route-level splitting: the Universal Reader must not load in the Markdown-only PWA.
const ReaderApp = React.lazy(() => import('./App'));
const MarkdownWorkbench = React.lazy(() => import('./MarkdownWorkbench'));
const isMarkdownWeb = window.location.pathname.replace(/\/+$/, '') === '/markdown' &&
  !Capacitor.isNativePlatform();

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <React.Suspense fallback={<div role="status">Carregando aplicativo local…</div>}>
      {isMarkdownWeb ? <MarkdownWorkbench /> : <ReaderApp />}
    </React.Suspense>
  </React.StrictMode>
);
