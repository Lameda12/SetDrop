# 🎵 SetDrop

> *"Don't think about making art, just get it done. Let everyone else decide if it's good or bad, whether they love it or hate it. While they are deciding, make even more art."* — Rick Rubin
>
> i built this in one sitting. it works. let's go. 🚀

---

## what is this

SetDrop is a **live song request tool** for indie artists, DJs, streamers, and bedroom producers.

fan scans a QR / types a code → requests a song → upvotes the queue → sends reactions → artist sees it all in real time on their dashboard + OBS overlay.

that's it. no fluff. no Spotify integration. no accounts for fans. no app to download. just vibes and a link. 🔗

---

## why i built it

i go to a lot of underground shows in berlin and tokyo and the DJ is just guessing what the crowd wants. i've been at raves where the energy was 10/10 but the DJ played the wrong set because they had no feedback loop.

meanwhile streamers on Twitch are copying song requests from chat manually like it's 2009.

**there's no product that solves this cleanly.** just forms, spreadsheets, and chaos.

i built SetDrop in a weekend with Next.js + Supabase + vibe coding energy. it's v1. it's rough. but it works and people are already asking for it. 👀

---

## the vibe coding manifesto (or: how i built this)

i follow **Rick Rubin's philosophy** of stripping everything down to the essential signal. no bloat. no enterprise features. no 47-step onboarding.

- build the thing that matters, kill everything else
- ship when it breathes, not when it's perfect
- the constraint IS the design
- "done" is a vibe, not a checklist

this whole codebase is one sitting of flow state. supabase realtime does the heavy lifting. no custom websocket server, no redis, no k8s. just postgres + a couple of RLS policies and it scales to thousands of concurrent fans per session. 🔥

---

## v1 feature set

### 🎤 for artists
- start a live session → get a 6-char code (e.g. `W4K9RZ`)
- share code or link with audience — they join instantly, no login
- see song requests roll in **live** as fans submit them, sorted by upvotes
- one-click "Mark Played" removes the song from the queue
- **Hype Meter** — real-time engagement score (0–100) based on requests + votes + reactions in the last 60 seconds. formula:
  ```
  score = (new_requests × 2) + (new_votes × 1) + (new_reactions × 0.5), capped at 100
  ```
- OBS browser source overlay: floating emoji bursts (🔥❤️🎵) + hype bar — transparent background, no chrome, pure cinema
- copy shareable join link in one click
- end session when done

### 🙋 for fans
- join with a 6-char code — no account, no app, just a link
- request any song (140 char, free text — artist's rules, not Spotify's)
- upvote other requests (deduped by browser fingerprint — `crypto.randomUUID()` stored in localStorage)
- max 3 requests per session — keeps the queue honest
- send reactions: 🔥 ❤️ 🎵 — they float up on the artist's OBS stream live
- see the live queue update in real time — feel part of the show

### 📺 for streamers / OBS
- `/overlay/[sessionId]` is a transparent OBS browser source
- emoji reactions float up with CSS keyframe animations, no JS animation libraries
- hype bar pulses + glows green when score > 70
- zero latency — Supabase Realtime push, not polling

---

## tech stack

| layer | choice | why |
|---|---|---|
| framework | Next.js 14 App Router | server components + edge middleware = fast auth without a dedicated auth server |
| database | Supabase Postgres | RLS handles multi-tenant auth at the DB layer — no auth middleware per route |
| realtime | Supabase Realtime (`postgres_changes`) | zero-config websocket fan-out. 1 line to subscribe by `session_id` filter |
| auth | Supabase Auth (email/password) | artist accounts only — fans need zero auth |
| styling | Tailwind CSS v3 | utility-first = design system in the config file |
| language | TypeScript | self-documenting schema, caught 11 bugs before runtime |
| hosting | any edge runtime (Vercel, Fly, Railway) | no persistent servers needed |

**no Redis. no custom WebSocket server. no message broker. no Docker Compose with 6 services.**

the entire infrastructure is: Next.js app + Supabase project. that's two services. 🎯

---

## database schema (the whole thing, it's tiny)

