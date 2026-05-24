import gsap from 'gsap';

export const animateWebStory3 = (scope) => {
  gsap.from('.animated-text', {
    scale: 0.8,
    opacity: 0,
    duration: 1,
    ease: 'back.out(1.7)'
  });
};