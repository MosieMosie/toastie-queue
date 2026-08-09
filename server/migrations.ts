/**
 * Schema migrations, applied in order and tracked in SQLite's own
 * `user_version` counter. A migration that has shipped is never edited —
 * change the schema by appending a new entry.
 */
import type {DatabaseSync} from "node:sqlite";

import {DEFAULT_GRILL_SECONDS} from "../shared/state.ts";

const MIGRATIONS = [
  `CREATE TABLE IF NOT EXISTS people (
     name  TEXT PRIMARY KEY,
     color TEXT NOT NULL,
     pos   INTEGER NOT NULL
   ) STRICT;
   CREATE TABLE IF NOT EXISTS kv (
     key   TEXT PRIMARY KEY,
     value TEXT NOT NULL
   ) STRICT;`,

  `ALTER TABLE people
     ADD COLUMN grill_seconds INTEGER NOT NULL DEFAULT ${DEFAULT_GRILL_SECONDS};`,
];

const versionOf = (db: DatabaseSync) =>
  (db.prepare("PRAGMA user_version").get() as {user_version: number})
    .user_version;

export function migrate(db: DatabaseSync) {
  const from = versionOf(db);
  const to = MIGRATIONS.length;
  if (from >= to) {
    return;
  }

  db.exec("BEGIN");
  try {
    for (const sql of MIGRATIONS.slice(from, to)) {
      db.exec(sql);
    }
    // not a parameter: PRAGMA takes literals only, and this one is ours
    db.exec(`PRAGMA user_version = ${to}`);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  console.log(`database migrated from version ${from} to ${to}`);
}
