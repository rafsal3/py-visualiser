import { useState, useCallback } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import Editor from "@monaco-editor/react";
import { Play, Settings, Box, Loader2, Plus, Trash2, BookMarked } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { executeCode } from '../../api/execution';
import { CodeNodeData } from '../../types/NodeTypes';
import { useFlowStore } from '../../store/useFlowStore';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

export function CodeNode({ data: propsData, id, selected }: NodeProps) {
    // Cast generic data to our typed data. 
    // We treat propsData as the source of truth for initial render, 
    // Use the store's updateNodeData to ensure updates are visible to all components
    const { updateNodeData } = useFlowStore();

    // Access data directly from propsData with fallbacks
    const data = {
        code: (propsData as any).code || '',
        contract: (propsData as any).contract || { inputs: [], outputs: [] },
        executionResult: (propsData as any).executionResult,
        isRunning: (propsData as any).isRunning,
        isError: (propsData as any).isError,
        output: (propsData as any).output || '',
    } as CodeNodeData;

    const [viewMode, setViewMode] = useState<'abstract' | 'code'>('abstract');
    const [isRunning, setIsRunning] = useState(false);

    const handleRun = useCallback(async () => {
        console.log(`[Frontend] Executing node ${id}`);
        setIsRunning(true);
        updateNodeData(id, { isRunning: true });

        try {
            // Simply execute the code - all variables are in global scope
            console.log(`[Frontend] Executing code:`, data.code);
            const result = await executeCode(data.code);
            console.log(`[Frontend] Execution result:`, result);

            // Update Node Data
            const updatePayload = {
                output: result.stdout + (result.stderr ? '\nError:\n' + result.stderr : ''),
                isError: result.status === 'error',
                isRunning: false
            };
            console.log(`[Frontend] Updating node ${id} with:`, updatePayload);
            updateNodeData(id, updatePayload);
            setIsRunning(false);

        } catch (err) {
            console.error(`[Frontend] Error in node ${id}:`, err);
            updateNodeData(id, {
                isError: true,
                isRunning: false,
                output: String(err)
            });
            setIsRunning(false);
        }
    }, [data.code, id, updateNodeData]);

    // Contract Editing Helpers
    const addInput = () => {
        const name = `in_${data.contract.inputs.length + 1}`;
        const newInputs = [...data.contract.inputs, { name, type: 'any' }];
        updateNodeData(id, { contract: { ...data.contract, inputs: newInputs } });
    };

    const addOutput = () => {
        const name = `out_${data.contract.outputs.length + 1}`;
        const newOutputs = [...data.contract.outputs, { name, type: 'any' }];
        updateNodeData(id, { contract: { ...data.contract, outputs: newOutputs } });
    };

    const updatePortName = (type: 'input' | 'output', index: number, newName: string) => {
        const list = type === 'input' ? [...data.contract.inputs] : [...data.contract.outputs];
        list[index] = { ...list[index], name: newName };
        updateNodeData(id, { contract: { ...data.contract, [type === 'input' ? 'inputs' : 'outputs']: list } });
    };

    const removePort = (type: 'input' | 'output', index: number) => {
        const list = type === 'input' ? [...data.contract.inputs] : [...data.contract.outputs];
        list.splice(index, 1);
        updateNodeData(id, { contract: { ...data.contract, [type === 'input' ? 'inputs' : 'outputs']: list } });
    };

    const handleCodeChange = (value: string | undefined) => {
        updateNodeData(id, { code: value || '' });
    };

    const handleSaveAsTemplate = () => {
        const name = prompt('Enter template name:');
        if (name) {
            const { saveNodeAsTemplate } = useFlowStore.getState();
            const saved = saveNodeAsTemplate(id, name);
            if (saved) {
                alert(`Template "${name}" saved!`);
            }
        }
    };

    // Render Logic
    return (
        <div className={cn(
            "bg-card border-2 rounded-lg shadow-xl flex flex-col w-[350px] transition-all duration-200",
            selected ? "border-primary ring-1 ring-primary" : "border-border",
            data.isError ? "border-red-500/50" : ""
        )}>
            {/* Header */}
            <div className="bg-muted px-4 py-2 flex items-center justify-between border-b border-border handle drag-handle cursor-grab active:cursor-grabbing group">
                <div className="flex items-center gap-2">
                    {/* Status Dot */}
                    <div className={cn("w-2 h-2 rounded-full",
                        isRunning ? "bg-yellow-400 animate-pulse" :
                            data.isError ? "bg-red-500" :
                                data.executionResult ? "bg-green-500" : "bg-gray-400"
                    )} />
                    <span className="font-semibold text-sm">Node {id.split('-').pop()}</span>
                </div>
                <div className="flex items-center gap-1 opacity-100 transition-opacity">
                    <button onClick={() => setViewMode(v => v === 'abstract' ? 'code' : 'abstract')}
                        className={cn("p-1.5 rounded hover:bg-background transition-colors", viewMode === 'code' && "bg-background text-primary")}
                        title="Toggle Code View"
                    >
                        {viewMode === 'abstract' ? <Settings size={14} /> : <Box size={14} />}
                    </button>
                    <button
                        onClick={handleRun}
                        disabled={isRunning}
                        className={cn(
                            "p-1 rounded transition-colors",
                            isRunning ? "text-yellow-500" : "text-green-500 hover:bg-background hover:text-green-600"
                        )}
                        title="Run Node"
                    >
                        {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="relative">
                {/* Abstract View - Ports & Status */}
                <div className={cn("p-4 flex flex-col gap-4", viewMode === 'code' && "hidden")}>

                    {/* Inputs & Outputs Row */}
                    <div className="flex justify-between gap-4">
                        {/* Inputs (Left) */}
                        <div className="flex flex-col gap-2 min-w-[30%]">
                            {data.contract.inputs.map((input) => (
                                <div key={input.name} className="relative flex items-center h-6">
                                    <Handle
                                        type="target"
                                        position={Position.Left}
                                        id={input.name}
                                        className="!w-3 !h-3 !-left-[22px] !bg-blue-400 !border-2 !border-card"
                                    />
                                    <span className="text-xs font-mono text-muted-foreground">{input.name}</span>
                                </div>
                            ))}
                            {data.contract.inputs.length === 0 && <span className="text-xs text-muted-foreground/50 italic">No inputs</span>}
                        </div>

                        {/* Outputs (Right) */}
                        <div className="flex flex-col gap-2 min-w-[30%] items-end">
                            {data.contract.outputs.map((output) => (
                                <div key={output.name} className="relative flex items-center justify-end h-6">
                                    <span className="text-xs font-mono text-muted-foreground">{output.name}</span>
                                    <Handle
                                        type="source"
                                        position={Position.Right}
                                        id={output.name}
                                        className="!w-3 !h-3 !-right-[22px] !bg-purple-400 !border-2 !border-card"
                                    />
                                </div>
                            ))}
                            {data.contract.outputs.length === 0 && <span className="text-xs text-muted-foreground/50 italic">No outputs</span>}
                        </div>
                    </div>
                </div>

                {/* Code View - Editor & Contract Config */}
                <div className={cn("flex flex-col", viewMode === 'abstract' && "hidden")}>
                    {/* Save Template Button */}
                    <div className="flex items-center justify-end px-3 py-1.5 border-b border-border bg-muted/30">
                        <button
                            onClick={handleSaveAsTemplate}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
                            title="Save as template"
                        >
                            <BookMarked size={12} />
                            Save Template
                        </button>
                    </div>
                    {/* Contract Config */}
                    <div className="border-b border-border bg-black/20 p-2 flex gap-4 text-xs">
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-2 text-muted-foreground">
                                <span>Inputs</span>
                                <button onClick={addInput} className="hover:text-primary"><Plus size={12} /></button>
                            </div>
                            <div className="flex flex-col gap-1 max-h-[100px] overflow-auto">
                                {data.contract.inputs.map((input, idx) => (
                                    <div key={idx} className="flex items-center gap-1 relative">
                                        <Handle
                                            type="target"
                                            position={Position.Left}
                                            id={input.name}
                                            className="!w-2 !h-2 !-left-[14px] !bg-blue-400 !border-1 !border-card"
                                        />
                                        <input
                                            value={input.name}
                                            onChange={(e) => updatePortName('input', idx, e.target.value)}
                                            className="bg-transparent border border-border rounded px-1 w-full text-foreground"
                                        />
                                        <button onClick={() => removePort('input', idx)} className="text-destructive hover:bg-destructive/10 p-0.5 rounded"><Trash2 size={10} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="w-px bg-border"></div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-2 text-muted-foreground">
                                <span>Outputs</span>
                                <button onClick={addOutput} className="hover:text-primary"><Plus size={12} /></button>
                            </div>
                            <div className="flex flex-col gap-1 max-h-[100px] overflow-auto">
                                {data.contract.outputs.map((output, idx) => (
                                    <div key={idx} className="flex items-center gap-1 relative">
                                        <input
                                            value={output.name}
                                            onChange={(e) => updatePortName('output', idx, e.target.value)}
                                            className="bg-transparent border border-border rounded px-1 w-full text-foreground"
                                        />
                                        <button onClick={() => removePort('output', idx)} className="text-destructive hover:bg-destructive/10 p-0.5 rounded"><Trash2 size={10} /></button>
                                        <Handle
                                            type="source"
                                            position={Position.Right}
                                            id={output.name}
                                            className="!w-2 !h-2 !-right-[14px] !bg-purple-400 !border-1 !border-card"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div
                        className="h-[200px] bg-[#1e1e1e] relative nodrag"
                        onKeyDown={(e) => {
                            // Prevent ReactFlow from capturing keyboard events
                            e.stopPropagation();
                        }}
                    >
                        <Editor
                            height="100%"
                            defaultLanguage="python"
                            theme="vs-dark"
                            value={data.code}
                            onChange={handleCodeChange}
                            options={{
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                fontSize: 12,
                                lineNumbers: 'on',
                                padding: { top: 8, bottom: 8 }
                            }}
                        />
                    </div>
                </div>

                {/* Execution Result Display (Shared) */}
                {data.output && (
                    <div className={cn(
                        "p-3 text-xs font-mono border-t border-border max-h-[150px] overflow-auto whitespace-pre-wrap",
                        data.isError ? "bg-red-950/30 text-red-200" : "bg-black/40 text-gray-300"
                    )}>
                        {data.output}
                    </div>
                )}
            </div>
        </div>
    );
}
