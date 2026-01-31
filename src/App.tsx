import { FlowCanvas } from './components/flow/FlowCanvas';
import { useFlowStore } from './store/useFlowStore';
import { Plus } from 'lucide-react';

function App() {
  const { addNode } = useFlowStore();

  const handleAddNode = () => {
    addNode({
      id: `node-${Date.now()}`,
      type: 'code-node',
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: { code: 'print("Hello World")' },
    });
  };
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      {/* Toolbar Placeholder */}
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
        {/* Sidebar Placeholder */}
        <aside className="w-64 border-r border-border bg-card shrink-0 hidden md:block">
          <div className="p-4 text-muted-foreground text-sm">
            Sidebar (Library/Blocks)
          </div>
        </aside>

        {/* Main Canvas Area */}
        <main className="flex-1 relative">
          <FlowCanvas />
        </main>
      </div>
    </div>
  );
}

export default App;
