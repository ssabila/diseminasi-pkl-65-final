import gsap from 'gsap';

/**
 * Animasi spesifik untuk isi Section 2
 * @param {HTMLElement} container - elemen root dari section 2
 */
export function animateUrgency(container) {
  // Hanya menganimasikan elemen-elemen di dalam Section 2
  gsap.fromTo(
    container.querySelector('.urgency-title'),
    { opacity: 0, y: 50 },
    {
      opacity: 1,
      y: 0,
      scrollTrigger: {
        trigger: container,
        start: 'top 60%', // Muncul saat section 2 mencapai 60% dari layar
        end: 'top 30%',
        scrub: true
      }
    }
  );

  // Animasi untuk stack gambar bertumpuk (muncul berurutan)
  gsap.fromTo(
    container.querySelectorAll('.stack-layer'),
    { opacity: 0, y: -150 }, // Mulai dari tempat yang lebih tinggi agar efek jatuhnya lebih terasa
    {
      opacity: 1,
      y: 0,
      stagger: 0.15, // Jeda stagger diperkecil agar animasinya lebih overlap dan mulus
      scrollTrigger: {
        trigger: container,
        start: 'top 60%', 
        end: 'top 10%', 
        scrub: 1 // Scrub = animasi mengikuti kecepatan scroll
      }
    }
  );
}
