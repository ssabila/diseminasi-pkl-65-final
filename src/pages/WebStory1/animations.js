import gsap from 'gsap';

export const animateWebStory1 = (scope) => {
  gsap.from('.animated-text', {
    y: 50,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
  });
};

export const animateView5 = (containerRef) => {
  gsap.fromTo('.ws1-husna-bento-tile', 
    { 
      y: 50, 
      opacity: 0 
    }, 
    {
      y: 0, 
      opacity: 1,
      duration: 1,
      stagger: 0.2,
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 80%",
        toggleActions: "play none none reverse",
      }
    } 
  );
};
