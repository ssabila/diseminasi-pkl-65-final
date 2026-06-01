/**
 * animations.js — WebStory2 GSAP Utilities
 * Fungsi animasi umum yang dapat dipanggil dari luar komponen.
 * Saat ini WebStory2.jsx mengelola animasi sendiri via useGSAP + ScrollTrigger.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const animateWebStory2 = (scope) => {
  // Animasi ini sekarang dikelola langsung di WebStory2.jsx
  // File ini tetap dipertahankan sebagai utilitas untuk animasi tambahan.
};