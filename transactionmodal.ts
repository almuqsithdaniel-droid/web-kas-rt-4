import React, { useState, useEffect } from 'react';
import { useCashBook } from '../../context/CashBookContext';
import { Transaction, TransactionType } from '../../types';
import { parseNumberInput } from '../../utils/formatters';
import {
  X,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Clock,
  User,
  Phone,
  FileText,
  Camera,
  Trash2,
} from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: TransactionType;
  initialPersonName?: string;
  initialPersonPhone?: string;
  initialAmount?: number;
  editingTransaction?: Transaction | null;
  onSuccessCreated?: (tx: Transaction) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  initialType = 'income',
  initialPersonName = '',
  initialPersonPhone = '',
  initialAmount,
  editingTransaction = null,
  onSuccessCreated,
}) => {
  const { members, addTransaction, updateTransaction, profile } = useCashBook();

  const [type, setType] = useState<TransactionType>(initialType);
  const [amountStr, setAmountStr] = useState<string>('');
  const [personName, setPersonName] = useState<string>('');
  const [personPhone, setPersonPhone] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState<string>(() => new Date().toTimeString().slice(0, 5));
  const [notes, setNotes] = useState<string>('');
  const [receiptImage, setReceiptImage] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (editingTransaction && editingTransaction.id) {
      setType(editingTransaction.type);
      setAmountStr(String(editingTransaction.amount));
      setPersonName(editingTransaction.personName || '');
      setPersonPhone(editingTransaction.personPhone || '');
      setDescription(editingTransaction.description || '');
      setDate(editingTransaction.date);
      setTime(editingTransaction.time || new Date().toTimeString().slice(0, 5));
      setNotes(editingTransaction.notes || '');
      setReceiptImage(editingTransaction.receiptImage || '');
    } else {
      setType(initialType);
      setAmountStr(initialAmount ? String(initialAmount) : (initialType === 'income' ? String(profile.monthlyFee || '') : ''));
      setPersonName(initialPersonName);
      setPersonPhone(initialPersonPhone);
      setDescription(initialType === 'income' ? 'Iuran kas pemuda' : '');
      setDate(new Date().toISOString().slice(0, 10));
      setTime(new Date().toTimeString().slice(0, 5));
      setNotes('');
      setReceiptImage('');
      setErrorMsg('');
    }
  }, [editingTransaction, initialType, initialPersonName, initialPersonPhone, initialAmount, profile.monthlyFee, isOpen]);

  if (!isOpen) return null;

  const currentAmountNum = parseNumberInput(amountStr);

  const handleSelectMember = (name: string) => {
    setPersonName(name);
    const m = members.find((item) => item.name.toLowerCase() === name.toLowerCase());
    if (m && m.phone) {
      setPersonPhone(m.phone);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setErrorMsg('Ukuran file foto maksimal 3MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setReceiptImage(event.target.result as string);
        setErrorMsg('');
      }
    };
    reader.readAsDataURL(file);
  };

  const addQuickAmount = (val: number) => {
    setAmountStr(String(currentAmountNum + val));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (currentAmountNum <= 0) {
      setErrorMsg('Nominal uang harus lebih dari Rp 0');
      return;
    }

    if (!personName.trim()) {
      setErrorMsg('Nama orang yang membayar atau menerima uang kas wajib diisi');
      return;
    }

    if (!description.trim()) {
      setErrorMsg('Keterangan kas masuk/keluar wajib diisi');
      return;
    }

    const payload = {
      type,
      amount: currentAmountNum,
      date,
      time,
      personName: personName.trim(),
      personPhone: personPhone.trim() || undefined,
      description: description.trim(),
      notes: notes.trim() || undefined,
      receiptImage: receiptImage || undefined,
    };

    if (editingTransaction && editingTransaction.id) {
      updateTransaction(editingTransaction.id, payload);
      onClose();
    } else {
      const createdTx = addTransaction(payload);
      onClose();
      if (onSuccessCreated) {
        onSuccessCreated(createdTx);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden transition-all">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                type === 'income'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600'
              }`}
            >
              {type === 'income' ? (
                <ArrowDownLeft className="w-4 h-4" />
              ) : (
                <ArrowUpRight className="w-4 h-4" />
              )}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {editingTransaction
                  ? `Edit Catatan Kas (${editingTransaction.receiptNumber})`
                  : type === 'income'
                  ? 'Pemasukan Kas (Kas Masuk)'
                  : 'Pengeluaran Kas (Kas Keluar)'}
              </h2>
              <p className="text-[11px] text-slate-500">
                {editingTransaction
                  ? 'Perbaiki salah ketik (typo) nama, nominal, atau keterangan transaksi'
                  : type === 'income'
                  ? 'Penerimaan iuran, sumbangan, atau uang kas pemuda'
                  : 'Pencatatan belanja, konsumsi, atau pengeluaran kas'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs font-medium text-rose-700 bg-rose-50 dark:bg-rose-950/40 rounded-lg border border-rose-200">
              {errorMsg}
            </div>
          )}

          {!editingTransaction && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setType('income');
                  if (!description) setDescription('Iuran kas pemuda');
                }}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-md transition-all ${
                  type === 'income'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>Kas Masuk</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('expense');
                  if (description === 'Iuran kas pemuda') setDescription('');
                }}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-md transition-all ${
                  type === 'expense'
                    ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Kas Keluar</span>
              </button>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Nominal Uang (Rp) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                required
                value={amountStr ? Number(amountStr).toLocaleString('id-ID') : ''}
                onChange={(e) => setAmountStr(String(parseNumberInput(e.target.value)))}
                placeholder="0"
                className="w-full pl-11 pr-4 py-2.5 text-lg font-bold font-mono text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {[5000, 10000, 15000, 20000, 50000, 100000].map((quick) => (
                <button
                  key={quick}
                  type="button"
                  onClick={() => addQuickAmount(quick)}
                  className="px-2 py-1 text-[11px] font-mono font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded transition-colors"
                >
                  +{quick >= 1000 ? `${quick / 1000}rb` : quick}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {type === 'income' ? 'Nama Orang Yang Bayar *' : 'Nama Penerima / Pembeli *'}
                </span>
              </label>
              <input
                type="text"
                required
                list="members-datalist"
                value={personName}
                onChange={(e) => handleSelectMember(e.target.value)}
                placeholder="Ketik atau pilih nama..."
                className="w-full px-3 py-2 text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <datalist id="members-datalist">
                {members.map((m) => (
                  <option key={m.id} value={m.name} />
                ))}
              </datalist>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>No. WhatsApp (Untuk Struk WA)</span>
              </label>
              <input
                type="tel"
                value={personPhone}
                onChange={(e) => setPersonPhone(e.target.value)}
                placeholder="081234567xxx"
                className="w-full px-3 py-2 text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Keterangan Kas Masuk / Keluar *</span>
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                type === 'income'
                  ? 'Contoh: Iuran kas bulan Oktober 2026, Sumbangan warga...'
                  : 'Contoh: Beli cat lapangan bola, Snack rapat pemuda, Bola futsal...'
              }
              className="w-full px-3 py-2 text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Tanggal</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Waktu</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Catatan Tambahan (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan tambahan di struk..."
              className="w-full px-3 py-2 text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Camera className="w-3.5 h-3.5 text-slate-400" />
              <span>Upload Foto Bukti Struk / Nota (Opsional)</span>
            </label>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors">
                <Camera className="w-3.5 h-3.5" />
                <span>{receiptImage ? 'Ganti Foto Bukti' : 'Pilih Foto / Nota'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              {receiptImage && (
                <button
                  type="button"
                  onClick={() => setReceiptImage('')}
                  className="p-2 text-rose-500 hover:text-rose-700 rounded-lg"
                  title="Hapus foto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-xs font-semibold text-white rounded-lg shadow-xs transition-colors ${
                type === 'income'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {editingTransaction
                ? 'Simpan Perubahan Typo'
                : type === 'income'
                ? 'Simpan Kas Masuk'
                : 'Simpan Kas Keluar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};