import { FlowCanvas } from './components/flow/FlowCanvas';
import { NodeLibrary } from './components/library/NodeLibrary';
import { useFlowStore } from './store/useFlowStore';
import { Plus } from 'lucide-react';

function App() {
  const { addNode } = useFlowStore();

  const handleAddNode = () => {
    addNode({
      id: `node-${Date.now()}`,
      type: 'code-node',
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: {
        code: '# Write your code here',
        contract: {
          inputs: [],
          outputs: []
        },
        executionResult: undefined
      },
    });
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      {/* Minimalistic Toolbar */}
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 shrink-0 z-10">
        <h1 className="text-xl font-bold text-primary">PyVisualiser</h1>
        <button
          onClick={handleAddNode}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          <Plus size={16} />
          Add Node
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Node Library Sidebar */}
        <NodeLibrary />

        {/* Main Canvas Area */}
        <main className="flex-1 relative">
          <FlowCanvas />
        </main>
      </div>
    </div>
  );
}

export default App;
