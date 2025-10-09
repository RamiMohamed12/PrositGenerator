import { NextRequest } from 'next/server'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  Header,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  Footer,
  ShadingType
} from 'docx'
import * as fs from 'fs'
import * as path from 'path'

interface FormData {
  mode?: 'aller' | 'retour'
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

interface RetourData {
  // All fields from Prosit Aller
  prositName: string
  studentName: string
  animateur: string
  scribe: string
  gestionnaire: string
  secretaire: string
  year: string
  group: string
  motsCles: string[]
  analyseContexte: string
  definitionProblematique: string
  contraintes: string[]
  hypothese: string[]
  
  // Editable fields for Retour
  motsADefinir: string[]
  definitions: { mot: string; definition: string }[]
  planActions: { 
    title: string
    paragraphs: { 
      id: string
      text: string
      order: number
    }[] 
  }[]
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type')
    
    // Handle Retour mode with FormData (includes images)
    if (contentType?.includes('multipart/form-data')) {
      return await handleRetourMode(request)
    }
    
    // Handle Aller mode with JSON
    const data: FormData = await request.json()

    // Sanitize and encode text to handle special characters
    const sanitizeText = (text: string) => {
      return text.normalize('NFC').replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"')
    }

    // Apply sanitization to all text fields
    const sanitizedData = {
      ...data,
      prositName: sanitizeText(data.prositName),
      studentName: sanitizeText(data.studentName),
      animateur: sanitizeText(data.animateur),
      scribe: sanitizeText(data.scribe),
      gestionnaire: sanitizeText(data.gestionnaire),
      secretaire: sanitizeText(data.secretaire),
      year: sanitizeText(data.year),
      group: sanitizeText(data.group),
      motsCles: data.motsCles.map(sanitizeText),
      motsADefinir: data.motsADefinir.map(sanitizeText),
      analyseContexte: sanitizeText(data.analyseContexte),
      definitionProblematique: sanitizeText(data.definitionProblematique),
      contraintes: data.contraintes.map(sanitizeText),
      hypothese: data.hypothese.map(sanitizeText),
      planActions: data.planActions.map(sanitizeText),
    }

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

