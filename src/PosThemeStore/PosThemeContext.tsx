'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

import {
  POS_BACKGROUNDS,
  POS_THEMES,
  PosBackground,
  PosBackgroundConfig,
  PosThemeName,
  PosThemeConfig,
} from '@/config/POS_THEME';

type PosThemeContextType = {
  themeName: PosThemeName;

  theme: PosThemeConfig;

  setThemeName: (theme: PosThemeName) => void;

  backgroundName: PosBackground;

  background: PosBackgroundConfig;

  setBackgroundName: (background: PosBackground) => void;
};

const PosThemeContext =
  createContext<PosThemeContextType | null>(null);

export function PosThemeProvider({
  children,
}: {
  children: ReactNode;
}) {

  // =====================================================
  // COLOR THEME
  // =====================================================

  const [themeName, setThemeNameState] =
    useState<PosThemeName>('blue');


  // =====================================================
  // POS BACKGROUND
  // =====================================================

  const [backgroundName, setBackgroundNameState] =
    useState<PosBackground>('softSlate');


  // =====================================================
  // LOAD SAVED SETTINGS
  // =====================================================

  useEffect(() => {

    const savedTheme =
      localStorage.getItem(
        'POS_THEME'
      ) as PosThemeName | null;

    if (
      savedTheme &&
      savedTheme in POS_THEMES
    ) {
      setThemeNameState(savedTheme);
    }


    const savedBackground =
      localStorage.getItem(
        'POS_BACKGROUND'
      ) as PosBackground | null;

    if (
      savedBackground &&
      savedBackground in POS_BACKGROUNDS
    ) {
      setBackgroundNameState(savedBackground);
    }

  }, []);


  // =====================================================
  // CHANGE COLOR THEME
  // =====================================================

  function setThemeName(
    theme: PosThemeName
  ) {

    setThemeNameState(theme);

    localStorage.setItem(
      'POS_THEME',
      theme
    );
  }


  // =====================================================
  // CHANGE BACKGROUND
  // =====================================================

  function setBackgroundName(
    background: PosBackground
  ) {

    setBackgroundNameState(background);

    localStorage.setItem(
      'POS_BACKGROUND',
      background
    );
  }


  // =====================================================
  // ACTIVE THEME
  // =====================================================

  const theme: PosThemeConfig =
    POS_THEMES[themeName];


  // =====================================================
  // ACTIVE BACKGROUND
  // =====================================================

  const background: PosBackgroundConfig =
    POS_BACKGROUNDS[backgroundName];


  // =====================================================
  // DEBUG
  // =====================================================

  // console.log(
  //   'ACTIVE POS BACKGROUND:',
  //   backgroundName,
  //   background
  // );


  // =====================================================
  // PROVIDER
  // =====================================================

  return (
    <PosThemeContext.Provider
      value={{
        themeName,
        theme,
        setThemeName,

        backgroundName,
        background,
        setBackgroundName,
      }}
    >
      {children}
    </PosThemeContext.Provider>
  );
}


export function usePosTheme() {

  const context =
    useContext(PosThemeContext);

  if (!context) {
    throw new Error(
      'usePosTheme must be used inside PosThemeProvider'
    );
  }

  return context;
}