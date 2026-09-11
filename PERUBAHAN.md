# Perubahan Web Story 2 — Revisi Desain

Semua perubahan ada di `src/pages/WebStory2/` dan `src/index.css`.
Babak lain (Web Story 1 & 3) tidak diubah, kecuali dua efek samping global
yang memang harus dibereskan (lihat bagian "Dampak ke story lain").

## Cara menjalankan

```bash
npm install
npm run dev
```

Buka `http://localhost:5173/web-story-2`.

> **Peta perlu token Mapbox.** File `.env` sengaja TIDAK disertakan di zip ini
> karena berisi kredensial. Buat sendiri di root proyek:
>
> ```
> VITE_MAPBOX_TOKEN=<token dari "Guidelines Web Story 2 Hasil Pendataan.docx">
> ```
>
> Tanpa itu, peta di Babak 1 tidak tampil dan Web Story 3 akan crash.
> Peta Babak 2 & 3 memakai OpenStreetMap, jadi tetap jalan.

---

## Yang berubah, per keluhan

### Peta & titik lokasi
- **Titik terlalu kecil** — radius titik Mapbox dulu nilai tetap (r=5) yang tidak
  menskala dengan zoom, jadi hilang di zoom rendah. Sekarang pakai ekspresi
  interpolasi per-zoom. Dot globe 14 → **22px**, pin desa 16 → **20px**, marker
  Babak 2 14/22 → **18/24px**. Semua oranye palet + glow, tidak ada lagi halo
  merah `rgba(255,42,42)` di atas isi oranye.
- **"Jangan zoom in terus zoom out"** — step kamera Babak 3 dulu berpola
  6,5 → 12 → 6,5 → 12 → 6,5 → 12. Zoom sekarang dikunci di 9,5, dan step
  "bridge" tidak lagi menarik kamera mundur melainkan menjadi momen gesernya.
  `flyTo` diganti `panTo` (Leaflet `flyTo` selalu melengkung walau zoom sama).
- **Poligon highlight** ditambahkan di peta Babak 2 (permintaan notula).
  Kepekatan isian mengikuti jumlah desa terdampak.

### Transisi
- **Peta → foto patah** — dulu dua ScrollTrigger terpisah, dan petanya mulai
  memudar saat masih di fase Sumbar. Sekarang foto jadi lapisan di dalam sticky
  yang sama, digerakkan satu timeline.
- **Biru ↔ krem** — container `.ws2` jadi satu-satunya pemilik warna latar.
  `<BgSeam>` menandai titik pergantian; warnanya dihitung dari posisi scroll.
- **`SectionDivider` dihapus.** Salah satu pemanggilannya memudar navy → krem
  padahal section berikutnya navy — itu "patah" yang paling keras.
- **Lenis** dipasang di WS2 (sebelumnya hanya WS3).

### Bar chart & data — ini yang paling banyak berubah
Beberapa angka yang tampil di halaman sebelumnya **salah**:

| Tempat | Sebelum | Sesudah |
|---|---|---|
| Krisis Layanan Dasar | 56,6% / 62,3% / 8,4% | **1,4% / 10,3% / 19,0%** |
| Kondisi bangunan | segmen ke-3 selalu 0 | **61,5 / 33,0 / 5,5%**, total 50.887 |
| Krisis Air Bersih | `0,0%` | **10,3%** (5.248 RT) |
| Tanpa Listrik | `0,00%` | **1,4%** (732 RT) |
| Indeks Prioritas | Aceh terpaku `100,0%` | **41,7 / 35,2 / 23,1%** |
| Kartu sektor | 3 kartu, 1.442 unit | **4 kartu, 2.548 unit** |

Penyebabnya:
- `pct` di `insight.json` dihitung dari **115.462 RT terdaftar**, padahal yang
  benar-benar diwawancarai **50.887** (44,07%). Semua angka rumah tangga kini
  lewat `shared/rtStats.js` dengan denominator yang sama.
- Dua kunci JSON yang dibaca tidak ada: `sumber_air_minum` dan
  `sumber_penerangan_utama` (yang benar `sumber_air` dan `sumber_listrik`).
- Kategori `Sosial/Ibadah` (1.106 unit, kelompok TERBESAR) dijatuhkan dari
  kartu sektor padahal ikut dihitung counter di atasnya.
- Donut "bantuan diterima" tidak sah secara statistik — itu pertanyaan
  multi-jawab, jadi menjumlahkannya menghitung ganda. Diganti daftar bar.

Semua bar sekarang lewat `shared/BarTrack.jsx` dengan dua mode yang tidak boleh
tertukar: `share` (porsi dari keseluruhan) dan `rank` (relatif nilai tertinggi).

### Warna
Dulu ada ~60 hex berbeda. Sekarang **hanya lima warna palet** yang tersisa di
seluruh JSX Babak 1–4. Token ada di `ws2-tokens.css` (scope `.ws2`, bukan
`:root`).

