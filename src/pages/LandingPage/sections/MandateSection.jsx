import { useLayoutEffect, useRef } from "react";
import Kicker from "../components/Kicker";
import { mandateSectionAnimation } from "../animations";

const details = [
  { k: "Pelaksana", v: "Mahasiswa Polstat STIS Angkatan 65" },
  { k: "Pemberi Mandat", v: "Badan Pusat Statistik Republik Indonesia" },
  { k: "Cakupan", v: "Aceh · Sumatera Utara · Sumatera Barat" },
  { k: "Fokus Pendataan", v: "Rehabilitasi & Rekonstruksi Pascabencana" },
  { k: "Periode Lapangan", v: "14 Januari – 02 Februari 2026" },
];

export default function MandateSection() {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    const cleanup = mandateSectionAnimation(sectionRef.current);
    return cleanup;
  }, []);

  return (
    <section
      id="mandate"
      ref={sectionRef}
      className="py-[clamp(72px,10vh,130px)] px-[5%] grid grid-cols-[1.1fr_0.9fr] gap-[clamp(48px,7vw,112px)] items-start max-md:grid-cols-1"
    >
      <div data-reveal data-from="left" className="opacity-0">
        <Kicker>Mandat Institusional</Kicker>
        <h2 className="font-[family-name:var(--font-title)] italic text-[clamp(28px,3.5vw,50px)] leading-[1.15] !text-[var(--beige)] mb-[clamp(20px,3vh,32px)]">
          Dipercaya Negara.<br />
          <span className="not-italic text-[var(--gold)]">Harapan Masyarakat.</span>
        </h2>
        <p className="text-[clamp(14px,1.3vw,17px)] leading-[1.85] font-light text-[var(--beige)]/70 mb-[18px] max-w-[520px]">
          Bukan sekadar tugas akademik. BPS Republik Indonesia — lembaga
          statistik resmi negara — mempercayakan <em className="text-[var(--beige)] italic">tugas mulia</em> untuk mempercepat pendataan
          <em className="text-[var(--beige)] italic"> Rencana Rehabilitasi Rekonstruksi
            Pascabencana</em> di 3 wilayah terdampak kepada mahasiswa <em className="italic text-[var(--beige)]">Politeknik Statistika STIS Angkatan 65.</em>
        </p>
        <p className="text-[clamp(14px,1.3vw,17px)] leading-[1.85] font-light text-[var(--beige)]/70 m-0 max-w-[520px]">
          Setiap angka mewakili <em className="text-[var(--beige)] italic">nyawa dan harapan</em> — warga yang kehilangan
          rumah, mata pencaharian, hingga sanak saudara.
        </p>
      </div>

      <div data-reveal data-from="right" data-delay="0.15" className="opacity-0">
        <div className="border-t border-[var(--beige)]/[0.12]">
          {details.map((row) => (
            <div
              key={row.k}
              className="grid grid-cols-[140px_1fr] gap-3 py-[clamp(14px,2vh,20px)] border-b border-[var(--beige)]/[0.07] items-start"
            >
              <span className="text-[10px] tracking-[0.14em] uppercase text-[var(--beige)]/[0.38] font-normal pt-0.5">
                {row.k}
              </span>
              <span className="text-[clamp(13px,1.1vw,15px)] text-[var(--beige)] font-light leading-[1.45]">
                {row.v}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-[clamp(24px,3vh,36px)] border-l-3 border-[var(--green)] pl-4">
          <p className="text-[clamp(13px,1.1vw,14px)] font-light leading-[1.75] text-[var(--beige)]/55 m-0">
            Metodologi terstandar BPS · Data primer lapangan
          </p>
        </div>
      </div>
    </section>
  );
}