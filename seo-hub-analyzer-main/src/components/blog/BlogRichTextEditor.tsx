import { useCallback, useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { mergeAttributes } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import {
  AlignCenter, AlignLeft, AlignRight, Bold, Heading1, Heading2, Heading3, Heading4, ImagePlus,
  Italic, Link2, List, ListOrdered, Minus, Quote, Redo2, Table2, Underline as UnderlineIcon,
  Undo2, Code2, Strikethrough,
} from "lucide-react";
import { getBlogImageUrls, sanitizeBlogHtml } from "@/lib/sanitizeBlogHtml";

type SlashCommand = {
  id: string;
  label: string;
  aliases: string[];
  from: number;
  to: number;
  selectedIndex: number;
};

const BlogImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      caption: {
        default: null,
        parseHTML: (element: HTMLElement) =>
          element.parentElement?.tagName === "FIGURE"
            ? element.parentElement.querySelector("figcaption")?.textContent ?? null
            : null,
        renderHTML: () => ({}),
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: "figure",
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) return false;
          const image = element.querySelector("img");
          const src = image?.getAttribute("src");
          if (!src) return false;
          return {
            src,
            alt: image.getAttribute("alt"),
            title: image.getAttribute("title"),
            width: image.getAttribute("width"),
            height: image.getAttribute("height"),
            caption: element.querySelector("figcaption")?.textContent ?? null,
          };
        },
      },
      { tag: "img" },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    const { caption, ...imageAttributes } = HTMLAttributes;
    const image = ["img", mergeAttributes(imageAttributes)] as const;
    return caption
      ? ["figure", {}, image, ["figcaption", {}, caption]]
      : image;
  },
});

interface BlogRichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  onImageUpload: (file: File) => Promise<string>;
  onImageRemoved: (oldUrl: string) => void;
}

