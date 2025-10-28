# Contributing Guide (Hacktoberfest)

Thanks for your interest in contributing to React Verse! This project is intentionally structured to welcome newcomers.

## Getting Started
1. Fork the repo & clone locally
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`
4. Create a feature branch: `git checkout -b feat/your-feature`

## Project Structure
```
src/
  components/     Reusable UI pieces (Card, Navbar, etc.)
  pages/          Each dashboard page (Weather, Crypto, etc.)
  styles.css      Global styles + themes
```

## Issue Types
- `good first issue` – Small, self‑contained, low risk
- `enhancement` – Feature improvements
- `bug` – Something broken or incorrect
- `documentation` – README / guide improvements

If you’re unsure where to start, open a discussion or comment on an issue to be assigned.

> Pro Tip : If you raise a valid issue - you WILL BE assigned that

## Contribution Ideas
General:
- Add accessibility (aria labels, focus states, skip links)
- Improve mobile layout & navigation
- Implement persistent dark mode (localStorage)
- Add global error boundary

Weather Dashboard:
- Dynamic backgrounds based on condition
- Unit toggle (°C / °F)
- Hourly forecast visualization

Crypto Dashboard:
- Sparkline charts for 7d prices
- Sort by market cap / price / % change
- Favorites + local storage

Space Dashboard:
- Leaflet map with live ISS position
- Refresh interval toggle
- ISS pass prediction form (lat/lon inputs)

Movies Dashboard:
- Poster images mapping
- Advanced filters (producer, running time)
- Favorites + watchlist

Recipes Dashboard:
- Modal with full instructions & ingredients
- Category & area filters
- Nutrition estimation (external API?)

Trivia Dashboard:
- Difficulty selector
- Timer per question
- High score persistence

Jokes & Quotes:
- Favorites & sharing
- Author filter dropdown

Pets Dashboard:
- Persist favorites
- Download image helper

COVID Dashboard:

- Daily trends line charts
- Country comparison

Task Flow Board:

- Add color themes for nodes
- Implement keyboard shortcuts (Delete, Undo)
- Add task search and filtering
- Create board templates (Kanban, Sprint Planning)
- Export/import boards as JSON
- Add task due dates and calendar view
- Implement drag-to-connect nodes feature
- Add task dependencies validation

Global Enhancements:

- Extract API calls into services folder
- Add custom hooks (useFetch, useLocalStorage)
- Add tests with Vitest
- TypeScript migration
- CI workflow (lint + build)

## Code Style

- Keep components small & focused
- Use semantic HTML where practical
- Prefer descriptive variable names
- Add `// TODO:` comments for follow-up ideas

## Submitting a PR

1. Ensure build passes: `npm run build`
2. Provide a clear title & description (include issue # if applicable)
3. Screenshots / GIFs for UI changes encouraged
4. One feature/fix per PR when possible

## License

By contributing you agree your work is licensed under the project’s MIT License.

Happy hacking! ✨
