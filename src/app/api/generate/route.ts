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
  try {
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