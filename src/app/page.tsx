'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface FormData {
  prositName: string
  studentName: string
  animateur: string
  scribe: string
  gestionnaire: string
  secretaire: string
  year: string
  group: string
  fileName: string
  motsCles: string[]
  motsADefinir: string[]
  analyseContexte: string
  definitionProblematique: string
  contraintes: string[]
  hypothese: string[]
  planActions: string[]
}

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    prositName: '',
    studentName: '',
    animateur: '',
    scribe: '',
    gestionnaire: '',
    secretaire: '',
    year: '',
    group: '',
    fileName: 'prosit',
    motsCles: [''],
    motsADefinir: [''],
    analyseContexte: '',
    definitionProblematique: '',
    contraintes: [''],
    hypothese: [''],
    planActions: ['']
  })

  const updateField = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addItem = (field: 'motsCles' | 'motsADefinir' | 'contraintes' | 'hypothese' | 'planActions') => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }))
  }

  const updateItem = (field: 'motsCles' | 'motsADefinir' | 'contraintes' | 'hypothese' | 'planActions', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  const removeItem = (field: 'motsCles' | 'motsADefinir' | 'contraintes' | 'hypothese' | 'planActions', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    if (response.ok) {
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      const fileName = formData.fileName.trim() || 'prosit'
      const fullFileName = fileName.endsWith('.docx') ? fileName : `${fileName}.docx`
      a.href = url
      a.download = fullFileName
      a.click()
      window.URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Générateur de Prosit</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="prositName">Nom du Prosit</Label>
            <Input id="prositName" value={formData.prositName} onChange={(e) => updateField('prositName', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="studentName">Nom de l'étudiant</Label>
            <Input id="studentName" value={formData.studentName} onChange={(e) => updateField('studentName', e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="animateur">Animateur</Label>
            <Input id="animateur" value={formData.animateur} onChange={(e) => updateField('animateur', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="scribe">Scribe</Label>
            <Input id="scribe" value={formData.scribe} onChange={(e) => updateField('scribe', e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="gestionnaire">Gestionnaire</Label>
            <Input id="gestionnaire" value={formData.gestionnaire} onChange={(e) => updateField('gestionnaire', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="secretaire">Secrétaire</Label>
            <Input id="secretaire" value={formData.secretaire} onChange={(e) => updateField('secretaire', e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="year">Année (A)</Label>
            <Input id="year" value={formData.year} onChange={(e) => updateField('year', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="group">Groupe</Label>
            <Input id="group" value={formData.group} onChange={(e) => updateField('group', e.target.value)} />
          </div>
        </div>

        <div>
          <Label htmlFor="fileName">Nom du fichier (sans extension)</Label>
          <Input id="fileName" value={formData.fileName} onChange={(e) => updateField('fileName', e.target.value)} placeholder="prosit" />
        </div>

        <div>
          <Label>Mots clés</Label>
          {formData.motsCles.map((mot, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <Input value={mot} onChange={(e) => updateItem('motsCles', index, e.target.value)} />
              <Button type="button" variant="outline" onClick={() => removeItem('motsCles', index)}>Supprimer</Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => addItem('motsCles')}>Ajouter</Button>
        </div>

        <div>
          <Label>Mots à définir</Label>
          {formData.motsADefinir.map((mot, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <Input value={mot} onChange={(e) => updateItem('motsADefinir', index, e.target.value)} />
              <Button type="button" variant="outline" onClick={() => removeItem('motsADefinir', index)}>Supprimer</Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => addItem('motsADefinir')}>Ajouter</Button>
        </div>

        <div>
          <Label htmlFor="analyseContexte">Analyse du contexte</Label>
          <Textarea id="analyseContexte" value={formData.analyseContexte} onChange={(e) => updateField('analyseContexte', e.target.value)} />
        </div>

        <div>
          <Label htmlFor="definitionProblematique">Définition de la problématique</Label>
          <Textarea id="definitionProblematique" value={formData.definitionProblematique} onChange={(e) => updateField('definitionProblematique', e.target.value)} />
        </div>

        <div>
          <Label>Contraintes</Label>
          {formData.contraintes.map((contrainte, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <Input value={contrainte} onChange={(e) => updateItem('contraintes', index, e.target.value)} />
              <Button type="button" variant="outline" onClick={() => removeItem('contraintes', index)}>Supprimer</Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => addItem('contraintes')}>Ajouter</Button>
        </div>

        <div>
          <Label>Hypothèse</Label>
          {formData.hypothese.map((hyp, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <Input value={hyp} onChange={(e) => updateItem('hypothese', index, e.target.value)} />
              <Button type="button" variant="outline" onClick={() => removeItem('hypothese', index)}>Supprimer</Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => addItem('hypothese')}>Ajouter</Button>
        </div>

        <div>
          <Label>Plan d'actions</Label>
          {formData.planActions.map((action, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <Input value={action} onChange={(e) => updateItem('planActions', index, e.target.value)} />
              <Button type="button" variant="outline" onClick={() => removeItem('planActions', index)}>Supprimer</Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => addItem('planActions')}>Ajouter</Button>
        </div>

        <Button type="submit">Générer le Prosit</Button>
      </form>
    </div>
  )
}
