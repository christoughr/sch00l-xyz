# Competitors & roadmap — how sch00l wins

**Positioning:** Not another video library or answer bot. **Socratic study + measurable learning lift** in class, with teacher visibility — then layer engagement (Kahoot-style) and community (forums) on top.

---

## What we already beat them on

| Competitor | Their strength | Our edge today |
|------------|----------------|----------------|
| Khan Academy | Free videos + exercises | Live AI tutor (no spoon-feeding), pre/post quiz **lift**, session memory |
| Google Classroom | Assignments, roster, LMS | Same roster + **lift metrics** tied to actual study sessions |
| Quizlet | Flashcards | AI-generated cards **from your session**, spaced review |
| Kahoot | Live quiz games | Not built yet — **Phase 2** (see below) |
| 1600.io, UWorld, Magoosh, etc. | Test-specific content + drills | **56 tracks** (AP, SAT/ACT, MCAT, LSAT, NCLEX, GRE, GMAT, IB) + adaptive difficulty |
| Chegg / Course Hero | Answers | Anti-shortcut tutor; learn material, not copy-paste |
| Discord study servers | Community | **Phase 3** class-scoped forums (safer than open Discord) |

---

## Feature matrix (copy + extend)

### Tier 1 — Ship next (4–8 weeks)

| Feature | Like… | sch00l twist |
|---------|--------|--------------|
| **Live quiz battles** | Kahoot, Gimkit, Blooket | Same room code as classroom; questions from **current unit track**; leaderboard + learning lift per round |
| **Class announcements** | Google Classroom stream | Teacher posts → students see on `/join` home |
| **Assign a unit** | Classroom assignment | Teacher picks one **study track** + due date; dashboard shows completion % |
| **Practice test mode** | 1600.io, Bluebook | Timed SAT/ACT/AP-style blocks using our quiz engine (no separate site) |

### Tier 2 — Differentiation (2–3 months)

| Feature | Like… | sch00l twist |
|---------|--------|--------------|
| **Student discussion** | Piazza, Schoology forums | Threads **per classroom + per unit**; AI moderation; no public DMs |
| **Teacher lounge** | Private FB groups | Threads per school pilot; share lift screenshots, unit plans |
| **Peer explain** | Brainly (but safe) | Students post *attempts*; tutor nudges; teacher approves exemplars |
| **Parent view** | Remind | Read-only: minutes + lift trend (no chat) |

### Tier 3 — Test prep moat (ongoing)

| Area | Competitors | Plan |
|------|-------------|------|
| SAT/ACT | 1600.io, Khan, College Board Bluebook | Official-style timing + score bands + **weak-skill routing** from session memory |
| AP | Fiveable, Heimler, AP Classroom | Per-AP track FRQ rubric hints (not full solutions day one) |
| GMAT/GRE/LSAT/MCAT | Magoosh, 7Sage, Kaplan | Already have tracks — add **question banks** + full-length sims |
| IB | Revision Village | Expand IB Math/Sciences tracks + criterion B/C style prompts |

---

## How to beat “study guide” sites

1. **One loop:** pre-quiz → tutor → post-quiz → cards (they’re fragmented tools).
2. **Proof:** `/outcomes` + classroom **avg learning lift** (competitors rarely show class-wide gain).
3. **Teacher in the loop:** roster + assign unit + live game — not solo consumer app.
4. **Honest AI:** Socratic rules + exam-specific tracks (not generic ChatGPT).

---

## Suggested build order

1. ✅ Classrooms, join codes, roster, lift dashboard  
2. 🔜 Assign unit + student progress %  
3. 🔜 Kahoot-style **live battle** (classroom code, 5–10 questions)  
4. 🔜 Student + teacher **threaded forums** (Supabase `threads` / `posts`)  
5. 🔜 Timed practice tests (SAT/ACT/AP picker)  
6. 🔜 Deeper item banks per exam (partnership or licensed content later)

Track progress in [NOW.md](./NOW.md). Starred GTM (Lemon Squeezy, Discord): [STARRED.md](./STARRED.md).
