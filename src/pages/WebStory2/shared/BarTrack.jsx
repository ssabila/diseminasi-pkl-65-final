
/**
 * SATU KOMPONEN BAR UNTUK SELURUH WEB STORY 2.
 *
 * Dua mode yang TIDAK BOLEH tertukar — inilah sumber keluhan "bar nya belum
 * bener":
 *
 *   mode="share"  width = n / denominator × 100
 *                 Hanya bila semua bar dalam satu grup adalah bagian dari satu
 *                 keseluruhan yang dinamai (severity per sektor, sebaran
 *                 provinsi, status bangunan). Label boleh memakai "%", dan
 *                 caption WAJIB menyebut denominatornya.
 *
 *   mode="rank"   width = n / max × 100
 *                 Hanya untuk daftar peringkat nilai yang berdiri sendiri
 *                 (keluhan kesehatan, status hunian, perbandingan provinsi).
 *                 Label HARUS nilai absolut. DILARANG mencetak persen hasil
 *                 normalisasi — itu yang dulu membuat Aceh terbaca "100,0%".
 *
 * Kontrak: `value` SELALU 0–100. Pemanggil yang menormalkan.
 */

const TONE_NAVY = {
  accent: 'var(--ws2-sev-4)',
  'accent-2': 'var(--ws2-sev-3)',
  'accent-3': 'var(--ws2-sev-2)',
  neutral: 'var(--ws2-sev-1)',
  positive: 'var(--ws2-green)',
  cream: 'var(--ws2-text-1)',
};

const TONE_CREAM = {
  accent: 'var(--ws2-sevc-4)',
  'accent-2': 'var(--ws2-sevc-3)',
  'accent-3': 'var(--ws2-sevc-2)',
  neutral: 'var(--ws2-sevc-1)',
  positive: 'var(--ws2-green)',
  ink: 'var(--ws2-ink-1)',
};

const fill = (tone, surface) => {
  const table = surface === 'cream' ? TONE_CREAM : TONE_NAVY;
  return table[tone] || table.accent;
};

const needsOutline = (tone) => tone === 'neutral';

export default function BarTrack({
  value = 0,
  segments = null,
  surface = 'navy',
  tone = 'accent',
  visible = true,
  delay = 0,
  height = null,
  color = null,
}) {
  const stacked = Array.isArray(segments) && segments.length > 0;
  const h = height ?? (stacked ? 10 : 4);
  const track = surface === 'cream' ? 'var(--ws2-track-c)' : 'var(--ws2-track)';
  const outline = surface === 'cream' ? 'var(--ws2-sevc-1-line)' : 'var(--ws2-sev-1-line)';

  const base = {
    width: '100%',
    height: h,
    borderRadius: 'var(--ws2-r-xs)',
    background: track,
    overflow: 'hidden',
    display: 'flex',
  };

  // Segmen bernilai > 0 diberi minWidth agar sliver kecil tetap terlihat,
  // tanpa memalsukan proporsinya.
  const grow = (pct) => ({
    width: visible ? `${Math.max(0, Math.min(100, pct))}%` : '0%',
    minWidth: visible && pct > 0 ? 2 : 0,
    height: '100%',
    transition: `width 1.2s var(--ws2-bar-ease) ${delay}s`,
  });

  if (stacked) {
    return (
      <div style={base}>
        {segments.map((seg, i) => (
          <div
            key={seg.key ?? seg.tone ?? i}
            style={{
              ...grow(seg.pct),
              background: seg.color || fill(seg.tone, surface),
              boxShadow: needsOutline(seg.tone) ? `inset 0 0 0 1px ${outline}` : 'none',
              transitionDelay: `${delay + i * 0.1}s`,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div style={base}>
      <div
        style={{
          ...grow(value),
          background: color || fill(tone, surface),
          boxShadow: needsOutline(tone) ? `inset 0 0 0 1px ${outline}` : 'none',
        }}
      />
    </div>
  );
}
