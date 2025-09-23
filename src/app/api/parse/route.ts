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
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Extract text from docx
    const result = await mammoth.extractRawText({ buffer })
    const text = result.value

    // Parse the content
    const parsedData = parsePrositContent(text)

    return NextResponse.json(parsedData)
  } catch (error) {
    console.error('Error parsing file:', error)
    return NextResponse.json({ error: 'Failed to parse file' }, { status: 500 })
  }
}

function parsePrositContent(text: string): ParsedData {
  const lines = text.split('\n').map(line => line.trim())
  let currentSection = ''
  let prositName = ''
  let studentName = ''
  let animateur = ''
  let scribe = ''
  let gestionnaire = ''
  let secretaire = ''
  let year = ''
  let group = ''
  let motsCles: string[] = []
  let motsADefinir: string[] = []
  let analyseContexte = ''
  let definitionProblematique = ''
  let contraintes: string[] = []
  let hypothese: string[] = []
  let planActions: { title: string; paragraphs: string[] }[] = []
  let currentPlanAction: { title: string; paragraphs: string[] } | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    // Section detection
    if (/cer u\.e/i.test(line)) {
      prositName = line.replace(/cer u\.e/i, '').replace(/"/g, '').trim()
      continue
    }
    if (/^nom de l'?étudiant/i.test(line)) {
      studentName = line.replace(/^nom de l'?étudiant:?/i, '').trim()
      continue
    }
    if (/^animateur/i.test(line)) {
      animateur = line.replace(/^animateur:?/i, '').trim()
      continue
    }
    if (/^scribe/i.test(line)) {
      scribe = line.replace(/^scribe:?/i, '').trim()
      continue
    }
    if (/^gestionnaire/i.test(line)) {
      gestionnaire = line.replace(/^gestionnaire:?/i, '').trim()
      continue
    }
    if (/^secr[ée]taire/i.test(line)) {
      secretaire = line.replace(/^secr[ée]taire:?/i, '').trim()
      continue
    }
    if (/^ann[ée]e/i.test(line)) {
      year = line.replace(/^ann[ée]e:?/i, '').trim()
      continue
    }
    if (/^groupe/i.test(line)) {
      group = line.replace(/^groupe:?/i, '').trim()
      continue
    }
    if (/mots clés?/i.test(line)) {
      currentSection = 'motsCles'
      continue
    }
    if (/mots à définir|mots a definir/i.test(line)) {
      currentSection = 'motsADefinir'
      continue
    }
    if (/analyse du contexte/i.test(line)) {
      currentSection = 'analyseContexte'
      continue
    }
    if (/définition de la problématique|definition de la problematique/i.test(line)) {
      currentSection = 'definitionProblematique'
      continue
    }
    if (/contraintes/i.test(line)) {
      currentSection = 'contraintes'
      continue
    }
    if (/hypoth[èe]se/i.test(line)) {
      currentSection = 'hypothese'
      continue
    }
    if (/plan d'?actions?/i.test(line)) {
      currentSection = 'planActions'
      continue
    }

    // Section content
    if (currentSection === 'motsCles' && line) {
      motsCles.push(...line.split(/[,;]/).map(w => w.trim()).filter(Boolean))
    } else if (currentSection === 'motsADefinir' && line) {
      motsADefinir.push(...line.split(/[,;]/).map(w => w.trim()).filter(Boolean))
    } else if (currentSection === 'analyseContexte' && line) {
      analyseContexte += (analyseContexte ? '\n' : '') + line
    } else if (currentSection === 'definitionProblematique' && line) {
      definitionProblematique += (definitionProblematique ? '\n' : '') + line
    } else if (currentSection === 'contraintes' && line) {
      contraintes.push(...line.split(/[,;]/).map(w => w.trim()).filter(Boolean))
    } else if (currentSection === 'hypothese' && line) {
      hypothese.push(...line.split(/[,;]/).map(w => w.trim()).filter(Boolean))
    } else if (currentSection === 'planActions' && line) {
      // Detect new plan action
      const planActionMatch = line.match(/^Plan d'action (\d+):\s*(.+)$/i) || line.match(/^(\d+)[:.]\s*(.+)$/)
      if (planActionMatch) {
        if (currentPlanAction) planActions.push(currentPlanAction)
        currentPlanAction = {
          title: `Plan d'action ${planActionMatch[1]}`,
          paragraphs: [planActionMatch[2].trim()]
        }
      } else if (currentPlanAction) {
        currentPlanAction.paragraphs.push(line)
      }
    }
  }
  if (currentPlanAction) planActions.push(currentPlanAction)

  return {
    prositName,
    studentName,
    animateur,
    scribe,
    gestionnaire,
    secretaire,
    year,
    group,
    motsCles,
    motsADefinir: [...new Set(motsADefinir)],
    analyseContexte,
    definitionProblematique,
    contraintes,
    hypothese,
    planActions
  }
}