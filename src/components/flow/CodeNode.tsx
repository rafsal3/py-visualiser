import { useState, useCallback } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import Editor from "@monaco-editor/react";
import { X, Play } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { executeCode } from '../../api/execution';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

// Data shape for our CodeNode
export type CodeNodeData = {
    code: string;
    output?: string;
    isError?: boolean;
    onRun?: (code: string) => void;
};

export function CodeNode({ data: propsData, id, selected }: NodeProps) {
    const data = propsData as unknown as CodeNodeData;
    const [code, setCode] = useState(data.code || '');
    const [output, setOutput] = useState(data.output || '');
    const [isError, setIsError] = useState(data.isError || false);
    const [isRunning, setIsRunning] = useState(false);

    // We will need to update the store with code changes later
    const handleEditorChange = useCallback((value: string | undefined) => {
        setCode(value || '');
        data.code = value || '';
    }, [data]);

    const handleRun = useCallback(async () => {
        setIsRunning(true);
        try {
            const result = await executeCode(code);

            const newOutput = result.stdout + (result.stderr ? '\nError:\n' + result.stderr : '');
            setOutput(newOutput);
            setIsError(result.status === 'error');

            // Update data ref for persistence (if we save/load)
            data.output = newOutput;
            data.isError = result.status === 'error';
        } finally {
            setIsRunning(false);
        }
    }, [code, data]);

    return (
        <div className={cn(
            "bg-card border-2 rounded-lg shadow-lg flex flex-col w-[400px] overflow-hidden transition-colors",
            selected ? "border-blue-500" : "border-border"
        )}>
            {/* Header */}
            <div className="bg-muted px-3 py-2 flex items-center justify-between border-b border-border handle drag-handle">
                <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <span>Python Cell</span>
                    <span className="text-xs text-muted-foreground font-mono opacity-50">{id}</span>
                </div>
                <div className="flex items-center gap-1">
                    {/* Run Button */}
                    <button
                        onClick={handleRun}
                        disabled={isRunning}
                        className={cn(
                            "p-1 rounded transition-colors",
                            isRunning ? "text-yellow-500" : "text-green-500 hover:bg-background"
                        )}
                        title="Run Node"
                    >
                        <Play size={14} fill="currentColor" className={isRunning ? "opacity-50" : ""} />
                    </button>
                    {/* Delete Button Placeholder */}
                    <button className="p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-colors" title="Delete Node">
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="h-[200px] bg-[#1e1e1e] relative nodrag">
                <Editor
                    height="100%"
                    defaultLanguage="python"
                    theme="vs-dark"
                    value={code}
                    onChange={handleEditorChange}
                    options={{
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        fontSize: 12,
                        lineNumbers: 'on',
                        glyphMargin: false,
                        folding: false,
                        lineDecorationsWidth: 10,
                        lineNumbersMinChars: 2,
                        padding: { top: 8, bottom: 8 }
                    }}
                />
            </div>

            {/* Output Area */}
            {output && (
                <div className={cn(
                    "p-3 bg-black/90 font-mono text-xs border-t border-border max-h-[150px] overflow-auto whitespace-pre-wrap",
                    isError ? "text-red-400" : "text-gray-300"
                )}>
                    {output}
                </div>
            )}

            {/* Handles */}
            <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500 border-2 border-background" />
            <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500 border-2 border-background" />
        </div>
    );
}
