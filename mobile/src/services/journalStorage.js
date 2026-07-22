import AsyncStorage from '@react-native-async-storage/async-storage';

const JOURNAL_ENTRIES_KEY = 'echo_journal_entries';

async function readEntries() {
  const raw = await AsyncStorage.getItem(JOURNAL_ENTRIES_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to parse stored journal entries:', error);
    return [];
  }
}

async function writeEntries(entries) {
  await AsyncStorage.setItem(JOURNAL_ENTRIES_KEY, JSON.stringify(entries));
}

export async function getJournalEntries() {
  return readEntries();
}

export async function saveJournalEntry(entry) {
  const entries = await readEntries();
  const entryWithMeta = {
    ...entry,
    id: entry.id || `${Date.now()}`,
    createdAt: entry.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const nextEntries = [
    entryWithMeta,
    ...entries.filter((item) => item.id !== entryWithMeta.id),
  ];

  await writeEntries(nextEntries);
  return entryWithMeta;
}

export async function deleteJournalEntry(entryId) {
  const entries = await readEntries();
  const nextEntries = entries.filter((entry) => entry.id !== entryId);
  await writeEntries(nextEntries);
}
