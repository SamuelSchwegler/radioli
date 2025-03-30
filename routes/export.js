import express from 'express'
import fs from 'fs'
import {parseStringPromise, Builder} from 'xml2js'
import ExcelJS from "exceljs";

const router = express.Router()
router.get('/download', (req, res) => {
    const filePath = './programme.xml'
    res.download(filePath, 'programme.xml', (err) => {
        if (err) {
            console.error('Download failed:', err)
            res.status(500).send('Error downloading file')
        }
    })
});

const typeColors = {
    jingle: {fgColor: {rgb: "FFCCE5FF"}},      // light blue
    moderation: {fgColor: {rgb: "FFDDEEFF"}},  // light purple
    song: {fgColor: {rgb: "FFFFF0D9"}},         // light yellow
}


router.get('/excel', async (req, res) => {
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

        const workbook = new ExcelJS.Workbook()
        const sheet = workbook.addWorksheet('Programme')

// Header
        sheet.columns = [
            {header: 'Start', key: 'start'},
            {header: 'Dauer', key: 'duration'},
            {header: 'Title', key: 'title'},
            {header: '#', key: 'tecNumber'},
            {header: 'Type', key: 'type'},
            {header: 'Moderation', key: 'moderation'}
        ]

// Type to color
        const typeColors = {
            jingle: 'CCE5FF',
            moderation: 'DDEEFF',
            song: 'FFF0D9'
        }

// Rows
        let currentStart = 0
        let tecNumber = 1;
        entries.forEach((e, i) => {
            const duration = parseInt(e.duration?.[0] || '0', 10)
            const startFormatted = formatTime(currentStart)
            currentStart += duration

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
                start: startFormatted,
                duration: formatTime(duration),
                moderation: (e.moderation?.[0] || '').trim()
            })

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
        res.status(500).json({error: 'Failed to generate Excel file'})
    }
});

export default router;