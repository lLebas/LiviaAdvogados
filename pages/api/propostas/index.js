import fs from 'fs'
import path from 'path'

const dataFile = path.join(process.cwd(), 'data', 'proposals.json')

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
  if (req.method === 'GET') {
    const items = await readData()
    return res.status(200).json(items)
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