  // Create header with logo in top left
  const header = new Header({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            children: [image],
          }),
        ],
        alignment: AlignmentType.LEFT,
      }),
    ],
  })

  // First page
  children.push(
      // Title (centered both vertically & horizontally)
      new Paragraph({
        children: [
          new TextRun({
            text: `CER U.E ${sanitizedData.prositName}`,
            font: 'Arial',
            size: 52, // 26pt
            bold: true,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }, // add spacing
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `"${sanitizedData.studentName}"`,
            font: 'Arial',
            size: 52,
            bold: true,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 800 }, // more space before the table
      }),

      new Paragraph({ text: '' }),
      new Paragraph({ text: '' }),
      new Paragraph({ text: '' }),
      new Paragraph({ text: '' }),
      new Paragraph({ text: '' }),
      new Paragraph({ text: '' }),
      new Paragraph({ text: '' }),
      new Paragraph({ text: '' }),
      new Paragraph({ text: '' }),
      new Paragraph({ text: '' }),

      // Roles table
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          // Header row
          new TableRow({
            height: { value: 600, rule: "atLeast" },
            children: [
              new TableCell({
                width: { size: 25, type: WidthType.PERCENTAGE },
                verticalAlign: "center",
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: "Rôle", bold: true, font: "Arial" })],
                  }),
                ],
                shading: { type: ShadingType.CLEAR, color: "auto", fill: "FFD700" },
              }),
              new TableCell({
                width: { size: 75, type: WidthType.PERCENTAGE },
                verticalAlign: "center",
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: "Nom Prénom", bold: true, font: "Arial" })],
                  }),
                ],
                shading: { type: ShadingType.CLEAR, color: "auto", fill: "FFD700" },
              }),
            ],
          }),

          // Animateur
          new TableRow({
            height: { value: 600, rule: "atLeast" }, // taller row
            children: [
              new TableCell({
                width: { size: 25, type: WidthType.PERCENTAGE },
                verticalAlign: "center",
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: "Animateur", bold: true, font: "Arial" })],
                  }),
                ],
                shading: { type: ShadingType.CLEAR, color: "auto", fill: "FFF8DC" },
              }),
              new TableCell({
                width: { size: 75, type: WidthType.PERCENTAGE },
                verticalAlign: "center",
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: sanitizedData.animateur || "", font: "Arial" })],
                  }),
                ],
                shading: { type: ShadingType.CLEAR, color: "auto", fill: "FFF8DC" },
              }),
            ],
          }),

          // Scribe
          new TableRow({
            height: { value: 600, rule: "atLeast" },
            children: [
              new TableCell({
                width: { size: 25, type: WidthType.PERCENTAGE },
                verticalAlign: "center",
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: "Scribe", bold: true, font: "Arial" })],
                  }),
                ],
                shading: { type: ShadingType.CLEAR, color: "auto", fill: "FFEFD5" },
              }),
              new TableCell({
                width: { size: 75, type: WidthType.PERCENTAGE },
                verticalAlign: "center",
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: sanitizedData.scribe || "", font: "Arial" })],
                  }),
                ],
                shading: { type: ShadingType.CLEAR, color: "auto", fill: "FFEFD5" },
              }),
            ],
          }),

          // Gestionnaire
          new TableRow({
            height: { value: 600, rule: "atLeast" },
            children: [
              new TableCell({
                width: { size: 25, type: WidthType.PERCENTAGE },
                verticalAlign: "center",
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: "Gestionnaire", bold: true, font: "Arial" })],
                  }),
                ],
                shading: { type: ShadingType.CLEAR, color: "auto", fill: "FFF8DC" },
              }),
              new TableCell({
                width: { size: 75, type: WidthType.PERCENTAGE },
                verticalAlign: "center",
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: sanitizedData.gestionnaire || "", font: "Arial" })],
                  }),
                ],
                shading: { type: ShadingType.CLEAR, color: "auto", fill: "FFF8DC" },
              }),
            ],
          }),

          // Secrétaire
          new TableRow({
            height: { value: 600, rule: "atLeast" },
            children: [
              new TableCell({
                width: { size: 25, type: WidthType.PERCENTAGE },
                verticalAlign: "center",
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: "Secrétaire", bold: true, font: "Arial" })],
                  }),
                ],
                shading: { type: ShadingType.CLEAR, color: "auto", fill: "FFEFD5" },
              }),
              new TableCell({
                width: { size: 75, type: WidthType.PERCENTAGE },
                verticalAlign: "center",
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: sanitizedData.secretaire || "", font: "Arial" })],
                  }),
                ],
                shading: { type: ShadingType.CLEAR, color: "auto", fill: "FFEFD5" },
              }),
            ],
          }),
        ],
      }),



      // Page break
      new Paragraph({ text: '', pageBreakBefore: true })
  );

  if (sanitizedData.motsCles.some(m => m.trim())) {
    children.push(
      new Paragraph({ children: [new TextRun({ text: '1. Mots clés:', font: 'Arial', size: 24, bold: true })] }),
      new Paragraph({ text: '' }), // Spacing before bullets
      ...sanitizedData.motsCles.filter(m => m.trim()).map(mot => new Paragraph({ children: [new TextRun({ text: `${mot}`, font: 'Arial', size: 24 })], bullet: { level: 0 } })),
      new Paragraph({ text: '' }) // Spacing after bullets
    )
  }

  // Mots à définir
  if (sanitizedData.motsADefinir.some(m => m.trim())) {
    children.push(
      new Paragraph({ children: [new TextRun({ text: '2. Mots à définir:', font: 'Arial', size: 24, bold: true })] }),
      new Paragraph({ text: '' }), // Spacing before bullets
      ...sanitizedData.motsADefinir.filter(m => m.trim()).map(mot => new Paragraph({ children: [new TextRun({ text: `${mot}`, font: 'Arial', size: 24 })], bullet: { level: 0 } })),
      new Paragraph({ text: '' }) // Spacing after bullets
    )
  }

  // Analyse du contexte
  if (sanitizedData.analyseContexte.trim()) {
    children.push(
      new Paragraph({ children: [new TextRun({ text: '3. Analyse du contexte:', font: 'Arial', size: 24, bold: true })] }),
      new Paragraph({ text: '' }), // Spacing before content
      new Paragraph({ children: [new TextRun({ text: sanitizedData.analyseContexte, font: 'Arial', size: 24 })] }),
      new Paragraph({ text: '' }) // Spacing after content
    )
  }

  // Définition de la problématique
  if (sanitizedData.definitionProblematique.trim()) {
    children.push(
      new Paragraph({ children: [new TextRun({ text: '4. Définition de la problématique:', font: 'Arial', size: 24, bold: true })] }),
      new Paragraph({ text: '' }), // Spacing before content
      new Paragraph({ children: [new TextRun({ text: sanitizedData.definitionProblematique, font: 'Arial', size: 24 })] }),
      new Paragraph({ text: '' }) // Spacing after content
    )
  }

  // Contraintes
  if (sanitizedData.contraintes.some(c => c.trim())) {
    children.push(
      new Paragraph({ children: [new TextRun({ text: '5. Contraintes:', font: 'Arial', size: 24, bold: true })] }),
      new Paragraph({ text: '' }), // Spacing before bullets
      ...sanitizedData.contraintes.filter(c => c.trim()).map(con => new Paragraph({ children: [new TextRun({ text: `${con}`, font: 'Arial', size: 24 })], bullet: { level: 0 } })),
      new Paragraph({ text: '' }) // Spacing after bullets
    )
  }

  // Plan d'action
  if (sanitizedData.planActions.some(a => a.trim())) {
    children.push(
        new Paragraph({
          children: [new TextRun({ text: "6. Plan d'actions :", font: "Arial", size: 24, bold: true })],
        }),
        new Paragraph({ text: "" }) // spacing before list of actions
    );

    sanitizedData.planActions
        .filter(a => a.trim())
        .forEach((action, index) => {
          const secNum = `6.${index + 1}`;

          // action description (indented a bit under the subsection header)
          children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: `${secNum} ${action}`, font: "Arial", size: 24, bold: true }),
                ],
                indent: { left: 400 },
                spacing: { after: 80 },
              })
          );

          // a. Qualification : Abouti / Difficile à concrétiser / Non abouti
          children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: "a. Qualification : ", font: "Arial", size: 24, bold: true }),
                  new TextRun({ text: "Abouti", font: "Arial", size: 24, highlight: "green", bold: true }),
                  new TextRun({ text: " / ", font: "Arial", size: 24 }),
                  new TextRun({ text: "Difficile à concrétiser", font: "Arial", size: 24, highlight: "yellow", bold: true }),
                  new TextRun({ text: " / ", font: "Arial", size: 24 }),
                  new TextRun({ text: "Non abouti", font: "Arial", size: 24, highlight: "red", bold: true }),
                ],
                indent: { left: 360 },
                spacing: { after: 80 },
              })
          );

          // b. Demonstration : (placeholder)
          children.push(
              new Paragraph({
                children: [new TextRun({ text: "b. Démonstration :", font: "Arial", size: 24, bold: true })],
                indent: { left: 360 },
                spacing: { after: 160 },
              }),
          new Paragraph({ text: '' })
          );
        });

  }

