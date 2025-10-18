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

## 🍽️ Nutrition (Recipes) — optional

Estimate nutrition for a recipe's ingredients. Works with RapidAPI or native Edamam; falls back to a local mock if no keys are set.

Setup
1. Create `.env` from the example:
   - `cp env.example .env`
2. Choose ONE provider:
   - RapidAPI (recommended for quick start):
     - `VITE_RAPIDAPI_KEY=your_rapidapi_key`
     - `VITE_RAPIDAPI_HOST=<copy the exact X-RapidAPI-Host from RapidAPI>`
       (e.g. `edamam-nutrition-analysis.p.rapidapi.com` — value may vary)
   - Native Edamam:
     - `VITE_EDAMAM_APP_ID=your_edamam_app_id`
     - `VITE_EDAMAM_APP_KEY=your_edamam_app_key`
3. Restart dev server.

Use
- Open Recipes → click “More Nutrition Info”.
- Shows: Calories (kcal), Carbs (g), Protein (g), Fat (g), Fiber (g), Sugar (g), Sodium (mg).
- If no keys are set, the button shows “Demo Nutrition (mock)”.

Notes & troubleshooting
- Do not commit real keys. `.env` is local only.
- RapidAPI: ensure Host matches your snippet exactly; we support common endpoints.
- If you see 401/404, double‑check Host/key and quota, then restart the dev server.

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