export function BlogRichTextEditor({ value, onChange, onImageUpload, onImageRemoved }: BlogRichTextEditorProps) {
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  const onImageRemovedRef = useRef(onImageRemoved);
  const previousHtmlRef = useRef(value);
  const slashMenuRef = useRef<SlashCommand | null>(null);
  const runSlashCommandRef = useRef<(id: string) => void>(() => undefined);
  const [slashMenu, setSlashMenu] = useState<SlashCommand | null>(null);
  onChangeRef.current = onChange;
  onImageRemovedRef.current = onImageRemoved;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
      Underline,
      Link.configure({ openOnClick: false, linkOnPaste: true }),
      BlogImage.configure({ allowBase64: false }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Write or paste your article here..." }),
    ],
    content: sanitizeBlogHtml(value),
    onUpdate: ({ editor: currentEditor }) => {
      const html = currentEditor.getHTML();
      const currentImages = new Set(getBlogImageUrls(html));
      getBlogImageUrls(previousHtmlRef.current).forEach((url) => {
        if (!currentImages.has(url)) onImageRemovedRef.current(url);
      });
      previousHtmlRef.current = html;
      onChangeRef.current(html);

      const { $from, from, to } = currentEditor.state.selection;
      const textBeforeCursor = $from.parent.textBetween(0, $from.parentOffset, "\n", "\0");
      const commandMatch = /(?:^|\s)\/([a-zA-Z0-9 ]*)$/.exec(textBeforeCursor);
      if (commandMatch) {
        const slashOffset = commandMatch.index + commandMatch[0].lastIndexOf("/");
        const nextMenu = {
          from: $from.start() + slashOffset,
          to,
          id: "",
          label: commandMatch[1].trim(),
          aliases: [],
          selectedIndex: 0,
        };
        slashMenuRef.current = nextMenu;
        setSlashMenu(nextMenu);
      } else {
        slashMenuRef.current = null;
        setSlashMenu(null);
      }
    },
    editorProps: {
      attributes: { class: "blog-rich-editor focus:outline-none" },
      handleKeyDown: (_view, event) => {
        const menu = slashMenuRef.current;
        if (!menu) return false;

        const matches = getSlashCommands(menu.label);
        if (event.key === "Escape") {
          slashMenuRef.current = null;
          setSlashMenu(null);
          return true;
        }
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          const direction = event.key === "ArrowDown" ? 1 : -1;
          const nextMenu = {
            ...menu,
            selectedIndex: (menu.selectedIndex + direction + matches.length) % matches.length,
          };
          slashMenuRef.current = nextMenu;
          setSlashMenu(nextMenu);
          return true;
        }
        if (event.key === "Enter" && matches.length > 0) {
          event.preventDefault();
          runSlashCommandRef.current(matches[menu.selectedIndex]?.id ?? matches[0].id);
          return true;
        }
        return false;
      },
    },
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      const sanitized = sanitizeBlogHtml(value);
      editor.commands.setContent(sanitized, false);
      previousHtmlRef.current = sanitized;
    }
  }, [editor, value]);

  const insertImages = useCallback(async (files: File[], position?: number) => {
    if (!editor) return;
    let insertAt = position;

    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      const src = await onImageUpload(file);
      const imageNode = { type: "image", attrs: { src, alt: file.name.replace(/\.[^.]+$/, "") } };
      if (insertAt === undefined) {
        editor.chain().focus().setImage(imageNode.attrs).run();
      } else {
        editor.chain().focus().insertContentAt(insertAt, imageNode).run();
        insertAt += 1;
      }
    }
  }, [editor, onImageUpload]);

  const slashCommands = [
    { id: "paragraph", label: "Paragraph", aliases: ["text", "body"] },
    { id: "heading-1", label: "Heading 1", aliases: ["h1"] },
    { id: "heading-2", label: "Heading 2", aliases: ["h2"] },
    { id: "heading-3", label: "Heading 3", aliases: ["h3"] },
    { id: "bullet-list", label: "Bullet list", aliases: ["bullets", "ul"] },
    { id: "numbered-list", label: "Numbered list", aliases: ["ordered", "ol"] },
    { id: "quote", label: "Quote", aliases: ["blockquote"] },
    { id: "code-block", label: "Code block", aliases: ["code"] },
    { id: "image", label: "Image", aliases: ["picture", "photo"] },
    { id: "table", label: "Table", aliases: ["grid"] },
    { id: "divider", label: "Divider", aliases: ["separator", "rule"] },
  ];

  function getSlashCommands(query: string) {
    const normalizedQuery = query.toLowerCase();
    return slashCommands.filter((command) =>
      `${command.label} ${command.aliases.join(" ")}`.toLowerCase().includes(normalizedQuery)
    );
  }

  const runSlashCommand = (id: string) => {
    if (!editor) return;
    const menu = slashMenuRef.current;
    if (!menu) return;

    const chain = editor.chain().focus().deleteRange({ from: menu.from, to: menu.to });
    switch (id) {
      case "paragraph": chain.setParagraph().run(); break;
      case "heading-1": chain.setHeading({ level: 1 }).run(); break;
      case "heading-2": chain.setHeading({ level: 2 }).run(); break;
      case "heading-3": chain.setHeading({ level: 3 }).run(); break;
      case "bullet-list": chain.toggleBulletList().run(); break;
      case "numbered-list": chain.toggleOrderedList().run(); break;
      case "quote": chain.toggleBlockquote().run(); break;
      case "code-block": chain.toggleCodeBlock().run(); break;
      case "table": chain.insertTable({ rows: 2, cols: 2, withHeaderRow: true }).run(); break;
      case "divider": chain.setHorizontalRule().run(); break;
      case "image":
        chain.run();
        uploadInputRef.current?.click();
        break;
      default: return;
    }

    slashMenuRef.current = null;
    setSlashMenu(null);
  };
  runSlashCommandRef.current = runSlashCommand;

  const handlePasteCapture = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const imageFiles = Array.from(event.clipboardData.items)
      .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
      .map((item) => item.getAsFile())
      .filter((file): file is File => file !== null);
    const html = event.clipboardData.getData("text/html");

    if (html && editor) {
      event.preventDefault();
      const source = document.createElement("template");
      source.innerHTML = html;
      const clipboardImages = Array.from(source.content.querySelectorAll<HTMLImageElement>("img[src]"))
        .filter((image) => /^(?:data:image\/|blob:|file:)/i.test(image.getAttribute("src") ?? ""));
      clipboardImages.forEach((image, index) => image.setAttribute("src", `clipboard-image-${index}`));
      const cleanHtml = sanitizeBlogHtml(source.innerHTML);
      const cleanTemplate = document.createElement("template");
      cleanTemplate.innerHTML = cleanHtml;
      const pastedImages = Array.from(cleanTemplate.content.querySelectorAll<HTMLImageElement>("img[src^='clipboard-image-']"));

      if (pastedImages.length && imageFiles.length) {
        void Promise.all(pastedImages.map(async (image, index) => {
          const file = imageFiles[index];
          if (!file) return { index, url: null };
          try {
            return { index, url: await onImageUpload(file) };
          } catch (error) {
            console.error("Clipboard image upload failed:", error);
            return { index, url: null };
          }
        })).then((uploadedImages) => {
          uploadedImages.forEach(({ index, url }) => {
            const pastedImage = pastedImages[index];
            if (url) pastedImage.setAttribute("src", url);
            else pastedImage.remove();
          });
          editor.chain().focus().insertContent(cleanTemplate.innerHTML).run();
        });
      } else {
        pastedImages.forEach((image) => image.remove());
        editor.chain().focus().insertContent(cleanTemplate.innerHTML).run();
      }
      return;
    }

    if (imageFiles.length) {
      event.preventDefault();
      void insertImages(imageFiles).catch((error: unknown) => {
        console.error("Clipboard image upload failed:", error);
      });
    }
  };

  const handleDropCapture = (event: React.DragEvent<HTMLDivElement>) => {
    const imageFiles = Array.from(event.dataTransfer.files).filter((file) => file.type.startsWith("image/"));
    if (!imageFiles.length || !editor) return;

    event.preventDefault();
    const coordinates = editor.view.posAtCoords({ left: event.clientX, top: event.clientY });
    void insertImages(imageFiles, coordinates?.pos).catch((error: unknown) => {
      console.error("Dropped image upload failed:", error);
    });
  };

  const handleImageSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !editor) return;

    try {
      const selectedImage = editor.isActive("image");
      const src = await onImageUpload(file);

      if (selectedImage) {
        editor.chain().focus().updateAttributes("image", { src }).run();
      } else {
        editor.chain().focus().setImage({ src, alt: file.name.replace(/\.[^.]+$/, "") }).run();
      }
    } catch (error) {
      console.error("Image upload failed:", error);
    }
  };

  const setLink = () => {
    if (!editor) return;
    const currentHref = editor.getAttributes("link").href as string | undefined;
    const href = window.prompt("Link URL", currentHref ?? "https://");
    if (href === null) return;
    if (!href.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: href.trim() }).run();
  };

  const selectedImageAlt = editor?.isActive("image") ? (editor.getAttributes("image").alt as string ?? "") : null;
  const selectedImageCaption = editor?.isActive("image") ? (editor.getAttributes("image").caption as string ?? "") : null;
  const matchingSlashCommands = slashMenu ? getSlashCommands(slashMenu.label) : [];

  return (
    <div className="relative space-y-3" onPasteCapture={handlePasteCapture} onDropCapture={handleDropCapture}>
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border border-[#e8e6dc] bg-white p-2 shadow-sm">
        <ToolbarButton label="Bold" active={!!editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()}><Bold /></ToolbarButton>
        <ToolbarButton label="Italic" active={!!editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()}><Italic /></ToolbarButton>
        <ToolbarButton label="Underline" active={!!editor?.isActive("underline")} onClick={() => editor?.chain().focus().toggleUnderline().run()}><UnderlineIcon /></ToolbarButton>
        <ToolbarButton label="Strikethrough" active={!!editor?.isActive("strike")} onClick={() => editor?.chain().focus().toggleStrike().run()}><Strikethrough /></ToolbarButton>
        <ToolbarButton label="Inline code" active={!!editor?.isActive("code")} onClick={() => editor?.chain().focus().toggleCode().run()}><Code2 /></ToolbarButton>
        <ToolbarButton label="Heading 1" active={!!editor?.isActive("heading", { level: 1 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}><Heading1 /></ToolbarButton>
        <ToolbarButton label="Heading 2" active={!!editor?.isActive("heading", { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 /></ToolbarButton>
        <ToolbarButton label="Heading 3" active={!!editor?.isActive("heading", { level: 3 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 /></ToolbarButton>
        <ToolbarButton label="Heading 4" active={!!editor?.isActive("heading", { level: 4 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 4 }).run()}><Heading4 /></ToolbarButton>
        <ToolbarButton label="Bulleted list" active={!!editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()}><List /></ToolbarButton>
        <ToolbarButton label="Numbered list" active={!!editor?.isActive("orderedList")} onClick={() => editor?.chain().focus().toggleOrderedList().run()}><ListOrdered /></ToolbarButton>
        <ToolbarButton label="Quote" active={!!editor?.isActive("blockquote")} onClick={() => editor?.chain().focus().toggleBlockquote().run()}><Quote /></ToolbarButton>
        <ToolbarButton label="Code block" active={!!editor?.isActive("codeBlock")} onClick={() => editor?.chain().focus().toggleCodeBlock().run()}><Code2 /></ToolbarButton>
        <ToolbarButton label="Link" active={!!editor?.isActive("link")} onClick={setLink}><Link2 /></ToolbarButton>
        <ToolbarButton label="Insert table" onClick={() => editor?.chain().focus().insertTable({ rows: 2, cols: 2, withHeaderRow: true }).run()}><Table2 /></ToolbarButton>
        <ToolbarButton label="Horizontal rule" onClick={() => editor?.chain().focus().setHorizontalRule().run()}><Minus /></ToolbarButton>
        <ToolbarButton label="Align left" onClick={() => editor?.chain().focus().setTextAlign("left").run()}><AlignLeft /></ToolbarButton>
        <ToolbarButton label="Align center" onClick={() => editor?.chain().focus().setTextAlign("center").run()}><AlignCenter /></ToolbarButton>
        <ToolbarButton label="Align right" onClick={() => editor?.chain().focus().setTextAlign("right").run()}><AlignRight /></ToolbarButton>
        <ToolbarButton label="Undo" onClick={() => editor?.chain().focus().undo().run()}><Undo2 /></ToolbarButton>
        <ToolbarButton label="Redo" onClick={() => editor?.chain().focus().redo().run()}><Redo2 /></ToolbarButton>
        <ToolbarButton label={editor?.isActive("image") ? "Replace image" : "Insert image"} onClick={() => uploadInputRef.current?.click()}><ImagePlus /></ToolbarButton>
        <input ref={uploadInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={handleImageSelection} />
      </div>

      {slashMenu && matchingSlashCommands.length > 0 && (
        <div
          role="listbox"
          aria-label="Editor commands"
          className="absolute left-2 top-12 z-30 max-h-64 w-64 overflow-y-auto rounded-lg border border-[#e8e6dc] bg-white p-1 shadow-xl"
        >
          {matchingSlashCommands.map((command, index) => (
            <button
              key={command.id}
              type="button"
              role="option"
              aria-selected={slashMenu.selectedIndex === index}
              className={`block w-full rounded px-3 py-2 text-left text-sm ${slashMenu.selectedIndex === index ? "bg-[#f5f4ed] text-[#c96442]" : "text-[#141413] hover:bg-[#faf9f5]"}`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => runSlashCommand(command.id)}
            >
              {command.label}
            </button>
          ))}
        </div>
      )}

      {selectedImageAlt !== null && (
        <div className="space-y-2 text-[12px] text-[#5e5d59]">
          <label className="flex items-center gap-2">
            Image alt text
            <input
              value={selectedImageAlt}
              onChange={(event) => editor?.chain().focus().updateAttributes("image", { alt: event.target.value }).run()}
              className="min-w-0 flex-1 border-b border-[#e8e6dc] bg-transparent px-2 py-1 text-[13px] text-[#141413] outline-none focus:border-[#c96442]"
            />
          </label>
          <label className="flex items-center gap-2">
            Image caption
            <input
              value={selectedImageCaption ?? ""}
              onChange={(event) => editor?.chain().focus().updateAttributes("image", { caption: event.target.value }).run()}
              className="min-w-0 flex-1 border-b border-[#e8e6dc] bg-transparent px-2 py-1 text-[13px] text-[#141413] outline-none focus:border-[#c96442]"
            />
          </label>
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarButton({
  label,
  active = false,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center border border-transparent text-[#5e5d59] transition-colors hover:bg-[#f5f4ed] [&>svg]:h-4 [&>svg]:w-4 ${active ? "bg-[#f5f4ed] text-[#c96442]" : ""}`}
    >
      {children}
    </button>
  );
}