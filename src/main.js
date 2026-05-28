import './style.css'

import BpmnModeler from 'bpmn-js/lib/Modeler'
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'

import BpmnModelerClassic from 'bpmn-js-classic/lib/Modeler'
import 'bpmn-js-classic/dist/assets/diagram-js.css'
import 'bpmn-js-classic/dist/assets/bpmn-js.css'
import 'bpmn-js-classic/dist/assets/bpmn-font/css/bpmn.css'

const defaultDiagramPath = `${import.meta.env.BASE_URL}default-diagram.bpmn`

document.querySelector('#app').innerHTML = `
<main class="app-shell">
  <div class="split-container collapse-left">
    <div class="panel panel-left">
      <div class="panel-header">
        <span class="panel-label">Before</span>
      </div>
      <div id="canvas-left" class="canvas"></div>
    </div>
    <div class="divider" id="divider"></div>
    <div class="panel panel-right">
      <div class="panel-header">
        <span id="panel-right-label" class="panel-label">BPMN Modeler</span>
        <div class="panel-actions">
          <button id="new-diagram" class="toggle-split" type="button">New diagram</button>
          <button id="toggle-split" class="toggle-split" type="button" aria-label="Toggle comparison">Show before</button>
          <button id="open-about" class="toggle-split" type="button">About</button>
        </div>
      </div>
      <div id="canvas-right" class="canvas"></div>
    </div>
  </div>
  <div id="drop-overlay" class="drop-overlay" hidden>
    <p>Drop a BPMN/XML file to import</p>
  </div>
  <section id="about-modal" class="about-modal" hidden>
    <article class="about-card" role="dialog" aria-modal="true">
      <div class="about-header">
        <h2>What's New</h2>
        <button id="close-about" class="about-close" type="button" aria-label="Close">&times;</button>
      </div>
      <p>We're exploring a refreshed look for the BPMN modeler. Here's what changed:</p>
      <ul class="about-list">
        <li>Redesigned task and event icons for improved clarity</li>
        <li>Updated task markers with a cleaner style</li>
        <li>Rounded corners on gateways and participants for a friendlier feel</li>
        <li>Elements now show an outline on hover for better visual feedback</li>
      </ul>
      <p>Use <strong>Show before</strong> to compare side-by-side with the classic look.</p>
    </article>
  </section>
</main>
`

// --- Modelers ---

const modelerClassic = new BpmnModelerClassic({
  container: '#canvas-left'
})

const modelerNew = new BpmnModeler({
  container: '#canvas-right'
})

// --- Navigation sync ---

let syncing = false

function applyOriginAndZoom(canvas, origin, zoom) {
  canvas.zoom(zoom)
  const vb = canvas.viewbox()
  const dx = origin.x - vb.x
  const dy = origin.y - vb.y
  canvas.scroll({ dx: -dx * zoom, dy: -dy * zoom })
}

function syncViewbox(source, target) {
  source.on('canvas.viewbox.changed', () => {
    if (syncing) return
    syncing = true
    try {
      const sourceCanvas = source.get('canvas')
      const targetCanvas = target.get('canvas')
      const vb = sourceCanvas.viewbox()
      const origin = { x: vb.x, y: vb.y }
      const zoom = sourceCanvas.zoom()
      applyOriginAndZoom(targetCanvas, origin, zoom)
    } catch (err) {
      // ignore if target not ready
    }
    syncing = false
  })
}

syncViewbox(modelerClassic, modelerNew)
syncViewbox(modelerNew, modelerClassic)

// --- Modeling sync ---

function syncModeling(source, target) {
  source.on('commandStack.changed', async () => {
    if (syncing) return
    syncing = true
    try {
      const { xml } = await source.saveXML({ format: true })
      const targetCanvas = target.get('canvas')
      const viewbox = targetCanvas.viewbox()
      await target.importXML(xml)
      targetCanvas.viewbox(viewbox)
    } catch (err) {
      // ignore sync errors
    }
    syncing = false
  })
}

syncModeling(modelerClassic, modelerNew)
syncModeling(modelerNew, modelerClassic)

// --- Diagram loading ---

const loadDefaultDiagram = async () => {
  const response = await fetch(defaultDiagramPath)

  if (!response.ok) {
    throw new Error(`Failed to load default diagram from ${defaultDiagramPath}`)
  }

  return response.text()
}

