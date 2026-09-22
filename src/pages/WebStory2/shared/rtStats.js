import insights from '../insight.json';

/**
 * SUMBER DENOMINATOR TUNGGAL UNTUK SELURUH ANGKA RUMAH TANGGA.
 *
 * insight.json._metadata.catatan: "Semua persentase dihitung dari total baris
 * per tabel masing-masing." Untuk tabel rumah_tangga, total barisnya 115.462
 * RT TERDAFTAR — padahal yang benar-benar ditemukan dan diwawancarai hanya
 * 50.887 (44,07%). Sisanya pindah, tidak terdampak, atau mengungsi.
 *
 * Akibatnya field `pct` bawaan JSON tidak pernah berjumlah 100% untuk satu
 * distribusi, dan sebelumnya dipakai dengan dua cara yang saling bertentangan:
 * `100 - pct` (menggelembungkan angka: "Listrik Padam 56,6%") dan penjumlahan
 * langsung (mengecilkan: "Sanitasi Lumpuh 8,4%").
 *
 * Aturan: untuk rumah_tangga.* JANGAN pakai field `pct` JSON — pakai pctRT().
 * Pengecualian: rumah_tangga.bantuan_diterima (multi-response, denominatornya
 * tabel bantuan sendiri) dan seluruh anggota_keluarga.* (denominator jiwa).
 */

const rt = insights.rumah_tangga;

export const N_RT_TERDAFTAR = insights.ringkasan_dataset.total_rt_keluarga; // 115.462
export const N_RT_SURVEI = rt.hasil_cek['1. Ditemukan dan tinggal di sini'].n; // 50.887

export const pctRT = (n) => (N_RT_SURVEI > 0 ? (n / N_RT_SURVEI) * 100 : 0);

/** Format Indonesia: 10.3 -> "10,3" */
export const fmtPct = (v, digits = 1) => v.toFixed(digits).replace('.', ',');
export const fmtN = (n) => n.toLocaleString('id-ID');

/**
 * Menjumlahkan n berdasarkan PREFIX nomor kunci, bukan kunci lengkap.
 * Wajib: beberapa kunci membawa sufiks HTML dari kuesioner, misalnya
 * '4. Bangunan rusak dan tidak dapat diperbaiki<b> --> Lanjut ke Rincian 10</b>'.
 * Kode lama mencocokkan string penuh yang ditebak dan diam-diam menghasilkan 0.
 */
export function sumN(obj, prefixes) {
  if (!obj) return 0;
  return Object.entries(obj).reduce((total, [key, val]) => {
    const hit = prefixes.some((p) => key.trim().startsWith(p));
    return hit ? total + (val?.n ?? 0) : total;
  }, 0);
}

/* ── Kondisi bangunan ─────────────────────────────────────────────────── */
const kb = rt.kondisi_bangunan;
export const BANGUNAN_MASIH = sumN(kb, ['1.', '2.']);            // 31.314 → 61,5%
export const BANGUNAN_PERLU_PERBAIKAN = sumN(kb, ['3.']);        // 16.774 → 33,0%
export const BANGUNAN_HILANG_TOTAL = sumN(kb, ['4.', '5.']);     //  2.799 →  5,5%

/* ── Layanan dasar ────────────────────────────────────────────────────── */
const listrik = rt.sumber_listrik;
export const LISTRIK_NON_PLN = sumN(listrik, ['2.', '3.']);      //    732 →  1,4%
export const LISTRIK_NON_PLN_BERLISTRIK = sumN(listrik, ['2.']); //    358
export const LISTRIK_TIDAK_ADA = sumN(listrik, ['3.']);          //    374

const air = rt.sumber_air;
// Tak layak = sumur tak terlindung, mata air tak terlindung, air permukaan,
// air hujan. '11. Lainnya' sengaja tidak dihitung karena tidak terdefinisi.
export const AIR_TAK_LAYAK = sumN(air, ['06.', '08.', '09.', '10.']); // 5.248 → 10,3%
export const AIR_MATA_AIR_TAK_TERLINDUNG = sumN(air, ['08.']);        // 2.496
export const AIR_PERMUKAAN = sumN(air, ['09.']);                      // 1.506

const mck = rt.fasilitas_mck;
export const MCK_TIDAK_ADA = sumN(mck, ['5.']);                  // 5.724 → 11,2%
export const MCK_UMUM_KOMUNAL = sumN(mck, ['3.', '4.']);         // 3.927 →  7,7%
// Label harus berbunyi "Bergantung MCK Umum/Komunal atau Tidak Ada" — kunci 2
// ("digunakan bersama beberapa rumah", 2.945) juga bukan MCK sendiri, jadi
// angka ini TIDAK boleh disebut "Tanpa MCK Sendiri".
export const MCK_TANPA_AKSES_SENDIRI = MCK_TIDAK_ADA + MCK_UMUM_KOMUNAL; // 9.651 → 19,0%

/** Wajib muncul sekali di bawah tiap grup angka rumah tangga. */
export const CAPTION_RT = `dari ${fmtN(N_RT_SURVEI)} rumah tangga yang ditemukan `
  + `dan diwawancarai — ${fmtPct((N_RT_SURVEI / N_RT_TERDAFTAR) * 100)}% `
  + `dari ${fmtN(N_RT_TERDAFTAR)} RT terdaftar`;

export const CAPTION_RANK = 'Panjang bar relatif terhadap nilai tertinggi';
