import express from 'express'
import fs from 'fs'
import cors from 'cors'
import bodyParser from 'body-parser'
import {parseStringPromise, Builder} from 'xml2js'
import exportRoutes from './routes/export.js'

const app = express()
const port = 3000
import {getXmlPath} from "./routes/helper.js";

app.use(cors())
app.use(bodyParser.json())

// Load metadata from XML
app.get('/programme', async (req, res) => {
    const xmlPath = getXmlPath();

    try {
        const xml = fs.readFileSync(xmlPath, 'utf8');
        const json = await parseStringPromise(xml)

        const entries = json.programme.entry || []
        const mappedEntries = entries.map(e => ({
            id: e.id[0],
            title: e.title[0],
            duration: parseInt(e.duration[0]),
            type: e.type[0],
            comment: e.hasOwnProperty('comment') ? e.comment[0].replace(/\s+\n\s+/g, '\n') : null,  // Clean spacing around newlines
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
    const xmlPath = getXmlPath();

    try {
        const newEntries = req.body

        // Read and parse existing XML
        const xml = fs.readFileSync(xmlPath, 'utf-8')
        const existing = await parseStringPromise(xml);

        // Update entries but keep meta
        const updatedProgramme = {
            programme: {
                meta: existing.programme.meta,
                entry: newEntries.map(e => ({
                    id: e.id,
                    title: e.title,
                    duration: e.duration,
                    type: e.type,
                    moderation: e.moderation,
                    comment: e.comment
                }))
            }
        }

        const builder = new Builder()
        const newXml = builder.buildObject(updatedProgramme)

        fs.writeFileSync(xmlPath, newXml)
        res.json({message: 'Programme entries updated. Metadata preserved.'})
    } catch (err) {
        console.error(err)
        res.status(500).json({error: 'Failed to update entries', details: err})
    }
});

app.use('/programme', exportRoutes);

app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`)
})