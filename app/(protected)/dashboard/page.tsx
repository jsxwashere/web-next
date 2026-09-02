import { redirect } from 'next/navigation';

// ECC P1 fix: /dashboard URL'i kök `app/(protected)/page.tsx` Dashboard'ı
// render ediyor — duplicate sayfa yerine redirect.
export default function DashboardAlias() {
  redirect('/');
}
