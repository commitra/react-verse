# 🌐 ReactVerse – The Open API Playground

**ReactVerse** is an open-source API dashboard built with **React + Vite**, designed to help developers explore, visualize, and learn how to integrate public APIs safely and responsibly.
It’s more than just a project — it’s a **community-driven learning space** for understanding how APIs work, managing data securely, and contributing meaningfully to open source.

Perfect for **beginners**, and **API enthusiasts** who want to get hands-on experience using real-world APIs.

---

## 🚀 What’s Inside

A collection of interactive dashboards that fetch and display data from **free, no-auth public APIs** — all in one unified, open-source interface.

| Dashboard             | API Used                                                                                                | Description                                       |
| --------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| ☀️ Weather            | [wttr.in](https://wttr.in/:help)                                                                        | Get real-time weather updates and forecasts       |
| 💰 Cryptocurrency     | [CoinGecko](https://www.coingecko.com/en/api)                                                           | Track live crypto prices and market data          |
| 🛰️ Space & Astronomy | [Open Notify](http://open-notify.org/Open-Notify-API/)                                                  | View ISS location and current astronauts in orbit |
| 🎬 Movies             | [Studio Ghibli API](https://ghibliapi.vercel.app/)                                                      | Explore Studio Ghibli’s magical movie catalog     |
| 🍳 Recipes            | [TheMealDB](https://www.themealdb.com/api.php)                                                          | Find meal ideas and cooking inspiration           |
| 🎯 Trivia Quiz        | [Open Trivia DB](https://opentdb.com/api_config.php)                                                    | Challenge yourself with fun trivia questions      |
| 😂 Jokes & Quotes     | [Joke API](https://official-joke-api.appspot.com/) + [Quotable](https://github.com/lukePeavey/quotable) | Daily dose of humor and motivation                |
| 🐶🐱 Pets             | [Dog CEO](https://dog.ceo/dog-api/) + [Cataas](https://cataas.com/#/)                                   | Random cute dog and cat images                    |
| 🦠 COVID-19 Tracker   | [COVID19 API](https://covid19api.com/)                                                                  | Track pandemic stats and trends globally          |

---

## 🧠 Why ReactVerse?

* 🧩 **Learn by doing** — See how public APIs work and how to safely handle data fetching.
* 🔐 **Promote API safety** — No API keys, no secrets, just best practices for secure integration.
* 🌍 **Open to everyone** — Ideal for contributors learning React, APIs, or GitHub workflows.
* 💬 **Collaborative & inclusive** — A space where you can build, break, and improve together.

---

## ⚙️ Quick Start

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧰 Tech Stack

* ⚛️ React 18 + Vite
* 🧭 React Router v6
* 🌐 Fetch API (no external client)
* 🎨 Custom Light/Dark CSS Theme

---

## 🍽️ Nutrition Estimation (Recipes page)

This project optionally integrates the Edamam Nutrition Analysis API to estimate nutrition for a recipe's ingredients on demand.

Setup (native Edamam):

1. Create a free Edamam account and an app for the Nutrition Analysis API.
2. Copy keys into a local env file based on `env.example`:

```
cp env.example .env
```

3. Fill in values:

```
VITE_EDAMAM_APP_ID=your_edamam_app_id
VITE_EDAMAM_APP_KEY=your_edamam_app_key
```

How it works:
- `src/services/nutrition.js` posts ingredients to `/edamam/api/nutrition-details` through the dev proxy configured in `vite.config.js`.
- Results are cached in-memory per unique ingredients list.
- On `Recipes` cards, click “More Nutrition Info” to fetch and show calories, carbs, protein, fat, fiber, sugar, sodium.

Notes:
- Keys are only needed locally. Do not commit real keys. The feature gracefully no-ops if keys are missing.

Using RapidAPI instead of native keys:
1. Subscribe to the Edamam Nutrition Analysis API on RapidAPI.
2. Copy your RapidAPI key and host, then add to `.env` (see `env.example`):

```
VITE_RAPIDAPI_KEY=your_rapidapi_key
VITE_RAPIDAPI_HOST=edamam-edamam-nutrition-analysis.p.rapidapi.com
```

How selection works:
- If RapidAPI vars are set, the app calls RapidAPI with `x-rapidapi-key`/`x-rapidapi-host`.
- Else if native Edamam vars are set, it uses the native API via the Vite proxy.
- Else it falls back to a local mock JSON for demo/screenshots.

---

## 🤝 Contributing

We welcome contributions of all levels — from design tweaks to feature enhancements!

* Check out `CONTRIBUTING.md` for setup instructions and issue labels.
* Look for **`good first issue`** or **`help wanted`** tags to get started.
* Participate in **Hacktoberfest** and grow your open-source journey with us.

---

## 🗺️ Roadmap

* ✨ Improve UI/UX and accessibility
* 🔍 Add search, filters, and persistent favorites
* 📊 Integrate charts (e.g. weather graphs, price trends)
* 🧱 Introduce a real charting library (e.g. Recharts or Chart.js)
* ⚙️ Add offline caching with service workers
* 🧪 Include testing (Vitest + React Testing Library)
* 🧾 Optional: Migrate to TypeScript for type safety

---


## 🪪 License

MIT – see `LICENSE` for full details.

---

## 💡 Acknowledgements

This project is community-built for **educational and open-source learning** purposes.

---

## 👥 Credits

* [Hrishikesh Dalal](https://www.hrishikeshdalal.tech/)
* [Venisha Kalola](https://www.venishakalola.tech/)

