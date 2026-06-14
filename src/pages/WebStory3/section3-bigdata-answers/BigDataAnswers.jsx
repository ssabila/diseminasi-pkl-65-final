import React, { useRef } from 'react';
import './BigDataAnswers.css';

/**
 * Section 3 — Big Data Bisa Menjawab (5 Pertanyaan Scroll-Triggered)
 */
export default function BigDataAnswers() {
  const sectionRef = useRef(null);

  const steps = [
    {
      id: 'step-1',
      question: 'Bagaimana bencana terjadi?',
      description: 'Visualisasi curah hujan sebagai salah satu faktor yang dapat digunakan untuk memahami dan menganalisis penyebab terjadinya bencana.'
    },
    {
      id: 'step-2',
      question: 'Seberapa luas dampaknya?',
      description: 'Area terdampak bencana, sehingga pengguna dapat melihat cakupan wilayah yang terkena dampak.'
    },
    {
      id: 'step-3',
      question: 'Siapa yang paling rentan?',
      description: 'Kepadatan penduduk pada wilayah terdampak untuk mengidentifikasi kelompok masyarakat yang memiliki tingkat kerentanan lebih tinggi.'
    },
    {
      id: 'step-4',
      question: 'Wilayah mana yang harus diprioritaskan?',
      description: 'Peta prioritas penanganan, yang menunjukkan wilayah-wilayah yang memerlukan perhatian dan intervensi lebih cepat.'
    },
    {
      id: 'step-5',
      question: 'Kapan wilayah mulai pulih?',
      description: 'Recovery timelapse yang memperlihatkan perkembangan kondisi wilayah pascabencana dari waktu ke waktu.'
    }
  ];

  return (
    <section ref={sectionRef} id="section3-bigdataanswers" className="section section-bigdataanswers">
      {/* Kiri: Area Kosong untuk Mapbox */}
      <div className="bigdata-map-area"></div>

      {/* Kanan: Panel Pertanyaan yang di-Pin */}
      <div className="bigdata-content-area">
        <div className="bigdata-panel-pinned" id="bigdata-panel">
          <div className="bigdata-cards-container">
            {steps.map((step, index) => (
              <div key={step.id} className="bigdata-card" id={`bigdata-card-${index + 1}`}>
                <div className="step-indicator">Tahap {index + 1}</div>
                <h2 className="bigdata-question">{step.question}</h2>
                <p className="bigdata-description">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
