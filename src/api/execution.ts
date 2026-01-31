export interface ExecutionResult {
    stdout: string;
    stderr: string;
    status: 'success' | 'error';
}

export async function executeCode(code: string): Promise<ExecutionResult> {
    try {
        const response = await fetch('http://127.0.0.1:8000/execute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        return {
            stdout: '',
            stderr: error instanceof Error ? error.message : String(error),
            status: 'error',
        };
    }
}
