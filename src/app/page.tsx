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
  motsCles: string[]
  motsADefinir: string[]
  analyseContexte: string
  definitionProblematique: string
  contraintes: string[]
  hypothese: string[]
  planActions: string[]
}

interface PrositRetourData {
  prositName: string
  studentName: string
  motsADefinir: { word: string; definition: string }[]
  planActions: { title: string; content: string; images: File[] }[]
}

type Mode = 'aller' | 'retour'

export default function Home() {
  const [mode, setMode] = useState<Mode>('aller')
  const [formData, setFormData] = useState<FormData>({
    prositName: '',
    studentName: '',
    animateur: '',
    scribe: '',
    gestionnaire: '',
    secretaire: '',
    year: '',
    group: '',
    motsCles: [''],
    motsADefinir: [''],
    analyseContexte: '',
    definitionProblematique: '',
    contraintes: [''],
    hypothese: [''],
    planActions: ['']
  })

  const [retourData, setRetourData] = useState<PrositRetourData>({
    prositName: '',
    studentName: '',
    motsADefinir: [],
    planActions: []
  })

  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

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

  const handleAllerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, mode: 'aller' })
    })
    if (response.ok) {
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      const fileName = `Prosit_${formData.prositName}_${formData.studentName}.docx`
      a.href = url
      a.download = fileName
      a.click()
      window.URL.revokeObjectURL(url)
    }
  }

  const handleRetourSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...retourData, mode: 'retour' })
    })
    if (response.ok) {
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      const fileName = `Prosit_Retour_${new Date().toISOString().split('T')[0]}.docx`
      a.href = url
      a.download = fileName
      a.click()
      window.URL.revokeObjectURL(url)
    } else {
      console.error('Failed to generate document')
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Tab Navigation */}
      <div className="flex justify-center mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setMode('aller')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              mode === 'aller'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Prosit Aller
          </button>
          <button
            onClick={() => setMode('retour')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              mode === 'retour'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Prosit Retour
          </button>
        </div>
      </div>

      {mode === 'aller' ? (
        <AllerForm
          formData={formData}
          updateField={updateField}
          addItem={addItem}
          updateItem={updateItem}
          removeItem={removeItem}
          onSubmit={handleAllerSubmit}
        />
      ) : (
        <RetourForm
          retourData={retourData}
          setRetourData={setRetourData}
          uploadedFile={uploadedFile}
          setUploadedFile={setUploadedFile}
          onSubmit={handleRetourSubmit}
        />
      )}
    </div>
  )
}

