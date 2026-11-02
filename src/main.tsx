import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './style.css';

const MarkdownWorkbench = React.lazy(() => import('./MarkdownWorkbench'));
const isMarkdownWeb = window.location.pathname.replace(/\/+$/, '') === '/markdown' &&
  !(window as Window & { Capacitor?: unknown }).Capacitor;

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isMarkdownWeb ? <React.Suspense fallback={<div>Carregando editor offline…</div>}><MarkdownWorkbench /></React.Suspense> : <App />}
  </React.StrictMode>
);
