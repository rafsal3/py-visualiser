import { useState } from 'react';
import { useFlowStore, NodeTemplate } from '../../store/useFlowStore';
import { BookMarked, Trash2, Search } from 'lucide-react';

export function NodeLibrary() {
    const { templates, deleteTemplate } = useFlowStore();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDragStart = (e: React.DragEvent, template: NodeTemplate) => {
        e.dataTransfer.setData('application/reactflow', 'template');
        e.dataTransfer.setData('templateId', template.id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDelete = (templateId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Delete this template?')) {
            deleteTemplate(templateId);
        }
    };

    return (
        <aside className="w-64 border-r border-border bg-card flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-border">
                <div className="flex items-center gap-2 mb-3">
                    <BookMarked size={20} className="text-primary" />
                    <h2 className="font-semibold text-foreground">Templates</h2>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-7 pr-2 py-1.5 text-sm bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
            </div>

            {/* Template List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {filteredTemplates.length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm py-8">
                        {searchQuery ? 'No templates found' : 'No templates saved yet'}
                    </div>
                ) : (
                    filteredTemplates.map((template) => (
                        <div
                            key={template.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, template)}
                            className="group relative p-3 bg-background border border-border rounded-lg cursor-move hover:border-primary hover:shadow-sm transition-all"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-sm text-foreground truncate">
                                        {template.name}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 font-mono">
                                        {template.code.split('\n')[0]}
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => handleDelete(template.id, e)}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-opacity"
                                    title="Delete template"
                                >
                                    <Trash2 size={14} className="text-destructive" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer Hint */}
            <div className="p-3 border-t border-border text-xs text-muted-foreground">
                Drag templates to canvas to use
            </div>
        </aside>
    );
}