// Prosit Aller Form Component
function AllerForm({
  formData,
  updateField,
  addItem,
  updateItem,
  removeItem,
  onSubmit
}: {
  formData: FormData
  updateField: (field: keyof FormData, value: string | string[]) => void
  addItem: (field: 'motsCles' | 'motsADefinir' | 'contraintes' | 'hypothese' | 'planActions') => void
  updateItem: (field: 'motsCles' | 'motsADefinir' | 'contraintes' | 'hypothese' | 'planActions', index: number, value: string) => void
  removeItem: (field: 'motsCles' | 'motsADefinir' | 'contraintes' | 'hypothese' | 'planActions', index: number) => void
  onSubmit: (e: React.FormEvent) => void
}) {
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Prosit Aller</h1>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="prositName">Nom du Prosit</Label>
            <Input id="prositName" value={formData.prositName} onChange={(e) => updateField('prositName', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="studentName">Nom de l'étudiant</Label>
            <Input id="studentName" value={formData.studentName} onChange={(e) => updateField('studentName', e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="animateur">Animateur</Label>
            <Input id="animateur" value={formData.animateur} onChange={(e) => updateField('animateur', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="scribe">Scribe</Label>
            <Input id="scribe" value={formData.scribe} onChange={(e) => updateField('scribe', e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="gestionnaire">Gestionnaire</Label>
            <Input id="gestionnaire" value={formData.gestionnaire} onChange={(e) => updateField('gestionnaire', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="secretaire">Secrétaire</Label>
            <Input id="secretaire" value={formData.secretaire} onChange={(e) => updateField('secretaire', e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="year">Année (A)</Label>
            <Input id="year" value={formData.year} onChange={(e) => updateField('year', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="group">Groupe</Label>
            <Input id="group" value={formData.group} onChange={(e) => updateField('group', e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Mots clés</Label>
          {formData.motsCles.map((mot, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <Input value={mot} onChange={(e) => updateItem('motsCles', index, e.target.value)} />
              <Button type="button" variant="outline" onClick={() => removeItem('motsCles', index)}>Supprimer</Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => addItem('motsCles')}>Ajouter</Button>
        </div>

        <div className="space-y-2">
          <Label>Mots à définir</Label>
          {formData.motsADefinir.map((mot, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <Input value={mot} onChange={(e) => updateItem('motsADefinir', index, e.target.value)} />
              <Button type="button" variant="outline" onClick={() => removeItem('motsADefinir', index)}>Supprimer</Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => addItem('motsADefinir')}>Ajouter</Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="analyseContexte">Analyse du contexte</Label>
          <Textarea id="analyseContexte" value={formData.analyseContexte} onChange={(e) => updateField('analyseContexte', e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="definitionProblematique">Définition de la problématique</Label>
          <Textarea id="definitionProblematique" value={formData.definitionProblematique} onChange={(e) => updateField('definitionProblematique', e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Contraintes</Label>
          {formData.contraintes.map((contrainte, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <Input value={contrainte} onChange={(e) => updateItem('contraintes', index, e.target.value)} />
              <Button type="button" variant="outline" onClick={() => removeItem('contraintes', index)}>Supprimer</Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => addItem('contraintes')}>Ajouter</Button>
        </div>

        <div className="space-y-2">
          <Label>Hypothèse</Label>
          {formData.hypothese.map((hyp, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <Input value={hyp} onChange={(e) => updateItem('hypothese', index, e.target.value)} />
              <Button type="button" variant="outline" onClick={() => removeItem('hypothese', index)}>Supprimer</Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => addItem('hypothese')}>Ajouter</Button>
        </div>

        <div className="space-y-2">
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
    </>
  )
}

// Prosit Retour Form Component
function RetourForm({
  retourData,
  setRetourData,
  uploadedFile,
  setUploadedFile,
  onSubmit
}: {
  retourData: PrositRetourData
  setRetourData: (data: PrositRetourData) => void
  uploadedFile: File | null
  setUploadedFile: (file: File | null) => void
  onSubmit: (e: React.FormEvent) => void
}) {
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)

      // Parse the uploaded file
      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await fetch('/api/parse', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          const parsedData = await response.json()

          // Convert parsed motsADefinir to the expected format
          const motsADefinir = parsedData.motsADefinir.map((word: string) => ({
            word: word,
            definition: ''
          }))

          // Convert parsed planActions to the expected format
          const planActions = parsedData.planActions.map((action: string, index: number) => ({
            title: `Plan d'action ${index + 1}`,
            content: action,
            images: []
          }))

          setRetourData({
            ...retourData,
            motsADefinir,
            planActions
          })
        }
      } catch (error) {
        console.error('Error parsing file:', error)
      }
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Prosit Retour</h1>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="retourPrositName">Nom du Prosit</Label>
            <Input
              id="retourPrositName"
              value={retourData.prositName}
              onChange={(e) => setRetourData({ ...retourData, prositName: e.target.value })}
              placeholder="Nom du prosit retour"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="retourStudentName">Nom de l'étudiant</Label>
            <Input
              id="retourStudentName"
              value={retourData.studentName}
              onChange={(e) => setRetourData({ ...retourData, studentName: e.target.value })}
              placeholder="Nom de l'étudiant"
            />
          </div>
        </div>

        <div className="space-y-4">
          <Label>Télécharger le Prosit Aller</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <input
              id="fileUpload"
              type="file"
              accept=".docx"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label htmlFor="fileUpload" className="cursor-pointer">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    {uploadedFile ? 'Fichier chargé' : 'Cliquez pour télécharger'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {uploadedFile ? uploadedFile.name : 'Sélectionnez un fichier .docx'}
                  </p>
                </div>
              </div>
            </label>
          </div>
          {uploadedFile && (
            <div className="flex items-center space-x-2 text-green-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Fichier analysé avec succès</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Mots à définir</Label>
          {retourData.motsADefinir.map((item, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <Input
                placeholder="Mot"
                value={item.word}
                onChange={(e) => {
                  const newData = { ...retourData }
                  newData.motsADefinir[index].word = e.target.value
                  setRetourData(newData)
                }}
              />
              <Input
                placeholder="Définition"
                value={item.definition}
                onChange={(e) => {
                  const newData = { ...retourData }
                  newData.motsADefinir[index].definition = e.target.value
                  setRetourData(newData)
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const newData = { ...retourData }
                  newData.motsADefinir.splice(index, 1)
                  setRetourData(newData)
                }}
              >
                Supprimer
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const newData = { ...retourData }
              newData.motsADefinir.push({ word: '', definition: '' })
              setRetourData(newData)
            }}
          >
            Ajouter
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Plan d'actions</Label>
          {retourData.planActions.map((item, index) => (
            <div key={index} className="space-y-2 mb-4 p-4 border rounded">
              <Input
                placeholder="Titre de l'action"
                value={item.title}
                onChange={(e) => {
                  const newData = { ...retourData }
                  newData.planActions[index].title = e.target.value
                  setRetourData(newData)
                }}
              />
              <Textarea
                placeholder="Contenu (supporte LaTeX: $formule$ pour inline, $$formule$$ pour display)"
                value={item.content}
                onChange={(e) => {
                  const newData = { ...retourData }
                  newData.planActions[index].content = e.target.value
                  setRetourData(newData)
                }}
              />
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const newData = { ...retourData }
                    const files = Array.from(e.target.files || [])
                    newData.planActions[index].images = [...newData.planActions[index].images, ...files]
                    setRetourData(newData)
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const newData = { ...retourData }
                    newData.planActions.splice(index, 1)
                    setRetourData(newData)
                  }}
                >
                  Supprimer
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const newData = { ...retourData }
              newData.planActions.push({ title: '', content: '', images: [] })
              setRetourData(newData)
            }}
          >
            Ajouter une action
          </Button>
        </div>

        <Button type="submit">Générer le Prosit Retour</Button>
      </form>
    </>
  )
}
