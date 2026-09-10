import { useEffect, useRef, useState } from 'react';

/**
 * Satu implementasi untuk seluruh Web Story 2.
 * Sebelumnya ada tiga salinan dengan threshold berbeda-beda (0.12 / 0.15 /
 * 0.25 / 0.3), yang membuat sebagian scene muncul jauh lebih telat dari
 * tetangganya dan terbaca sebagai transisi tersendat.
 *
 * One-shot: sekali terlihat, tetap terlihat. Reveal tidak diputar ulang
 * saat scroll balik.
 */
export default function useInView(threshold = 0.12, rootMargin = '0px 0px -10% 0px') {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return [ref, visible];
}
