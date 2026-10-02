'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthRegisterRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/signup');
  }, [router]);

  return (
    <div className="flex-1 flex items-center justify-center p-8 text-sm text-slate-500">
      Redirecting to /signup...
    </div>
  );
}
