import { redirect } from 'next/navigation';

// ECC P0 fix: Malzeme/Stok global listesi yerine projelere yönlendir.
export default function MalzemeStokIndex() {
  redirect('/projects');
}
