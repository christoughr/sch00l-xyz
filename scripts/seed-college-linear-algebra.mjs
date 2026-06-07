#!/usr/bin/env node
/** Seed college-linear-algebra. node scripts/seed-college-linear-algebra.mjs */
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

const TRACK = "college-linear-algebra";
const UNITS = [
  [1, "Systems & matrices", "Gaussian elimination, RREF, and matrix algebra"],
  [2, "Vector spaces", "Subspaces, basis, dimension, and linear independence"],
  [3, "Linear transformations", "Matrix representations, kernel, and image"],
  [4, "Determinants & eigenvalues", "Det properties, characteristic polynomial, diagonalization"],
  [5, "Applications & review", "Markov chains, least squares, and exam synthesis"],
];

const LESSONS = [
  [1, 1, "Solving linear systems", ["Use row operations to reach RREF", "Interpret solution types: unique, none, infinite"], "# Systems\n\nAugmented matrix [A|b]. Pivot columns → basic variables; free columns → parameters."],
  [1, 2, "Matrix operations", ["Add, scale, and multiply compatible matrices", "Know when AB ≠ BA"], "# Matrix algebra\n\n(AB)C = A(BC); A(B+C) = AB+AC. Dimension mismatch blocks multiplication."],
  [1, 3, "Inverse matrices", ["Find A⁻¹ via row reduction when it exists", "Solve Ax = b with x = A⁻¹b when invertible"], "# Inverse\n\nSquare matrix invertible iff RREF is I iff det ≠ 0 (for square case later)."],
  [2, 1, "Span and linear independence", ["Test if vectors span a subspace", "Identify dependence relations"], "# Independence\n\n{c₁v₁ + … + c_kv_k = 0} only trivial solution → independent set."],
  [2, 2, "Basis and dimension", ["Extract a basis from spanning sets", "State dim(col A) and dim(null A)"], "# Basis\n\nMinimal spanning set = maximal independent set. Dimension = #vectors in any basis."],
  [2, 3, "Rank-nullity theorem", ["Relate rank(A) and nullity(A)", "Connect to solutions of Ax=0"], "# Rank-nullity\n\nrank A + nullity A = n for A ∈ ℝ^{m×n} with n columns."],
  [3, 1, "Linear transformations", ["Verify T(u+v) = T(u)+T(v) and T(cu)=cT(u)", "Find standard matrix from T(e_i)"], "# Transformations\n\nEvery linear T: ℝ^n→ℝ^m has matrix A with T(x)=Ax."],
  [3, 2, "Kernel and image", ["Compute bases for ker(T) and im(T)", "Relate to column space and null space"], "# Kernel & image\n\nker(A) = solutions to Ax=0; im(A) = col(A)."],
  [3, 3, "Change of basis", ["Convert coordinates between bases", "Use transition matrices"], "# Change of basis\n\n[x]_B = P [x]_C when P columns are C-coordinates of B-basis vectors."],
  [4, 1, "Determinants", ["Compute 2×2 and 3×3 determinants", "Use row ops and det properties"], "# Determinant\n\nRow swap flips sign; scaling row scales det; det(AB)=det(A)det(B)."],
  [4, 2, "Eigenvalues and eigenvectors", ["Solve det(A−λI)=0", "Find eigenvectors for each eigenvalue"], "# Eigen\n\nA v = λ v. Diagonalize when enough independent eigenvectors exist."],
  [4, 3, "Diagonalization and powers", ["Write A = PDP⁻¹", "Compute A^k efficiently"], "# Diagonalization\n\nA^k = PD^k P⁻¹ when D is diagonal of eigenvalues."],
  [5, 1, "Orthogonality and projections", ["Use dot product and orthogonal complements", "Project vectors onto subspaces"], "# Projection\n\nLeast squares: normal equations A^T A x = A^T b for inconsistent systems."],
  [5, 2, "Gram-Schmidt process", ["Orthogonalize a basis", "Produce QR-style orthonormal sets"], "# Gram-Schmidt\n\nSubtract projections onto previous vectors; normalize at the end if needed."],
  [5, 3, "Mixed review", ["Tag problem types: RREF, eigen, transform", "Build a 10-problem timed set"], "# Review\n\nLinear algebra exams mix computation and short proofs—state the theorem you invoke."]];

async function main() {
  loadEnv();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: existing } = await supabase.from("course_units").select("id").eq("track_id", TRACK);
  if (existing?.length) {
    for (const u of existing) await supabase.from("course_lessons").delete().eq("unit_id", u.id);
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
