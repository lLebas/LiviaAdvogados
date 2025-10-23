import fs from 'fs'
import path from 'path'

const dataFile = path.join(process.cwd(), 'data', 'proposals.json')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
let supabase = null
if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    // dynamic import to avoid module-not-found during local dev if not installed
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createClient } = require('@supabase/supabase-js')
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
  } catch (err) {
    console.warn('supabase client not available, falling back to file storage')
    supabase = null
  }
}

async function readData() {
  try {
    const raw = await fs.promises.readFile(dataFile, 'utf8')
    return JSON.parse(raw || '[]')
  } catch (e) {
    return []
  }
}

async function writeData(arr) {
  await fs.promises.mkdir(path.dirname(dataFile), { recursive: true })
  await fs.promises.writeFile(dataFile, JSON.stringify(arr, null, 2), 'utf8')
}

// Remove items older than 7 days (lazy cleanup)
function isOlderThan7Days(iso) {
  if (!iso) return false
  const then = new Date(iso)
  const diff = Date.now() - then.getTime()
  return diff > 7 * 24 * 60 * 60 * 1000
}

export default async function handler(req, res) {
  // If supabase configured, use it; otherwise fallback to file-based storage
  if (supabase) {
    if (req.method === 'GET') {
      // lazy cleanup: delete rows older than 7 days
      try {
        await supabase.from('propostas').delete().lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      } catch (e) {
        // ignore cleanup errors
        console.warn('supabase cleanup warning', e.message || e)
      }
      const { data, error } = await supabase.from('propostas').select('*').order('created_at', { ascending: false })
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json(data || [])
    }

    if (req.method === 'POST') {
      try {
        const body = req.body
        const payload = { ...body, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        const { data, error } = await supabase.from('propostas').insert(payload).select()
        if (error) return res.status(500).json({ error: error.message })
        return res.status(201).json(data && data[0] ? data[0] : payload)
      } catch (err) {
        console.error('supabase save error', err)
        return res.status(500).json({ error: 'failed to save' })
      }
    }

    return res.status(405).end('Method Not Allowed')
  }

  // FILE-BASED fallback
  if (req.method === 'GET') {
    const items = await readData()
    // cleanup older than 7 days
    const filtered = items.filter(i => !isOlderThan7Days(i.createdAt))
    if (filtered.length !== items.length) {
      try { await writeData(filtered) } catch (e) { console.warn('cleanup write failed', e) }
    }
    return res.status(200).json(filtered)
  }

  if (req.method === 'POST') {
    try {
      const body = req.body
      const items = await readData()
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2,8)
      const item = { id, ...body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      items.push(item)
      await writeData(items)
      return res.status(201).json(item)
    } catch (err) {
      console.error('save error', err)
      return res.status(500).json({ error: 'failed to save' })
    }
  }

  return res.status(405).end('Method Not Allowed')
}
