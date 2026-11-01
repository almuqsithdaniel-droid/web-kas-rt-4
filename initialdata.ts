import { Transaction, KasShortage, Member, KasProfile } from '../types';

// Bersih 100% dari 0 untuk penggunaan pribadi
export const initialTransactions: Transaction[] = [];
export const initialShortages: KasShortage[] = [];
export const initialMembers: Member[] = [];

export const initialProfile: KasProfile = {
  organizationName: 'Kas Pemuda RT 04',
  rtNumber: 'RT 04',
  treasurerName: 'Bendahara Pemuda',
  treasurerPhone: '',
  monthlyFee: 15000,
  receiptNote: 'Simpan tanda terima ini sebagai bukti sah pembayaran kas Pemuda RT 04.',
};