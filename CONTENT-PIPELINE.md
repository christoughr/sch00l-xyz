# Content pipeline — per subject



Same steps for each track. **Paste 3 is per subject** (publish only that track's drafts).



| Step | AP Bio | AP Chem | SAT |

|------|--------|---------|-----|

| 1. Schema | `017` | `017` | `017` |

| 2. Original seed | `018` | `021` | TBD `022` |

| 3. Ingest PDFs | `ingest --track ap-bio` | `ingest --track ap-chem` | `ingest --track sat` |

| 4. Paste 2 | `drafts.sql` | `drafts.sql` | `drafts.sql` |

| 5. Paste 3 | publish `ord >= 100` for `ap-bio` | publish for `ap-chem` | publish for `sat` |

| 6. Polish | `polish-ap-bio-lessons.ts` | `polish-ap-chem-lessons.ts` | polish script (next) |

| 7. Deploy UI | `/study` course outline | same | same |



**AP Bio status:** polished, 111 lessons live.



**Next:** AP Chem — run `021` in Supabase, add books, ingest, publish, polish.



**Then:** SAT.



**Study flow:** Students and teachers open `/study` → pick track → expand **Course lessons** → read material → AI tutor + quizzes + practice MCQs. Not MCQ-only.