const importDiagram = async (xml) => {
  await Promise.all([
    modelerClassic.importXML(xml),
    modelerNew.importXML(xml)
  ])
}

const loadAndImport = async () => {
  try {
    const xml = await loadDefaultDiagram()
    await importDiagram(xml)
  } catch (error) {
    console.error('Failed to import BPMN diagram', error)
  }
}

// --- Toggle split/full ---

const splitContainer = document.querySelector('.split-container')
const panelLeft = document.querySelector('.panel-left')
const toggleBtn = document.querySelector('#toggle-split')
const panelRightLabel = document.querySelector('#panel-right-label')

toggleBtn.addEventListener('click', async () => {
  panelLeft.style.flex = ''
  const wasCollapsed = splitContainer.classList.contains('collapse-left')
  splitContainer.classList.toggle('collapse-left')
  const isCollapsed = splitContainer.classList.contains('collapse-left')
  toggleBtn.textContent = isCollapsed ? 'Show before' : 'Hide before'
  panelRightLabel.textContent = isCollapsed ? 'BPMN Modeler' : 'After'

  modelerClassic.get('canvas').resized()
  modelerNew.get('canvas').resized()

  // Sync classic modeler when opening split view
  if (wasCollapsed) {
    syncing = true
    try {
      const { xml } = await modelerNew.saveXML({ format: true })
      await modelerClassic.importXML(xml)
      const sourceCanvas = modelerNew.get('canvas')
      const targetCanvas = modelerClassic.get('canvas')
      const vb = sourceCanvas.viewbox()
      applyOriginAndZoom(targetCanvas, { x: vb.x, y: vb.y }, sourceCanvas.zoom())
    } catch (err) {
      // ignore
    }
    syncing = false
  }
})

// --- New diagram ---

const NEW_DIAGRAM_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="182" y="162" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`

document.querySelector('#new-diagram').addEventListener('click', () => {
  importDiagram(NEW_DIAGRAM_XML)
})

// --- About modal ---

const aboutModal = document.querySelector('#about-modal')

document.querySelector('#open-about').addEventListener('click', () => {
  aboutModal.hidden = false
})

document.querySelector('#close-about').addEventListener('click', () => {
  aboutModal.hidden = true
})

aboutModal.addEventListener('click', (e) => {
  if (e.target === aboutModal) aboutModal.hidden = true
})

// --- Drag & drop ---

const appShell = document.querySelector('.app-shell')
const dropOverlay = document.querySelector('#drop-overlay')
let dragDepth = 0

const setDropOverlayOpen = (open) => {
  dropOverlay.hidden = !open
}

const getDroppedFile = (dataTransfer) => {
  if (!dataTransfer?.files?.length) return null

  return Array.from(dataTransfer.files).find((file) => {
    const lowerName = file.name.toLowerCase()
    return lowerName.endsWith('.xml') || lowerName.endsWith('.bpmn') ||
      file.type === 'text/xml' || file.type === 'application/xml'
  })
}

appShell.addEventListener('dragenter', (event) => {
  event.preventDefault()
  dragDepth += 1
  setDropOverlayOpen(true)
})

appShell.addEventListener('dragover', (event) => {
  event.preventDefault()
})

appShell.addEventListener('dragleave', (event) => {
  event.preventDefault()
  dragDepth = Math.max(0, dragDepth - 1)
  if (dragDepth === 0) setDropOverlayOpen(false)
})

appShell.addEventListener('drop', async (event) => {
  event.preventDefault()
  dragDepth = 0
  setDropOverlayOpen(false)

  const droppedFile = getDroppedFile(event.dataTransfer)
  if (!droppedFile) return

  const xml = await droppedFile.text()
  await importDiagram(xml)
})

// --- Divider drag to resize ---

const divider = document.querySelector('#divider')

let isDragging = false

divider.addEventListener('mousedown', (e) => {
  isDragging = true
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
  e.preventDefault()
})

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return

  const containerRect = splitContainer.getBoundingClientRect()
  const offsetX = e.clientX - containerRect.left
  const percentage = (offsetX / containerRect.width) * 100
  const clamped = Math.min(Math.max(percentage, 20), 80)

  panelLeft.style.flex = `0 0 ${clamped}%`

  modelerClassic.get('canvas').resized()
  modelerNew.get('canvas').resized()
})

document.addEventListener('mouseup', () => {
  if (!isDragging) return
  isDragging = false
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
})

// --- Init ---

loadAndImport()
