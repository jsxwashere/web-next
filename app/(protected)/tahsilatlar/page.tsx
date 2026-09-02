import { redirect } from 'next/navigation';

// ECC P0 fix: Tahsilatlar global listesi yerine projelere yönlendir.
// Mevcut sayfa /projects/{id}/tahsilatlar (proje detayında) — global
// liste ileride eklenecek.
export default function TahsilatlarIndex() {
  redirect('/projects');
}
