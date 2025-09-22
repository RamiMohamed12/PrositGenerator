import { NextRequest, NextResponse } from 'next/server'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Header, ImageRun } from 'docx'
import * as fs from 'fs'
import * as path from 'path'

interface FormData {
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
  planActions: string[]
}

export async function POST(request: NextRequest) {
  const data: FormData = await request.json()

  // Load the logo image
  const imagePath = path.join(process.cwd(), 'public', 'image.png')
  const imageBuffer = fs.readFileSync(imagePath)
  const image = new ImageRun({
    data: imageBuffer,
    transformation: {
      width: 100,
      height: 100,
    },
    type: 'png',
  })

  const children: any[] = []

  // Create header with logo in top right
  const header = new Header({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            children: [image],
          }),
        ],
        alignment: AlignmentType.RIGHT,
      }),
    ],
  })

  // First page
  children.push(
    new Paragraph({
      children: [new TextRun({ text: `CER U.E ${data.prositName} "${data.studentName}"`, font: 'Arial', size: 48 })],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ text: '' }),
    new Paragraph({ text: '' }),
    new Paragraph({ text: '' }),
    new Paragraph({ text: '' }),
    new Paragraph({ text: '' }),
    new Paragraph({ children: [new TextRun({ text: `Animateur: ${data.animateur || ''}`, font: 'Arial', size: 24 })] }),
    new Paragraph({ children: [new TextRun({ text: `Scribe: ${data.scribe || ''}`, font: 'Arial', size: 24 })] }),
    new Paragraph({ children: [new TextRun({ text: `Gestionnaire: ${data.gestionnaire || ''}`, font: 'Arial', size: 24 })] }),
    new Paragraph({ children: [new TextRun({ text: `Secrétaire: ${data.secretaire || ''}`, font: 'Arial', size: 24 })] }),
    new Paragraph({ text: '' }),
    new Paragraph({
      children: [new TextRun({ text: `${new Date().toLocaleDateString('fr-FR')} A${data.year}-Groupe ${data.group}`, font: 'Arial', size: 24 })],
      alignment: AlignmentType.RIGHT,
    }),
    new Paragraph({ text: '', pageBreakBefore: true }) // Page break
  )

  // Mots clés
  if (data.motsCles.some(m => m.trim())) {
    children.push(
      new Paragraph({ children: [new TextRun({ text: '1. Mots clés:', font: 'Arial', size: 24, bold: true })] }),
      new Paragraph({ text: '' }), // Spacing before bullets
      ...data.motsCles.filter(m => m.trim()).map(mot => new Paragraph({ children: [new TextRun({ text: `${mot}`, font: 'Arial', size: 24 })], bullet: { level: 0 } })),
      new Paragraph({ text: '' }) // Spacing after bullets
    )
  }

  // Mots à définir
  if (data.motsADefinir.some(m => m.trim())) {
    children.push(
      new Paragraph({ children: [new TextRun({ text: '2. Mots à définir:', font: 'Arial', size: 24, bold: true })] }),
      new Paragraph({ text: '' }), // Spacing before bullets
      ...data.motsADefinir.filter(m => m.trim()).map(mot => new Paragraph({ children: [new TextRun({ text: `${mot}`, font: 'Arial', size: 24 })], bullet: { level: 0 } })),
      new Paragraph({ text: '' }) // Spacing after bullets
    )
  }

  // Analyse du contexte
  if (data.analyseContexte.trim()) {
    children.push(
      new Paragraph({ children: [new TextRun({ text: '3. Analyse du contexte:', font: 'Arial', size: 24, bold: true })] }),
      new Paragraph({ text: '' }), // Spacing before content
      new Paragraph({ children: [new TextRun({ text: data.analyseContexte, font: 'Arial', size: 24 })] }),
      new Paragraph({ text: '' }) // Spacing after content
    )
  }

  // Définition de la problématique
  if (data.definitionProblematique.trim()) {
    children.push(
      new Paragraph({ children: [new TextRun({ text: '4. Définition de la problématique:', font: 'Arial', size: 24, bold: true })] }),
      new Paragraph({ text: '' }), // Spacing before content
      new Paragraph({ children: [new TextRun({ text: data.definitionProblematique, font: 'Arial', size: 24 })] }),
      new Paragraph({ text: '' }) // Spacing after content
    )
  }

  // Contraintes
  if (data.contraintes.some(c => c.trim())) {
    children.push(
      new Paragraph({ children: [new TextRun({ text: '5. Contraintes:', font: 'Arial', size: 24, bold: true })] }),
      new Paragraph({ text: '' }), // Spacing before bullets
      ...data.contraintes.filter(c => c.trim()).map(con => new Paragraph({ children: [new TextRun({ text: `${con}`, font: 'Arial', size: 24 })], bullet: { level: 0 } })),
      new Paragraph({ text: '' }) // Spacing after bullets
    )
  }

  // Hypothèse
  if (data.hypothese.some(h => h.trim())) {
    children.push(
      new Paragraph({ children: [new TextRun({ text: '6. Hypothèse:', font: 'Arial', size: 24, bold: true })] }),
      new Paragraph({ text: '' }), // Spacing before bullets
      ...data.hypothese.filter(h => h.trim()).map(hyp => new Paragraph({ children: [new TextRun({ text: `${hyp}`, font: 'Arial', size: 24 })], bullet: { level: 0 } })),
      new Paragraph({ text: '' }) // Spacing after bullets
    )
  }

  // Plan d'actions
  if (data.planActions.some(a => a.trim())) {
    children.push(
      new Paragraph({ children: [new TextRun({ text: '7. Plan d\'actions:', font: 'Arial', size: 24, bold: true })] }),
      new Paragraph({ text: '' }), // Spacing before content
      ...data.planActions.filter(a => a.trim()).map((action, index) => new Paragraph({ children: [new TextRun({ text: `Plan d'action ${index + 1}: ${action}`, font: 'Arial', size: 24 })] })),
      new Paragraph({ text: '' }) // Spacing after content
    )
  }

  const doc = new Document({
    sections: [{
      headers: {
        default: header,
      },
      properties: {},
      children: children,
    }],
  })

  const buffer = await Packer.toBuffer(doc)

  const fileName = `Prosit_${data.prositName}_${data.studentName}.docx`

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename=${fileName}`,
    },
  })
}