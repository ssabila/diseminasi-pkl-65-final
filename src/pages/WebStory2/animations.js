import gsap from 'gsap';

export const animateWebStory2 = (scope) => {
  gsap.from('.animated-text', {
    x: -50,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
  });
};