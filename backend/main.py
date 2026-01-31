from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
import io
import contextlib
import traceback

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for MVP local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global execution scope shared across all code executions
# This allows variables to persist between cell executions, like Jupyter notebooks
GLOBAL_SCOPE = {}

class CodeRequest(BaseModel):
    code: str

@app.post("/execute")
async def execute_code(request: CodeRequest):
    print(f"[Backend] Executing code in global scope")
    print(f"[Backend] Current global scope keys: {list(GLOBAL_SCOPE.keys())}")
    
    stdout_buffer = io.StringIO()
    stderr_buffer = io.StringIO()
    
    try:
        with contextlib.redirect_stdout(stdout_buffer), contextlib.redirect_stderr(stderr_buffer):
            # Execute in the shared global scope
            # Variables created in one execution persist for future executions
            exec(request.code, GLOBAL_SCOPE)
            
        print(f"[Backend] After execution, global scope keys: {list(GLOBAL_SCOPE.keys())}")
        
        return {
            "stdout": stdout_buffer.getvalue(),
            "stderr": stderr_buffer.getvalue(),
            "status": "success"
        }
    except Exception:
        return {
            "stdout": stdout_buffer.getvalue(),
            "stderr": traceback.format_exc(),
            "status": "error"
        }

@app.post("/reset")
async def reset_scope():
    """Reset the global execution scope"""
    global GLOBAL_SCOPE
    GLOBAL_SCOPE = {}
    print("[Backend] Global scope reset")
    return {"status": "success", "message": "Global scope reset"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
