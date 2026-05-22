import './style.css'
import BpmnModeler from 'bpmn-js/lib/Modeler'
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'

const initialDiagram = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  id="Definitions_1"
  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" name="Start">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:task id="Activity_1" name="Demo Task">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:task>
    <bpmn:endEvent id="EndEvent_1" name="Done">
      <bpmn:incoming>Flow_2</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Activity_1" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Activity_1" targetRef="EndEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="173" y="117" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_1_di" bpmnElement="Activity_1">
        <dc:Bounds x="270" y="95" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
        <dc:Bounds x="442" y="117" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="209" y="135" />
        <di:waypoint x="270" y="135" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
        <di:waypoint x="370" y="135" />
        <di:waypoint x="442" y="135" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`

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
  </nav>
  <div id="canvas"></div>
</main>
`

const modeler = new BpmnModeler({
  container: '#canvas'
})

const menuToggle = document.querySelector('#menu-toggle')
const menu = document.querySelector('#menu')

const setMenuOpen = (open) => {
  menu.hidden = !open
  menuToggle.setAttribute('aria-expanded', String(open))
}

setMenuOpen(false)

const importDiagram = async () => {
  try {
    await modeler.importXML(initialDiagram)
    modeler.get('canvas').zoom('fit-viewport')
  } catch (error) {
    console.error('Failed to import BPMN diagram', error)
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

document
  .querySelector('#new-diagram')
  .addEventListener('click', () => {
    importDiagram()
    setMenuOpen(false)
  })

document
  .querySelector('#download-diagram')
  .addEventListener('click', () => {
    downloadDiagram()
    setMenuOpen(false)
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
  }
})

importDiagram()
