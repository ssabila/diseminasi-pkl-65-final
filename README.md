# 📖 Panduan Pengembangan Web Diseminasi PKL 65

Proyek ini adalah Single Page Application (SPA) berbasis React dan Vite yang menggunakan animasi sangat interaktif dari GSAP. Struktur direktori dirancang secara **Feature-based** (berbasis halaman) untuk mencegah konflik penamaan (terutama pada file aset gambar/video), serta mempermudah Anda saat mengelola kode GSAP yang mungkin akan sangat panjang.

---

## 🚀 Cara Menjalankan Proyek

1. Pastikan Anda berada di root direktori proyek (`diseminasi-pkl-65-final`).
2. Instal semua dependensi (jika belum):
   ```bash
   npm install
   ```
3. Jalankan development server lokal:
   ```bash
   npm run dev
   ```
4. Buka tautan `localhost` (biasanya `http://localhost:5173/`) di peramban (browser) Anda.

---

## 📂 Struktur Direktori Proyek

Folder utama tempat kita mengoding ada di dalam direktori `src/`. Konsep utamanya adalah **pemisahan halaman beserta aset dan animasinya masing-masing**.

```text
src/
├── assets/                 # Aset GLOBAL (Hanya untuk misal: Logo utama PKL, favicon, ikon universal)
├── components/             # (Jika ada) Komponen UI global (Navbar, Footer umum)
├── pages/                  # 📍 Letak Halaman (Tempat Ngoding Utama)
│   ├── LandingPage/        
│   │   ├── assets/         # Aset khusus Landing Page 
│   │   ├── LandingPage.jsx # UI (React JSX) Landing Page
│   │   └── LandingPage.css # CSS KHUSUS Landing Page
│   │
│   ├── WebStory1/          
│   │   ├── assets/         # Aset gambar Web Story 1 (background, karakter, ilustrasi scene 1)
│   │   ├── WebStory1.jsx   # UI (React JSX) Web Story 1
│   │   └── animations.js   # File KHUSUS logika animasi/Timeline GSAP Web Story 1
│   │
│   ├── WebStory2/          
│   │   ├── assets/         
│   │   ├── WebStory2.jsx
│   │   └── animations.js
│   │
│   └── WebStory3/          
│       ├── assets/         
│       ├── WebStory3.jsx
│       └── animations.js
│
├── utils/
│   └── gsapConfig.js       # Registrasi plugin GSAP secara terpusat
│
├── App.jsx                 # Pengaturan Rute (React Router) antar halaman
├── index.css               # Tema Global (Warna, Tipografi, Variabel CSS - Jangan sembarang ubah!)
└── main.jsx                # Entry point aplikasi (tidak perlu diubah-ubah)
```

---

## 🛠️ Pembagian Tempat Coding (Guidelines)

### 1. Koding UI (React / JSX) Halaman
- **Letak:** `src/pages/[NamaHalaman]/[NamaHalaman].jsx`
- **Aturan Main:** Fokus pada pembuatan layout HTML (menggunakan tag-tag semantik) dan struktur UI React. 
- **Memanggil Aset Gambar/Video:** Selalu letakkan aset foto ke dalam folder `assets/` **di dalam** folder halaman tersebut, lalu impor seperti ini:
  ```javascript
  import ilustrasiScene1 from './assets/scene1.png';
  
  // Nanti di JSX:
  <img src={ilustrasiScene1} alt="Scene 1" />
  ```

### 2. Koding Animasi (GSAP)
- **Letak:** `src/pages/[NamaHalaman]/animations.js`
- **Aturan Main:** 
  - GSAP code (Timeline, ScrollTrigger, dan pengaturan offset/parallax) pastinya memakan ratusan baris. **Jangan satukan kodingan GSAP di file `.jsx`** karena akan membuat file *React Component* sangat pusing dibaca.
  - Buatlah sebuah fungsi/function (seperti `animateWebStory1`) yang menyimpan *Timeline GSAP* di dalam `animations.js`, ekspor fungsi tersebut, lalu tarik (impor) di dalam `.jsx` menggunakan `useGSAP()`. *(Pola ini sudah dipasangkan secara otomoatis sebagai contoh di file WebStory Anda kawan!).*

### 3. Konfigurasi GSAP dan Plugin (`gsapConfig.js`)
- **Letak:** `src/utils/gsapConfig.js`
- **Fungsi:** Aplikasi ini akan sangat bergantung pada plugin seperti `ScrollTrigger` atau barangkali yang lain. Semua registrasi plugin cukup dilakukan **SATU KALI** di file ini. Anda tidak perlu memanggil *gsap.registerPlugin* lagi di setiap halaman Web Story.

### 4. Penambahan Halaman Baru (Routing)
- **Letak:** `src/App.jsx`
- **Fungsi:** File ini fokus untuk pendaftaran jalur (path URL). Jika nanti Anda membuat `WebStory4`, raut halaman tersebut harus ditaruh di sini di dalam `<Route>`.

---

## 🎨 Panduan Desain Tema Global (Warna & Font)

Variabel identitas (Warna spesifik identitas & Font spesifik identitas) sudah disediakan secara terpusat di `src/index.css`.  Gunakan variabel-variabel tersebut untuk menjaga konsistensi.

### Tema Warna (CSS Variable)
Bila Anda perlu memanggil warna biru (`#15173d`) atau warna *beige* di halaman manapun (misalnya di *LandingPage.css*), cukup panggil nama *var* berikut:
- `var(--navy)`: Background dongker/biru gelap.
- `var(--beige)`: Background krem pudar.
- `var(--green)`: Aksen warna hijau (hijau lumut stabil).
- `var(--off-white)`: Base putih abu-abu pudar.

**Contoh di CSS Biasa:**
```css
.kotak-test {
  background-color: var(--navy);
  color: var(--beige);
  border: 1px solid var(--green);
}
```

### Tipografi (Font & Ukuran Ketebalan Font / Weight)
Aplikasi ini sudah dilengkai font standar dari Google Fonts: **Playfair Display** (Untuk judul) dan **Lato** (Untuk Paragraf konten).

- **Otomatis by Default**: Tag `<h1>` hingga `<h6>` sudah otomatis berubah menjadi font Playfair. Sedangkan plain text (`<p>`, `<span>`) sudah otomatis menggunakan Lato dengan ketebalan standar 300 (Light).

Bila Anda membutuhkan varian huruf tebal atau miring di elemen tertentu sewaktu ngoding JSX, panggil saja dengan **`className`** utility di bawah ini:

**Playfair utility:**
- `.playfair-display`

**Lato utility:**
- *Tebal-Tipis Standard:* `.lato-thin`, `.lato-light`, `.lato-regular`, `.lato-bold`, `.lato-black`
- *Tebal-Tipis Italic (Miring):* `.lato-thin-italic`, `.lato-light-italic`, `.lato-regular-italic`, `.lato-bold-italic`, `.lato-black-italic`

**Contoh Saat Ngoding di React JSX:**
```jsx
// Akan otomatis menjadi Lato tebal (weight 700)
<p className="lato-bold">Diseminasi BPS PKL 65 Keren!</p>

// Akan jadi Lato sangat tipis dan miring
<span className="lato-thin-italic">St. T.A 2026</span>
```
