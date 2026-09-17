/**
 * Browser entry point: the stylesheets, the React root, and nothing else.
 *
 * Blueprint's and KaTeX's CSS are imported here rather than in a component so
 * they are loaded once, before anything renders, and so this site's own
 * sheets — which deliberately override Blueprint's focus and label rules, and
 * KaTeX's font size — always come last.
 */

import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import 'katex/dist/katex.min.css';
import 'react-cheminfo/styles/chrome.css';
import './styles/global.css';
import './styles/controls.css';
import './styles/learning.css';

import { FocusStyleManager } from '@blueprintjs/core';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App.tsx';

// A focus ring on every click makes the valence chips look broken; on Tab it is
// the only thing telling a keyboard user where they are.
FocusStyleManager.onlyShowFocusOnTabs();

const container = document.querySelector('#root');
if (container === null) {
  throw new Error(
    'dbe.cheminfo.org cannot start: index.html has no <div id="root"></div> to mount into.',
  );
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
