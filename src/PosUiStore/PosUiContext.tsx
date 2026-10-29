'use client';

import {
  createContext,
  useContext,
  useState,
} from 'react';

export type RightSidebarView =
  | 'cart'
  | 'kitchen'
  | 'bill'
  | 'RO';

type PosUiContextType = {
  rightSidebarView: RightSidebarView;
  setRightSidebarView: (
    view: RightSidebarView
  ) => void;

  // Future UI states
  isPaymentOpen: boolean;
  setPaymentOpen: (v: boolean) => void;

  isCustomerOpen: boolean;
  setCustomerOpen: (v: boolean) => void;
};

const PosUiContext =
  createContext<PosUiContextType | null>(null);

export function PosUiProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [
    rightSidebarView,
    setRightSidebarView,
  ] = useState<RightSidebarView>('cart');

  const [
    isPaymentOpen,
    setPaymentOpen,
  ] = useState(false);

  const [
    isCustomerOpen,
    setCustomerOpen,
  ] = useState(false);

  return (
    <PosUiContext.Provider
      value={{
        rightSidebarView,
        setRightSidebarView,
        isPaymentOpen,
        setPaymentOpen,
        isCustomerOpen,
        setCustomerOpen,
      }}
    >
      {children}
    </PosUiContext.Provider>
  );
}

export function usePosUi() {
  const ctx = useContext(PosUiContext);

  if (!ctx) {
    throw new Error(
      'usePosUi must be used inside PosUiProvider'
    );
  }

  return ctx;
}