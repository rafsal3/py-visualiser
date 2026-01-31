import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';

export interface NodeTemplate {
  id: string;
  name: string;
  code: string;
  contract: any;
  createdAt: string;
}

type FlowState = {
  nodes: Node[];
  edges: Edge[];
  templates: NodeTemplate[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (node: Node) => void;
  updateNodeData: (nodeId: string, data: any) => void;
  saveNodeAsTemplate: (nodeId: string, name: string) => boolean;
  getTemplates: () => NodeTemplate[];
  deleteTemplate: (templateId: string) => void;
  createNodeFromTemplate: (templateId: string, position: { x: number; y: number }) => void;
};

const TEMPLATES_KEY = 'py-visualiser-templates';

const loadTemplatesFromStorage = (): NodeTemplate[] => {
  try {
    const saved = localStorage.getItem(TEMPLATES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveTemplatesToStorage = (templates: NodeTemplate[]) => {
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
};

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [
    {
      id: 'sample-1',
      type: 'code-node',
      position: { x: 100, y: 100 },
      data: {
        code: 'value = 42\nprint(f"Generated value: {value}")',
        contract: {
          inputs: [],
          outputs: [{ name: 'value', type: 'number' }]
        },
        executionResult: undefined
      }
    },
    {
      id: 'sample-2',
      type: 'code-node',
      position: { x: 550, y: 100 },
      data: {
        code: 'result = value * 2\nprint(f"Result: {result}")',
        contract: {
          inputs: [{ name: 'value', type: 'number' }],
          outputs: [{ name: 'result', type: 'number' }]
        },
        executionResult: undefined
      }
    }
  ],
  edges: [
    {
      id: 'sample-edge-1',
      source: 'sample-1',
      target: 'sample-2',
      sourceHandle: 'value',
      targetHandle: 'value'
    }
  ],
  templates: loadTemplatesFromStorage(),
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },
  addNode: (node: Node) => {
    set({
      nodes: [...get().nodes, node],
    });
  },
  updateNodeData: (nodeId: string, newData: any) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      ),
    });
  },
  saveNodeAsTemplate: (nodeId: string, name: string) => {
    const node = get().nodes.find(n => n.id === nodeId);
    if (!node) return false;

    const template: NodeTemplate = {
      id: `template-${Date.now()}`,
      name,
      code: (node.data as any).code || '',
      contract: (node.data as any).contract || { inputs: [], outputs: [] },
      createdAt: new Date().toISOString(),
    };

    const newTemplates = [...get().templates, template];
    set({ templates: newTemplates });
    saveTemplatesToStorage(newTemplates);
    console.log('[Store] Saved template:', name);
    return true;
  },
  getTemplates: () => {
    return get().templates;
  },
  deleteTemplate: (templateId: string) => {
    const newTemplates = get().templates.filter(t => t.id !== templateId);
    set({ templates: newTemplates });
    saveTemplatesToStorage(newTemplates);
    console.log('[Store] Deleted template:', templateId);
  },
  createNodeFromTemplate: (templateId: string, position: { x: number; y: number }) => {
    const template = get().templates.find(t => t.id === templateId);
    if (!template) return;

    const newNode = {
      id: `node-${Date.now()}`,
      type: 'code-node',
      position,
      data: {
        code: template.code,
        contract: template.contract,
        executionResult: undefined,
      },
    };

    set({ nodes: [...get().nodes, newNode] });
    console.log('[Store] Created node from template:', template.name);
  },
}));
