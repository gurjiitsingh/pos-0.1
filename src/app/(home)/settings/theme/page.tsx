'use client';

import PosThemeSelector from '@/components/theme/PosThemeSelector';
import { useEffect, useState } from 'react';

export default function TestPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [outlet, setOutlet] = useState<any>(null);

  useEffect(() => {
    // window.posApi.getAllUsers().then(setUsers);
    // window.posApi.getOutlet().then(setOutlet);
  }, []);

  return (
    <div className='p-4 min-w-[300px] flex space-y-4 overflow-y-auto'>
       {/* <pre>{JSON.stringify(users, null, 2)}</pre>
      <pre>{JSON.stringify(outlet, null, 2)}</pre> */}

      <div className="w-full">

        <PosThemeSelector />

      </div>
    </div>
  );
}