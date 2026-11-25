import React, {useEffect, type ReactNode} from 'react';
import OriginalLayoutProvider from '@theme-original/Layout/Provider';
import {useColorMode} from '@docusaurus/theme-common';
import type {Props} from '@theme/Layout/Provider';

/*
 * The Academy shell owns the visible theme controls and emits this event after
 * updating data-swa-theme. Docusaurus does not observe that attribute, so its
 * React consumers (including diagrams) need the same choice through its public
 * colour-mode API. Mount inside the original provider to preserve all of the
 * framework's navigation, storage and system-preference behaviour.
 */
function AcademyThemeBridge(): null {
  const {colorMode, colorModeChoice, setColorMode} = useColorMode();

  useEffect(() => {
    const syncTheme = () => {
      const mode = document.documentElement.getAttribute('data-swa-theme');
      if (mode !== 'light' && mode !== 'dark' && mode !== 'system') return;

      const choice = mode === 'system' ? null : mode;
      const effective = mode === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : mode;

      if (colorModeChoice !== choice || colorMode !== effective) {
        setColorMode(choice);
      }
    };

    // The shell may have loaded before hydration or after this effect mounts.
    syncTheme();
    window.addEventListener('skunkworksacademy:theme-change', syncTheme);
    return () => window.removeEventListener('skunkworksacademy:theme-change', syncTheme);
  }, [colorMode, colorModeChoice, setColorMode]);

  return null;
}

export default function LayoutProvider({children}: Props): ReactNode {
  return (
    <OriginalLayoutProvider>
      <AcademyThemeBridge />
      {children}
    </OriginalLayoutProvider>
  );
}
