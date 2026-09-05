import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins here so they are available globally
gsap.registerPlugin(ScrollTrigger,ScrollToPlugin);

export default gsap;