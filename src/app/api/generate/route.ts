import { NextRequest, NextResponse } from 'next/server'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  Header,
  ImageRun,
} from 'docx'
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

interface PrositRetourData {
  motsADefinir: { word: string; definition: string }[]
  planActions: { title: string; content: string; images: File[] }[]
}

interface RequestData extends Partial<FormData & PrositRetourData> {
  mode?: 'aller' | 'retour'
}

export async function POST(request: NextRequest) {
  const data: RequestData = await request.json()

  // Define the image path - adjust this to your actual logo location
  const imagePath = path.join(process.cwd(), 'public', 'logo.png')
  
  // Check if image exists before trying to read it
  let image: ImageRun | undefined
  
  try {
    if (fs.existsSync(imagePath)) {
      const imageBuffer = fs.readFileSync(imagePath)
      
      image = new ImageRun({
        data: imageBuffer,
        transformation: {
          width: 100,
          height: 100,
        },
        type: 'png', // Specify the image type
      })
    }
  } catch (error) {
    console.warn('Could not load logo image:', error)
    // Continue without image if it fails to load
  }

  const header = new Header({
    children: [
      new Paragraph({
        children: image ? [image] : [], // Only add image if it exists
        alignment: AlignmentType.RIGHT,
      }),
    ],
  })

  const children: Paragraph[] = []

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `CER U.E ${data.prositName || ''} "${data.studentName || ''}"`,
          font: 'Arial',
          size: 48,
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ text: '' }),
    new Paragraph({ text: '' }),
    new Paragraph({ text: '' }),
    new Paragraph({ text: '' }),
    new Paragraph({ text: '' }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Animateur: ${data.animateur || ''}`,
          font: 'Arial',
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Scribe: ${data.scribe || ''}`,
          font: 'Arial',
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Gestionnaire: ${data.gestionnaire || ''}`,
          font: 'Arial',
          size: 24,
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Secrétaire: ${data.secretaire || ''}`,
          font: 'Arial',
          size: 24,
        }),
      ],
    }),
    new Paragraph({ text: '' }),
    new Paragraph({
      children: [
        new TextRun({
          text: `${new Date().toLocaleDateString('fr-FR')} A${
            data.year || ''
          }-Groupe ${data.group || ''}`,
          font: 'Arial',
          size: 24,
        }),
      ],
      alignment: AlignmentType.RIGHT,
    }),
    new Paragraph({ text: '', pageBreakBefore: true })
  )

  // Section 1: Mots clés
  if ((data.motsCles ?? []).some(m => m.trim())) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '1. Mots clés:',
            font: 'Arial',
            size: 24,
            bold: true,
          }),
        ],
      }),
      new Paragraph({ text: '' }),
      ...(data.motsCles ?? [])
        .filter(m => m.trim())
        .map(
          mot =>
            new Paragraph({
              children: [
                new TextRun({ text: `${mot}`, font: 'Arial', size: 24 }),
              ],
              bullet: { level: 0 },
            })
        ),
      new Paragraph({ text: '' })
    )
  }

  // Section 2: Mots à définir
  if (data.motsADefinir && data.motsADefinir.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '2. Mots à définir:',
            font: 'Arial',
            size: 24,
            bold: true,
          }),
        ],
      }),
      new Paragraph({ text: '' })
    )

    if (data.mode === 'retour' && data.motsADefinir.every(item => typeof item === 'object' && 'word' in item)) {
      // For "retour" mode, show definitions
      (data.motsADefinir as { word: string; definition: string }[])
        .filter(item => item.word && item.definition)
        .forEach(item => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${item.word}: `,
                  font: 'Arial',
                  size: 24,
                  bold: true,
                }),
                new TextRun({
                  text: item.definition,
                  font: 'Arial',
                  size: 24,
                }),
              ],
            })
          )
        })
    } else {
      // For "aller" mode, just list the words
      (data.motsADefinir as string[])
        .filter(m => typeof m === 'string' && m.trim())
        .forEach(mot => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: `${mot}`, font: 'Arial', size: 24 }),
              ],
              bullet: { level: 0 },
            })
          )
        })
    }
    children.push(new Paragraph({ text: '' }))
  }

  // Section 3: Analyse du contexte
  if (data.analyseContexte && data.analyseContexte.trim()) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '3. Analyse du contexte:',
            font: 'Arial',
            size: 24,
            bold: true,
          }),
        ],
      }),
      new Paragraph({ text: '' }),
      new Paragraph({
        children: [
          new TextRun({
            text: data.analyseContexte,
            font: 'Arial',
            size: 24,
          }),
        ],
      }),
      new Paragraph({ text: '' })
    )
  }

  // Section 4: Définition de la problématique
  if (data.definitionProblematique && data.definitionProblematique.trim()) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '4. Définition de la problématique:',
            font: 'Arial',
            size: 24,
            bold: true,
          }),
        ],
      }),
      new Paragraph({ text: '' }),
      new Paragraph({
        children: [
          new TextRun({
            text: data.definitionProblematique,
            font: 'Arial',
            size: 24,
          }),
        ],
      }),
      new Paragraph({ text: '' })
    )
  }

  // Section 5: Contraintes
  if ((data.contraintes ?? []).some(c => c.trim())) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '5. Contraintes:',
            font: 'Arial',
            size: 24,
            bold: true,
          }),
        ],
      }),
      new Paragraph({ text: '' }),
      ...(data.contraintes ?? [])
        .filter(c => c.trim())
        .map(
          contrainte =>
            new Paragraph({
              children: [
                new TextRun({ text: `${contrainte}`, font: 'Arial', size: 24 }),
              ],
              bullet: { level: 0 },
            })
        ),
      new Paragraph({ text: '' })
    )
  }

  // Section 6: Hypothèses
  if ((data.hypothese ?? []).some(h => h.trim())) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '6. Hypothèses:',
            font: 'Arial',
            size: 24,
            bold: true,
          }),
        ],
      }),
      new Paragraph({ text: '' }),
      ...(data.hypothese ?? [])
        .filter(h => h.trim())
        .map(
          hypothese =>
            new Paragraph({
              children: [
                new TextRun({ text: `${hypothese}`, font: 'Arial', size: 24 }),
              ],
              bullet: { level: 0 },
            })
        ),
      new Paragraph({ text: '' })
    )
  }

  // Section 7: Plan d'actions
  if (data.planActions && data.planActions.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "7. Plan d'actions:",
            font: 'Arial',
            size: 24,
            bold: true,
          }),
        ],
      }),
      new Paragraph({ text: '' })
    )

    if (data.mode === 'retour' && data.planActions.every(item => typeof item === 'object' && 'title' in item)) {
      // For "retour" mode, show detailed plan actions with content
      (data.planActions as { title: string; content: string; images: File[] }[])
        .filter(action => action.title)
        .forEach((action, index) => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `Plan d'action ${index + 1}: ${action.title}`,
                  font: 'Arial',
                  size: 24,
                  bold: true,
                }),
              ],
            })
          )
          
          if (action.content && action.content.trim()) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: action.content,
                    font: 'Arial',
                    size: 24,
                  }),
                ],
              })
            )
          }
          
          children.push(new Paragraph({ text: '' }))
        })
    } else {
      // For "aller" mode, just list the plan actions
      (data.planActions as string[])
        .filter(a => typeof a === 'string' && a.trim())
        .forEach((action, index) => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `Plan d'action ${index + 1}: ${action}`,
                  font: 'Arial',
                  size: 24,
                }),
              ],
            })
          )
        })
      children.push(new Paragraph({ text: '' }))
    }
  }

  const doc = new Document({
    sections: [
      {
        headers: {
          default: header,
        },
        properties: {},
        children: children,
      },
    ],
  })

  const buffer = await Packer.toBuffer(doc)
  const fileName = data.mode === 'retour'
    ? `Prosit_Retour_${data.prositName || 'Retour'}_${new Date().toISOString().split('T')[0]}.docx`
    : `Prosit_${data.prositName || 'Untitled'}_${data.studentName || 'NoName'}.docx`

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  })
}