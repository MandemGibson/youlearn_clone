import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;

// Study generation API helpers
export async function apiGenerateFlashcards(namespace: string, count = 15) {
  const res = await fetch(`http://localhost:5000/v1/generate/flashcards`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ namespace, count }),
  });
  return res.json();
}

export async function apiGenerateQuiz(
  namespace: string,
  count = 10,
  difficulty = "mixed"
) {
  const res = await fetch(`http://localhost:5000/v1/generate/quiz`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ namespace, count, difficulty }),
  });
  return res.json();
}

export async function apiGenerateSummary(
  namespace: string,
  type: "brief" | "detailed" | "executive" = "brief"
) {
  const res = await fetch(`http://localhost:5000/v1/generate/summary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ namespace, type }),
  });
  return res.json();
}

export async function apiGenerateChapters(namespace: string, maxChapters = 8) {
  const res = await fetch(`http://localhost:5000/v1/generate/chapters`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ namespace, maxChapters }),
  });
  return res.json();
}

export async function apiGenerateNotes(namespace: string) {
  const res = await fetch(`http://localhost:5000/v1/generate/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ namespace }),
  });
  return res.json();
}
