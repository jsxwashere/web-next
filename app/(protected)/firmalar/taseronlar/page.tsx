import { redirect } from 'next/navigation';

// ECC P0 fix: Firmalar/Taşeronlar global listesi zaten /firms'de var.
export default function FirmalarTaseronlarIndex() {
  redirect('/firms');
}
