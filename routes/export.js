import express from 'express'
import fs from 'fs'
import {parseStringPromise} from 'xml2js'
import ExcelJS from "exceljs";
import {Document, Packer, Paragraph, TextRun, HeadingLevel} from "docx"
import {getXmlPath} from "./helper.js";

const router = express.Router()
router.get('/download', (req, res) => {
    const xmlPath = getXmlPath();
    res.download(xmlPath, 'programme.xml', (err) => {
        if (err) {
            console.error('Download failed:', err)
            res.status(500).send('Error downloading file')
        }
    })
});


router.get('/excel', async (req, res) => {
    const xmlPath = getXmlPath();
    try {
        const xml = fs.readFileSync(xmlPath, 'utf-8')
        const parsed = await parseStringPromise(xml)

        const meta = parsed.programme.meta || {}
        const entries = parsed.programme.entry || []

        // Helper to format seconds as mm:ss
        const formatTime = (seconds) => {
            const m = Math.floor(seconds / 60).toString().padStart(2, '0')
            const s = (seconds % 60).toString().padStart(2, '0')
            return `${m}:${s}`
        }

        const workbook = new ExcelJS.Workbook()
        const sheet = workbook.addWorksheet('Programme')

// Header
        sheet.columns = [
            {header: 'Start', key: 'start'},
            {header: 'Dauer', key: 'duration'},
            {header: '#', key: 'tecNumber'},
            {header: 'Title', key: 'title'},
            {header: 'Moderation', key: 'moderation'}
        ]

// Type to color
        const typeColors = {
            jingle: "fdc700",
            feature: "b9f8cf",
            song: "51a2ff",
            unclear: "fb2c36"
        }

// Rows
        let currentStart = 0
        let tecNumber = 1;
        entries.forEach((e, i) => {
            const durationSeconds = parseInt(e.duration?.[0] || '0', 10)

            let tecNumberLabel = tecNumber.toString();
            if (e.type?.[0] === 'moderation') {
                tecNumberLabel = '';
            } else {
                tecNumber = tecNumber + 1;
            }

            const row = sheet.addRow({
                tecNumber: tecNumberLabel,
                title: e.title?.[0] || '',
                type: e.type?.[0] || '',
                start: null,
                duration: durationSeconds / 86400, // convert seconds to Excel time
                moderation: (e.moderation?.[0] || e.comment?.[0] || '').trim()
            })

            // Style Duration cell (column B)
            row.getCell('B').numFmt = '[mm]:ss'

            // Apply formula for start
            if (i === 0) {
                // First row: 00:00
                row.getCell('A').value = 0
            } else {
                // Next rows: Add previous start + previous duration
                const prevStartCell = `A${i + 1}` // +1 because Excel is 1-indexed
                const prevDurationCell = `B${i + 1}`

                row.getCell('A').value = {
                    formula: `${prevStartCell}+${prevDurationCell}`
                }
            }

            // Style Start cell (column A)
            row.getCell('A').numFmt = '[mm]:ss'

            // Color entire row
            const color = typeColors[e.type?.[0]]
            if (color) {
                row.eachCell((cell) => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: {argb: color}
                    }

                    cell.border = {
                        top: {style: 'thin'},
                        left: {style: 'thin'},
                        bottom: {style: 'thin'},
                        right: {style: 'thin'}
                    }
                })
            }
        })

        const programm_title = meta.title?.[0] || ''

        // Generate buffer and send as file
        const buffer = await workbook.xlsx.writeBuffer();
        res.setHeader('Content-Disposition', 'attachment; filename=' + programm_title + '.xlsx')
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        res.send(buffer)
    } catch (err) {
        console.error(err)
        res.status(500).json({error: 'Failed to generate Excel file', xmlPath: xmlPath})
    }
});


router.get('/word', async (req, res) => {
    const xmlPath = getXmlPath();

    try {
        const xml = fs.readFileSync(xmlPath, 'utf-8')
        const parsed = await parseStringPromise(xml, {})
        const entries = parsed.programme.entry || []
        const paragraphs = []

        entries.forEach((entry) => {
            const title = entry.title?.[0] || ''
            const moderation = (entry.moderation?.[0] || '').trim();

            if (title) {
                paragraphs.push(
                    new Paragraph({
                        text: title,
                        heading: HeadingLevel.HEADING_1,
                        spacing: {after: 200}
                    })
                )
            }

            if (moderation) {
                const lines = moderation.split('\n')
                lines.forEach((line) => {
                    paragraphs.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: line.trim(),
                                    font: "Arial",
                                    size: 24
                                })
                            ],
                            spacing: {after: 200} // smaller spacing for paragraphs
                        })
                    )
                })
            }
        })

        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children: [
                        ...paragraphs
                    ]
                }
            ]
        })

        const buffer = await Packer.toBuffer(doc)

        res.setHeader('Content-Disposition', 'attachment; filename=programme.docx')
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
        res.send(buffer)
    } catch (err) {
        console.error(err)
        res.status(500).json({error: 'Failed to generate Word document'})
    }
})

export default router;