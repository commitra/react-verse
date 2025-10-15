/**
 * GLOBAL / APP-LEVEL TODOs
 * ------------------------
 * The following are cross-cutting enhancements contributors can pick up.
 * The individual pages each contain domain-specific TODO blocks.
 *
 * Architecture & State:
 *  - [ ] Introduce Context for theme + persistence (localStorage)
 *  - [ ] Add Error Boundary component wrapping <Routes />
 *  - [ ] Create services/ + hooks/ directories for data & reuse
 *  - [ ] Implement a generic useFetch hook with caching & cancellation
 * Performance:
 *  - [ ] Code-split pages using React.lazy + Suspense
 *  - [ ] Preload most-visited pages on hover (link prefetch)
 *  - [ ] Add simple runtime metrics logging (optional debug panel)
 * UI/UX:
 *  - [ ] Persist theme choice & respect prefers-color-scheme
 *  - [ ] Add skip-to-content link for accessibility
 *  - [ ] Improve keyboard navigation for nav menu
 *  - [ ] Add focus outlines & reduced motion preference support
 * Tooling:
 *  - [ ] Add ESLint + Prettier config
 *  - [ ] Add Vitest + React Testing Library starter tests
 *  - [ ] GitHub Actions workflow for build + test
 *  - [ ] Issue / PR templates (.github/)
 * Advanced / Stretch:
 *  - [ ] PWA support (manifest + service worker caching selected API responses)
 *  - [ ] TypeScript migration (incremental) – begin with types for services
 *  - [ ] Theming via CSS variables extracted to separate file; dynamic theme packs
 *  - [ ] Add analytics abstraction (document open-source options only)
 */
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Weather from './pages/Weather.jsx';
import Crypto from './pages/Crypto.jsx';
import Space from './pages/Space.jsx';
import Movies from './pages/Movies.jsx';
import Recipes from './pages/Recipes.jsx';
import Trivia from './pages/Trivia.jsx';
import JokesQuotes from './pages/JokesQuotes.jsx';
import Pets from './pages/Pets.jsx';
import Covid from './pages/Covid.jsx';
import Navbar from './components/Navbar.jsx';
import ThemeSwitcher from './components/ThemeSwitcher.jsx';

// TODO: Extract theme state into context (see todo 5).
import { useState } from 'react';

export default function App() {
  const [theme, setTheme] = useState('light');
  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));

  return (
    <div className={`app theme-${theme}`}>      
      <Navbar />
      <ThemeSwitcher theme={theme} toggleTheme={toggleTheme} />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/weather" element={<Weather />} />
            <Route path="/crypto" element={<Crypto />} />
            <Route path="/space" element={<Space theme={theme} />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/trivia" element={<Trivia />} />
            <Route path="/jokes-quotes" element={<JokesQuotes />} />
            <Route path="/pets" element={<Pets />} />
            <Route path="/covid" element={<Covid />} />        
        </Routes>
      </main>
    </div>
  );
}
