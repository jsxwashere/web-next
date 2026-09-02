import { redirect } from 'next/navigation';

// ECC P0 fix: Hakediş global listesi yerine projelere yönlendir.
export default function HakedisIndex() {
  redirect('/projects');
}