Yang dibongkar: `infrastruktur.jsx` dulu menyuntik blok `:root` KEDUA ke
`document.head` yang menimpa `--navy` dan `--gold` untuk seluruh aplikasi.
Di dalamnya `--gold === --rust` dan `--slate === --sage` — empat token semantik
runtuh jadi dua hex, sehingga setiap legend bar bertumpuk menampilkan warna
yang salah.

### Layout
- **Split kiri-kanan Babak 2 Scene 1** — `.infra-grid-photo-chart` dulu `1fr`
  di dasar DAN `1fr` lagi di media query, tanpa aturan dua kolom di mana pun.
  Jadi split-nya **tidak pernah terjadi**. Sekarang 551px foto / 718px data.
- **Maskot** dipindah ke kolomnya sendiri (dulu sengaja terpotong
  `overflow:hidden` di dalam kartu — itulah "nyempil").
- **"Cakupan Wilayah Terdampak"** — peta full-bleed, indeks keparahan melayang
  di atas peta, tiga kartu provinsi duduk penuh di bawah peta.
- **"Rumah yang Masih Berdiri"** — foto memenuhi setengah kanan sampai tepi
  layar, teks menumpang di atasnya dengan tiga lapis perlakuan supaya tetap
  terbaca (foto diredupkan, scrim gradien, pelat kaca di belakang teks).

### Kartu, kaca, ikon
- Satu bahasa kartu: `.ws2-card` (+ varian krem/overlay/clickable).
- **Glassmorphism "Krisis Layanan Dasar" dibuang** — `blur(16px)` di sana duduk
  di atas gradient polos tanpa apa pun di belakangnya, jadi efeknya nol.
  Kaca sekarang hanya dipakai kalau memang ada peta/foto hidup di belakangnya.
- Pustaka **17 ikon SVG yang tidak pernah dipakai** dihapus. Kartu yang
  menampilkan huruf "H/F/P/R" sebagai pengganti ikon juga dihapus.

### Babak 4
- Card "Kebutuhan Mendesak" → **bubble chart**. Komponennya sudah ada di file
  tapi tidak pernah dirender, dan melanggar rules-of-hooks (`useEffect` setelah
  early return) sehingga akan crash begitu diaktifkan. Ditulis ulang tanpa
  dependensi baru; radius sebanding **akar kuadrat** nilai supaya LUAS-nya yang
  proporsional.
- `SceneAjakan` dan `SceneZonaPrioritas` dihidupkan kembali.
- Path aset `url('/src/assets/images/...')` diperbaiki — itu path dev-server
  yang 404 setelah build.

### Lain-lain
- Progress bar dipindah ke tepi bawah layar.
- Efek bintang di "Skala Besar Dampak Nyata", latar krem bertitik di galeri
  huntara, efek fajar di scene penutup.
- Impor `Administrasi_Provinsi.json` (22,7 MB) dilepas — diganti
  `sumatera_provinsi.json` (64 KB) lewat `shared/sumateraGeo.js`.

---

## Dampak ke story lain

Dua perbaikan menyentuh yang global, jadi **tolong ikut cek WS1 dan WS3**:

1. Blok `:root` ganda dihapus → `--navy` global kembali `#15173d`
   (sebelumnya tertimpa jadi `#12143A` selama Babak 2 ter-mount).
2. `ScrollTrigger.defaults({ scrub: 0.8 })` dihapus dari `kebutuhan.jsx`.
   Itu efek samping global yang diam-diam men-scrub setiap trigger di seluruh
   aplikasi. Beberapa trigger di WS1 mungkin bergantung padanya tanpa disadari.

Saat dicek terakhir, keduanya normal.

---

## Berkas baru

```
src/pages/WebStory2/
  ws2-tokens.css        token warna, radius, easing (scope .ws2)
  ws2-tokens.js         konstanta hex untuk Mapbox/Leaflet (tidak menerima var())
  shared/
    useInView.js        satu implementasi (dulu ada 3 salinan)
    sumateraGeo.js      poligon provinsi, dipakai Babak 1/2/3
    rtStats.js          denominator & agregat rumah tangga
    BarTrack.jsx        komponen bar tunggal, mode share/rank
    BgSeam.jsx          penanda pergantian warna latar
  2.Infrastruktur/
    infrastruktur.css   dulu template string yang disuntik ke document.head
```

## Catatan yang belum dikerjakan

- Narasi "terjebak dalam kegelapan tanpa listrik" jadi berlebihan setelah
  angkanya turun ke 1,4% — perlu mata redaksi.
- `pkl2_1.webp` dan `pkl3_1.webp` sebenarnya **JPEG berekstensi `.webp`**.
  Layout foto yang baru menampilkan watermark BBC/Getty lebih jelas — perlu
  keputusan lisensi.
- Galeri intro masih memuat `huntara-03/14/16.jpg` (±6 MB per file) padahal
  versi `.webp`-nya ada. Kandidat perbaikan performa.
