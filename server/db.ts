/**
 * The database: opens the file, migrates it, and hands out plain functions for
 * everything the API needs. All SQL in the project lives here.
 */
import {mkdirSync} from "node:fs";
import path from "node:path";
import {DatabaseSync} from "node:sqlite";

import {
  emptyState,
  type Person,
  sanitizeState,
  type State,
} from "../shared/state.ts";

import {migrate} from "./migrations.ts";

const STATE_KEY = "state-v1";

const dataDir =
  process.env.TOASTIE_DATA_DIR ?? path.join(process.cwd(), "data");
mkdirSync(dataDir, {recursive: true});

const db = new DatabaseSync(path.join(dataDir, "toastie.db"));

// The kiosk gets switched off at the wall, so an abrupt power cut is the normal
// way this process ends. WAL survives that where the default rollback journal
// can leave a corrupt file behind. NORMAL trades the last transaction or two
// for far fewer writes to the Pi's flash, and losing one drag of a toastie is fine.
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA synchronous = NORMAL");

migrate(db);

const stmt = {
  listPeople: db.prepare(
    "SELECT name, color, grill_seconds AS grillSeconds FROM people ORDER BY pos",
  ),
  findPerson: db.prepare(
    "SELECT name, color, grill_seconds AS grillSeconds FROM people WHERE name = ?",
  ),
  insertPerson: db.prepare(
    `INSERT INTO people (name, color, grill_seconds, pos)
     VALUES (?, ?, ?, (SELECT COALESCE(MAX(pos), -1) + 1 FROM people))`,
  ),
  updatePerson: db.prepare(
    "UPDATE people SET name = ?, color = ?, grill_seconds = ? WHERE name = ?",
  ),
  deletePerson: db.prepare("DELETE FROM people WHERE name = ?"),
  getState: db.prepare("SELECT value FROM kv WHERE key = ?"),
  saveState: db.prepare(
    `INSERT INTO kv (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
  ),
};

export const listPeople = (): Person[] =>
  stmt.listPeople.all() as unknown as Person[];

export const findPerson = (name: string): Person | undefined =>
  stmt.findPerson.get(name) as unknown as Person | undefined;

export const insertPerson = ({name, color, grillSeconds}: Person) => {
  stmt.insertPerson.run(name, color, grillSeconds);
};

export const updatePerson = (oldName: string, next: Person) => {
  stmt.updatePerson.run(next.name, next.color, next.grillSeconds, oldName);
};

export const deletePerson = (name: string) => {
  stmt.deletePerson.run(name);
};

export function loadState(): State {
  const row = stmt.getState.get(STATE_KEY) as {value: string} | undefined;
  if (!row) {
    return emptyState();
  }
  try {
    return sanitizeState(JSON.parse(row.value)) ?? emptyState();
  } catch {
    return emptyState();
  }
}

export const saveState = (state: State) => {
  stmt.saveState.run(STATE_KEY, JSON.stringify(state));
};
