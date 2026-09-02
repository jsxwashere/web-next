import { redirect } from 'next/navigation';

// ECC P0 fix: Raporlar global listesi yerine projelere yönlendir.
export default function RaporlarIndex() {
  redirect('/projects');
}
