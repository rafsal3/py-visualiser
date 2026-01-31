import { ReactFlow, Background, Controls, MiniMap, useReactFlow, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useFlowStore } from '../../store/useFlowStore';
import { useCallback } from 'react';

import { CodeNode } from './CodeNode';

const nodeTypes = {
    'code-node': CodeNode,
};

function FlowCanvasInner() {
    const { nodes, edges, onNodesChange, onEdgesChange, onConnect, createNodeFromTemplate } = useFlowStore();
    const { screenToFlowPosition } = useReactFlow();

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');
            if (type !== 'template') return;

            const templateId = event.dataTransfer.getData('templateId');
            if (!templateId) return;

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            createNodeFromTemplate(templateId, position);
        },
        [screenToFlowPosition, createNodeFromTemplate]
    );

    return (
        <ReactFlow
            nodes={nodes}
            nodesDraggable={true}
            nodeTypes={nodeTypes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDragOver={onDragOver}
            onDrop={onDrop}
            colorMode="dark"
            fitView
        >
            <Background />
            <Controls />
            <MiniMap className="!bg-card !border-border" nodeColor="#64748b" />
        </ReactFlow>
    );
}

export function FlowCanvas() {
    return (
        <div className="h-full w-full bg-background text-foreground">
            <ReactFlowProvider>
                <FlowCanvasInner />
            </ReactFlowProvider>
        </div>
    );
}
