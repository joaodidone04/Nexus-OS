/**
 * NΞXUS — Health Station Backend
 * Node.js + Express + LowDB (JSON puro — zero compilação nativa)
 *
 * Rodar:  node server.js
 * Porta:  3001
 */

import express   from "express";
import cors      from "cors";
import path      from "path";
import fs        from "fs";
import { v4 as uuid } from "uuid";
import multer    from "multer";
import { Low }   from "lowdb";
import { JSONFile } from "lowdb/node";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Config ───────────────────────────────────────────────────────────────
const PORT     = process.env.PORT || 3001;
const DATA_DIR = path.join(__dirname, "data");
const IMG_DIR  = path.join(DATA_DIR, "uploads");
[DATA_DIR, IMG_DIR].forEach(d => fs.mkdirSync(d, { recursive: true }));

// ─── Database (lowdb — arquivo JSON) ──────────────────────────────────────
const adapter = new JSONFile(path.join(DATA_DIR, "nexus_health.json"));
const db = new Low(adapter, {
  diet:         [],
  workout:      [],
  exercises:    [],
  measures:     [],
  hydration:    [],
  hydra_goals:  [],
  sleep:        [],
  supplements:  [],
  supp_log:     [],
});
await db.read();

const save = () => db.write();

// ─── Helpers ──────────────────────────────────────────────────────────────
const ok  = (res, data)            => res.json({ ok: true, data });
const err = (res, msg, status=400) => res.status(status).json({ ok: false, error: msg });

function calcSleepMins(bed, wake) {
  const [bh, bm] = bed.split(":").map(Number);
  const [wh, wm] = wake.split(":").map(Number);
  let m = (wh*60+wm) - (bh*60+bm);
  return m < 0 ? m + 1440 : m;
}