```sql
sessions   -- artist creates, fans join by code
requests   -- song queue, sorted by upvotes desc
votes      -- 1 per fingerprint per request (unique constraint = free dedup)
reactions  -- ephemeral 🔥❤️🎵 bursts, drives hype score
```

one stored procedure:
```sql
create function increment_upvote(request_id uuid) ...
-- atomic denormalized counter, no race conditions, no SELECT COUNT(*) on every render
```

four partial indexes. RLS on every table. Realtime publication on all four tables.
the whole migration is [one SQL file](./supabase/migrations/0001_initial.sql).

---

## quick start

```bash
# 1. clone
git clone https://github.com/Lameda12/SetDrop
cd SetDrop

# 2. install
npm install

# 3. env
cp .env.example .env.local
# fill in your Supabase URL + keys

# 4. run the migration
# paste supabase/migrations/0001_initial.sql into Supabase SQL Editor

# 5. run
npm run dev
# → http://localhost:3000
```

**that's it.** no seed scripts. no docker compose. no environment setup ceremony.

---

## project structure

```
src/
├── app/
│   ├── page.tsx                  # landing
│   ├── login/ + signup/          # auth
│   ├── dashboard/                # artist view (protected)
│   ├── join/[code]/              # fan view (public)
│   ├── overlay/[sessionId]/      # OBS transparent overlay
│   └── api/
│       ├── sessions/             # create / end session
│       ├── requests/             # submit song
│       ├── requests/[id]/played/ # mark played
│       ├── votes/                # upvote via RPC
│       └── reactions/            # 🔥❤️🎵 bursts
├── components/
│   ├── dashboard/                # QueueList, HypeMeter, SessionControls, CopyLink
│   ├── fan/                      # RequestForm, FanQueue, ReactionBar
│   └── overlay/                  # EmojiLayer, FloatingEmoji, OverlayHypeBar
└── lib/
    ├── supabase/                 # browser + server + middleware clients
    ├── hype.ts                   # hype score formula
    ├── types.ts                  # full database type definitions
    └── utils.ts                  # cn(), generateCode(), getFingerprint()
```

---

## the market (why this is bigger than it looks)

### who needs this RIGHT NOW

| segment | size | current solution | SetDrop advantage |
|---|---|---|---|
| 🎧 Twitch / Kick music streamers | 500k+ active music streamers | copying requests from chat manually | structured queue, live sort, OBS native |
| 🎤 indie artists / DIY shows | millions globally | shouting into mic, texting friends | frictionless — fans just type a code |
| 🏠 bedroom DJ sessions | exploding post-COVID | nothing, they just wing it | first product that exists for this |
| 🎪 festival b-stages, pop-up raves | growing scene in Berlin, Seoul, London | venue apps that cost $500/month | $0 to start, works on any device |
| 🎮 gaming / variety streamers | expanding beyond gaming | StreamElements song requests (Spotify only) | any song, any platform, overlay-native |

### the number that matters

**Twitch alone has 7.3 million unique monthly streaming channels.** even 1% of that is 73,000 potential artists.
if SetDrop charges $12/month for pro features — that's **$876k MRR** from 1% of one platform.

we haven't touched YouTube Live, Kick, TikTok Live, Discord Stage, physical venues, corporate events, or karaoke bars.

### the hype economy angle 🔥

every song request is a **micro-engagement signal**. every vote is intent data. every reaction maps to a timestamp in the set.

SetDrop is sitting on top of the most underutilized real-time data in live entertainment: **what a crowd wants to hear, when they want to hear it.**

future: setlist analytics, crowd mood curves, "what songs trend at 1am in Berlin", label partnerships, Spotify/Apple Music playlist generation from set data. this is a data moat dressed up as a utility tool.

---

## what accelerators would bet on

### the unfair advantages

**1. zero-friction fan side** — no app, no account, no download. just a link. this is the entire moat. every competitor adds friction. friction kills engagement.

**2. OBS-native** — every serious streamer already uses OBS. SetDrop lives inside their workflow, not beside it. browser source = instant distribution channel.

**3. the code is the product** — a 6-char code like `W4K9RZ` is memorable, shareable, tweetable. "join my session at W4K9RZ" works in a caption, on a flyer, shouted on a mic. it's a tiny URL with presence.

