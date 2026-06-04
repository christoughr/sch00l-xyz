-- AP Biology course outline (original sch00l content; College Board unit alignment)
-- Run after 017. Safe to re-run: clears prior ap-bio seed.

delete from public.course_lessons
where unit_id in (select id from public.course_units where track_id = 'ap-bio');

delete from public.course_units where track_id = 'ap-bio';

insert into public.course_units (track_id, ord, title, description) values
  ('ap-bio', 1, 'Cells & organelles', 'Structure, membrane transport, and cellular energetics'),
  ('ap-bio', 2, 'Genetics & heredity', 'DNA, gene expression, and inheritance patterns'),
  ('ap-bio', 3, 'Evolution', 'Natural selection, phylogeny, and population genetics'),
  ('ap-bio', 4, 'Ecology', 'Ecosystems, populations, and conservation'),
  ('ap-bio', 5, 'AP exam prep', 'Claim-evidence-reasoning, FRQ strategies, and review');

-- Unit 1: Cells
insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 1, 'Cell structure and organelles',
  '["Identify major organelles and their functions","Connect structure to function in eukaryotic cells"]'::jsonb,
  E'# Cell structure\n\nCells are the basic unit of life. **Prokaryotes** lack a nucleus; **eukaryotes** compartmentalize reactions in membrane-bound organelles.\n\n| Organelle | Role |\n|-----------|------|\n| Nucleus | Stores DNA; controls gene expression |\n| Mitochondria | Aerobic ATP production |\n| Chloroplast | Photosynthesis (plants) |\n| Ribosomes | Protein synthesis |\n| ER / Golgi | Protein processing and shipping |\n\n**Study tip:** For AP-style questions, link *structure → function* in one sentence (CER).',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-bio' and u.ord = 1;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 2, 'Membrane transport',
  '["Compare passive and active transport","Predict water movement in hypertonic vs hypotonic solutions"]'::jsonb,
  E'# Membrane transport\n\nThe phospholipid bilayer is selectively permeable. **Diffusion** and **osmosis** move substances down gradients without ATP. **Active transport** uses proteins and energy to move against gradients.\n\n- **Hypertonic:** water exits the cell → may shrink\n- **Hypotonic:** water enters → may lyse (animal cells)\n\nPractice explaining *why* using water potential vocabulary.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-bio' and u.ord = 1;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 3, 'Enzymes and cellular energetics',
  '["Describe enzyme specificity and denaturation","Outline ATP role in metabolism"]'::jsonb,
  E'# Enzymes and ATP\n\nEnzymes lower activation energy by binding substrates at the **active site**. Temperature and pH outside optimal ranges can **denature** shape and stop function.\n\n**ATP** is the cell''s energy currency: hydrolysis drives endergonic steps in glycolysis, cellular respiration, and active transport.\n\nLink to lab skills: explain how changing temperature might affect reaction rate in an enzyme assay.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-bio' and u.ord = 1;

-- Unit 2: Genetics
insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 1, 'DNA structure and replication',
  '["Summarize semiconservative replication","Name key enzymes in replication"]'::jsonb,
  E'# DNA and replication\n\nDNA is a double helix: antiparallel strands, complementary base pairing (A–T, G–C). **Semiconservative replication** means each new double helix has one parental and one new strand.\n\nKey enzymes: helicase (unwinds), primase (RNA primers), DNA polymerase (adds nucleotides), ligase (joins Okazaki fragments on the lagging strand).',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-bio' and u.ord = 2;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 2, 'Gene expression',
  '["Outline transcription and translation","Explain how mutations can change phenotype"]'::jsonb,
  E'# Central dogma\n\n**DNA → RNA → protein.** Transcription produces mRNA in the nucleus; translation builds polypeptides on ribosomes using codons.\n\nMutations (point, frameshift, regulatory) can alter protein structure or expression level—connect genotype to phenotype with a short CER chain.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-bio' and u.ord = 2;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 3, 'Mendelian inheritance',
  '["Set up Punnett squares for monohybrid crosses","Interpret pedigrees for dominant/recessive traits"]'::jsonb,
  E'# Inheritance\n\nAlleles segregate during meiosis. A **heterozygote** carries two different alleles; phenotype depends on dominance, codominance, or incomplete dominance.\n\nExample: Tt × tt → 1:1 tall:short phenotypic ratio if T is dominant.\n\nAlways define **genotype vs phenotype** in FRQ answers.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-bio' and u.ord = 2;

