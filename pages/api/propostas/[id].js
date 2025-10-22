import fs from 'fs'
import path from 'path'

const dataFile = path.join(process.cwd(), 'data', 'proposals.json')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
let supabase = null
if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    // dynamic import to avoid module-not-found
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

export default async function handler(req, res) {
  const { id } = req.query

  if (supabase) {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('propostas').select('*').eq('id', id).limit(1)
      if (error) return res.status(500).json({ error: error.message })
      if (!data || data.length === 0) return res.status(404).json({ error: 'not found' })
      return res.status(200).json(data[0])
    }

    if (req.method === 'PUT') {
      const body = req.body
      const { data, error } = await supabase.from('propostas').update({ ...body, updated_at: new Date().toISOString() }).eq('id', id).select()
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json(data && data[0] ? data[0] : {})
    }

    if (req.method === 'DELETE') {
      const { error } = await supabase.from('propostas').delete().eq('id', id)
      if (error) return res.status(500).json({ error: error.message })
      return res.status(204).end()
    }

    return res.status(405).end('Method Not Allowed')
  }

  // FILE fallback
  const items = await readData()
  const idx = items.findIndex(i => i.id === id)
  if (idx === -1) return res.status(404).json({ error: 'not found' })

  if (req.method === 'GET') {
    return res.status(200).json(items[idx])
  }

  if (req.method === 'PUT') {
    const body = req.body
    items[idx] = { ...items[idx], ...body, updatedAt: new Date().toISOString() }
    await writeData(items)
    return res.status(200).json(items[idx])
  }

  if (req.method === 'DELETE') {
    items.splice(idx, 1)
    await writeData(items)
    return res.status(204).end()
  }

  return res.status(405).end('Method Not Allowed')
}
