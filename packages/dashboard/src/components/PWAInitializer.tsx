'use client';

import { useServiceWorker } from '@/hooks/useServiceWorker';

export default function PWAInitializer() {
  useServiceWorker();
  return null;
}
