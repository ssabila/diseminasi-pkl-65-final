import patternNavyToCream from '../../../assets/Grand Design/Pattern.png';
import patternCreamToNavy from '../../../assets/Grand Design/Pattern_2.png';

/**
 * JAHITAN PERGANTIAN WARNA LATAR.
 *
 * Web Story 2 berselang-seling navy <-> krem (permintaan notula). Sebelumnya
 * tiap batas dikerjakan sendiri-sendiri: gradient di dalam section, atau
 * <SectionDivider from to> yang nilainya tidak pernah cocok dengan warna
 * section di atas/bawahnya — salah satunya bahkan memudar navy -> krem lalu
 * disusul section navy lagi. Itulah "transisi patah".
 *
 * Sekarang: container di WebStory2.jsx adalah SATU-SATUNYA pemilik warna
 * latar, dan komponen ini hanya menandai DI MANA pergantian terjadi lewat
 * atribut data-seam. WebStory2.jsx memindai semua [data-seam] dan membuat
 * tween warna yang terkunci ke posisi scroll. Komponen ini sendiri tidak
 * pernah membuat ScrollTrigger.
 *
 * from === to  -> penanda bab saja: tidak ada tween, tinggi lebih pendek.
 */

export default function BgSeam({ from = 'navy', to = 'cream', pattern = 'auto' }) {
  const isMarker = from === to;

  // Pattern.png bernada oranye (terbaca di atas krem), Pattern_2.png bernada
  // krem pucat (terbaca di atas navy). Dipilih menurut warna TUJUAN, karena
  // strip duduk di tepi bawah seam — saat ia terlihat, wash warna sudah selesai.
  const src = to === 'cream' ? patternNavyToCream : patternCreamToNavy;
  const showPattern = pattern !== false;

  return (
    <div
      aria-hidden="true"
      data-seam={`${from}>${to}`}
      style={{
        position: 'relative',
        width: '100%',
        height: isMarker ? 96 : 'clamp(180px, 26vh, 280px)',
        background: 'transparent',
        display: 'flex',
        alignItems: 'flex-end',
        pointerEvents: 'none',
      }}
    >
      {showPattern && (
        <div
          style={{
            width: '100%',
            height: 40,
            backgroundImage: `url(${src})`,
            backgroundRepeat: 'repeat-x',
            backgroundSize: 'auto 100%',
            opacity: 0.55,
          }}
        />
      )}
    </div>
  );
}
