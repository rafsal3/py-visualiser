export interface NodePort {
    name: string;
    type?: string;
}

export interface NodeContract {
    inputs: NodePort[];
    outputs: NodePort[];
}

export interface ExecutionResult {
    stdout: string;
    stderr: string;
    status: 'success' | 'error';
    outputs?: Record<string, any>;
}

export interface CodeNodeData {
    // Core Data
    code: string;
    contract: NodeContract;

    // Execution State
    output?: string; // stdout/stderr combo for display
    executionResult?: ExecutionResult;
    isError?: boolean;
    isRunning?: boolean;

    // View State (Not strictly data, but often convenient to keep here or in component state)
    // We'll keep view state local to component for now, or add here if needed for persistence.
}
