import gsap from 'gsap';

export const animateWebStory1 = (scope) => {
  gsap.from('.animated-text', {
    y: 50,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
  });
};