import { redirect } from 'next/navigation';

// ECC P0 fix: Ödemeler global listesi yerine projelere yönlendir.
// Mevcut sayfa /projects/{id}/odemeler (proje detayında) — global
// liste ileride eklenecek.
export default function OdemelerIndex() {
  redirect('/projects');
}
