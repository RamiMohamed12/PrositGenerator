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
            text: `CER U.E ${data.prositName}`,
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
            text: `"${data.studentName}"`,
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
                    children: [new TextRun({ text: data.animateur || "", font: "Arial" })],
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
                    children: [new TextRun({ text: data.scribe || "", font: "Arial" })],
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
                    children: [new TextRun({ text: data.gestionnaire || "", font: "Arial" })],
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
                    children: [new TextRun({ text: data.secretaire || "", font: "Arial" })],
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

  // Plan d'action
  if (data.planActions.some(a => a.trim())) {
    children.push(
        new Paragraph({
          children: [new TextRun({ text: "6. Plan d'actions :", font: "Arial", size: 24, bold: true })],
        }),
        new Paragraph({ text: "" }) // spacing before list of actions
    );

    data.planActions
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
  if (data.hypothese.some(h => h.trim())) {
    children.push(
        new Paragraph({
          children: [new TextRun({ text: "7. Hypothèses :", font: "Arial", size: 24, bold: true })],
        }),
        new Paragraph({ text: "" }) // spacing before list of hypotheses
    );

    data.hypothese
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
            text: `${new Date().toLocaleDateString('fr-FR')} A${data.year}-Groupe ${data.group}`,
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

  const fileName = `Prosit_${data.prositName}---.docx`

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename=${fileName}`,
    },
  })
}