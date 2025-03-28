import express from 'express'
import fs from 'fs'
import cors from 'cors'
import bodyParser from 'body-parser'
import { parseStringPromise, Builder } from 'xml2js'

const app = express()
const port = 3001

app.use(cors())
app.use(bodyParser.json())

// Load metadata from XML
app.get('/programme', async (req, res) => {
    try {
        const xml = fs.readFileSync('programme.xml', 'utf-8')
        const json = await parseStringPromise(xml)
        res.json(json.meta)
    } catch (error) {
        res.status(500).json({ error: 'Error reading XML file' })
    }
})

// Save metadata to XML
app.post('/metadata', (req, res) => {
    const { title, date, contributors } = req.body

    const metadata = {
        meta: {
            title,
            date,
            contributors: { contributor: contributors }
        }
    }

    const builder = new Builder()
    const xml = builder.buildObject(metadata)

    fs.writeFileSync('programme.xml', xml)
    res.json({ message: 'Metadata saved successfully!' })
})

app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`)
})