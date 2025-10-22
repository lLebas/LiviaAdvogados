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
  const { id } = req.query
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

  return res.status(405).end('Method Not Allowed')
}
