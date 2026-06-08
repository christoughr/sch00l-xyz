#!/usr/bin/env node
/** Seed college-discrete-math. node scripts/seed-college-discrete-math.mjs */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()])
      process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

const TRACK = "college-discrete-math";
const UNITS = [
  [1, "Logic & proofs", "Propositions, quantifiers, and proof techniques"],
  [2, "Sets & functions", "Set algebra, relations, and cardinality"],
  [3, "Combinatorics", "Counting rules, permutations, and combinations"],
  [4, "Graph theory", "Vertices, edges, trees, and traversals"],
  [5, "Recurrence & algorithms", "Induction, recurrences, and complexity basics"],
];

const LESSONS = [
  [1, 1, "Propositional logic", ["Translate statements with ∧, ∨, ¬, →, ↔", "Build truth tables for compound statements"], "# Logic\n\nImplication is false only when the hypothesis is true and conclusion false."],
  [1, 2, "Predicates and quantifiers", ["Read ∀ and ∃ statements", "Negate quantified statements"], "# Quantifiers\n\n¬(∀x P(x)) ≡ ∃x ¬P(x); order of quantifiers matters."],
  [1, 3, "Proof methods", ["Write direct, contrapositive, and contradiction proofs", "Use mathematical induction"], "# Proofs\n\nInduction: base case + inductive step ⇒ ∀n P(n)."],
  [2, 1, "Sets and operations", ["Use ∪, ∩, complement, and difference", "Prove set identities with membership arguments"], "# Sets\n\nDouble inclusion is the standard way to prove A = B."],
  [2, 2, "Relations and functions", ["Identify injective, surjective, and bijective maps", "Compose functions and find inverses"], "# Functions\n\nBijection ⇔ inverse exists. Composition is associative but not commutative."],
  [2, 3, "Sequences and summations", ["Work with Σ notation and closed forms", "Telescope sums when possible"], "# Sums\n\nIndex shifts and splitting sums are routine algebra tools."],
  [3, 1, "Counting principles", ["Apply the product and sum rules", "Use permutations and combinations"], "# Counting\n\nOrder matters → permutation; order irrelevant → combination."],
  [3, 2, "Binomial and multinomial coefficients", ["Expand (x+y)^n and interpret coefficients", "Count multisets and distributions"], "# Binomial\n\nC(n,k) counts k-subsets of an n-set."],
  [3, 3, "Inclusion–exclusion", ["Count unions with |A∪B| formula", "Extend to three or more sets"], "# PIE\n\nSubtract overlaps once, add triple overlaps back, etc."],
  [4, 1, "Graph basics", ["Define degree, path, cycle, and connectivity", "Prove the handshaking lemma"], "# Graphs\n\nΣ deg(v) = 2|E| — every edge contributes 2 to total degree."],
  [4, 2, "Trees and spanning trees", ["Characterize trees (n−1 edges, no cycles)", "Use Cayley-style counting ideas at intro level"], "# Trees\n\nA tree on n vertices has exactly n−1 edges."],
  [4, 3, "Euler and Hamilton paths", ["Apply necessary conditions for Euler circuits", "Distinguish Hamiltonian from Eulerian problems"], "# Traversals\n\nEuler: all vertices even degree (undirected). Hamilton is generally harder."],
  [5, 1, "Recurrence relations", ["Solve linear homogeneous recurrences", "Find characteristic roots"], "# Recurrences\n\naₙ = c₁aₙ₋₁ + c₂aₙ₋₂ → characteristic equation r² − c₁r − c₂ = 0."],
  [5, 2, "Algorithmic thinking", ["Describe greedy and divide-and-conquer sketches", "Compare growth of basic functions"], "# Algorithms\n\nO(n log n) sorts beat O(n²) for large n—know when each idea applies."],
  [5, 3, "Course review strategy", ["Drill proof templates and counting setups", "Tag problem types: logic, sets, PIE, graphs"], "# Review\n\nDiscrete exams mix proof style with computation—practice both under time."]];

async function main() {
  loadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Add SUPABASE_SERVICE_ROLE_KEY to .env.local");
    process.exit(1);
  }

  const supabase = createClient(url, key);

  const { data: existing } = await supabase
    .from("course_units")
    .select("id")
    .eq("track_id", TRACK);
  if (existing?.length) {
    for (const u of existing) {
      await supabase.from("course_lessons").delete().eq("unit_id", u.id);
    }
    await supabase.from("course_units").delete().eq("track_id", TRACK);
  }

  const unitIds = {};
  for (const [ord, title, description] of UNITS) {
    const { data, error } = await supabase
      .from("course_units")
      .insert({ track_id: TRACK, ord, title, description })
      .select("id")
      .single();
    if (error) throw error;
    unitIds[ord] = data.id;
  }

  for (const [unitOrd, lessonOrd, title, objectives, body] of LESSONS) {
    const { error } = await supabase.from("course_lessons").insert({
      unit_id: unitIds[unitOrd],
      ord: lessonOrd,
      title,
      objectives,
      body_markdown: body,
      review_status: "published",
      source_pdf_name: "sch00l-original-oer-aligned",
    });
    if (error) throw error;
  }

  console.log("Seeded", TRACK, "—", LESSONS.length, "lessons");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
