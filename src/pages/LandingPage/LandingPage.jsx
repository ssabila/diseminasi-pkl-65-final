import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <h1>Halaman Utama (Landing Page)</h1>
      <p>Pilih Web Story di bawah ini:</p>
      <nav>
        <ul>
          <li><Link to="/web-story-1">Web Story 1</Link></li>
          <li><Link to="/web-story-2">Web Story 2</Link></li>
          <li><Link to="/web-story-3">Web Story 3</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default LandingPage;