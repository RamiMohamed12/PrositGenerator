'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ThemeToggle } from '@/components/theme-toggle'

type PageMode = 'aller' | 'retour'

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

interface PlanActionParagraph {
  id: string
  text: string
  image: File | null
  order: number
}

interface RetourFormData {
  // Read-only fields from scanned document
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
  
  // Editable fields
  motsADefinir: string[]
  definitions: { mot: string; definition: string }[]
  planActions: { title: string; paragraphs: PlanActionParagraph[] }[]
}

export default function Home() {
  const [mode, setMode] = useState<PageMode>('aller')
  const [retourData, setRetourData] = useState<RetourFormData>({
    prositName: '',
    studentName: '',
    animateur: '',
    scribe: '',
    gestionnaire: '',
    secretaire: '',
    year: '',
    group: '',
    motsCles: [],
    analyseContexte: '',
    definitionProblematique: '',
    contraintes: [],
    hypothese: [],
    motsADefinir: [],
    definitions: [],
    planActions: []
  })
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadedFile(file)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/parse', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Parsed data:', data) // Debug log
        
        setRetourData({
          // Read-only fields from scanned document
          prositName: data.prositName || '',
          studentName: data.studentName || '',
          animateur: data.animateur || '',
          scribe: data.scribe || '',
          gestionnaire: data.gestionnaire || '',
          secretaire: data.secretaire || '',
          year: data.year || '',
          group: data.group || '',
          motsCles: data.motsCles || [],
          analyseContexte: data.analyseContexte || '',
          definitionProblematique: data.definitionProblematique || '',
          contraintes: data.contraintes || [],
          hypothese: data.hypothese || [],
          
          // Editable fields
          motsADefinir: data.motsADefinir || [],
          definitions: (data.motsADefinir || []).map((mot: string) => ({ mot, definition: '' })),
          planActions: (data.planActions || []).map((action: any) => ({
            title: action.title || action,
            paragraphs: action.paragraphs && action.paragraphs.length > 0 
              ? action.paragraphs.map((para: string, idx: number) => ({
                  id: Math.random().toString(36).substr(2, 9),
                  text: para,
                  image: null,
                  order: idx
                }))
              : [{
                  id: Math.random().toString(36).substr(2, 9),
                  text: '',
                  image: null,
                  order: 0
                }]
          }))
        })
      } else {
        const error = await response.json()
        console.error('Parse error:', error)
        alert('Erreur lors de l\'analyse du fichier: ' + (error.error || 'Erreur inconnue'))
      }
    } catch (error) {
      console.error('Error parsing file:', error)
      alert('Erreur lors de l\'analyse du fichier. Veuillez vérifier que le fichier est un document Prosit valide.')
    }
  }

  const handleRetourSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const formDataToSend = new FormData()
    formDataToSend.append('mode', 'retour')
    formDataToSend.append('data', JSON.stringify(retourData))

    // Add images
    retourData.planActions.forEach((action, actionIndex) => {
      action.paragraphs.forEach((para, paraIndex) => {
        if (para.image) {
          formDataToSend.append(`image_${actionIndex}_${paraIndex}`, para.image)
        }
      })
    })

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formDataToSend
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'Prosit_Retour.docx'
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error generating retour document:', error)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-4 max-w-4xl relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        
        {/* Navigation Tabs */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-6">Générateur de Prosit</h1>
          <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setMode('aller')}
              className={`px-6 py-3 font-medium transition-colors ${
                mode === 'aller'
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Prosit Aller
            </button>
            <button
              onClick={() => setMode('retour')}
              className={`px-6 py-3 font-medium transition-colors ${
                mode === 'retour'
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Prosit Retour
            </button>
          </div>
        </div>

        {/* Prosit Aller Form */}
        {mode === 'aller' && (
          <form onSubmit={handleSubmit} className="space-y-6">
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
        )}

        {/* Prosit Retour Form */}
        {mode === 'retour' && (
          <form onSubmit={handleRetourSubmit} className="space-y-6">
            {/* Alpha Warning Banner */}
            <div className="border-2 border-red-500 dark:border-red-600 bg-red-50 dark:bg-red-950/30 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <span className="text-2xl">⚠️</span>
                <h3 className="font-bold text-lg">EXPÉRIMENTAL - VERSION ALPHA</h3>
                <span className="text-2xl">⚠️</span>
              </div>
              <p className="text-sm text-red-600 dark:text-red-400">
                Cette fonctionnalité Prosit Retour est actuellement en phase de test alpha. Les fonctionnalités peuvent être incomplètes ou instables. 
                Veuillez signaler tout problème sur <a href="https://github.com/RamiMohamed12/PrositGenerator" target="_blank" rel="noopener noreferrer" className="underline hover:text-red-800 dark:hover:text-red-300">GitHub</a>.
              </p>
            </div>

            <div className="space-y-4">
              <Label>Uploader le Prosit Aller</Label>
              <Input
                type="file"
                accept=".docx"
                onChange={handleFileUpload}
                className="cursor-pointer"
              />
              {uploadedFile && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  Fichier chargé: {uploadedFile.name}
                </p>
              )}
            </div>

            {uploadedFile && retourData.motsADefinir.length === 0 && (
              <div className="text-center py-8 text-yellow-600 dark:text-yellow-400">
                <p>Analyse du fichier en cours...</p>
              </div>
            )}

            {(uploadedFile && retourData.motsADefinir.length > 0) && (
              <>
                {/* Display all fields from scanned document - same layout as Aller */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nom du Prosit</Label>
                    <Input value={retourData.prositName} disabled className="bg-gray-100 dark:bg-gray-800" />
                  </div>
                  <div className="space-y-2">
                    <Label>Nom de l'étudiant</Label>
                    <Input value={retourData.studentName} disabled className="bg-gray-100 dark:bg-gray-800" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Animateur</Label>
                    <Input value={retourData.animateur} disabled className="bg-gray-100 dark:bg-gray-800" />
                  </div>
                  <div className="space-y-2">
                    <Label>Scribe</Label>
                    <Input value={retourData.scribe} disabled className="bg-gray-100 dark:bg-gray-800" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Gestionnaire</Label>
                    <Input value={retourData.gestionnaire} disabled className="bg-gray-100 dark:bg-gray-800" />
                  </div>
                  <div className="space-y-2">
                    <Label>Secrétaire</Label>
                    <Input value={retourData.secretaire} disabled className="bg-gray-100 dark:bg-gray-800" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Année (A)</Label>
                    <Input value={retourData.year} disabled className="bg-gray-100 dark:bg-gray-800" />
                  </div>
                  <div className="space-y-2">
                    <Label>Groupe</Label>
                    <Input value={retourData.group} disabled className="bg-gray-100 dark:bg-gray-800" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Mots clés</Label>
                  <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                    {retourData.motsCles.map((mot, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                      >
                        {mot}
                      </span>
                    ))}
                  </div>
                </div>

                {/* EDITABLE: Mots à définir */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">Mots à définir (Éditable)</Label>
                  {retourData.definitions.map((def, index) => (
                    <div key={index} className="space-y-2 p-4 border-2 border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-950">
                      <Label className="text-sm font-semibold">{def.mot}</Label>
                      <Textarea
                        value={def.definition}
                        onChange={(e) => {
                          const newDefs = [...retourData.definitions]
                          newDefs[index].definition = e.target.value
                          setRetourData({ ...retourData, definitions: newDefs })
                        }}
                        placeholder="Entrez la définition..."
                        rows={3}
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label>Analyse du contexte</Label>
                  <Textarea value={retourData.analyseContexte} disabled className="bg-gray-100 dark:bg-gray-800" rows={4} />
                </div>

                <div className="space-y-2">
                  <Label>Définition de la problématique</Label>
                  <Textarea value={retourData.definitionProblematique} disabled className="bg-gray-100 dark:bg-gray-800" rows={4} />
                </div>

                <div className="space-y-2">
                  <Label>Contraintes</Label>
                  <div className="space-y-2">
                    {retourData.contraintes.map((contrainte, index) => (
                      <Input key={index} value={contrainte} disabled className="bg-gray-100 dark:bg-gray-800" />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Hypothèse</Label>
                  <div className="space-y-2">
                    {retourData.hypothese.map((hyp, index) => (
                      <Input key={index} value={hyp} disabled className="bg-gray-100 dark:bg-gray-800" />
                    ))}
                  </div>
                </div>

                {/* EDITABLE: Plan d'actions */}
                <div className="space-y-6">
                  <Label className="text-lg font-semibold">Plan d'actions (Éditable)</Label>
                  {retourData.planActions.map((action, actionIndex) => (
                    <div key={actionIndex} className="space-y-4 p-6 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                      <div className="space-y-2">
                        <Label>Titre du plan d'action</Label>
                        <Input
                          value={action.title}
                          onChange={(e) => {
                            const newActions = [...retourData.planActions]
                            newActions[actionIndex].title = e.target.value
                            setRetourData({ ...retourData, planActions: newActions })
                          }}
                        />
                      </div>

                      <div className="space-y-4">
                        <Label className="text-sm">Paragraphes</Label>
                        {action.paragraphs
                          .sort((a, b) => a.order - b.order)
                          .map((para, paraIndex) => (
                            <div key={para.id} className="space-y-3 p-4 border rounded dark:border-gray-600 bg-white dark:bg-gray-900">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Paragraphe {para.order + 1}</span>
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const newActions = [...retourData.planActions]
                                      const paras = newActions[actionIndex].paragraphs
                                      const currentIndex = paras.findIndex(p => p.id === para.id)
                                      if (currentIndex > 0) {
                                        const temp = paras[currentIndex].order
                                        paras[currentIndex].order = paras[currentIndex - 1].order
                                        paras[currentIndex - 1].order = temp
                                        setRetourData({ ...retourData, planActions: newActions })
                                      }
                                    }}
                                    disabled={paraIndex === 0}
                                  >
                                    ↑
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const newActions = [...retourData.planActions]
                                      const paras = newActions[actionIndex].paragraphs
                                      const currentIndex = paras.findIndex(p => p.id === para.id)
                                      if (currentIndex < paras.length - 1) {
                                        const temp = paras[currentIndex].order
                                        paras[currentIndex].order = paras[currentIndex + 1].order
                                        paras[currentIndex + 1].order = temp
                                        setRetourData({ ...retourData, planActions: newActions })
                                      }
                                    }}
                                    disabled={paraIndex === action.paragraphs.length - 1}
                                  >
                                    ↓
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const newActions = [...retourData.planActions]
                                      newActions[actionIndex].paragraphs = newActions[actionIndex].paragraphs.filter(p => p.id !== para.id)
                                      setRetourData({ ...retourData, planActions: newActions })
                                    }}
                                  >
                                    Supprimer
                                  </Button>
                                </div>
                              </div>

                              <Textarea
                                value={para.text}
                                onChange={(e) => {
                                  const newActions = [...retourData.planActions]
                                  const p = newActions[actionIndex].paragraphs.find(p => p.id === para.id)
                                  if (p) p.text = e.target.value
                                  setRetourData({ ...retourData, planActions: newActions })
                                }}
                                placeholder="Entrez le texte du paragraphe..."
                                rows={4}
                              />

                              <div className="space-y-2">
                                <Label className="text-sm">Image (optionnelle)</Label>
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                      const newActions = [...retourData.planActions]
                                      const p = newActions[actionIndex].paragraphs.find(p => p.id === para.id)
                                      if (p) p.image = file
                                      setRetourData({ ...retourData, planActions: newActions })
                                    }
                                  }}
                                  className="cursor-pointer"
                                />
                                {para.image && (
                                  <p className="text-sm text-green-600 dark:text-green-400">
                                    Image: {para.image.name}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const newActions = [...retourData.planActions]
                            newActions[actionIndex].paragraphs.push({
                              id: Math.random().toString(36).substr(2, 9),
                              text: '',
                              image: null,
                              order: newActions[actionIndex].paragraphs.length
                            })
                            setRetourData({ ...retourData, planActions: newActions })
                          }}
                        >
                          Ajouter un paragraphe
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button type="submit">Générer le Prosit Retour</Button>
              </>
            )}
          </form>
        )}

      <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-600 dark:text-gray-300">
        <p>
          Created by{' '}
          <a
            href="https://github.com/RamiMohamed12/PrositGenerator"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
          >
            RamiMohamed12
          </a>
          {' '}on GitHub. It's free to submit code! (Beta version)
        </p>
      </footer>
      </div>
    </div>
  )
}
