import { redirect } from 'next/navigation';

// ECC P0 fix: Firmalar/Tedarikçiler global listesi zaten /firms'de var.
export default function FirmalarTedarikcilerIndex() {
  redirect('/firms');
}
