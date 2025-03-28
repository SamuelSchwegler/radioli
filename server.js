import express from 'express'
import fs from 'fs'
import cors from 'cors'
import bodyParser from 'body-parser'
import {parseStringPromise, Builder} from 'xml2js'
import * as XLSX from 'xlsx'

const app = express()
const port = 3001

app.use(cors())
app.use(bodyParser.json())

// Load metadata from XML
app.get('/programme', async (req, res) => {
    try {
        const xml = fs.readFileSync('programme.xml', 'utf-8')
        const json = await parseStringPromise(xml)

        const entries = json.programme.entry || []
        const mappedEntries = entries.map(e => ({
            id: e.id[0],
            title: e.title[0],
            duration: parseInt(e.duration[0]),
            type: e.type[0],
            moderation: e.hasOwnProperty('moderation') ? e.moderation[0].replace(/\s+\n\s+/g, '\n')  // Clean spacing around newlines
                .replace(/[ \t]{2,}/g, ' ')  // Collapse excessive spaces/tabs
                .trim() : ''
        }));
        res.json({
            'meta': {
                'title': json.programme.meta[0].title[0],
                'date': json.programme.meta[0].date[0],
                'contributors': json.programme.meta[0].contributors[0].contributor
            },
            'entries': mappedEntries || []
        })
    } catch (error) {
        res.status(500).json({error: 'Error reading XML file', message: error.message})
    }
})

app.post('/programme/meta', async (req, res) => {
    try {
        const newMeta = req.body

        // Read and parse existing XML
        const xml = fs.readFileSync('programme.xml', 'utf-8')
        const existing = await parseStringPromise(xml)

        // Replace the meta, keep the entries
        const updatedProgramme = {
            programme: {
                meta: {
                    title: newMeta.title,
                    date: newMeta.date,
                    contributors: {
                        contributor: newMeta.contributors
                    }
                },
                entry: existing.programme.entry || []
            }
        }

        const builder = new Builder()
        const newXml = builder.buildObject(updatedProgramme)

        fs.writeFileSync('programme.xml', newXml)
        res.json({message: 'Metadata updated. Entries preserved.'})
    } catch (err) {
        console.error(err)
        res.status(500).json({error: 'Failed to update metadata'})
    }
})

app.post('/programme/entries', async (req, res) => {
    try {
        const newEntries = req.body

        // Read and parse existing XML
        const xml = fs.readFileSync('programme.xml', 'utf-8')
        const existing = await parseStringPromise(xml)

        // Update entries but keep meta
        const updatedProgramme = {
            programme: {
                meta: existing.programme.meta,
                entry: newEntries.map(e => ({
                    id: e.id,
                    title: e.title,
                    duration: e.duration,
                    type: e.type,
                    moderation: e.moderation
                }))
            }
        }

        const builder = new Builder()
        const newXml = builder.buildObject(updatedProgramme)

        fs.writeFileSync('programme.xml', newXml)
        res.json({message: 'Programme entries updated. Metadata preserved.'})
    } catch (err) {
        console.error(err)
        res.status(500).json({error: 'Failed to update entries'})
    }
});

app.get('/programme/download', (req, res) => {
    const filePath = './programme.xml'
    res.download(filePath, 'programme.xml', (err) => {
        if (err) {
            console.error('Download failed:', err)
            res.status(500).send('Error downloading file')
        }
    })
});


app.get('/programme/excel', async (req, res) => {
    try {
        const xml = fs.readFileSync('programme.xml', 'utf-8')
        const parsed = await parseStringPromise(xml)

        const meta = parsed.programme.meta || {}
        const entries = parsed.programme.entry || []

        // Helper to format seconds as mm:ss
        const formatTime = (seconds) => {
            const m = Math.floor(seconds / 60).toString().padStart(2, '0')
            const s = (seconds % 60).toString().padStart(2, '0')
            return `${m}:${s}`
        }

        // Prepare data rows
        let currentStart = 0
        const rows = entries.map((entry, index) => {
            const duration = parseInt(entry.duration?.[0] || '0', 10)
            const row = {
                '#': index + 1,
                Title: entry.title?.[0] || '',
                Type: entry.type?.[0] || '',
                Start: formatTime(currentStart),
                Duration: formatTime(duration),
                Moderation: (entry.moderation?.[0] || '').trim()
            }
            currentStart += duration
            return row
        });

        rows.push({
            '#': '',
            Title: '',
            Type: '',
            Start: '',
            Duration: formatTime(currentStart),
            Moderation: ''
        })

        // Create worksheet & workbook
        const worksheet = XLSX.utils.json_to_sheet(rows)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Zeitplan')

        const programm_title = meta.title?.[0] || ''

        // Generate buffer and send as file
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
        res.setHeader('Content-Disposition', 'attachment; filename='+ programm_title +'.xlsx')
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        res.send(buffer)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to generate Excel file' })
    }
});

app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`)
})