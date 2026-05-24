import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage';
import WebStory1 from './pages/WebStory1/WebStory1';
import WebStory2 from './pages/WebStory2/WebStory2';
import WebStory3 from './pages/WebStory3/WebStory3';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/web-story-1" element={<WebStory1 />} />
        <Route path="/web-story-2" element={<WebStory2 />} />
        <Route path="/web-story-3" element={<WebStory3 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
