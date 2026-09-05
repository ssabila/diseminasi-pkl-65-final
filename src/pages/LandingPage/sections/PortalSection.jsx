import { useLayoutEffect, useRef } from "react";
import Kicker from "../components/Kicker";
import { portalsSectionAnimation } from "../animations";
import { DestinationCard } from "../components/DestinationCard";
import plane from "../../../assets/images/plane.png";
import planeMobile from "../../../assets/images/plane-mobile.png";

export default function PortalsSection() {
    const sectionRef = useRef(null);

    useLayoutEffect(() => {
        const cleanup = portalsSectionAnimation(sectionRef.current);
        return cleanup;
    }, []);

    return (
        <section
            ref={sectionRef}
            id="portal"
            className="relative flex flex-col justify-between lg:justify-end"
        >
            <div className="plane-transition-trigger -translate-y-50 z-[999] w-full h-20">

            </div>
            <BackGround />
            <Content />
        </section>
    );
}

const BackGround = () => {
    return (
        <div className="absolute top-0 left-0 h-full w-full overflow-clip pointer-events-none z-10">
            {/* Gambar Background Plane Trail */}
            <div className='clouds absolute top-0 left-0 w-screen h-screen z-20 opacity-70 pointer-events-none rotate-0 md:rotate-0 translate-x-[50vw] md:translate-x-0'>
                <img className='cloudLoader1 absolute scale-200 translate-y-[50vh] top-0 left-0 w-full h-full' src='assets/cloud1.png'></img>
                <img className='cloudLoader2 absolute scale-200 -translate-y-[40vh] top-0 left-0 w-full h-full' src='assets/cloud2.png'></img>
            </div>
            <div
                className="plane absolute inset-0 bg-no-repeat z-20"
            >
                <img src={plane} className="hidden md:block w-full h-full" />
                <img src={planeMobile} className="block md:hidden w-full h-full" />
            </div>

            {/* Gradient Overlay 1 */}
            <div
                className="absolute inset-0 z-10"
                style={{
                    background: `linear-gradient(
                        180deg,
                        rgba(15,23,42,0.72) 0%,
                        rgba(15,23,42,0.30) 40%,
                        rgba(15,23,42,0.55) 70%,
                        rgba(15,23,42,0.92) 100%
                    )`,
                }}
            />
            {/* Gradient Overlay 2 (Vignette) */}
            <div
                className="absolute inset-0 z-10"
                style={{
                    background: `linear-gradient(90deg, rgba(15,23,42,0.50) 0%, transparent 60%)`,
                }}
            />
        </div>
    );
};
const Content = () => {
    return (
        <div className="w-full flex flex-col md:flex-col p-4 gap-3 md:p-20 z-40">
            <div
                className="z-40 pt-12 lg:pt-0"
                data-reveal
                data-from="bottom"
                data-delay="0"
            >
                <div>
                    <Kicker>Akses Dashboard Riset</Kicker>
                    <h2
                        className="italic font-[family-name:var(--font-title)] text-[clamp(28px,4vw,58px)] leading-[1.1] !text-[var(--cream)] max-w-[600px] mb-[clamp(10px,1.5vh,16px)]"
                        style={{ textShadow: "0 2px 24px rgba(0,0,0,0.5)" }}
                    >
                        Tiga Destinasi.<br />
                        <span className="not-italic text-[var(--gold)]">Satu Misi.</span>
                    </h2>
                    <p className="text-[clamp(13px,1.2vw,16px)] text-[rgba(243,234,210,0.6)] font-light max-w-[460px] leading-[1.7] m-0">
                        Pilih wilayah riset untuk menelusuri data rehabilitasi dan rekonstruksi
                        pascabencana yang dikumpulkan langsung dari lapangan.
                    </p>
                </div>
            </div>

            {/* Three destination cards (Grid 1 kolom di mobile, 3 kolom di desktop) */}
            <div
                id="riset-cards-grid"
                className="relative  h-full z-20 grid grid-cols-1 lg:grid-cols-3 items-end px-0 lg:px-[5%] pb-6 lg:pb-[clamp(48px,7vh,80px)] gap-4 lg:gap-[clamp(12px,1.5vw,20px)]"
            >
                {DESTINATION_ITEMS.map((r) => (
                    <div
                        key={r.num}
                        num={r.num}
                        id={r.id}
                        data-reveal
                        data-from="bottom"
                        data-delay={r.delay}
                        className="h-full"
                    >
                        <DestinationCard {...r} />
                    </div>
                ))}
            </div>
        </div>
    )
}



const DESTINATION_ITEMS = [
    {
        num: 1,
        region: "Aceh & Sumatera Utara",
        tag: "Rehabilitasi Perumahan",
        copy: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        accent: "var(--gold)",
        href: "#",
        delay: 0.05,
    },
    {
        num: 2,
        region: "Lintas Provinsi",
        tag: "Komparasi Regional",
        copy: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        accent: "var(--gold)",
        href: "#",
        delay: 0.18,
    },
    {
        num: 3,
        region: "Sumatera Barat",
        tag: "Rekonstruksi Infrastruktur",
        copy: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        accent: "var(--gold)",
        href: "#",
        delay: 0.30,
        id: "riset-3",
    },
];