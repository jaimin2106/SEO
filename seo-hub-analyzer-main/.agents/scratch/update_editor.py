import os

file_path = r"c:\Users\JAIMIN\Desktop\seo-hub-analyzer-main\seo-hub-analyzer-main\src\pages\admin\AdminBlogEditor.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    original = f.read()

# We will apply a series of replacements to inject the new functionality.

new_content = original.replace(
    "import React, { useState, useEffect } from 'react';",
    "import React, { useState, useEffect, useRef } from 'react';"
)

new_content = new_content.replace(
    "import { \n  ArrowLeft, Save, Sparkles, Image as ImageIcon, \n  AlignLeft, Heading1, Code, Quote, ListChecks, CheckCircle2, \n  LayoutTemplate, Settings2, Trash2, GripVertical, ChevronDown, ChevronRight\n} from 'lucide-react';",
    "import { \n  ArrowLeft, Save, Sparkles, Image as ImageIcon, \n  AlignLeft, Heading1, Code, Quote, ListChecks, CheckCircle2, \n  LayoutTemplate, Settings2, Trash2, GripVertical, ChevronDown, ChevronRight,\n  PenLine, Eye\n} from 'lucide-react';"
)

state_declaration = """  // UI State
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [hoveredBlockIndex, setHoveredBlockIndex] = useState<number | null>(null);
  
  // UX Overhaul States
  const [mobileView, setMobileView] = useState<'write' | 'preview'>('write');
  const [isTyping, setIsTyping] = useState(false);
  const [activeBlockIndex, setActiveBlockIndex] = useState<number | null>(null);
  const [slashMenu, setSlashMenu] = useState<{ isOpen: boolean, index: number, search: string } | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const handleTyping = () => {
    setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000);
  };
"""

new_content = new_content.replace(
    "  // UI State\n  const [isConfigOpen, setIsConfigOpen] = useState(false);\n  const [hoveredBlockIndex, setHoveredBlockIndex] = useState<number | null>(null);",
    state_declaration
)

# Active focus on click
new_content = new_content.replace(
    "onMouseEnter={() => setHoveredBlockIndex(index)}",
    "onMouseEnter={() => setHoveredBlockIndex(index)}\n                  onClick={() => setActiveBlockIndex(index)}"
)

# Textarea changes for handleTyping and active tracking
new_content = new_content.replace(
    "onChange={e => handleUpdateBlock(index, { ...block, text: e.target.value })}",
    "onChange={e => {\n                          handleTyping();\n                          const val = e.target.value;\n                          // Slash menu trigger\n                          if (val.endsWith('/')) {\n                            setSlashMenu({ isOpen: true, index, search: '' });\n                          } else if (slashMenu?.isOpen && slashMenu.index === index) {\n                            const parts = val.split('/');\n                            setSlashMenu({ ...slashMenu, search: parts[parts.length - 1] });\n                          }\n                          if (!val.includes('/')) setSlashMenu(null);\n                          handleUpdateBlock(index, { ...block, text: val });\n                        }}"
)

# Block Canvas Active State
new_content = new_content.replace(
    "className=\"flex-1 rounded-xl group-hover:bg-gray-50 transition-colors p-2 -my-2 relative\"",
    "className={`flex-1 rounded-xl group-hover:bg-gray-50 transition-colors p-2 -my-2 relative border-l-2 ${activeBlockIndex === index ? 'border-[#c96442]' : 'border-transparent'}`}"
)

# Layout adjustments for responsive and distraction free mode
new_content = new_content.replace(
    "<div className=\"h-14 shrink-0 border-b border-gray-200 bg-white px-4 flex items-center justify-between z-20\">",
    "<div className={`h-14 shrink-0 border-b border-gray-200 bg-white px-4 flex items-center justify-between z-20 transition-opacity duration-500 ${isTyping ? 'opacity-20 hover:opacity-100' : 'opacity-100'}`}>"
)

new_content = new_content.replace(
    "className=\"bg-white border-b border-gray-200 shrink-0 shadow-sm z-10 animate-in slide-in-from-top-2 duration-200\"",
    "className={`bg-white border-b border-gray-200 shrink-0 shadow-sm z-10 animate-in slide-in-from-top-2 duration-500 transition-opacity ${isTyping ? 'opacity-20 hover:opacity-100' : 'opacity-100'}`}"
)

# Mobile Flex Row logic
new_content = new_content.replace(
    "<div className=\"flex-1 flex overflow-hidden\">",
    "<div className=\"flex-1 flex flex-col lg:flex-row overflow-hidden pb-[60px] lg:pb-0\">"
)

new_content = new_content.replace(
    "<div className=\"w-1/2 flex flex-col border-r border-gray-200 bg-white relative\">",
    "<div className={`w-full lg:w-1/2 flex-col border-r border-gray-200 bg-white relative ${mobileView === 'write' ? 'flex' : 'hidden lg:flex'}`}>"
)

