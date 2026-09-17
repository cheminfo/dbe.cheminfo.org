/**
 * The application shell: the bar every site of the family carries, and the path
 * routing that makes each page a link somebody can hand out.
 *
 * Which page a visitor is on is state — `state.view.activeTab` — and the
 * address mirrors it. {@link useRouteSync} keeps the two in step in both
 * directions: the address is applied to the state on load and on every back or
 * forward, and any state change is written back to it. What the two carry is
 * `src/share/route.ts`, so this file stays the shell.
 *
 * A link carrying `?embed` drops the header, its page bar and the footer, and
 * the shell renders the tool alone — which is what a course page frames.
 */

import { effect } from '@preact/signals-react';
import { useSignals } from '@preact/signals-react/runtime';
import type { ReactElement } from 'react';
import { useEffect } from 'react';
import { startDocumentMeta } from 'react-cheminfo/core';
import {
  CiteButton,
  EcosystemButton,
  HiddenPartsProvider,
  NavLink,
  SiteFooter,
  SiteHeader,
  SiteTheme,
} from 'react-cheminfo/ui';

import { ABOUT } from './about.ts';
import { About } from './pages/About.tsx';
import { Calculator } from './pages/Calculator.tsx';
import { Exercises } from './pages/Exercises.tsx';
import { Learn } from './pages/Learn.tsx';
import { Reference } from './pages/Reference.tsx';
import { PAGE_ROUTES } from './seo/routes.ts';
import { ShareButton } from './share/ShareButton.tsx';
import { applyRoute, currentRoute } from './share/route.ts';
import type { TabId } from './state/index.ts';
import {
  DEFAULT_TAB,
  NAV_TAB_IDS,
  TAB_LABELS,
  setActiveTab,
  state,
} from './state/index.ts';
import { absoluteUrl, withBase } from './state/site.ts';
import {
  formatRoute,
  pathOf,
  readRoute,
  subscribeToRoute,
  writeRoute,
} from './utils/router.ts';

/**
 * The whole application: the bar, the page the address names, and the footer
 * under it.
 * @returns The shell, with exactly one page mounted — a page that draws no
 * structure never mounts the editor, and so never downloads openchemlib.
 */
export function App(): ReactElement {
  useSignals();
  const activeTab = state.view.activeTab.value;

  useRouteSync();

  const framed = state.view.embedded.value;
  const hidden = state.view.hidden.value;
  const navItems = NAV_TAB_IDS.map((tab) => ({
    id: tab,
    label: TAB_LABELS[tab],
    href: withBase(pathOf(tab)),
    onSelect: () => {
      setActiveTab(tab);
    },
  }));

  return (
    <>
      <SiteTheme siteId="dbe" />
      <div className="app-screen">
        {/* The tool fills the window, so the bar and the footer run to both
            edges with it: a capped bar over an uncapped tool leaves the brand
            floating inwards and reads as a fault. */}
        <SiteHeader
          siteId="dbe"
          width="full"
          embedded={framed}
          nav={hidden.includes('tabs') ? [] : navItems}
          activeId={activeTab}
          homeHref={withBase('/')}
          onHome={() => {
            setActiveTab(DEFAULT_TAB);
          }}
          markSize={24}
          actions={
            <>
              <NavLink
                item={{
                  id: 'about',
                  label: 'About',
                  href: withBase('/about'),
                  icon: 'info-sign',
                  title: 'What this site counts, and what it borrows',
                  onSelect: () => {
                    setActiveTab('about');
                  },
                }}
                active={activeTab === 'about'}
              />
              <CiteButton works={ABOUT.cite ?? []} />
              <EcosystemButton currentSiteId="dbe" />
              <ShareButton />
            </>
          }
        />

        {/*
          The one `page-<tab>` marker the end-to-end tests locate a page by. It
          lives on the shell, where exactly one exists at a time — a page adding
          its own would make the locator ambiguous and fail Playwright's strict
          mode.
        */}
        <main className="app-main" data-testid={`page-${activeTab}`}>
          <HiddenPartsProvider hidden={hidden}>
            <PageBody tab={activeTab} />
          </HiddenPartsProvider>
        </main>
      </div>

      <SiteFooter siteId="dbe" width="full" embedded={framed} />
    </>
  );
}

function PageBody(props: { tab: TabId }): ReactElement {
  const { tab } = props;
  if (tab === 'learn') return <Learn />;
  if (tab === 'exercises') return <Exercises />;
  if (tab === 'reference') return <Reference />;
  if (tab === 'about') return <About />;
  return <Calculator />;
}

/**
 * Two-way binding between the address and the view state.
 *
 * The signal `effect` is created *after* the initial route has been applied, so
 * it runs with the state the address just set and can never overwrite a deep
 * link with the defaults it captured a render earlier — the classic bug of a
 * `useEffect` whose dependencies are one render behind the signals.
 */
function useRouteSync(): void {
  useEffect(() => {
    function follow(): void {
      applyRoute(readRoute());
    }
    follow();
    const stopFollowing = subscribeToRoute(follow);
    const stopWriting = effect(() => {
      writeRoute(currentRoute());
    });
    const stopTitling = startDocumentMeta({
      site: 'dbe',
      routes: PAGE_ROUTES,
      url: () => formatRoute(currentRoute()),
      // Read off the page rather than off the build: the origin is whichever
      // host answered and the mount is the one stamped into the page, so a
      // deployment under `/dbe` describes itself instead of claiming an address
      // it does not serve.
      origin: absoluteUrl('/'),
      follow: effect,
    });
    return () => {
      stopFollowing();
      stopWriting();
      stopTitling();
    };
  }, []);
}
