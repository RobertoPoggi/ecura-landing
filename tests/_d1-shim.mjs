// Simulatore minimo di D1 su node:sqlite, per i test (nessuna rete, nessun Cloudflare).
import { DatabaseSync } from 'node:sqlite'
import fs from 'node:fs'

export function nuovoDb(migrazioni = ['migrations/0010_claim_blocks.sql']) {
  const raw = new DatabaseSync(':memory:')
  for (const m of migrazioni) raw.exec(fs.readFileSync(m, 'utf8'))
  const stmt = sql => {
    let args = []
    const o = {
      bind: (...a) => { args = a; return o },
      first: async () => raw.prepare(sql).get(...args) ?? null,
      all: async () => ({ results: raw.prepare(sql).all(...args) }),
      run: async () => { raw.prepare(sql).run(...args); return { success: true } },
      _exec: () => raw.prepare(sql).run(...args),
    }
    return o
  }
  return {
    raw,
    prepare: stmt,
    batch: async list => { raw.exec('BEGIN'); try { for (const s of list) s._exec(); raw.exec('COMMIT') } catch (e) { raw.exec('ROLLBACK'); throw e } return list.map(() => ({ success: true })) },
  }
}
