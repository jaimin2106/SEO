import DOMPurify from "dompurify";

const BLOG_HTML_CONFIG = {
  ALLOWED_TAGS: [
    "a", "b", "blockquote", "br", "code", "em", "figcaption", "figure", "h1", "h2", "h3", "h4", "hr", "i", "img",
    "li", "ol", "p", "pre", "s", "strong", "sub", "sup", "table", "tbody", "td", "th",
    "thead", "tr", "u", "ul",
  ],
  ALLOWED_ATTR: ["alt", "colspan", "height", "href", "rowspan", "scope", "src", "style", "title", "width"],
  ALLOW_DATA_ATTR: false,
  FORBID_TAGS: ["embed", "iframe", "object", "script", "style", "svg", "math"],
};

export function sanitizeBlogHtml(html: string): string {
  const cleanHtml = DOMPurify.sanitize(html, BLOG_HTML_CONFIG);
  const container = document.createElement("template");
  container.innerHTML = cleanHtml;

  container.content.querySelectorAll<HTMLElement>("[style]").forEach((element) => {
    const alignment = element.style.textAlign;
    element.removeAttribute("style");
    if (["left", "center", "right", "justify"].includes(alignment)) {
      element.style.textAlign = alignment;
    }
  });

  container.content.querySelectorAll<HTMLImageElement>("img[src]").forEach((image) => {
    const src = image.getAttribute("src")?.trim() ?? "";
    const isSafeSource = /^(?:https?:\/\/|\/(?!\/)|\.{1,2}\/|clipboard-image-\d+$)/i.test(src);
    if (!isSafeSource) image.remove();
  });

  return container.innerHTML;
}

export function getBlogImageUrls(html: string): string[] {
  const container = document.createElement("template");
  container.innerHTML = sanitizeBlogHtml(html);
  return Array.from(container.content.querySelectorAll("img[src]"))
    .map((image) => image.getAttribute("src"))
    .filter((src): src is string => Boolean(src));
}