// ─── Multer ───────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: IMG_DIR,
  filename: (req, file, cb) => cb(null, `${uuid()}-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ─── App ──────────────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(IMG_DIR));

// ══════════════════════════════════════════════════════════════════════════
// DIETA
// ══════════════════════════════════════════════════════════════════════════
const diet = express.Router();

diet.get("/summary", (req, res) => {
  const { profile_id, date } = req.query;
  if (!profile_id || !date) return err(res, "profile_id e date obrigatórios");
  const entries = db.data.diet.filter(e => e.profile_id === profile_id && e.date === date);
  const sum = entries.reduce((acc, e) => ({
    calories:  acc.calories  + (e.calories  || 0),
    protein_g: acc.protein_g + (e.protein_g || 0),
    carbs_g:   acc.carbs_g   + (e.carbs_g   || 0),
    fat_g:     acc.fat_g     + (e.fat_g     || 0),
  }), { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 });
  ok(res, { ...sum, entries: entries.length });
});

diet.get("/", (req, res) => {
  const { profile_id, date, from, to } = req.query;
  if (!profile_id) return err(res, "profile_id obrigatório");
  let list = db.data.diet.filter(e => e.profile_id === profile_id);
  if (date) list = list.filter(e => e.date === date);
  if (from) list = list.filter(e => e.date >= from);
  if (to)   list = list.filter(e => e.date <= to);
  ok(res, list.sort((a,b) => b.created_at.localeCompare(a.created_at)));
});

diet.post("/", async (req, res) => {
  const { profile_id, date, meal, food, calories, protein_g, carbs_g, fat_g, notes } = req.body;
  if (!profile_id || !date || !meal || !food) return err(res, "Campos obrigatórios: profile_id, date, meal, food");
  const entry = { id: uuid(), profile_id, date, meal, food, calories: calories||null, protein_g: protein_g||null, carbs_g: carbs_g||null, fat_g: fat_g||null, notes: notes||null, created_at: new Date().toISOString() };
  db.data.diet.push(entry);
  await save();
  ok(res, { id: entry.id });
});

diet.delete("/:id", async (req, res) => {
  db.data.diet = db.data.diet.filter(e => e.id !== req.params.id);
  await save();
  ok(res, { deleted: req.params.id });
});

app.use("/api/diet", diet);

// ══════════════════════════════════════════════════════════════════════════
// TREINO
// ══════════════════════════════════════════════════════════════════════════
const workout = express.Router();

workout.get("/", (req, res) => {
  const { profile_id, date, from, to } = req.query;
  if (!profile_id) return err(res, "profile_id obrigatório");
  let sessions = db.data.workout.filter(s => s.profile_id === profile_id);
  if (date) sessions = sessions.filter(s => s.date === date);
  if (from) sessions = sessions.filter(s => s.date >= from);
  if (to)   sessions = sessions.filter(s => s.date <= to);
  sessions = sessions.sort((a,b) => b.created_at.localeCompare(a.created_at));
  sessions.forEach(s => { s.exercises = db.data.exercises.filter(e => e.session_id === s.id); });
  ok(res, sessions);
});

workout.post("/", async (req, res) => {
  const { profile_id, date, type, name, duration_min, intensity, calories, notes, exercises = [] } = req.body;
  if (!profile_id || !date || !type || !name) return err(res, "Campos obrigatórios: profile_id, date, type, name");
  const sid = uuid();
  const session = { id: sid, profile_id, date, type, name, duration_min: duration_min||null, intensity: intensity||null, calories: calories||null, notes: notes||null, created_at: new Date().toISOString() };
  db.data.workout.push(session);
  exercises.forEach(ex => {
    db.data.exercises.push({ id: uuid(), session_id: sid, name: ex.name, sets: ex.sets||null, reps: ex.reps||null, weight_kg: ex.weight_kg||null, rest_sec: ex.rest_sec||null, notes: ex.notes||null });
  });
  await save();
  ok(res, { id: sid });
});

workout.delete("/:id", async (req, res) => {
  db.data.workout   = db.data.workout.filter(s => s.id !== req.params.id);
  db.data.exercises = db.data.exercises.filter(e => e.session_id !== req.params.id);
  await save();
  ok(res, { deleted: req.params.id });
});

app.use("/api/workout", workout);

// ══════════════════════════════════════════════════════════════════════════
// MEDIDAS
// ══════════════════════════════════════════════════════════════════════════
const measures = express.Router();

measures.get("/", (req, res) => {
  const { profile_id, limit = 20 } = req.query;
  if (!profile_id) return err(res, "profile_id obrigatório");
  const list = db.data.measures.filter(m => m.profile_id === profile_id)
    .sort((a,b) => b.date.localeCompare(a.date))
    .slice(0, Number(limit));
  ok(res, list);
});

measures.post("/", upload.single("photo"), async (req, res) => {
  const body = req.body;
  const { profile_id, date } = body;
  if (!profile_id || !date) return err(res, "profile_id e date obrigatórios");
  const photo_url = req.file ? `/uploads/${req.file.filename}` : null;
  const entry = {
    id: uuid(), profile_id, date,
    weight_kg: body.weight_kg||null, height_cm: body.height_cm||null, body_fat_pct: body.body_fat_pct||null,
    chest_cm: body.chest_cm||null, waist_cm: body.waist_cm||null, hip_cm: body.hip_cm||null,
    arm_cm: body.arm_cm||null, thigh_cm: body.thigh_cm||null, calf_cm: body.calf_cm||null,
    photo_url, notes: body.notes||null, created_at: new Date().toISOString()
  };
  db.data.measures.push(entry);
  await save();
  ok(res, { id: entry.id, photo_url });
});

measures.delete("/:id", async (req, res) => {
  const row = db.data.measures.find(m => m.id === req.params.id);
  if (row?.photo_url) {
    const full = path.join(IMG_DIR, path.basename(row.photo_url));
    if (fs.existsSync(full)) fs.unlinkSync(full);
  }
  db.data.measures = db.data.measures.filter(m => m.id !== req.params.id);
  await save();
  ok(res, { deleted: req.params.id });
});

app.use("/api/measures", measures);

// ══════════════════════════════════════════════════════════════════════════
// HIDRATAÇÃO
// ══════════════════════════════════════════════════════════════════════════
const hydration = express.Router();

hydration.get("/", (req, res) => {
  const { profile_id, date } = req.query;
  if (!profile_id || !date) return err(res, "profile_id e date obrigatórios");
  const entries = db.data.hydration.filter(h => h.profile_id === profile_id && h.date === date)
    .sort((a,b) => a.time.localeCompare(b.time));
  const goal_row = db.data.hydra_goals.find(g => g.profile_id === profile_id);
  const total_ml = entries.reduce((s, e) => s + e.amount_ml, 0);
  ok(res, { entries, total_ml, goal_ml: goal_row?.goal_ml || 2500 });
});

hydration.post("/", async (req, res) => {
  const { profile_id, date, time, amount_ml, type = "agua" } = req.body;
  if (!profile_id || !date || !time || !amount_ml) return err(res, "Campos obrigatórios: profile_id, date, time, amount_ml");
  const entry = { id: uuid(), profile_id, date, time, amount_ml: Number(amount_ml), type, created_at: new Date().toISOString() };
  db.data.hydration.push(entry);
  await save();
  ok(res, { id: entry.id });
});

hydration.delete("/:id", async (req, res) => {
  db.data.hydration = db.data.hydration.filter(h => h.id !== req.params.id);
  await save();
  ok(res, { deleted: req.params.id });
});

hydration.put("/goal", async (req, res) => {
  const { profile_id, goal_ml } = req.body;
  if (!profile_id || !goal_ml) return err(res, "profile_id e goal_ml obrigatórios");
  const idx = db.data.hydra_goals.findIndex(g => g.profile_id === profile_id);
  if (idx >= 0) db.data.hydra_goals[idx].goal_ml = Number(goal_ml);
  else db.data.hydra_goals.push({ profile_id, goal_ml: Number(goal_ml) });
  await save();
  ok(res, { goal_ml });
});

app.use("/api/hydration", hydration);

// ══════════════════════════════════════════════════════════════════════════
// SONO
// ══════════════════════════════════════════════════════════════════════════
const sleep = express.Router();

sleep.get("/avg", (req, res) => {
  const { profile_id, days = 7 } = req.query;
  if (!profile_id) return err(res, "profile_id obrigatório");
  const list = db.data.sleep.filter(s => s.profile_id === profile_id)
    .sort((a,b) => b.date.localeCompare(a.date))
    .slice(0, Number(days));
  if (!list.length) return ok(res, { avg_duration_min: null, avg_quality: null });
  const avg_duration_min = list.reduce((s,l) => s + (l.duration_min||0), 0) / list.length;
  const avg_quality = list.filter(l=>l.quality).reduce((s,l,_,a) => s + l.quality/a.length, 0);
  ok(res, { avg_duration_min: Math.round(avg_duration_min*10)/10, avg_quality: Math.round(avg_quality*10)/10 });
});

sleep.get("/", (req, res) => {
  const { profile_id, limit = 14 } = req.query;
  if (!profile_id) return err(res, "profile_id obrigatório");
  ok(res, db.data.sleep.filter(s => s.profile_id === profile_id)
    .sort((a,b) => b.date.localeCompare(a.date))
    .slice(0, Number(limit)));
});

sleep.post("/", async (req, res) => {
  const { profile_id, date, bed_time, wake_time, quality, deep_sleep_pct, notes } = req.body;
  if (!profile_id || !date || !bed_time || !wake_time) return err(res, "Campos obrigatórios: profile_id, date, bed_time, wake_time");
  const duration_min = calcSleepMins(bed_time, wake_time);
  const entry = { id: uuid(), profile_id, date, bed_time, wake_time, duration_min, quality: quality||null, deep_sleep_pct: deep_sleep_pct||null, notes: notes||null, created_at: new Date().toISOString() };
  db.data.sleep.push(entry);
  await save();
  ok(res, { id: entry.id, duration_min });
});

sleep.delete("/:id", async (req, res) => {
  db.data.sleep = db.data.sleep.filter(s => s.id !== req.params.id);
  await save();
  ok(res, { deleted: req.params.id });
});

app.use("/api/sleep", sleep);

// ══════════════════════════════════════════════════════════════════════════
// SUPLEMENTOS
// ══════════════════════════════════════════════════════════════════════════
const supps = express.Router();

supps.get("/log", (req, res) => {
  const { profile_id, date } = req.query;
  if (!profile_id || !date) return err(res, "profile_id e date obrigatórios");
  ok(res, db.data.supp_log.filter(l => l.profile_id === profile_id && l.date === date));
});

supps.post("/log", async (req, res) => {
  const { supplement_id, profile_id, date, time } = req.body;
  if (!supplement_id || !profile_id || !date || !time) return err(res, "Campos obrigatórios");
  const entry = { id: uuid(), supplement_id, profile_id, date, time, created_at: new Date().toISOString() };
  db.data.supp_log.push(entry);
  await save();
  ok(res, { id: entry.id });
});

supps.get("/", (req, res) => {
  const { profile_id } = req.query;
  if (!profile_id) return err(res, "profile_id obrigatório");
  ok(res, db.data.supplements.filter(s => s.profile_id === profile_id)
    .sort((a,b) => a.name.localeCompare(b.name)));
});

supps.post("/", async (req, res) => {
  const { profile_id, name, dose, times, with_food = false, notes } = req.body;
  if (!profile_id || !name || !dose || !times) return err(res, "Campos obrigatórios");
  const entry = { id: uuid(), profile_id, name, dose, times, with_food: !!with_food, active: true, notes: notes||null, created_at: new Date().toISOString() };
  db.data.supplements.push(entry);
  await save();
  ok(res, { id: entry.id });
});

supps.put("/:id", async (req, res) => {
  const idx = db.data.supplements.findIndex(s => s.id === req.params.id);
  if (idx < 0) return err(res, "Não encontrado", 404);
  db.data.supplements[idx] = { ...db.data.supplements[idx], ...req.body };
  await save();
  ok(res, { updated: req.params.id });
});

supps.delete("/:id", async (req, res) => {
  db.data.supplements = db.data.supplements.filter(s => s.id !== req.params.id);
  db.data.supp_log    = db.data.supp_log.filter(l => l.supplement_id !== req.params.id);
  await save();
  ok(res, { deleted: req.params.id });
});

app.use("/api/supplements", supps);

// ─── Health check ─────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => ok(res, { status: "ONLINE", version: "2.0.0" }));

// ─── Start ────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  NΞXUS Health API — ONLINE`);
  console.log(`  http://localhost:${PORT}/api/health\n`);
});