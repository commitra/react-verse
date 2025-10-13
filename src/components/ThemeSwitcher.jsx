export default function ThemeSwitcher({ theme, toggleTheme }) {
  return (
    <div className="theme-switcher">
      <button onClick={toggleTheme}>Theme: {theme === 'light' ? '🌞' : '🌜'}</button>
    </div>
  );
}
