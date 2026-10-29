'use client';

import { usePosUi } from '@/PosUiStore/PosUiContext';

 
import KitchenView from './KitchenView';
import Bill from './Bill';

import { usePosTheme } from '@/PosThemeStore/PosThemeContext';
import CartPanel from './CartPanel';
import RunningOrderView from './RunningOrderView';

export default function RightSideBar() {

  const {
    rightSidebarView,
  } = usePosUi();

  const {
    background,
  } = usePosTheme();

  return (
    <aside
      className={`
        relative
        flex
        h-[100%]
        w-full
        flex-col
        overflow-hidden
        border-l
        ${background.border}
        ${background.className}
        ${background.text}
      `}
    >

      <div className="min-h-0 flex-1 overflow-hidden ">

        {rightSidebarView === 'cart' && (
          <CartPanel />
        )}

        {rightSidebarView === 'bill' && (
          <Bill />
        )}

        {rightSidebarView === 'kitchen' && (
          <KitchenView />
        )}
           {rightSidebarView === 'RO' && (
          <RunningOrderView />
        )}

      </div>

    </aside>
  );
}