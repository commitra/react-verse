import { NavLink } from 'react-router-dom';

export default function Navbar({ theme, toggleTheme }) {
  return (
    <nav className="navbar">
      <h1 className="logo">🌐 ReactVerse</h1>
      
      <ul>
        <li><NavLink to="/">Home</NavLink></li>
        <li><NavLink to="/weather">Weather</NavLink></li>
        <li><NavLink to="/crypto">Crypto</NavLink></li>
        <li><NavLink to="/space">Space</NavLink></li>
        <li><NavLink to="/movies">Movies</NavLink></li>
        <li><NavLink to="/recipes">Recipes</NavLink></li>
        <li><NavLink to="/trivia">Trivia</NavLink></li>
        <li><NavLink to="/jokes-quotes">Jokes & Quotes</NavLink></li>
        <li><NavLink to="/pets">Pets</NavLink></li>
        <li><NavLink to="/covid">COVID-19</NavLink></li>
        <li><NavLink to="/github-analyzer">GitHub Analyzer</NavLink></li>
        <li className="theme-item">
          <button 
            className="theme-toggle" 
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            <span className="theme-text">Theme Switcher</span>
            <span className="theme-icon">{theme === 'light' ? '🌙' : '☀️'}</span>
          </button>
        </li>
      </ul>
      
      <button 
        className="nav-toggle" 
        aria-label="Toggle navigation" 
        onClick={() => document.body.classList.toggle('nav-open')}
      >
        ☰
      </button>
    </nav>
  );
}
