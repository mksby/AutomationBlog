import { getStrapiMediaUrl } from "./strapi";

interface InlineNode {
  type: "text" | "link";
  text?: string;
  url?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  children?: InlineNode[];
}

interface BlockNode {
  type: string;
  level?: number;
  format?: "ordered" | "unordered";
  children?: (InlineNode | BlockNode)[];
  image?: {
    url: string;
    alternativeText?: string;
    width?: number;
    height?: number;
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderInline(node: InlineNode): string {
  if (node.type === "link" && node.url) {
    const inner = node.children?.map(renderInline).join("") ?? "";
    return '<a href="' + escapeHtml(node.url) + '">' + inner + "</a>";
  }

  let text = escapeHtml(node.text ?? "");
  if (node.code) text = "<code>" + text + "</code>";
  if (node.bold) text = "<strong>" + text + "</strong>";
  if (node.italic) text = "<em>" + text + "</em>";
  if (node.underline) text = "<u>" + text + "</u>";
  if (node.strikethrough) text = "<s>" + text + "</s>";
  return text;
}

function renderChildren(children: InlineNode[] | undefined): string {
  return children?.map(renderInline).join("") ?? "";
}

function renderBlock(block: BlockNode): string {
  switch (block.type) {
    case "paragraph":
      return "<p>" + renderChildren(block.children as InlineNode[]) + "</p>";

    case "heading": {
      const tag = "h" + (block.level ?? 2);
      return (
        "<" + tag + ">" + renderChildren(block.children as InlineNode[]) + "</" + tag + ">"
      );
    }

    case "list": {
      const tag = block.format === "ordered" ? "ol" : "ul";
      const items =
        block.children
          ?.map(
            (item: any) =>
              "<li>" + renderChildren(item.children) + "</li>",
          )
          .join("") ?? "";
      return "<" + tag + ">" + items + "</" + tag + ">";
    }

    case "quote":
      return (
        "<blockquote>" +
        renderChildren(block.children as InlineNode[]) +
        "</blockquote>"
      );

    case "code":
      return (
        "<pre><code>" +
        renderChildren(block.children as InlineNode[]) +
        "</code></pre>"
      );

    case "image": {
      if (!block.image) return "";
      const src = getStrapiMediaUrl(block.image.url);
      const alt = escapeHtml(block.image.alternativeText ?? "");
      const w = block.image.width ?? "";
      const h = block.image.height ?? "";
      let html =
        '<figure><img src="' +
        src +
        '" alt="' +
        alt +
        '" width="' +
        w +
        '" height="' +
        h +
        '" loading="lazy" decoding="async" />';
      if (alt) html += "<figcaption>" + alt + "</figcaption>";
      html += "</figure>";
      return html;
    }

    default:
      return "";
  }
}

export function renderBlocks(content: unknown[]): string {
  return (content as BlockNode[]).map(renderBlock).join("\n");
}
