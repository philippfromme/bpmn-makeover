import './style.css'
import BpmnModeler from 'bpmn-js/lib/Modeler'
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'

const defaultDiagramPath = `${import.meta.env.BASE_URL}default-diagram.bpmn`

document.querySelector('#app').innerHTML = `
<main class="app-shell">
  <button id="menu-toggle" class="menu-toggle" type="button" aria-label="Open menu" aria-expanded="false">
    <span></span>
    <span></span>
    <span></span>
  </button>
  <nav id="menu" class="menu" hidden>
    <button id="new-diagram" type="button">New Diagram</button>
    <button id="download-diagram" type="button">Download BPMN</button>
    <button id="open-about" type="button">About</button>
  </nav>
  <section id="about-modal" class="about-modal" hidden>
    <article class="about-card" role="dialog" aria-modal="true" aria-labelledby="about-title">
      <div class="about-header">
        <h2 id="about-title">About</h2>
        <button id="close-about" class="about-close" type="button" aria-label="Close about">×</button>
      </div>
      <p>This is a demo of a potentially improved BPMN modeler experience.</p>
      <p>Features:</p>
      <ul class="about-points">
        <li>Refreshed BPMN symbols for cleaner visuals</li>
        <li>Rounded corners for friendlier look</li>
        <li>Outline shown on hover for better visual feedback</li>
      </ul>
    </article>
  </section>
  <div id="drop-overlay" class="drop-overlay" hidden>
    <p>Drop a BPMN/XML file to import</p>
  </div>
  <div id="canvas"></div>
</main>
`

const modeler = new BpmnModeler({
  container: '#canvas'
})

const menuToggle = document.querySelector('#menu-toggle')
const menu = document.querySelector('#menu')
const appShell = document.querySelector('.app-shell')
const dropOverlay = document.querySelector('#drop-overlay')
const aboutModal = document.querySelector('#about-modal')
const openAboutButton = document.querySelector('#open-about')
const closeAboutButton = document.querySelector('#close-about')
let dragDepth = 0

const setMenuOpen = (open) => {
  menu.hidden = !open
  menuToggle.setAttribute('aria-expanded', String(open))
}

const setDropOverlayOpen = (open) => {
  dropOverlay.hidden = !open
}

const setAboutOpen = (open) => {
  aboutModal.hidden = !open
}

const loadDefaultDiagram = async () => {
  const response = await fetch(defaultDiagramPath)

  if (!response.ok) {
    throw new Error(`Failed to load default diagram from ${defaultDiagramPath}`)
  }

  return response.text()
}

setMenuOpen(false)

const importDiagram = async () => {
  try {
    const xmlContent = await loadDefaultDiagram()
    await importDiagramFromXml(xmlContent)
  } catch (error) {
    console.error('Failed to import BPMN diagram', error)
  }
}

const NEW_DIAGRAM_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="Definitions_0xr55f2" targetNamespace="http://bpmn.io/schema/bpmn" xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" xmlns:modeler="http://camunda.org/schema/modeler/1.0" exporter="Camunda Modeler" exporterVersion="5.47.0" modeler:executionPlatform="Camunda Cloud" modeler:executionPlatformVersion="8.9.0">
  <bpmn:process id="Process_157x7hv" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_157x7hv">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="182" y="162" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`

const createNewDiagram = async () => {
  try {
    await importDiagramFromXml(NEW_DIAGRAM_XML)
  } catch (error) {
    console.error('Failed to create new diagram', error)
  }
}

const downloadDiagram = async () => {
  try {
    const { xml } = await modeler.saveXML({ format: true })
    const blob = new Blob([xml], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'demo-diagram.bpmn'
    anchor.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to export BPMN diagram', error)
  }
}

const importDiagramFromXml = async (xmlContent) => {
  try {
    await modeler.importXML(xmlContent)
    // modeler.get('canvas').zoom('fit-viewport')
  } catch (error) {
    console.error('Failed to import dropped BPMN/XML file', error)
  }
}

const getDroppedFile = (dataTransfer) => {
  if (!dataTransfer?.files?.length) {
    return null
  }

  return Array.from(dataTransfer.files).find((file) => {
    const lowerName = file.name.toLowerCase()
    const isXmlByName = lowerName.endsWith('.xml') || lowerName.endsWith('.bpmn')
    const isXmlByType = file.type === 'text/xml' || file.type === 'application/xml'

    return isXmlByName || isXmlByType
  })
}

document
  .querySelector('#new-diagram')
  .addEventListener('click', () => {
    createNewDiagram()
    setMenuOpen(false)
  })

document
  .querySelector('#download-diagram')
  .addEventListener('click', () => {
    downloadDiagram()
    setMenuOpen(false)
  })

openAboutButton.addEventListener('click', () => {
  setAboutOpen(true)
  setMenuOpen(false)
})

closeAboutButton.addEventListener('click', () => {
  setAboutOpen(false)
})

menuToggle.addEventListener('click', () => {
  setMenuOpen(menu.hidden)
})

document.addEventListener('click', (event) => {
  if (menu.hidden) {
    return
  }

  const target = event.target

  if (!menu.contains(target) && !menuToggle.contains(target)) {
    setMenuOpen(false)
  }
})

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    setMenuOpen(false)
    setAboutOpen(false)
  }
})

aboutModal.addEventListener('click', (event) => {
  if (event.target === aboutModal) {
    setAboutOpen(false)
  }
})

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

  if (dragDepth === 0) {
    setDropOverlayOpen(false)
  }
})

appShell.addEventListener('drop', async (event) => {
  event.preventDefault()
  dragDepth = 0
  setDropOverlayOpen(false)

  const droppedFile = getDroppedFile(event.dataTransfer)

  if (!droppedFile) {
    return
  }

  const xmlContent = await droppedFile.text()
  await importDiagramFromXml(xmlContent)
})

importDiagram()