new_content = new_content.replace(
    "<div className=\"w-1/2 flex flex-col bg-[#faf9f5] overflow-hidden relative border-l border-gray-200\">",
    "<div className={`w-full lg:w-1/2 flex-col bg-[#faf9f5] overflow-hidden relative border-l border-gray-200 ${mobileView === 'preview' ? 'flex' : 'hidden lg:flex'}`}>"
)

# Typography inside editor
new_content = new_content.replace(
    "text-[16px] text-gray-800 bg-transparent outline-none min-h-[40px]",
    "font-serif text-[18px] text-gray-800 bg-transparent outline-none min-h-[40px]"
)

# Inject slash menu UI inside the block loop
slash_ui = """
                    {/* Command Palette Dropdown */}
                    {slashMenu?.isOpen && slashMenu.index === index && block.type === 'paragraph' && (
                      <div className="absolute top-full left-4 mt-1 w-64 bg-white border border-gray-200 shadow-xl rounded-xl z-50 overflow-hidden font-sans">
                        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 border-b border-gray-100">
                          Basic Blocks
                        </div>
                        <div className="p-1">
                          {[
                            { id: 'heading', label: 'Heading', icon: Heading1 },
                            { id: 'image', label: 'Image', icon: ImageIcon },
                            { id: 'quote', label: 'Quote', icon: Quote },
                            { id: 'code', label: 'Code Block', icon: Code },
                            { id: 'executive_summary', label: 'Summary', icon: ListChecks }
                          ].filter(cmd => cmd.label.toLowerCase().includes(slashMenu.search.toLowerCase())).map(cmd => (
                            <button
                              key={cmd.id}
                              className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg text-left transition-colors"
                              onClick={() => {
                                let newBlockType: any = { type: cmd.id };
                                if (cmd.id === 'heading') newBlockType = { type: 'heading', level: 2, text: '', id: `h-${Date.now()}` };
                                if (cmd.id === 'executive_summary') newBlockType = { type: 'executive_summary', items: [''] };
                                if (cmd.id === 'image') newBlockType = { type: 'image', url: '', caption: '', alt: '' };
                                if (cmd.id === 'quote') newBlockType = { type: 'quote', text: '' };
                                if (cmd.id === 'code') newBlockType = { type: 'code', code: '' };
                                handleUpdateBlock(index, newBlockType);
                                setSlashMenu(null);
                              }}
                            >
                              <cmd.icon className="h-4 w-4 text-gray-400" />
                              {cmd.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
"""
new_content = new_content.replace(
    "placeholder=\"Type paragraph...\"\n                      />\n                    )}",
    "placeholder=\"Type paragraph...\"\n                      />\n                    )}" + slash_ui
)

# Mobile Sticky Tab Bar
mobile_tabs = """
      {/* Mobile Sticky Navigation Tabs */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-[60px] bg-white border-t border-gray-200 z-50 flex">
        <button 
          onClick={() => setMobileView('write')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${mobileView === 'write' ? 'text-[#c96442]' : 'text-gray-500 hover:text-gray-900'}`}
        >
          <PenLine className="h-5 w-5" />
          <span className="text-[11px] font-medium uppercase tracking-wider">Write</span>
        </button>
        <div className="w-[1px] h-full bg-gray-200" />
        <button 
          onClick={() => setMobileView('preview')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${mobileView === 'preview' ? 'text-[#c96442]' : 'text-gray-500 hover:text-gray-900'}`}
        >
          <Eye className="h-5 w-5" />
          <span className="text-[11px] font-medium uppercase tracking-wider">Preview</span>
        </button>
      </div>
    </div>
  );
"""
new_content = new_content.replace("    </div>\n  );\n};\n\nexport default AdminBlogEditor;", mobile_tabs + "\n};\n\nexport default AdminBlogEditor;")

# Drag and Drop handlers for the left pane
drag_drop_handlers = """
          onDrop={async (e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file && file.type.startsWith('image/')) {
              // Add temp block
              const newBlocks = [...blocks, { type: 'image', url: '', alt: 'Uploading...' } as any];
              setBlocks(newBlocks);
              const url = await uploadImage.mutateAsync(file);
              const updatedBlocks = [...newBlocks];
              updatedBlocks[updatedBlocks.length - 1].url = url;
              updatedBlocks[updatedBlocks.length - 1].alt = '';
              setBlocks(updatedBlocks);
            }
          }}
          onDragOver={(e) => e.preventDefault()}
"""
new_content = new_content.replace(
    "<div className={`w-full lg:w-1/2 flex-col border-r border-gray-200 bg-white relative ${mobileView === 'write' ? 'flex' : 'hidden lg:flex'}`}>",
    f"<div className={{`w-full lg:w-1/2 flex-col border-r border-gray-200 bg-white relative ${{mobileView === 'write' ? 'flex' : 'hidden lg:flex'}}`}} {drag_drop_handlers}>"
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Editor updated successfully.")