**4. supply-side virality** — every artist who uses SetDrop shows it to their fans. every fan who uses it becomes aware of SetDrop. the artist is the distribution channel. it's exactly how Calendly grew.

**5. realtime without complexity** — Supabase Realtime + postgres_changes means we broadcast to thousands of concurrent fans per session with zero additional infrastructure. the cost to serve 10,000 concurrent users is nearly identical to serving 10.

### the accelerator pitch in two sentences

> *SetDrop makes every live performance interactive. Fans shape the set in real time — and artists finally know what their crowd wants.*

---

## global market fit 🌏

this isn't a US-only product. it's built for the scenes where it matters most:

| city | scene | why SetDrop fits |
|---|---|---|
| 🇰🇷 Seoul | K-pop fansign events, live streaming culture | fans ALREADY demand interactivity. this is the infrastructure |
| 🇯🇵 Tokyo | underground electronic, idol concerts | obsessive crowd engagement + tech-first culture |
| 🇩🇪 Berlin | techno, Berghain adjacent, DIY culture | DJs are gods there. give them a crowd feedback loop |
| 🇬🇧 London | garage, grime, drill live sets | high-density shows, young demographic, phone-first |
| 🇸🇬 Singapore | regional hub, festival circuit | Southeast Asia's live scene is growing fast. first mover wins |
| 🇺🇸 NYC / LA | indie, streaming, podcasts with live audiences | obvious. covered. |
| 🌍 everywhere | any artist with a phone and an audience | the barrier to entry is literally: read a code |

---

## roadmap (what v2 looks like)

these are NOT promises. this is what i'm thinking about. 🧠

- [ ] **QR code generation** — display on stream, at venue, on merch
- [ ] **Setlist history** — every song marked played, timestamped, exportable
- [ ] **Artist analytics** — request frequency, hype score over time, top requesters
- [ ] **Crowd mood API** — raw signal: `{ timestamp, hype_score, top_request, reaction_counts }` — sell this
- [ ] **Tiered plans** — free (1 active session), Pro ($12/mo, unlimited + analytics), Venue ($99/mo, multi-artist dashboard)
- [ ] **Embeddable widget** — drop a `<script>` tag on any website or Linktree
- [ ] **Spotify / Apple Music deep links** — auto-link requested songs (keep input free-text, enrich on output)
- [ ] **Discord bot** — `/setdrop join W4K9RZ` from inside a Discord server
- [ ] **Mobile app** — React Native, shares 90% of the codebase logic
- [ ] **White-label for venues** — venues resell SetDrop to their artists

---

## monetization (simple, indie-hacker style)

**v1: free.** build the user base. prove retention.

**v2:**
```
Free     — 1 session at a time, 50 fans max, no analytics
Pro      — $12/mo — unlimited sessions, unlimited fans, analytics, QR codes
Venue    — $99/mo — multi-artist, dashboard for bookers, white-label overlay
```

**why $12?** it's less than a streaming subscription. it's less than a round of drinks at the show SetDrop is powering. artists will pay $12/mo without thinking.

**why venues pay $99?** because they run 4+ artists a night and the alternative is hiring someone to manage requests manually.

---

## the one thing i know for sure

every artist i've shown this to has said *"wait, i want this tonight."*

not "interesting concept" — *"i want this tonight."*

that's the signal. 📡

---

## contributing

this is early. everything is on the table.

if you're a designer who thinks the UI is mid — PRs open.  
if you're a backend person who sees a better way to do the hype score — PRs open.  
if you're an artist and you want to use this — DM me.  
if you're a VC or accelerator and you want to talk — also DM me. be cool about it.

---

## license

MIT. take it, fork it, learn from it.

if you build something with it and make money, buy me a coffee and tell me about it. 🤝

---

## built by

a 21-year-old CS student who stayed up too late listening to Rick Rubin interviews and decided that software should feel like a great record — **not too much, not too little. just the thing itself.**

SetDrop is the thing itself.

---

<div align="center">

**🎵 SetDrop v1 — built in a flow state, shipped before the doubt could catch up 🎵**

*"The only way to do it is to do it."*

[join a live session] · [start your own] · [read the code]

</div>
