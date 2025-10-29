/**
 * HOME DASHBOARD TODOs (Contribution Guide Snippet)
 * -------------------------------------------------
 * Easy:
 *  - [ ] Add welcome hero section with project intro & quick links
 *  - [ ] Add badges (Hacktoberfest, License, PRs welcome)
 *  - [ ] Animate cards on hover / entrance
 *  - [ ] Add search/filter field to quickly find dashboards
 *  - [ ] Add a footer with API attribution links
 * Medium:
 *  - [ ] Convert dashboard list into data-driven config (shared file) and reuse across nav
 *  - [ ] Add category tags and filter by tag
 *  - [ ] Implement keyboard navigation & focus outlines
 *  - [ ] Add i18n foundation (e.g., en.json) + language switch placeholder
 *  - [ ] Persist recently visited dashboards (localStorage)
 * Advanced:
 *  - [ ] Add analytics (open-source, self-hosted suggestion in docs only) for page views
 *  - [ ] Lazy-load pages (React.lazy + Suspense) with skeleton states
 *  - [ ] Implement global search across dashboards (typeahead)
 *  - [ ] Add offline cache for dashboard list
 */
import Card from '../components/Card.jsx';
import { Link } from 'react-router-dom';
import Header from './Header.jsx';

const dashboards = [
  { path: '/weather', title: 'Weather', desc: 'Current weather & forecast' },
  { path: '/crypto', title: 'Cryptocurrency', desc: 'Top coins & market data' },
  { path: '/space', title: 'Space & Astronomy', desc: 'ISS location & astronauts' },
  { path: '/movies', title: 'Movies', desc: 'Studio Ghibli films' },
  { path: '/recipes', title: 'Recipes', desc: 'Find meals & random ideas' },
  { path: '/trivia', title: 'Trivia Quiz', desc: 'Answer questions & score' },
  { path: '/jokes-quotes', title: 'Jokes & Quotes', desc: 'Random jokes & inspiration' },
  { path: '/pets', title: 'Pets Images', desc: 'Random dog & cat images' },
  { path: '/covid', title: 'COVID-19 Stats', desc: 'Global & country data' },
  { path: '/pokedex', title: 'Pokédex', desc: 'Explore Pokémon species' },
  { path: '/taskflow', title: 'Task Flow Board', desc: 'Visual task management with nodes' },
  { path: '/github-profile-analyzer', title: 'GitHub Profile Analyzer', desc: 'Analyze GitHub profiles and repositories' },
  { path: '/contributors', title: 'Contributor Wall', desc: 'Our Contributors' },
   
];

export default function Home() {
  return (
    <>
    <Header/>
     <div className="home-page">
      <div className="grid">
        {dashboards.map(d => (
          <Card
            key={d.path}
            title={d.title}
            footer={<Link to={d.path} className="card-link-button">Open →</Link>}
          >
            <p>{d.desc}</p>
          </Card>
        ))}
      </div>
    </div>
    </>
  );
}
