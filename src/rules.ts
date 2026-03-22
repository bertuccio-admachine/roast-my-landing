import type { PageData } from "./fetcher";

export interface Finding {
  category: string;
  severity: "critical" | "warning" | "info" | "pass";
  title: string;
  detail: string;
  fix?: string;
}

type Rule = (page: PageData) => Finding | Finding[] | null;

const rules: Rule[] = [
  // === HEADLINE & COPY ===
  (p) => {
    const h1s = p.headings.filter((h) => h.level === 1);
    if (h1s.length === 0)
      return {
        category: "Copy",
        severity: "critical",
        title: "No H1 headline found",
        detail: "Your page has no H1 tag. Visitors need to know what you do in <3 seconds.",
        fix: "Add a single, clear H1 that communicates your value proposition.",
      };
    if (h1s.length > 1)
      return {
        category: "Copy",
        severity: "warning",
        title: `Multiple H1s (${h1s.length})`,
        detail: `Found ${h1s.length} H1 tags: "${h1s.map((h) => h.text).join('", "')}". This dilutes focus.`,
        fix: "Use exactly one H1 for your main headline. Use H2s for sections.",
      };
    const h1 = h1s[0].text;
    if (h1.length > 80)
      return {
        category: "Copy",
        severity: "warning",
        title: "H1 is too long",
        detail: `"${h1}" is ${h1.length} chars. Best headlines are 6-12 words.`,
        fix: "Shorten to a punchy, benefit-driven headline.",
      };
    if (h1.length < 5)
      return {
        category: "Copy",
        severity: "warning",
        title: "H1 is too short/vague",
        detail: `"${h1}" doesn't say much.`,
        fix: "Make your headline specific and benefit-driven.",
      };
    return {
      category: "Copy",
      severity: "pass",
      title: "H1 looks solid",
      detail: `"${h1}" — clear and present.`,
    };
  },

  // === META ===
  (p) => {
    const findings: Finding[] = [];
    if (!p.meta.description)
      findings.push({
        category: "SEO",
        severity: "warning",
        title: "Missing meta description",
        detail: "No meta description tag. Search engines and social shares will look rough.",
        fix: 'Add <meta name="description" content="..."> with 120-160 chars.',
      });
    else if (p.meta.description.length < 70 || p.meta.description.length > 160)
      findings.push({
        category: "SEO",
        severity: "info",
        title: "Meta description length",
        detail: `${p.meta.description.length} chars — ideal is 120-160.`,
        fix: "Tweak to fit the sweet spot.",
      });

    if (!p.meta["og:title"] && !p.meta["og:description"])
      findings.push({
        category: "SEO",
        severity: "warning",
        title: "No Open Graph tags",
        detail: "When someone shares your link, it'll look like garbage.",
        fix: "Add og:title, og:description, og:image meta tags.",
      });

    if (!p.title)
      findings.push({
        category: "SEO",
        severity: "critical",
        title: "Missing page title",
        detail: "No <title> tag. This is basic stuff.",
        fix: "Add a descriptive <title> tag.",
      });
    return findings.length ? findings : null;
  },

  // === CTA ===
  (p) => {
    if (p.buttons.length === 0 && p.forms.length === 0)
      return {
        category: "Conversion",
        severity: "critical",
        title: "No CTA found",
        detail: "No buttons or forms detected. What are visitors supposed to DO?",
        fix: "Add a clear, prominent call-to-action button above the fold.",
      };

    const findings: Finding[] = [];
    const weakCTAs = ["submit", "click here", "learn more", "read more"];
    for (const btn of p.buttons) {
      if (weakCTAs.some((w) => btn.toLowerCase().includes(w)))
        findings.push({
          category: "Conversion",
          severity: "warning",
          title: `Weak CTA: "${btn}"`,
          detail: "Generic button text doesn't drive action.",
          fix: `Replace with a benefit-driven CTA like "Start Free Trial" or "Get Your Report".`,
        });
    }
    if (p.buttons.length > 0 && findings.length === 0)
      findings.push({
        category: "Conversion",
        severity: "pass",
        title: `Found ${p.buttons.length} CTA(s)`,
        detail: `Buttons: "${p.buttons.slice(0, 5).join('", "')}"`,
      });
    return findings;
  },

  // === TRUST ===
  (p) => {
    const trustWords = [
      "testimonial", "review", "rating", "stars", "trusted by",
      "customers", "companies", "as seen", "featured in", "case study",
      "guarantee", "money back", "risk-free", "social proof",
    ];
    const text = p.textContent.toLowerCase();
    const found = trustWords.filter((w) => text.includes(w));
    if (found.length === 0)
      return {
        category: "Trust",
        severity: "warning",
        title: "No social proof detected",
        detail: "No testimonials, reviews, logos, or trust signals found on the page.",
        fix: "Add customer testimonials, logos of notable clients, ratings, or trust badges.",
      };
    return {
      category: "Trust",
      severity: "pass",
      title: "Social proof detected",
      detail: `Found trust signals: ${found.join(", ")}.`,
    };
  },

  // === PERFORMANCE ===
  (p) => {
    const findings: Finding[] = [];
    if (p.loadTimeMs > 3000)
      findings.push({
        category: "Performance",
        severity: "critical",
        title: `Slow load: ${(p.loadTimeMs / 1000).toFixed(1)}s`,
        detail: "Page took over 3 seconds to load. You're losing visitors.",
        fix: "Optimize images, reduce scripts, enable compression.",
      });
    else if (p.loadTimeMs > 1500)
      findings.push({
        category: "Performance",
        severity: "warning",
        title: `Load time: ${(p.loadTimeMs / 1000).toFixed(1)}s`,
        detail: "Decent but could be faster. Under 1s is ideal.",
      });
    else
      findings.push({
        category: "Performance",
        severity: "pass",
        title: `Fast load: ${p.loadTimeMs}ms`,
        detail: "Good response time.",
      });

    if (p.scripts > 15)
      findings.push({
        category: "Performance",
        severity: "warning",
        title: `${p.scripts} script tags`,
        detail: "That's a lot of JavaScript. Each one adds load time and potential render blocking.",
        fix: "Audit scripts — remove unused ones, defer non-critical ones.",
      });
    return findings;
  },

  // === IMAGES ===
  (p) => {
    const noAlt = p.images.filter((i) => !i.alt);
    if (noAlt.length > 0)
      return {
        category: "Accessibility",
        severity: "warning",
        title: `${noAlt.length} image(s) missing alt text`,
        detail: "Bad for SEO and accessibility.",
        fix: "Add descriptive alt text to every image.",
      };
    if (p.images.length > 0)
      return {
        category: "Accessibility",
        severity: "pass",
        title: "All images have alt text",
        detail: `${p.images.length} images checked.`,
      };
    return null;
  },

  // === MOBILE ===
  (p) => {
    const viewport = p.meta.viewport;
    if (!viewport)
      return {
        category: "Mobile",
        severity: "critical",
        title: "No viewport meta tag",
        detail: "Page probably looks terrible on phones.",
        fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">.',
      };
    return {
      category: "Mobile",
      severity: "pass",
      title: "Viewport tag present",
      detail: `viewport: ${viewport}`,
    };
  },

  // === COPY LENGTH ===
  (p) => {
    if (p.wordCount < 100)
      return {
        category: "Copy",
        severity: "warning",
        title: `Very thin content (${p.wordCount} words)`,
        detail: "There's barely anything here. Visitors won't have enough info to convert.",
        fix: "Add sections covering benefits, how it works, who it's for, and social proof.",
      };
    if (p.wordCount > 3000)
      return {
        category: "Copy",
        severity: "info",
        title: `Long page (${p.wordCount} words)`,
        detail: "That's a lot of text. Make sure it's scannable with headers and bullet points.",
      };
    return null;
  },

  // === FORM FRICTION ===
  (p) => {
    for (const form of p.forms) {
      if (form.inputs.length > 5)
        return {
          category: "Conversion",
          severity: "warning",
          title: `Form has ${form.inputs.length} fields`,
          detail: "Too many fields = friction. Every extra field drops conversions.",
          fix: "Reduce to essentials. Name + email is often enough to start.",
        };
    }
    return null;
  },

  // === EXTERNAL LINKS ===
  (p) => {
    const ext = p.links.filter((l) => l.external);
    if (ext.length > 5)
      return {
        category: "Conversion",
        severity: "warning",
        title: `${ext.length} external links`,
        detail: "Each outbound link is an exit ramp. Landing pages should minimize distractions.",
        fix: "Remove non-essential external links. Keep focus on the conversion goal.",
      };
    return null;
  },

  // === FAVICON ===
  (p) => {
    const hasFavicon =
      p.$('link[rel="icon"]').length > 0 ||
      p.$('link[rel="shortcut icon"]').length > 0;
    if (!hasFavicon)
      return {
        category: "Polish",
        severity: "info",
        title: "No favicon detected",
        detail: "Small detail, big impact on perceived professionalism.",
        fix: "Add a favicon.",
      };
    return null;
  },

  // === HTTPS ===
  (p) => {
    if (!p.url.startsWith("https://"))
      return {
        category: "Trust",
        severity: "critical",
        title: "Not using HTTPS",
        detail: "Browsers flag this as 'Not Secure'. Instant trust killer.",
        fix: "Get an SSL certificate and redirect HTTP to HTTPS.",
      };
    return { category: "Trust", severity: "pass", title: "HTTPS enabled", detail: "Good." };
  },
];

export function runRules(page: PageData): Finding[] {
  const findings: Finding[] = [];
  for (const rule of rules) {
    const result = rule(page);
    if (result) {
      if (Array.isArray(result)) findings.push(...result);
      else findings.push(result);
    }
  }
  return findings;
}
