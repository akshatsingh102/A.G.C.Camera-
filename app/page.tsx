'use client';

import dynamic from 'next/dynamic';

const Camera = dynamic(() => import('@/components/Camera').then((m) => m.Camera), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        <p className="text-white/70">Loading Camera...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  return <Camera />;
}
