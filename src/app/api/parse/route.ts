import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'

interface ParsedData {
  prositName: string
  studentName: string
  animateur: string
  scribe: string
  gestionnaire: string
  secretaire: string
  year: string
  group: string
  motsCles: string[]
  motsADefinir: string[]
  analyseContexte: string
  definitionProblematique: string
  contraintes: string[]
  hypothese: string[]
  planActions: { title: string; paragraphs: string[] }[]
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const result = await mammoth.extractRawText({ buffer })
    const text = result.value

    // Parse the document text to extract fields
    const parsedData = parsePrositContent(text)

    return NextResponse.json(parsedData)
  } catch (error) {
    console.error('Error parsing document:', error)
    return NextResponse.json({ error: 'Failed to parse document' }, { status: 500 })
  }
}

function parsePrositContent(text: string): ParsedData {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)

  console.log('Parsing document with', lines.length, 'lines') // Debug

  const data: ParsedData = {
    prositName: '',
    studentName: '',
    animateur: '',
    scribe: '',
    gestionnaire: '',
    secretaire: '',
    year: '',
    group: '',
    motsCles: [],
    motsADefinir: [],
    analyseContexte: '',
    definitionProblematique: '',
    contraintes: [],
    hypothese: [],
    planActions: []
  }

  let currentSection = ''
  let captureText = ''
  let inTable = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lowerLine = line.toLowerCase()

    // Try to extract from table or key-value pairs
    if (lowerLine.includes('nom du prosit')) {
      // Try inline value first
      const parts = line.split(/[:：]/)
      if (parts.length > 1 && parts[1].trim()) {
        data.prositName = parts[1].trim()
      } else if (i + 1 < lines.length) {
        data.prositName = lines[i + 1]
      }
      inTable = true
      console.log('Found prositName:', data.prositName)
    } else if (lowerLine.includes('nom de l') && (lowerLine.includes('tudiant') || lowerLine.includes('étudiant'))) {
      const parts = line.split(/[:：]/)
      if (parts.length > 1 && parts[1].trim()) {
        data.studentName = parts[1].trim()
      } else if (i + 1 < lines.length) {
        data.studentName = lines[i + 1]
      }
      console.log('Found studentName:', data.studentName)
    } else if (lowerLine.includes('animateur')) {
      const parts = line.split(/[:：]/)
      if (parts.length > 1 && parts[1].trim()) {
        data.animateur = parts[1].trim()
      } else if (i + 1 < lines.length && !lines[i + 1].toLowerCase().includes(':')) {
        data.animateur = lines[i + 1]
      }
      console.log('Found animateur:', data.animateur)
    } else if (lowerLine.includes('scribe') && !lowerLine.includes('animateur')) {
      const parts = line.split(/[:：]/)
      if (parts.length > 1 && parts[1].trim()) {
        data.scribe = parts[1].trim()
      } else if (i + 1 < lines.length && !lines[i + 1].toLowerCase().includes(':')) {
        data.scribe = lines[i + 1]
      }
      console.log('Found scribe:', data.scribe)
    } else if (lowerLine.includes('gestionnaire')) {
      const parts = line.split(/[:：]/)
      if (parts.length > 1 && parts[1].trim()) {
        data.gestionnaire = parts[1].trim()
      } else if (i + 1 < lines.length && !lines[i + 1].toLowerCase().includes(':')) {
        data.gestionnaire = lines[i + 1]
      }
      console.log('Found gestionnaire:', data.gestionnaire)
    } else if (lowerLine.includes('secrétaire') || lowerLine.includes('secretaire')) {
      const parts = line.split(/[:：]/)
      if (parts.length > 1 && parts[1].trim()) {
        data.secretaire = parts[1].trim()
      } else if (i + 1 < lines.length && !lines[i + 1].toLowerCase().includes(':')) {
        data.secretaire = lines[i + 1]
      }
      console.log('Found secretaire:', data.secretaire)
    } else if (lowerLine.includes('année') || lowerLine.includes('annee')) {
      const parts = line.split(/[:：]/)
      if (parts.length > 1 && parts[1].trim()) {
        data.year = parts[1].trim()
      } else if (i + 1 < lines.length && !lines[i + 1].toLowerCase().includes(':')) {
        data.year = lines[i + 1]
      }
      console.log('Found year:', data.year)
    } else if (lowerLine.includes('groupe') && !lowerLine.includes('année')) {
      const parts = line.split(/[:：]/)
      if (parts.length > 1 && parts[1].trim()) {
        data.group = parts[1].trim()
      } else if (i + 1 < lines.length && !lines[i + 1].toLowerCase().includes(':')) {
        data.group = lines[i + 1]
      }
      console.log('Found group:', data.group)
    }

    // Detect sections
    if (lowerLine.includes('mots clés') || lowerLine.includes('mots cles') || lowerLine === '1. mots clés' || lowerLine === '1. mots cles') {
      currentSection = 'motsCles'
      captureText = ''
      inTable = false
      console.log('Section: motsCles')
      continue
    } else if (lowerLine.includes('mots à définir') || lowerLine.includes('mots a definir') || lowerLine === '2. mots à définir') {
      currentSection = 'motsADefinir'
      captureText = ''
      inTable = false
      console.log('Section: motsADefinir')
      continue
    } else if (lowerLine.includes('analyse du contexte') || lowerLine === '3. analyse du contexte') {
      currentSection = 'analyseContexte'
      captureText = ''
      inTable = false
      console.log('Section: analyseContexte')
      continue
    } else if ((lowerLine.includes('définition') && lowerLine.includes('problématique')) || 
               (lowerLine.includes('definition') && lowerLine.includes('problematique')) ||
               lowerLine === '4. définition de la problématique') {
      currentSection = 'definitionProblematique'
      captureText = ''
      inTable = false
      console.log('Section: definitionProblematique')
      continue
    } else if (lowerLine === 'contraintes' || lowerLine === '5. contraintes') {
      currentSection = 'contraintes'
      captureText = ''
      inTable = false
      console.log('Section: contraintes')
      continue
    } else if (lowerLine.includes('hypothèse') || lowerLine.includes('hypothese') || lowerLine === '6. hypothèse') {
      currentSection = 'hypothese'
      captureText = ''
      inTable = false
      console.log('Section: hypothese')
      continue
    } else if (lowerLine.includes('plan d\'action') || lowerLine.includes('plan d action') || lowerLine === '7. plan d\'actions') {
      currentSection = 'planActions'
      captureText = ''
      inTable = false
      console.log('Section: planActions')
      continue
    }

    // Skip if we're in the table section
    if (inTable) continue

    // Extract content based on current section
    if (currentSection === 'motsCles' && line.length > 0 && !lowerLine.includes('mots clés')) {
      const mots = line.split(/[,;]/).map(m => m.trim()).filter(m => m.length > 0 && m.length < 100 && !m.match(/^\d+\./))
      data.motsCles.push(...mots)
    } else if (currentSection === 'motsADefinir' && line.length > 0 && !lowerLine.includes('mots à définir')) {
      const mots = line.split(/[,;]/).map(m => m.trim()).filter(m => m.length > 0 && m.length < 100 && !m.match(/^\d+\./))
      data.motsADefinir.push(...mots)
    } else if (currentSection === 'analyseContexte' && line.length > 0 && !lowerLine.includes('analyse')) {
      captureText += (captureText ? ' ' : '') + line
      data.analyseContexte = captureText
    } else if (currentSection === 'definitionProblematique' && line.length > 0 && !lowerLine.includes('définition') && !lowerLine.includes('problematique')) {
      captureText += (captureText ? ' ' : '') + line
      data.definitionProblematique = captureText
    } else if (currentSection === 'contraintes' && line.length > 0 && !lowerLine.includes('contraintes')) {
      data.contraintes.push(line)
    } else if (currentSection === 'hypothese' && line.length > 0 && !lowerLine.includes('hypothèse')) {
      data.hypothese.push(line)
    } else if (currentSection === 'planActions' && line.length > 0) {
      // Plan d'actions start with "6." or "7." followed by a number (e.g., "6.1", "7.1")
      if (line.match(/^[67]\.\d+/)) {
        const title = line.replace(/^[67]\.\d+\s*/, '').trim()
        data.planActions.push({ title, paragraphs: [] })
        console.log('Found plan action:', title)
      } else if (data.planActions.length > 0 && !lowerLine.includes('plan d\'action')) {
        const lastAction = data.planActions[data.planActions.length - 1]
        lastAction.paragraphs.push(line)
      }
    }
  }

  // Remove duplicates from arrays
  data.motsCles = [...new Set(data.motsCles)]
  data.motsADefinir = [...new Set(data.motsADefinir)]

  console.log('Parsed result:', {
    prositName: data.prositName,
    studentName: data.studentName,
    motsCles: data.motsCles.length,
    motsADefinir: data.motsADefinir.length,
    planActions: data.planActions.length
  })

  return data
}
