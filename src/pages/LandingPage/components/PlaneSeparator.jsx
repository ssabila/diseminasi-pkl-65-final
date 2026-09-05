import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import gsap from "../../../utils/gsapConfig";

export default function PlaneSeparator() {
    const containerRef = useRef(null);
    const con = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / (container.clientHeight * 1.2),
            0.1,
            1000
        );
        camera.position.set(0, 100, 50);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 2);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        let model = null;
        const mm = gsap.matchMedia()

        const ctx = gsap.context(() => {
            const loader = new GLTFLoader();
            loader.load(
                "/c-400/scene.gltf",
                (gltf) => {
                    model = gltf.scene;
                    model.rotation.y = Math.PI * 1.3;
                    model.rotation.z = Math.PI / 3;
                    model.rotation.x = Math.PI / 4;
                    model.position.y = -50
                    model.position.x = 90
                    model.position.z = 20

                    scene.add(model);
                    mm.add({
                        isMobile: "(max-width: 768px)",
                        isDesktop: "(min-width: 769px)",
                    }, (context) => {
                        let { isMobile } = context.conditions;

                        gsap.timeline({
                            scrollTrigger: {
                                trigger: '.plane-transition-trigger',
                                start: 'top+2vh 90%',
                                end: '+=150%',
                                scrub: 2,
                            },
                        })
                            .to('#portal', { autoAlpha: 0 }, 0)
                            .to(camera.position, {
                                y: 20, x: 0, z: 0,
                                duration: 100,
                            }, 0)
                            .to(model.rotation, {
                                z: Math.PI,
                                duration: 100,
                            }, 0)
                            .to(model.position, {
                                x: -70,
                                y: 60,
                                z: -10,
                                duration: 100,
                            }, 0)
                            .to(['.quote-section-trigger','.bg-quotes-title','quotes-display'],{autoAlpha:0,duration:20},10)
                            .fromTo(['.cloudTransition1', '.cloudTransition2'], {
                                opacity: 0,
                            }, {
                                opacity: 1,
                                duration: isMobile ? 10 : 40,
                            }, 10)
                            .to('#portal', { autoAlpha: 1, duration: 20, ease: 'none' })
                            .to(['.cloudTransition1', '.cloudTransition2'], {
                                opacity: 0,
                                duration: isMobile ? 10 : 40
                            }, isMobile ? 50 : 90)
                    });

                },
                undefined,
                (error) => console.error("Error loading model:", error)
            );
        }, container);

        let animationFrameId;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            if (!container) return;
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        };
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            ctx.revert();
            cancelAnimationFrame(animationFrameId);
            if (container) container.innerHTML = "";
            renderer.dispose();
        };
    }, []);

    return (
        <div
            ref={con}
            className="fixed inset-0 w-screen h-screen z-40 pointer-events-none flex items-center justify-center"
        >

            <div
                ref={containerRef}
                className="sticky top-0 w-full h-[200vh] flex items-center justify-center z-40"
            >
            </div>
            <div className="absolute top-0 left-0 w-screen h-full z-50">
                <div className="sticky top-0 left-0 w-screen h-screen flex items-center justify-center">
                    <img className='cloudTransition1 opacity-0 scale-205 w-full h-full absolute top-0 left-0' src='assets/cloud1.png'></img>
                    <img className='cloudTransition2 opacity-0 scale-205 w-full h-full absolute top-0 left-0' src='assets/cloud2.png'></img>
                    <div className='bg-cloud-plane-transition opacity-0 scale-205 w-full h-full absolute top-0 left-0'></div>
                </div>
            </div>
        </div>
    );
}