// Hypothèses
  if (sanitizedData.hypothese.some(h => h.trim())) {
    children.push(
        new Paragraph({
          children: [new TextRun({ text: "7. Hypothèses :", font: "Arial", size: 24, bold: true })],
        }),
        new Paragraph({ text: "" }) // spacing before list of hypotheses
    );

    sanitizedData.hypothese
        .filter(h => h.trim())
        .forEach((hyp, index) => {
          const secNum = `7.${index + 1}`;

          // hypothesis text (indented)
          children.push(
              new Paragraph({
                children: [new TextRun({ text: `${secNum} ${hyp}`, font: "Arial", size: 24, bold: true })],
                indent: { left: 400 },
                spacing: { after: 80 },
              })
          );

          // Qualification : Vrai / Faux
          children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: "a. Qualification : ", font: "Arial", size: 24, bold: true }),
                  new TextRun({ text: "Vrai", font: "Arial", size: 24, highlight: "green", bold: true }),
                  new TextRun({ text: " / ", font: "Arial", size: 24, bold: true }),
                  new TextRun({ text: "Faux", font: "Arial", size: 24, highlight: "red", bold: true }),
                ],
                indent: { left: 360 },
                spacing: { after: 80 },
              })
          );

          // b. Demonstration :
          children.push(
              new Paragraph({
                children: [new TextRun({ text: "b. Démonstration :", font: "Arial", size: 24, bold: true })],
                indent: { left: 360 },
                spacing: { after: 160 },
              }),
              new Paragraph({ text: '' })
          );
        });
  }


  const footerFirstPage = new Footer({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: `${new Date().toLocaleDateString('fr-FR')} A${sanitizedData.year}-Groupe ${sanitizedData.group}`,
            font: 'Arial',
            size: 24,
          }),
        ],
        alignment: AlignmentType.LEFT,
      }),
    ],
  });

  const doc = new Document({
    sections: [{
      headers: {
        first: header,
        default: header,
      },
      footers: {
        first: footerFirstPage,
        default: new Footer({ children: [] }),
      },
      properties: {
        titlePage: true,
      },
      children: children,
    }],
  })

  const buffer = await Packer.toBuffer(doc)

  // Sanitize filename to be safe for HTTP headers
  // Remove or replace special characters that might cause issues
  const safeFileName = sanitizedData.prositName
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (accents)
    .replace(/[^a-zA-Z0-9_-]/g, '_') // Replace any remaining special chars with underscore
    .trim()

  const fileName = `Prosit_${safeFileName}_${sanitizedData.studentName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]/g, '_')}.docx`
  
  // Use RFC 5987 encoding for the filename with special characters
  const encodedFileName = encodeURIComponent(fileName)

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${fileName}"; filename*=UTF-8''${encodedFileName}`,
    },
  })
  } catch (error) {
    console.error('Error generating document:', error)
    return new Response(JSON.stringify({ error: 'Failed to generate document' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}

async function handleRetourMode(request: NextRequest) {
  try {
    const formData = await request.formData()
    const dataString = formData.get('data') as string
    const retourData: RetourData = JSON.parse(dataString)

    // Sanitize text helper
    const sanitizeText = (text: string) => {
      return text.normalize('NFC').replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"')
    }

    // Convert LaTeX-style math notation to readable text
    const convertLatexToText = (text: string): string => {
      return text
        // Remove LaTeX delimiters
        .replace(/\\\(/g, '').replace(/\\\)/g, '')
        .replace(/\$\$/g, '').replace(/\$/g, '')
        
        // Convert common LaTeX commands
        .replace(/\\text\{([^}]+)\}/g, '$1')
        .replace(/\\neq/g, '≠')
        .replace(/\\leq/g, '≤')
        .replace(/\\geq/g, '≥')
        .replace(/\\times/g, '×')
        .replace(/\\div/g, '÷')
        .replace(/\\pm/g, '±')
        .replace(/\\infty/g, '∞')
        .replace(/\\alpha/g, 'α')
        .replace(/\\beta/g, 'β')
        .replace(/\\gamma/g, 'γ')
        .replace(/\\delta/g, 'δ')
        .replace(/\\theta/g, 'θ')
        .replace(/\\lambda/g, 'λ')
        .replace(/\\mu/g, 'μ')
        .replace(/\\pi/g, 'π')
        .replace(/\\sigma/g, 'σ')
        .replace(/\\to/g, '→')
        .replace(/\\rightarrow/g, '→')
        .replace(/\\leftarrow/g, '←')
        .replace(/\\Rightarrow/g, '⇒')
        .replace(/\\Leftarrow/g, '⇐')
        .replace(/\\in/g, '∈')
        .replace(/\\notin/g, '∉')
        .replace(/\\subset/g, '⊂')
        .replace(/\\supset/g, '⊃')
        .replace(/\\cup/g, '∪')
        .replace(/\\cap/g, '∩')
        .replace(/\\emptyset/g, '∅')
        .replace(/\\forall/g, '∀')
        .replace(/\\exists/g, '∃')
        .replace(/\\sum/g, '∑')
        .replace(/\\prod/g, '∏')
        .replace(/\\int/g, '∫')
        .replace(/\\cdot/g, '·')
        
        // Clean up brackets and parentheses
        .replace(/\\\{/g, '{').replace(/\\\}/g, '}')
        .replace(/\\\[/g, '[').replace(/\\\]/g, ']')
        
        // Remove remaining backslashes
        .replace(/\\/g, '')
    }

    // Helper function to parse markdown-style text into Word paragraphs
    const parseTextToParagraphs = (text: string, baseIndent: number = 0): Paragraph[] => {
      const paragraphs: Paragraph[] = []
      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
      
      for (const line of lines) {
        // Handle headers (## Title)
        if (line.startsWith('##')) {
          const headerText = line.replace(/^#+\s*/, '')
          paragraphs.push(
            new Paragraph({
              children: [new TextRun({ text: sanitizeText(headerText), font: 'Arial', size: 28, bold: true })],
              spacing: { before: 200, after: 100 },
              indent: { left: baseIndent },
            })
          )
        }
        // Handle subheaders (### Title)
        else if (line.startsWith('###')) {
          const subheaderText = line.replace(/^#+\s*/, '')
          paragraphs.push(
            new Paragraph({
              children: [new TextRun({ text: sanitizeText(subheaderText), font: 'Arial', size: 26, bold: true })],
              spacing: { before: 150, after: 80 },
              indent: { left: baseIndent + 200 },
            })
          )
        }
        // Handle bullet points
        else if (line.startsWith('*') || line.startsWith('-')) {
          const bulletText = convertLatexToText(line.replace(/^[*-]\s*/, ''))
          // Parse bold text within bullets (**text**)
          const parts = bulletText.split(/(\*\*.*?\*\*)/)
          const textRuns: TextRun[] = []
          
          for (const part of parts) {
            if (part.startsWith('**') && part.endsWith('**')) {
              textRuns.push(new TextRun({ text: sanitizeText(part.replace(/\*\*/g, '')), font: 'Arial', size: 24, bold: true }))
            } else if (part.length > 0) {
              textRuns.push(new TextRun({ text: sanitizeText(part), font: 'Arial', size: 24 }))
            }
          }
          
          paragraphs.push(
            new Paragraph({
              children: textRuns,
              bullet: { level: 0 },
              spacing: { after: 80 },
              indent: { left: baseIndent },
            })
          )
        }
        // Handle code blocks (```...```)
        else if (line.startsWith('```')) {
          continue // Skip code block markers
        }
        // Handle blockquotes (> text)
        else if (line.startsWith('>')) {
          const quoteText = line.replace(/^>\s*/, '')
          paragraphs.push(
            new Paragraph({
              children: [new TextRun({ text: sanitizeText(quoteText), font: 'Arial', size: 22, italics: true })],
              indent: { left: baseIndent + 400 },
              spacing: { after: 100 },
            })
          )
        }
        // Handle horizontal rules (---)
        else if (line === '---' || line === '***') {
          paragraphs.push(new Paragraph({ text: '', border: { bottom: { color: '000000', space: 1, style: 'single', size: 6 } }, spacing: { after: 200 }, indent: { left: baseIndent } }))
        }
        // Handle regular text with inline formatting
        else {
          // First convert any LaTeX expressions
          const processedLine = convertLatexToText(line)
          
          // Parse bold (**text**), code (`text`), and math expressions
          const parts = processedLine.split(/(\*\*.*?\*\*|\`.*?\`|\(.*?\)|\[.*?\])/)
          const textRuns: TextRun[] = []
          
          for (const part of parts) {
            if (part.startsWith('**') && part.endsWith('**')) {
              textRuns.push(new TextRun({ text: sanitizeText(part.replace(/\*\*/g, '')), font: 'Arial', size: 24, bold: true }))
            } else if (part.startsWith('`') && part.endsWith('`')) {
              textRuns.push(new TextRun({ text: sanitizeText(part.replace(/`/g, '')), font: 'Courier New', size: 22 }))
            } else if (part.startsWith('(') && part.endsWith(')') && part.includes('=')) {
              // Mathematical expressions in parentheses - use italic font
              textRuns.push(new TextRun({ text: sanitizeText(part), font: 'Arial', size: 24, italics: true }))
            } else if (part.length > 0) {
              textRuns.push(new TextRun({ text: sanitizeText(part), font: 'Arial', size: 24 }))
            }
          }
          
          if (textRuns.length > 0) {
            paragraphs.push(
              new Paragraph({
                children: textRuns,
                spacing: { after: 100 },
                indent: { left: baseIndent },
              })
            )
          }
        }
      }
      
      return paragraphs
    }

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

    // Create header with logo in top left
    const header = new Header({
      children: [
        new Paragraph({
          children: [
            new TextRun({
              children: [image],
            }),
          ],
          alignment: AlignmentType.LEFT,
        }),
      ],
    })

    // First page - Title and roles table (same as Aller)
    children.push(
      // Alpha warning banner
      new Paragraph({
        children: [
          new TextRun({
            text: '⚠️ EXPERIMENTAL - ALPHA VERSION ⚠️',
            font: 'Arial',
            size: 28,
            bold: true,
            color: 'FF0000', // Red color
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: 'This Prosit Retour feature is currently in alpha testing. Please report any issues.',
            font: 'Arial',
            size: 20,
            italics: true,
            color: 'FF6600', // Orange color
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
      
      // Title (centered)
      new Paragraph({
        children: [
          new TextRun({
            text: `CER U.E ${sanitizeText(retourData.prositName)}`,
            font: 'Arial',
            size: 52, // 26pt
            bold: true,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `"${sanitizeText(retourData.studentName)}"`,
            font: 'Arial',
            size: 52,
            bold: true,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 800 },
      }),

      new Paragraph({ text: '' }),
      new Paragraph({ text: '' }),
      new Paragraph({ text: '' }),
      new Paragraph({ text: '' }),
      new Paragraph({ text: '' }),
      new Paragraph({ text: '' }),
      new Paragraph({ text: '' }),
      new Paragraph({ text: '' }),
      new Paragraph({ text: '' }),
      new Paragraph({ text: '' }),

      // Roles table with same colors as Aller
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          // Header row (gold)
          new TableRow({
            height: { value: 600, rule: "atLeast" },
            children: [
              new TableCell({
                width: { size: 25, type: WidthType.PERCENTAGE },
                verticalAlign: "center",
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: "Rôle", bold: true, font: "Arial" })],
                  }),
                ],
                shading: { type: ShadingType.CLEAR, color: "auto", fill: "FFD700" },
              }),
              new TableCell({
                width: { size: 75, type: WidthType.PERCENTAGE },
                verticalAlign: "center",
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: "Nom Prénom", bold: true, font: "Arial" })],
                  }),
                ],
                shading: { type: ShadingType.CLEAR, color: "auto", fill: "FFD700" },
              }),
            ],
          }),

          // Animateur (light cream)
          new TableRow({
            height: { value: 600, rule: "atLeast" },
            children: [
              new TableCell({
                width: { size: 25, type: WidthType.PERCENTAGE },
                verticalAlign: "center",
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: "Animateur", bold: true, font: "Arial" })],
                  }),
                ],
                shading: { type: ShadingType.CLEAR, color: "auto", fill: "FFF8DC" },
              }),
              new TableCell({
                width: { size: 75, type: WidthType.PERCENTAGE },
                verticalAlign: "center",
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: sanitizeText(retourData.animateur) || "", font: "Arial" })],
                  }),
                ],
                shading: { type: ShadingType.CLEAR, color: "auto", fill: "FFF8DC" },
              }),
            ],
          }),

          // Scribe (papaya whip)
          new TableRow({
            height: { value: 600, rule: "atLeast" },
            children: [
              new TableCell({
                width: { size: 25, type: WidthType.PERCENTAGE },
                verticalAlign: "center",
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: "Scribe", bold: true, font: "Arial" })],
                  }),
                ],
                shading: { type: ShadingType.CLEAR, color: "auto", fill: "FFEFD5" },
              }),
              new TableCell({
                width: { size: 75, type: WidthType.PERCENTAGE },
                verticalAlign: "center",
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: sanitizeText(retourData.scribe) || "", font: "Arial" })],
                  }),
                ],
                shading: { type: ShadingType.CLEAR, color: "auto", fill: "FFEFD5" },
              }),
            ],
          }),

          // Gestionnaire (light cream)
          new TableRow({
            height: { value: 600, rule: "atLeast" },
            children: [
              new TableCell({
                width: { size: 25, type: WidthType.PERCENTAGE },
                verticalAlign: "center",
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: "Gestionnaire", bold: true, font: "Arial" })],
                  }),
                ],
                shading: { type: ShadingType.CLEAR, color: "auto", fill: "FFF8DC" },
              }),
              new TableCell({
                width: { size: 75, type: WidthType.PERCENTAGE },
                verticalAlign: "center",
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: sanitizeText(retourData.gestionnaire) || "", font: "Arial" })],
                  }),
                ],
                shading: { type: ShadingType.CLEAR, color: "auto", fill: "FFF8DC" },
              }),
            ],
          }),

          // Secrétaire (papaya whip)
          new TableRow({
            height: { value: 600, rule: "atLeast" },
            children: [
              new TableCell({
                width: { size: 25, type: WidthType.PERCENTAGE },
                verticalAlign: "center",
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: "Secrétaire", bold: true, font: "Arial" })],
                  }),
                ],
                shading: { type: ShadingType.CLEAR, color: "auto", fill: "FFEFD5" },
              }),
              new TableCell({
                width: { size: 75, type: WidthType.PERCENTAGE },
                verticalAlign: "center",
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: sanitizeText(retourData.secretaire) || "", font: "Arial" })],
                  }),
                ],
                shading: { type: ShadingType.CLEAR, color: "auto", fill: "FFEFD5" },
              }),
            ],
          }),
        ],
      }),

      // Page break
      new Paragraph({ text: '', pageBreakBefore: true })
    )

    // 1. Mots clés
    if (retourData.motsCles.length > 0) {
      children.push(
        new Paragraph({ children: [new TextRun({ text: '1. Mots clés:', font: 'Arial', size: 24, bold: true })] }),
        new Paragraph({ text: '' }), // Spacing before bullets
        ...retourData.motsCles.map(mot => new Paragraph({ 
          children: [new TextRun({ text: sanitizeText(mot), font: 'Arial', size: 24 })], 
          bullet: { level: 0 } 
        })),
        new Paragraph({ text: '' }) // Spacing after bullets
      )
    }

    // 2. Mots à définir (with definitions)
    if (retourData.definitions.length > 0) {
      children.push(
        new Paragraph({ children: [new TextRun({ text: '2. Mots à définir:', font: 'Arial', size: 24, bold: true })] }),
        new Paragraph({ text: '' }) // Spacing before content
      )

      retourData.definitions.forEach(def => {
        // Add the word as a subheading
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${sanitizeText(def.mot)}`, font: 'Arial', size: 24, bold: true })
            ],
            spacing: { before: 150, after: 80 },
          })
        )
        
        // Parse and add the definition with proper formatting
        const definitionParagraphs = parseTextToParagraphs(def.definition)
        children.push(...definitionParagraphs)
      })

      children.push(new Paragraph({ text: '' })) // Spacing after section
    }

    // 3. Analyse du contexte
    if (retourData.analyseContexte.trim()) {
      children.push(
        new Paragraph({ children: [new TextRun({ text: '3. Analyse du contexte:', font: 'Arial', size: 24, bold: true })] }),
        new Paragraph({ text: '' }), // Spacing before content
        new Paragraph({ children: [new TextRun({ text: sanitizeText(retourData.analyseContexte), font: 'Arial', size: 24 })] }),
        new Paragraph({ text: '' }) // Spacing after content
      )
    }

    // 4. Définition de la problématique
    if (retourData.definitionProblematique.trim()) {
      children.push(
        new Paragraph({ children: [new TextRun({ text: '4. Définition de la problématique:', font: 'Arial', size: 24, bold: true })] }),
        new Paragraph({ text: '' }), // Spacing before content
        new Paragraph({ children: [new TextRun({ text: sanitizeText(retourData.definitionProblematique), font: 'Arial', size: 24 })] }),
        new Paragraph({ text: '' }) // Spacing after content
      )
    }

    // 5. Contraintes
    if (retourData.contraintes.length > 0) {
      children.push(
        new Paragraph({ children: [new TextRun({ text: '5. Contraintes:', font: 'Arial', size: 24, bold: true })] }),
        new Paragraph({ text: '' }), // Spacing before bullets
        ...retourData.contraintes.map(con => new Paragraph({ 
          children: [new TextRun({ text: sanitizeText(con), font: 'Arial', size: 24 })], 
          bullet: { level: 0 } 
        })),
        new Paragraph({ text: '' }) // Spacing after bullets
      )
    }

    // 6. Plan d'actions (with paragraphs and images)
    if (retourData.planActions.length > 0) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: "6. Plan d'actions :", font: "Arial", size: 24, bold: true })],
        }),
        new Paragraph({ text: "" }) // spacing before list of actions
      )

      for (let i = 0; i < retourData.planActions.length; i++) {
        const action = retourData.planActions[i]
        const secNum = `6.${i + 1}`

        // Action title (indented)
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${secNum} ${sanitizeText(action.title)}`, font: "Arial", size: 24, bold: true }),
            ],
            indent: { left: 400 },
            spacing: { after: 80 },
          })
        )

        // Sort paragraphs by order
        const sortedParagraphs = [...action.paragraphs].sort((a, b) => a.order - b.order)

        for (let paraIdx = 0; paraIdx < sortedParagraphs.length; paraIdx++) {
          const para = sortedParagraphs[paraIdx]

          // Add paragraph text with proper formatting
          if (para.text && para.text.trim()) {
            const formattedParagraphs = parseTextToParagraphs(para.text, 400)
            children.push(...formattedParagraphs)
          }

          // Add image if present
          const imageKey = `image_${i}_${action.paragraphs.findIndex(p => p.id === para.id)}`
          const imageFile = formData.get(imageKey) as File | null

          if (imageFile) {
            try {
              const imageArrayBuffer = await imageFile.arrayBuffer()
              const imageBufferData = Buffer.from(imageArrayBuffer)

              // Determine image type
              const imageType = imageFile.type.includes('png') ? 'png' : 'jpg'

              children.push(
                new Paragraph({
                  children: [
                    new ImageRun({
                      data: imageBufferData,
                      transformation: {
                        width: 400,
                        height: 300,
                      },
                      type: imageType,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 200 },
                })
              )
            } catch (error) {
              console.error('Error processing image:', error)
            }
          }
        }

        children.push(new Paragraph({ text: '' })) // Spacing after each action
      }
    }

    // 7. Hypothèses
    if (retourData.hypothese.length > 0) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: "7. Hypothèses :", font: "Arial", size: 24, bold: true })],
        }),
        new Paragraph({ text: "" }) // spacing before list of hypotheses
      )

      retourData.hypothese.forEach((hyp, index) => {
        const secNum = `7.${index + 1}`

        // Hypothesis text (indented)
        children.push(
          new Paragraph({
            children: [new TextRun({ text: `${secNum} ${sanitizeText(hyp)}`, font: "Arial", size: 24, bold: true })],
            indent: { left: 400 },
            spacing: { after: 160 },
          })
        )
      })

      children.push(new Paragraph({ text: '' })) // Spacing after section
    }

    // Footer with date, year, and group
    const footerFirstPage = new Footer({
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: `${new Date().toLocaleDateString('fr-FR')} A${retourData.year}-Groupe ${retourData.group}`,
              font: 'Arial',
              size: 24,
            }),
          ],
          alignment: AlignmentType.LEFT,
        }),
      ],
    })

    // Create document
    const doc = new Document({
      sections: [{
        headers: {
          first: header,
          default: header,
        },
        footers: {
          first: footerFirstPage,
          default: new Footer({ children: [] }),
        },
        properties: {
          titlePage: true,
        },
        children: children,
      }],
    })

    const buffer = await Packer.toBuffer(doc)

    // Sanitize filename
    const safeFileName = sanitizeText(retourData.prositName)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .trim()

    const fileName = `Prosit_Retour_${safeFileName}_${sanitizeText(retourData.studentName).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]/g, '_')}.docx`
    const encodedFileName = encodeURIComponent(fileName)

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${fileName}"; filename*=UTF-8''${encodedFileName}`,
      },
    })
  } catch (error) {
    console.error('Error generating retour document:', error)
    return new Response(JSON.stringify({ error: 'Failed to generate retour document' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}