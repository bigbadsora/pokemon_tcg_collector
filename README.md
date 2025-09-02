# Pokémon TCG Collection Tracker (Alpha)

A fast, no-nonsense web app for tracking your Pokémon TCG collection by **expansion, variant, and quantity**.  
Frontend: **Next.js** · Backend: **FastAPI** · One-liner local run via **Docker Compose**.  
**Status:** Alpha — core features work; polish & UX improvements in progress.

---

## ⚠️ Disclaimer

This project is a fan-made tool. **Pokémon** and **Pokémon TCG** are trademarks of The Pokémon Company, Nintendo, Game Freak, and Creatures.  
This project is **not affiliated with or endorsed by them**.

---

## 🚀 Quickstart (Docker recommended)

```bash
git clone https://github.com/bigbadsora/pokemon_tcg_collector.git
cd pokemon_tcg_collector

# Build & run (first run seeds the DB automatically)
docker compose up --build
```

* Frontend → [http://localhost:3000](http://localhost:3000)
* API docs (Swagger) → [http://localhost:8000/docs](http://localhost:8000/docs)

**What you get on first run:** a pre-seeded SQLite DB with expansions/cards so you can use the app immediately (no 30-minute API warm-up).

**Reset to factory seed later:**
```bash
docker compose down -v
docker compose up --build
```
## 🛠 How it Works (Infra Basics)
* **Seed DB** lives at `backend/seed/pokemon.db` (tracked).
* At container start, an entrypoint copies that to the volume at ``/app/data/app.db`` if the volume is empty.
* FastAPI reads `DATABASE_PATH=/app/data/app.db` (set by Compose).
* Next.js gets its backend URL at **build time** via the Compose build arg `NEXT_PUBLIC_BACKEND_URL=http://localhost:8000/api.`

## 💻 Manual Dev (no Docker)
**Backend**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate  # (Windows: .venv\Scripts\activate)
pip install -r requirements.txt
export DATABASE_PATH="$(pwd)/seed/pokemon.db"      # Windows (PowerShell): $env:DATABASE_PATH="...\seed\pokemon.db"
uvicorn app.main:app --reload --port 8000
```

**Frontend**
```bash
cd frontend
# Make sure .env.local contains:
# NEXT_PUBLIC_BACKEND_URL="http://localhost:8000/api"
npm install
npm run dev
# http://localhost:3000
```

## 📦Features (Alpha)
* Expansion dropdown (incl. **Pocket** toggle)
* Full expansion view with **every card** & your **quantities** (0 allowed)
* Tracks **variants**, **quantity**, and **collection number** (not condition)
* Stats panel: total progress + rarity breakdown (official symbols + names)
* Table view; binder view toggle stubbed for a future release
* Sorting fixed after updates; quantities never go negative

## ⚙️ Configuration
**Frontend**
* `NEXT_PUBLIC_BACKEND_URL` → base URL for backend
    * Docker: baked at build time via Compose (`http://localhost:8000/api`)
    * Manual dev: set in `frontend/.env.local`
 
**Backend**
* `DATABASE_PATH` → path to SQLite DB
    * Docker: `/app/data/app.db` (volume; seeded on first run)
    * Manual dev: `backend/seed/pokemon.db` (or any local path)
