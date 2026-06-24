# Queue Cure '26 🏥

> Real-time smart clinic queue management — built for Wooble's Queue Cure '26 hackathon

## Live Demo

| Screen | Link |
|--------|------|
| 🖥️ Receptionist | https://queue-cure-26-ecru.vercel.app/receptionist |
| 📺 Patient Waiting Room | https://queue-cure-26-ecru.vercel.app/waiting-room |
| 👨‍⚕️ Doctor Pulse Dashboard | https://queue-cure-26-ecru.vercel.app/doctor |

## Problem

76% of India's 1.5 million clinics manage patient queues on paper slips and verbal calls.
Patients wait 2–3 hours with zero visibility. Receptionists manage everything from memory.

## Solution

A three-screen, real-time queue management system:
- **Receptionist** — register patients, call next token, set consult time
- **Waiting Room** — live TV display showing current token, queue position, estimated wait
- **Doctor Pulse** — analytics dashboard with queue load, wait trends, and hourly flow

## Unique Features (USP)

- **Priority-aware queue** — urgent and elderly patients bypass token order automatically
- **Dynamic wait estimation** — calculated from real consult times, adjusts for overruns
- **No-show detection** — alerts receptionist if a called patient hasn't been seen in 3× avg time
- **Print token receipt** — generates an A6 printable slip replacing paper tokens
- **Queue pause with reason** — receptionist logs reason (lunch/emergency); waiting room shows it

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | TailwindCSS + shadcn/ui |
| Animation | Framer Motion |
| State | Zustand |
| Realtime | Supabase Realtime (postgres_changes) |
| Database | Supabase (PostgreSQL) |
| Charts | Recharts |
| Deployment | Vercel |

## Local Setup

1. Clone the repo
```bash
   git clone https://github.com/nihal-aiml/queue-cure-26.git
   cd queue-cure-26
```

2. Install dependencies
```bash
   npm install
```

3. Create `.env.local` in the project root

VITE_SUPABASE_URL=https://ucscwccjgdkdcjpyjwru.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjc2N3Y2NqZ2RrZGNqcHlqd3J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMjg4MjcsImV4cCI6MjA5NzcwNDgyN30.JZuZPsL03151be82iNzSkA6knJQOvqKn_RnscL4Yebk


4. Run the SQL schema in your Supabase SQL editor (see `/docs/schema.sql`)

5. Start the dev server
```bash
   npm run dev
```

6. Open the three screens:
   - http://localhost:5173/receptionist
   - http://localhost:5173/waiting-room
   - http://localhost:5173/doctor

## Architecture

Live sync works via Supabase Realtime — both screens subscribe to the same
`postgres_changes` channel. When the receptionist clicks "Call Next," the
waiting room updates within 300ms with no page refresh.

![Socket Event Diagram](docs/socket-diagram.png)

## Evaluation Criteria

| Criterion | Weight | Implementation |
|-----------|--------|----------------|
| Live queue updates | 40% | Supabase Realtime postgres_changes, Zustand shared store |
| Wait time from real data | 25% | (priority position × avg_consult_minutes) − session overrun |
| Receptionist UX | 20% | Auto tokens, dropdowns, debounced button, toast errors |
| Concurrency & edge cases | 15% | See thought process sheet in /docs |

## License

MIT