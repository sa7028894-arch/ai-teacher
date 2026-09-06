# 👩‍🏫 Priya — AI Teacher

An AI teacher that plans, explains, questions, and adapts — not a chatbot bolted onto a document.

Built for **AI Innovation Hackathon 2026**, hosted by Bharat Academix.

![Next.js](https://img.shields.io/badge/Next.js-black?logo=next.js) ![Groq](https://img.shields.io/badge/Groq-orange) ![License-MIT](https://img.shields.io/badge/License-MIT-green)

**Try it live -> https://ai-teacher-ot48.onrender.com/teach.html**

## What this is

Most "AI in education" tools are a chatbot answering questions about a textbook: same explanation, same order, for every student. This isn't that.

Priya takes an uploaded document (or a plain topic) and delivers a real teaching session: it plans a lesson, teaches it segment by segment through a narrated avatar, asks questions mid-lesson, and -- on every answer -- an LLM call decides live what happens next:

| Move | What it means |
|---|---|
| continue | Answer was solid -- move to the next segment as planned |
| reexplain | Wrong understanding of this concept -- re-taught with a new analogy and a new example, never a repeat |
| simplify_remaining | Struggling -- the rest of the lesson steps down a difficulty level |
| advance_remaining | Coasting -- the rest of the lesson steps up a difficulty level |

The model has to name the specific misconception before it's allowed to move on -- that's what keeps reexplain honest: it has to actually be a different mental model, not the same sentence said slower.

The right-hand rail renders live lesson progress and a running score, so the shape of the adapted path is visible as it happens.

## Table of contents

- Quickstart
- How it works
- Architecture
- Project structure
- Design decisions
- What's deliberately left out
- Extensibility
- License

## Quickstart

Needs a Groq API key (starts with gsk_, free tier available at console.groq.com).

Clone and install:
```bash
git clone https://github.com/sa7028894-arch/ai-teacher.git
cd ai-teacher-app
npm install
```

GROQ_API_KEY=your_groq_key_here

Run it:
```bash
npm run dev
```

Then open http://localhost:3000/teach.html -- not the bare root URL, that's Next.js's default page; the app itself lives at /teach.html.

## How it works

1. The learner uploads material (.txt/.pdf/.docx) or types a topic, and sets level, time available, and language.
2. An outline call plans N segments (concept / example / question / synthesis), sized to the time budget.
3. Each segment is generated on demand, one at a time -- grounded in the most relevant chunks of the uploaded material (simple keyword-overlap retrieval, no vector DB), narrated aloud via the Web Speech API, captioned on screen, and illustrated with a Groq-generated inline SVG when a subject-appropriate visual helps.
4. When a segment includes a question, the student's answer is graded live, and the move table above decides what happens next -- possibly inserting a fresh re-explanation segment on the spot.
5. After the last segment: a 4-question final quiz, then a generated learning report (score, strengths, weak areas, revision notes, next-topic recommendation).
6. The learner's history (topics, scores, recurring weak/strong concepts) persists across visits in the browser's localStorage.

There is no server-side session store -- the backend is a stateless proxy; all lesson state lives in the browser for the duration of the session.

## Architecture

The API key never reaches the browser -- it lives in .env.local server-side, and teach.html only ever talks to our own /api/teach route.

## Project structure
ai-teacher-app/
app/
api/
teach/
route.js (Groq proxy -- keeps the API key server-side)
layout.js (default Next.js app shell)
page.js (default Next.js root page; app itself lives at /teach.html)
public/
teach.html (the entire frontend: HTML/CSS/JS, no build step)
.env.local (GROQ_API_KEY -- never committed, see .gitignore)
.gitignore
package.json
LICENSE
README.md

## Design decisions

Why a plain HTML file instead of a React frontend? The teaching UI (avatar, captions, lesson stage) is direct DOM manipulation with no component tree worth abstracting yet -- a single dependency-free file kept iteration fast and kept the whole app inspectable in one place.

Why segment-by-segment generation instead of planning the whole lesson upfront? Generating one segment at a time is what makes real adaptation possible -- a reexplain or difficulty shift can insert new content mid-lesson, which a single upfront lesson plan couldn't do.

Why force a misconception name before re-teaching? Without it, a model can just reword the same explanation and call that "adaptive." Requiring a named misconception is what keeps reexplain genuinely different from continue.

## What's deliberately left out:-

- No accounts or cross-device sync -- localStorage is per-browser by design; scope stayed on the teaching loop itself, not auth infrastructure.
- No real vector database for material grounding -- retrieval is keyword-overlap scoring over chunked text, disclosed rather than dressed up as full RAG. A drop-in embeddings upgrade is possible but out of scope for this build.
- No exported video file -- the lesson plays live (animated avatar + synced TTS) rather than rendering to .mp4; reliable in-browser audio capture isn't consistent enough across browsers to promise. Screen-recording a live session is the intended path to a demo video.
- 7-day plan mode generates the multi-day outline and lets the learner start Day 1 as a normal session; it doesn't yet auto-schedule days 2-7.

## Extensibility:-

The four-move contract (continue / reexplain / simplify_remaining / advance_remaining) and the JSON schemas in app/api/teach/route.js aren't specific to any one subject -- they're driven entirely by the outline and segment prompts in public/teach.html. Retargeting the retrieval step at a real vector store, or swapping the model provider (the backend already isolates all Groq-specific code to one route file), wouldn't require touching the teaching loop itself.

## License:-

MIT -- see LICENSE.
