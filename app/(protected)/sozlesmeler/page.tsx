import { redirect } from 'next/navigation';

// ECC P0 fix: Sözleşmeler global listesi yerine projelere yönlendir.
export default function SozlesmelerIndex() {
  redirect('/projects');
}
