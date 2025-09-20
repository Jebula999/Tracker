// Helpers for saving / loading from localStorage

const STORAGE_KEY = "tracker-pwa-data";
const JOURNAL_KEY = "tracker-pwa-journal";

export function loadEntries() {
  const s = localStorage.getItem(STORAGE_KEY);
  if (!s) return [];
  try {
    return JSON.parse(s);
  } catch (e) {
    console.error("Error parsing tracker data:", e);
    return [];
  }
}

export function saveEntry(entry) {
  const all = loadEntries();
  all.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function loadJournal() {
  const s = localStorage.getItem(JOURNAL_KEY);
  if (!s) return [];
  try {
    return JSON.parse(s);
  } catch (e) {
    console.error("Error parsing journal data:", e);
    return [];
  }
}

export function saveJournal(journalEntry) {
  const all = loadJournal();
  all.unshift(journalEntry);
  localStorage.setItem(JOURNAL_KEY, JSON.stringify(all));
}

export function deleteJournalEntry(timestamp) {
  let all = loadJournal();
  all = all.filter(entry => entry.timestamp !== timestamp);
  localStorage.setItem(JOURNAL_KEY, JSON.stringify(all));
}

export function deleteTrackEntry(timestamp) {
  let all = loadEntries();
  all = all.filter(entry => entry.timestamp !== timestamp);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function deleteFilteredTrackEntries(timestamps) {
  let all = loadEntries();
  all = all.filter(entry => !timestamps.includes(entry.timestamp));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}
