import { redirect } from 'next/navigation';

// ECC P0 fix: Firmalar/Bayiler global listesi zaten /firms'de var.
export default function FirmalarBayilerIndex() {
  redirect('/firms');
}
