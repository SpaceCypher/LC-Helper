'use client';

import { useState } from 'react';

interface Note {
    id: string;
    type: string;
    content: string;
}

interface NotesEditorProps {
    slug: string;
    notes: Note[];
    onNotesChange?: () => void;
}

export default function NotesEditor({ slug, notes, onNotesChange }: NotesEditorProps) {
    const [isAddingRecall, setIsAddingRecall] = useState(false);
    const [isAddingDeep, setIsAddingDeep] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [newContent, setNewContent] = useState('');

    const recallNotes = notes.filter((n) => n.type === 'RECALL');
    const deepNotes = notes.filter((n) => n.type === 'DEEP');

    const handleAddNote = async (type: 'RECALL' | 'DEEP') => {
        if (!newContent.trim()) return;

        try {
            await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug, type, content: newContent }),
            });

            setNewContent('');
            setIsAddingRecall(false);
            setIsAddingDeep(false);
            onNotesChange?.();
        } catch (error) {
            console.error('Failed to add note:', error);
        }
    };

    const handleUpdateNote = async (id: string) => {
        if (!editContent.trim()) return;

        try {
            await fetch('/api/notes', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, content: editContent }),
            });

            setEditingId(null);
            setEditContent('');
            onNotesChange?.();
        } catch (error) {
            console.error('Failed to update note:', error);
        }
    };

    const handleDeleteNote = async (id: string) => {
        try {
            await fetch(`/api/notes?id=${id}`, { method: 'DELETE' });
            onNotesChange?.();
        } catch (error) {
            console.error('Failed to delete note:', error);
        }
    };

    return (
        <div className="vertical-flow">
            {/* Recall Notes */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Recall Notes</h3>
                    <button
                        onClick={() => setIsAddingRecall(true)}
                        className="btn-secondary text-sm px-4 py-2"
                    >
                        + Add
                    </button>
                </div>

                <p className="text-text-muted text-sm mb-4">
                    Short reminders visible before revealing the solution
                </p>

                <div className="space-y-2">
                    {recallNotes.map((note) => (
                        <div key={note.id} className="flex items-start gap-2">
                            {editingId === note.id ? (
                                <div className="flex-1 flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="text"
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="input-glass flex-1"
                                        autoFocus
                                    />
                                    <div className="flex gap-2 self-end sm:self-auto">
                                        <button
                                            onClick={() => handleUpdateNote(note.id)}
                                            className="btn-primary text-sm px-3 py-1"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="btn-secondary text-sm px-3 py-1"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <span className="flex-1 text-text-secondary">• {note.content}</span>
                                    <button
                                        onClick={() => {
                                            setEditingId(note.id);
                                            setEditContent(note.content);
                                        }}
                                        className="text-accent text-sm hover:underline"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteNote(note.id)}
                                        className="text-red-400 text-sm hover:underline"
                                    >
                                        Delete
                                    </button>
                                </>
                            )}
                        </div>
                    ))}

                    {isAddingRecall && (
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="text"
                                value={newContent}
                                onChange={(e) => setNewContent(e.target.value)}
                                placeholder="Add a recall note..."
                                className="input-glass flex-1"
                                autoFocus
                            />
                            <div className="flex gap-2 self-end sm:self-auto">
                                <button
                                    onClick={() => handleAddNote('RECALL')}
                                    className="btn-primary text-sm px-4 py-2"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => {
                                        setIsAddingRecall(false);
                                        setNewContent('');
                                    }}
                                    className="btn-secondary text-sm px-4 py-2"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Deep Notes */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Deep Notes</h3>
                    <button
                        onClick={() => setIsAddingDeep(true)}
                        className="btn-secondary text-sm px-4 py-2"
                    >
                        + Add
                    </button>
                </div>

                <p className="text-text-muted text-sm mb-4">
                    Detailed insights, edge cases, and clarifications
                </p>

                <div className="space-y-4">
                    {deepNotes.map((note) => (
                        <div key={note.id} className="border-l-2 border-accent pl-4">
                            {editingId === note.id ? (
                                <div className="space-y-2">
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="input-glass w-full min-h-[100px]"
                                        autoFocus
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleUpdateNote(note.id)}
                                            className="btn-primary text-sm px-4 py-2"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="btn-secondary text-sm px-4 py-2"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p className="text-text-secondary whitespace-pre-wrap mb-2">{note.content}</p>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => {
                                                setEditingId(note.id);
                                                setEditContent(note.content);
                                            }}
                                            className="text-accent text-sm hover:underline"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteNote(note.id)}
                                            className="text-red-400 text-sm hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}

                    {isAddingDeep && (
                        <div className="space-y-2">
                            <textarea
                                value={newContent}
                                onChange={(e) => setNewContent(e.target.value)}
                                placeholder="Add detailed notes..."
                                className="input-glass w-full min-h-[100px]"
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleAddNote('DEEP')}
                                    className="btn-primary text-sm px-4 py-2"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => {
                                        setIsAddingDeep(false);
                                        setNewContent('');
                                    }}
                                    className="btn-secondary text-sm px-4 py-2"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
