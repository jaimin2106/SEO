import { describe, expect, it } from "vitest";
import { getBlogImageUrls, sanitizeBlogHtml } from "@/lib/sanitizeBlogHtml";

describe("sanitizeBlogHtml", () => {
  it("preserves semantic article formatting while removing unsafe markup", () => {
    const result = sanitizeBlogHtml(
      '<h1 onclick="alert(1)">Title</h1><h4>Section</h4><p style="text-align:center;color:red">Text <strong>bold</strong></p><script>alert(1)</script><a href="javascript:alert(1)">bad link</a>'
    );
    const container = document.createElement("template");
    container.innerHTML = result;

    expect(container.content.querySelector("h1")?.textContent).toBe("Title");
    expect(container.content.querySelector("h4")?.textContent).toBe("Section");
    expect(container.content.querySelector("p")?.style.textAlign).toBe("center");
    expect(container.content.querySelector("p")?.style.color).toBe("");
    expect(container.content.querySelector("script")).toBeNull();
    expect(container.content.querySelector("[onclick]")).toBeNull();
    expect(container.content.querySelector('a[href^="javascript:"]')).toBeNull();
    expect(container.content.querySelector("strong")?.textContent).toBe("bold");
  });

  it("returns only sanitized image references", () => {
    expect(getBlogImageUrls(
      '<p><img src="https://cdn.example.test/post.webp" alt="Cover"><img src="javascript:alert(1)"><img src="data:image/png;base64,AAAA"></p>'
    )).toEqual(["https://cdn.example.test/post.webp"]);
  });
});