-- Unit 3: Evolution
insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 1, 'Natural selection',
  '["State conditions for evolution by natural selection","Give examples of selection pressures"]'::jsonb,
  E'# Natural selection\n\nVariation exists; more offspring are produced than survive; traits that improve survival/reproduction increase in frequency.\n\nSelection acts on **phenotype**, not directly on genotype. Connect to antibiotic resistance or camouflage as class examples.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-bio' and u.ord = 3;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 2, 'Population genetics',
  '["Use Hardy-Weinberg as a null model","List violations that cause allele frequency change"]'::jsonb,
  E'# Hardy-Weinberg\n\np² + 2pq + q² = 1 for a diploid population under ideal conditions: large N, random mating, no mutation/migration/selection.\n\nReal populations violate these—**evolution is occurring** when allele frequencies change across generations.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-bio' and u.ord = 3;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 3, 'Phylogeny and speciation',
  '["Read simple cladograms","Contrast allopatric vs sympatric speciation"]'::jsonb,
  E'# Phylogeny\n\nCladograms show relative relatedness from shared derived characters. **Speciation** can follow geographic isolation (allopatric) or reproductive barriers in the same area (sympatric).\n\nAvoid memorizing trees—practice explaining *what evidence* supports a branch.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-bio' and u.ord = 3;

-- Unit 4: Ecology
insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 1, 'Energy flow and trophic levels',
  '["Explain why energy transfer is inefficient","Sketch a food web vs chain"]'::jsonb,
  E'# Energy in ecosystems\n\nRoughly **10%** of energy transfers to the next trophic level; most is lost as heat during metabolism. This limits food chain length.\n\nPrimary producers fix carbon; consumers transfer biomass upward with decreasing available energy.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-bio' and u.ord = 4;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 2, 'Population ecology',
  '["Interpret logistic growth curves","Define carrying capacity"]'::jsonb,
  E'# Populations\n\nExponential growth occurs when resources are abundant; **logistic growth** slows as N approaches **carrying capacity (K)**.\n\nDensity-dependent factors (competition, disease) vs independent factors (storms) shape growth differently.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-bio' and u.ord = 4;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 3, 'Community and conservation',
  '["Describe niche and competitive exclusion","Give examples of conservation strategies"]'::jsonb,
  E'# Communities\n\nSpecies interact as predator/prey, mutualists, or competitors. **Competitive exclusion** suggests two species cannot occupy the same niche indefinitely.\n\nConservation: habitat corridors, protected areas, monitoring invasive species—tie to human impact data when writing FRQs.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-bio' and u.ord = 4;

-- Unit 5: Exam prep
insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 1, 'Claim-Evidence-Reasoning (CER)',
  '["Write a one-sentence claim","Support with data and biological reasoning"]'::jsonb,
  E'# CER for AP Bio FRQs\n\n1. **Claim** — direct answer\n2. **Evidence** — data from passage or graph\n3. **Reasoning** — link evidence to biological principle\n\nScorers reward precise vocabulary and logical links, not length.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-bio' and u.ord = 5;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 2, 'MCQ strategies',
  '["Eliminate distractors using units and magnitude","Manage pacing on long science sections"]'::jsonb,
  E'# MCQ strategy\n\nRead the **last sentence first** to know what is asked. Cross out answers with wrong units or impossible direction of change.\n\nMark and return to lengthy graph items; secure easy points first.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-bio' and u.ord = 5;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 3, 'Full review checklist',
  '["Build a personal weak-topic list","Plan practice tests and error log"]'::jsonb,
  E'# Review checklist\n\n- Cells: transport, enzymes, respiration/photosynthesis overview\n- Genetics: replication, expression, crosses\n- Evolution: selection, HW, trees\n- Ecology: energy, populations, human impact\n\nPair each weak topic with one **practice MCQ block** and one **tutor session** on sch00l.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-bio' and u.ord = 5;
