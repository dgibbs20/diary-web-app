/**
 * Rich Text Editor Toolbar — Premium branded formatting bar
 * Consistent gold active states, Cormorant Garamond labels
 */
import { type Editor } from '@tiptap/react';
import {
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Code,
  Undo2, Redo2, Minus, Heading1, Heading2, Heading3,
  ChevronDown, Palette, Highlighter, Type,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const FONT = "'Cormorant Garamond', Georgia, serif";

interface EditorToolbarProps {
  editor: Editor | null;
}

const FONT_FAMILIES = [
  { label: 'Cormorant Garamond', value: 'Cormorant Garamond' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'System Sans', value: 'system-ui' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Courier New', value: 'Courier New' },
];

const FONT_SIZES = ['12', '14', '16', '18', '20', '24', '28', '32', '36', '48'];

const TEXT_COLORS = [
  '#2C1A0E', '#5C3D2A', '#8B6347', '#C9A84C', '#A8863A',
  '#E85D4A', '#D4A5E5', '#6B8EC2', '#8BC34A', '#FF6B8A',
  '#000000', '#333333', '#666666', '#999999', '#CCCCCC',
];

const HIGHLIGHT_COLORS = [
  'transparent', '#FFF9C4', '#FFECB3', '#FFE0B2', '#F8BBD0',
  '#E1BEE7', '#C5CAE9', '#B3E5FC', '#C8E6C9', '#DCEDC8',
];

export default function EditorToolbar({ editor }: EditorToolbarProps) {
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const fontMenuRef = useRef<HTMLDivElement>(null);
  const sizeMenuRef = useRef<HTMLDivElement>(null);
  const colorRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (fontMenuRef.current && !fontMenuRef.current.contains(e.target as Node)) setShowFontMenu(false);
      if (sizeMenuRef.current && !sizeMenuRef.current.contains(e.target as Node)) setShowSizeMenu(false);
      if (colorRef.current && !colorRef.current.contains(e.target as Node)) setShowColorPicker(false);
      if (highlightRef.current && !highlightRef.current.contains(e.target as Node)) setShowHighlightPicker(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!editor) return null;

  const run = (fn: (chain: ReturnType<Editor['chain']>) => ReturnType<Editor['chain']>) => {
    fn(editor.chain().focus()).run();
  };

  /* Gold active state instead of generic primary */
  const btnClass = (active: boolean) =>
    `p-1.5 rounded transition-colors duration-150 ${
      active
        ? 'text-[#C9A84C]'
        : 'hover:bg-accent text-foreground/60 hover:text-foreground'
    }`;

  const activeBtnBg = (active: boolean): React.CSSProperties =>
    active ? { backgroundColor: 'rgba(201,168,76,0.1)' } : {};

  const divider = (
    <div className="w-px h-5 mx-1 flex-shrink-0" style={{ backgroundColor: 'var(--border)' }} />
  );

  const currentFont = editor.getAttributes('textStyle').fontFamily || 'Cormorant Garamond';
  const currentFontLabel = FONT_FAMILIES.find(f => f.value === currentFont)?.label || 'Cormorant Garamond';
  const currentSize = editor.getAttributes('textStyle').fontSize?.replace('px', '') || '18';

  return (
    <div
      className="flex items-center gap-0.5 px-3 py-1.5 overflow-x-auto diary-scrollbar"
      style={{
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'var(--card)',
      }}
    >
      {/* Undo / Redo */}
      <button onClick={() => run(c => c.undo())} disabled={!editor.can().undo()} className={`${btnClass(false)} disabled:opacity-30`} title="Undo (Ctrl+Z)">
        <Undo2 size={15} />
      </button>
      <button onClick={() => run(c => c.redo())} disabled={!editor.can().redo()} className={`${btnClass(false)} disabled:opacity-30`} title="Redo (Ctrl+Y)">
        <Redo2 size={15} />
      </button>

      {divider}

      {/* Font Family Dropdown */}
      <div className="relative" ref={fontMenuRef}>
        <button
          onClick={() => { setShowFontMenu(!showFontMenu); setShowSizeMenu(false); setShowColorPicker(false); setShowHighlightPicker(false); }}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-accent transition-colors min-w-[110px]"
          style={{ color: 'var(--foreground)', fontFamily: FONT }}
        >
          <Type size={13} />
          <span className="truncate">{currentFontLabel}</span>
          <ChevronDown size={12} />
        </button>
        {showFontMenu && (
          <div
            className="absolute top-full left-0 mt-1 rounded-lg shadow-lg z-50 py-1 min-w-[180px]"
            style={{ backgroundColor: 'var(--popover)', border: '1px solid var(--border)' }}
          >
            {FONT_FAMILIES.map(font => (
              <button
                key={font.value}
                onClick={() => { run(c => c.setFontFamily(font.value)); setShowFontMenu(false); }}
                className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent transition-colors"
                style={{ fontFamily: font.value, color: currentFont === font.value ? '#C9A84C' : 'var(--foreground)' }}
              >
                {font.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Font Size Dropdown */}
      <div className="relative" ref={sizeMenuRef}>
        <button
          onClick={() => { setShowSizeMenu(!showSizeMenu); setShowFontMenu(false); setShowColorPicker(false); setShowHighlightPicker(false); }}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-accent transition-colors min-w-[50px]"
          style={{ color: 'var(--foreground)', fontFamily: FONT }}
        >
          <span>{currentSize}</span>
          <ChevronDown size={12} />
        </button>
        {showSizeMenu && (
          <div
            className="absolute top-full left-0 mt-1 rounded-lg shadow-lg z-50 py-1 min-w-[60px] max-h-[200px] overflow-y-auto"
            style={{ backgroundColor: 'var(--popover)', border: '1px solid var(--border)' }}
          >
            {FONT_SIZES.map(size => (
              <button
                key={size}
                onClick={() => {
                  (editor.chain().focus() as any).setFontSize(`${size}px`).run();
                  setShowSizeMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent transition-colors"
                style={{ color: currentSize === size ? '#C9A84C' : 'var(--foreground)', fontFamily: FONT }}
              >
                {size}
              </button>
            ))}
          </div>
        )}
      </div>

      {divider}

      {/* Bold, Italic, Underline, Strikethrough */}
      <button onClick={() => run(c => c.toggleBold())} className={btnClass(editor.isActive('bold'))} style={activeBtnBg(editor.isActive('bold'))} title="Bold (Ctrl+B)">
        <Bold size={15} />
      </button>
      <button onClick={() => run(c => c.toggleItalic())} className={btnClass(editor.isActive('italic'))} style={activeBtnBg(editor.isActive('italic'))} title="Italic (Ctrl+I)">
        <Italic size={15} />
      </button>
      <button onClick={() => run(c => c.toggleUnderline())} className={btnClass(editor.isActive('underline'))} style={activeBtnBg(editor.isActive('underline'))} title="Underline (Ctrl+U)">
        <Underline size={15} />
      </button>
      <button onClick={() => run(c => c.toggleStrike())} className={btnClass(editor.isActive('strike'))} style={activeBtnBg(editor.isActive('strike'))} title="Strikethrough">
        <Strikethrough size={15} />
      </button>

      {divider}

      {/* Text Color */}
      <div className="relative" ref={colorRef}>
        <button
          onClick={() => { setShowColorPicker(!showColorPicker); setShowFontMenu(false); setShowSizeMenu(false); setShowHighlightPicker(false); }}
          className={btnClass(false)}
          title="Text Color"
        >
          <Palette size={15} />
        </button>
        {showColorPicker && (
          <div
            className="absolute top-full left-0 mt-1 rounded-lg shadow-lg z-50 p-2"
            style={{ backgroundColor: 'var(--popover)', border: '1px solid var(--border)' }}
          >
            <div className="grid grid-cols-5 gap-1">
              {TEXT_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => { run(c => c.setColor(color)); setShowColorPicker(false); }}
                  className="w-6 h-6 rounded hover:scale-110 transition-transform"
                  style={{ backgroundColor: color, border: '1px solid var(--border)' }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Highlight */}
      <div className="relative" ref={highlightRef}>
        <button
          onClick={() => { setShowHighlightPicker(!showHighlightPicker); setShowFontMenu(false); setShowSizeMenu(false); setShowColorPicker(false); }}
          className={btnClass(editor.isActive('highlight'))}
          style={activeBtnBg(editor.isActive('highlight'))}
          title="Highlight"
        >
          <Highlighter size={15} />
        </button>
        {showHighlightPicker && (
          <div
            className="absolute top-full left-0 mt-1 rounded-lg shadow-lg z-50 p-2"
            style={{ backgroundColor: 'var(--popover)', border: '1px solid var(--border)' }}
          >
            <div className="grid grid-cols-5 gap-1">
              {HIGHLIGHT_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => {
                    if (color === 'transparent') {
                      run(c => c.unsetHighlight());
                    } else {
                      run(c => c.toggleHighlight({ color }));
                    }
                    setShowHighlightPicker(false);
                  }}
                  className="w-6 h-6 rounded hover:scale-110 transition-transform"
                  style={{ backgroundColor: color === 'transparent' ? 'var(--background)' : color, border: '1px solid var(--border)' }}
                >
                  {color === 'transparent' && <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>✕</span>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {divider}

      {/* Headings */}
      <button onClick={() => run(c => c.toggleHeading({ level: 1 }))} className={btnClass(editor.isActive('heading', { level: 1 }))} style={activeBtnBg(editor.isActive('heading', { level: 1 }))} title="Heading 1">
        <Heading1 size={15} />
      </button>
      <button onClick={() => run(c => c.toggleHeading({ level: 2 }))} className={btnClass(editor.isActive('heading', { level: 2 }))} style={activeBtnBg(editor.isActive('heading', { level: 2 }))} title="Heading 2">
        <Heading2 size={15} />
      </button>
      <button onClick={() => run(c => c.toggleHeading({ level: 3 }))} className={btnClass(editor.isActive('heading', { level: 3 }))} style={activeBtnBg(editor.isActive('heading', { level: 3 }))} title="Heading 3">
        <Heading3 size={15} />
      </button>

      {divider}

      {/* Alignment */}
      <button onClick={() => run(c => c.setTextAlign('left'))} className={btnClass(editor.isActive({ textAlign: 'left' }))} style={activeBtnBg(editor.isActive({ textAlign: 'left' }))} title="Align Left">
        <AlignLeft size={15} />
      </button>
      <button onClick={() => run(c => c.setTextAlign('center'))} className={btnClass(editor.isActive({ textAlign: 'center' }))} style={activeBtnBg(editor.isActive({ textAlign: 'center' }))} title="Align Center">
        <AlignCenter size={15} />
      </button>
      <button onClick={() => run(c => c.setTextAlign('right'))} className={btnClass(editor.isActive({ textAlign: 'right' }))} style={activeBtnBg(editor.isActive({ textAlign: 'right' }))} title="Align Right">
        <AlignRight size={15} />
      </button>
      <button onClick={() => run(c => c.setTextAlign('justify'))} className={btnClass(editor.isActive({ textAlign: 'justify' }))} style={activeBtnBg(editor.isActive({ textAlign: 'justify' }))} title="Justify">
        <AlignJustify size={15} />
      </button>

      {divider}

      {/* Lists */}
      <button onClick={() => (editor.chain().focus() as any).toggleBulletList().run()} className={btnClass(editor.isActive('bulletList'))} style={activeBtnBg(editor.isActive('bulletList'))} title="Bullet List">
        <List size={15} />
      </button>
      <button onClick={() => (editor.chain().focus() as any).toggleOrderedList().run()} className={btnClass(editor.isActive('orderedList'))} style={activeBtnBg(editor.isActive('orderedList'))} title="Numbered List">
        <ListOrdered size={15} />
      </button>

      {divider}

      {/* Blockquote, Code, Horizontal Rule */}
      <button onClick={() => (editor.chain().focus() as any).toggleBlockquote().run()} className={btnClass(editor.isActive('blockquote'))} style={activeBtnBg(editor.isActive('blockquote'))} title="Blockquote">
        <Quote size={15} />
      </button>
      <button onClick={() => (editor.chain().focus() as any).toggleCodeBlock().run()} className={btnClass(editor.isActive('codeBlock'))} style={activeBtnBg(editor.isActive('codeBlock'))} title="Code Block">
        <Code size={15} />
      </button>
      <button onClick={() => (editor.chain().focus() as any).setHorizontalRule().run()} className={btnClass(false)} title="Horizontal Rule">
        <Minus size={15} />
      </button>
    </div>
  );
}
