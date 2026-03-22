import * as cheerio from "cheerio";

export interface PageData {
  url: string;
  html: string;
  $: cheerio.CheerioAPI;
  title: string;
  meta: Record<string, string>;
  headings: { level: number; text: string }[];
  links: { href: string; text: string; external: boolean }[];
  images: { src: string; alt: string }[];
  forms: { action: string; inputs: string[] }[];
  buttons: string[];
  textContent: string;
  loadTimeMs: number;
  wordCount: number;
  scripts: number;
  stylesheets: number;
}

export async function fetchPage(url: string): Promise<PageData> {
  const start = Date.now();
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    redirect: "follow",
  });

  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const html = await res.text();
  const loadTimeMs = Date.now() - start;
  const $ = cheerio.load(html);

  const meta: Record<string, string> = {};
  $("meta").each((_, el) => {
    const name =
      $(el).attr("name") || $(el).attr("property") || $(el).attr("http-equiv");
    const content = $(el).attr("content");
    if (name && content) meta[name.toLowerCase()] = content;
  });

  const headings: PageData["headings"] = [];
  $("h1, h2, h3, h4, h5, h6").each((_, el) => {
    headings.push({
      level: parseInt(el.tagName[1]),
      text: $(el).text().trim(),
    });
  });

  const links: PageData["links"] = [];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    links.push({
      href,
      text: $(el).text().trim(),
      external: href.startsWith("http") && !href.includes(new URL(url).hostname),
    });
  });

  const images: PageData["images"] = [];
  $("img").each((_, el) => {
    images.push({ src: $(el).attr("src") || "", alt: $(el).attr("alt") || "" });
  });

  const forms: PageData["forms"] = [];
  $("form").each((_, el) => {
    const inputs: string[] = [];
    $(el)
      .find("input, textarea, select")
      .each((_, inp) => {
        inputs.push(
          $(inp).attr("type") || $(inp).attr("name") || inp.tagName
        );
      });
    forms.push({ action: $(el).attr("action") || "", inputs });
  });

  const buttons: string[] = [];
  $('button, [role="button"], input[type="submit"], a.btn, a.button, .cta').each(
    (_, el) => {
      const text = $(el).text().trim() || $(el).attr("value") || "";
      if (text) buttons.push(text);
    }
  );

  const textContent = $("body").text().replace(/\s+/g, " ").trim();

  return {
    url,
    html,
    $,
    title: $("title").text().trim(),
    meta,
    headings,
    links,
    images,
    forms,
    buttons,
    textContent,
    loadTimeMs,
    wordCount: textContent.split(/\s+/).length,
    scripts: $("script").length,
    stylesheets: $('link[rel="stylesheet"]').length,
  };
}
