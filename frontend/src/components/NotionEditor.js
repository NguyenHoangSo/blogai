import React, { useState, useRef, useEffect } from 'react';
import '../styles/NotionEditor.css';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const Button = ({ children, variant = 'default', size = 'default', className, ...props }) => {
    const base = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
    const variants = {
        default: 'bg-gradient-to-r from-orange-500 to-yellow-400 text-black font-bold hover:from-orange-600 hover:to-yellow-500',
        ghost: 'hover:bg-zinc-700 text-white'
    };
    const sizes = {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3',
        lg: 'h-12 px-6'
    };
    return (
        <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
            {children}
        </button>
    );
};

const NotionEditor = ({ value, onChange, placeholder = "Start writing..." }) => {
    const [content, setContent] = useState(value || '');
    const editorRef = useRef(null);

    useEffect(() => {
        setContent(value || '');
    }, [value]);

    useEffect(() => {
        if (onChange) onChange(content);
    }, [content]);

    const formatText = (command, value = null) => {
        document.execCommand(command, false, value);
        editorRef.current.focus();
    };

    const insertHeading = (level) => {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        const range = selection.getRangeAt(0);
        const heading = document.createElement(`h${level}`);
        heading.textContent = selection.toString() || `Heading ${level}`;
        range.deleteContents();
        range.insertNode(heading);
        range.setStartAfter(heading);
        selection.removeAllRanges();
        selection.addRange(range);
        setContent(editorRef.current.innerHTML);
    };

    return (
        <div className="min-h-screen bg-zinc-900 text-white p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-zinc-800 p-4 rounded-lg flex flex-wrap gap-2 justify-between shadow-lg">
                    <div className="flex gap-2 flex-wrap">
                        <Button onClick={() => formatText('bold')} title="Bold"><strong>B</strong></Button>
                        <Button onClick={() => formatText('italic')} title="Italic"><em>I</em></Button>
                        <Button onClick={() => formatText('underline')} title="Underline"><u>U</u></Button>
                        <Button onClick={() => formatText('strikeThrough')} title="Strike"><s>S</s></Button>
                        <Button onClick={() => insertHeading(1)}>H1</Button>
                        <Button onClick={() => insertHeading(2)}>H2</Button>
                        <Button onClick={() => insertHeading(3)}>H3</Button>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => formatText('insertUnorderedList')}>• List</Button>
                        <Button onClick={() => formatText('insertOrderedList')}>1. List</Button>
                        <Button onClick={() => formatText('createLink', prompt('Enter URL:'))}>🔗</Button>
                        <Button onClick={() => formatText('insertImage', prompt('Enter Image URL:'))}>🖼️</Button>
                    </div>
                </div>

                <div
                    ref={editorRef}
                    className="mt-6 bg-zinc-800 p-6 rounded-lg min-h-[300px] prose prose-invert max-w-none focus:outline-none"
                    contentEditable
                    suppressContentEditableWarning
                    onInput={(e) => setContent(e.target.innerHTML)}
                    dangerouslySetInnerHTML={{ __html: content }}
                    data-placeholder={placeholder}
                />

                <div className="text-sm text-zinc-500 mt-4 text-center">
                    Press <kbd>Ctrl+B</kbd> for bold, <kbd>/</kbd> for commands
                </div>
            </div>
        </div>
    );
};

export default NotionEditor;
