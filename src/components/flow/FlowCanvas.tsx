import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useFlowStore } from '../../store/useFlowStore';

import { CodeNode } from './CodeNode';

const nodeTypes = {
    'code-node': CodeNode,
};

export function FlowCanvas() {
    const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useFlowStore();

    return (
        <div className="h-full w-full bg-background text-foreground">
            <ReactFlow
                nodes={nodes}
                nodesDraggable={true}
                nodeTypes={nodeTypes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                colorMode="dark"
                fitView
            >
                <Background />
                <Controls />
                <MiniMap className="!bg-card !border-border" nodeColor="#64748b" />
            </ReactFlow>
        </div>
    );
}
