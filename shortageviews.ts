import React, { useState, useMemo } from 'react';
import { useCashBook } from '../../context/CashBookContext';
import { KasShortage } from '../../types';
import {
  formatRupiah,
  formatDate,
  generateShortageWhatsAppLink,
} from '../../utils/formatters';
import {
  Search,
  Plus,
  Send,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Trash2,
  Calendar,
  Phone,
  User,
} from 'lucide-react';

interface ShortagesViewProps {
  onOpenNewShortage: () => void;
  onOpenPayModal: (shortage: KasShortage) => void;
}

export const ShortagesView: React.FC<ShortagesViewProps> = ({
  onOpenNewShortage,
  onOpenPayModal,
}) => {
  const { shortages, deleteShortage, profile } = useCashBook();

  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid' | 'paid'>('unpaid');
  const [shortageToDelete, setShortageToDelete] = useState<KasShortage | null>(null);

  const filteredShortages = useMemo(() => {
    return shortages.filter((s) => {
      if (statusFilter === 'unpaid' && s.status === 'paid') return false;
      if (statusFilter === 'paid' && s.status !== 'paid') return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const nameMatch = s.personName.toLowerCase().includes(q);
        const periodMatch = s.period.toLowerCase().includes(q);
        const phoneMatch = s.personPhone.includes(q);
        if (!nameMatch && !periodMatch && !phoneMatch) return false;
      }
      return true;
    });
  }, [shortages, statusFilter, search]);

  const unpaidTotal = useMemo(
    () => shortages.filter((s) => s.status !== 'paid').reduce((sum, s) => sum + s.remainingAmount, 0),
    [shortages]
  );

  const paidTotal = useMemo(
    () => shortages.reduce((sum, s) => sum + s.paidAmount, 0),
    [shortages]
  );

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              Pengawasan Iuran
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-xs text-slate-500">{profile.organizationName}</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Catatan Kekurangan Kas Seseorang
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Daftar anggota yang belum membayar atau masih memiliki kekurangan iuran kas.
          </p>
        </div>

        <button
          onClick={onOpenNewShortage}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Catat Kekurangan Kas</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 block">Total Kekurangan Kas Belum Lunas</span>
          <span className="text-xl font-bold font-mono tracking-tight text-amber-600 dark:text-amber-400 block mt-1">
            {formatRupiah(unpaidTotal)}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">
            Uang kas yang masih tertahan
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 block">Sudah Dilunasi / Disetor</span>
          <span className="text-xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400 block mt-1">
            {formatRupiah(paidTotal)}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">
            Pelunasan yang sudah masuk kas
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 block">Orang yang Masih Kurang Kas</span>
          <span className="text-xl font-bold font-mono tracking-tight text-slate-900 dark:text-white block mt-1">
            {shortages.filter((s) => s.status !== 'paid').length} Orang
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">
            Dapat diingatkan via WhatsApp
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama anggota / orang yang kurang kas..."
            className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('unpaid')}
            className={`flex-1 sm:flex-none px-3 py-1 rounded-md font-medium transition-colors ${
              statusFilter === 'unpaid'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Belum Lunas ({shortages.filter((s) => s.status !== 'paid').length})
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`flex-1 sm:flex-none px-3 py-1 rounded-md font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Semua Catatan
          </button>
          <button
            onClick={() => setStatusFilter('paid')}
            className={`flex-1 sm:flex-none px-3 py-1 rounded-md font-medium transition-colors ${
              statusFilter === 'paid'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Sudah Lunas ({shortages.filter((s) => s.status === 'paid').length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredShortages.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            {shortages.length === 0 ? (
              <div className="space-y-3">
                <AlertCircle className="w-8 h-8 text-amber-500/50 mx-auto" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  Tidak ada catatan kekurangan kas
                </p>
                <p className="text-slate-500 max-w-sm mx-auto">
                  Semua iuran kas pemuda RT 04 lunas, atau Anda dapat mencatat anggota yang belum membayar kas.
                </p>
                <button
                  onClick={onOpenNewShortage}
                  className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Catat Kekurangan Kas Pertama</span>
                </button>
              </div>
            ) : (
              'Tidak ada data kekurangan kas yang sesuai kriteria.'
            )}
          </div>
        ) : (
          filteredShortages.map((s) => {
            const isPaid = s.status === 'paid';
            const waLink = generateShortageWhatsAppLink(
              s,
              profile.organizationName,
              profile.treasurerName
            );

            return (
              <div
                key={s.id}
                className={`bg-white dark:bg-slate-900 rounded-xl p-4 border shadow-xs flex flex-col justify-between transition-colors ${
                  isPaid
                    ? 'border-slate-200 dark:border-slate-800 opacity-80'
                    : 'border-amber-200/80 dark:border-amber-900/50'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {s.personName}
                      </h3>
                      {s.personPhone && (
                        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {s.personPhone}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {isPaid ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Lunas
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                          {s.paidAmount > 0 ? 'Kurang Sebagian' : 'Belum Bayar'}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => setShortageToDelete(s)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Hapus Catatan Ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Keperluan / Periode:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {s.period}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Target Wajib Kas:</span>
                      <span className="font-mono">{formatRupiah(s.targetAmount)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Sudah Disetor:</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400">
                        {formatRupiah(s.paidAmount)}
                      </span>
                    </div>

                    <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700 font-bold">
                      <span className="text-slate-800 dark:text-slate-200">Sisa Kekurangan:</span>
                      <span
                        className={`font-mono ${
                          isPaid
                            ? 'text-emerald-600'
                            : 'text-amber-600 dark:text-amber-400 text-sm'
                        }`}
                      >
                        {formatRupiah(s.remainingAmount)}
                      </span>
                    </div>
                  </div>

                  {s.dueDate && !isPaid && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Batas pelunasan: {formatDate(s.dueDate)}</span>
                    </div>
                  )}

                  {s.notes && (
                    <p className="text-[11px] text-slate-400 mt-1 italic">
                      &ldquo;{s.notes}&rdquo;
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  {!isPaid ? (
                    <>
                      <button
                        onClick={() => onOpenPayModal(s)}
                        className="flex-1 py-1.5 px-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Bayar / Lunasi</span>
                      </button>

                      {s.personPhone && (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-1.5 px-2.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-lg transition-colors flex items-center gap-1"
                          title="Kirim Pesan WhatsApp Pengingat"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Ingatkan</span>
                        </a>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Kas sudah lunas
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {shortageToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Hapus Catatan Kekurangan Kas?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Apakah Anda yakin ingin menghapus catatan kekurangan iuran atas nama &ldquo;<strong className="text-slate-900 dark:text-white">{shortageToDelete.personName}</strong>&rdquo; ({shortageToDelete.period})?
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShortageToDelete(null)}
                className="px-3.5 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteShortage(shortageToDelete.id);
                  setShortageToDelete(null);
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};