# 🔥 roast-my-landing

**Brutally honest landing page auditor.** Get a conversion score, find what's killing your signups, and fix it — in one command.

```bash
bunx roast-my-landing stripe.com
```

```
╔══════════════════════════════════════════╗
║   🔥 ROAST MY LANDING PAGE 🔥            ║
╚══════════════════════════════════════════╝

  URL: https://stripe.com
  SCORE: 72/100 👍 (B)

  Category Breakdown:
    Copy            █████████████░░░░░░░░░░░░ 12.5
    Conversion      ███████████████░░░░░░░░░░ 15
    Trust           ███████████████░░░░░░░░░░ 15
    SEO             ███████████████░░░░░░░░░░ 15
    Performance     ██████░░░░░░░░░░░░░░░░░░░ 6
    Mobile          █████░░░░░░░░░░░░░░░░░░░░ 5

  🟡 Multiple H1s (2) [Copy]
    → Use exactly one H1 for your main headline.

  🟡 67 script tags [Performance]
    → Audit scripts — remove unused ones, defer non-critical ones.

  ✅ Social proof detected [Trust]
  ✅ Fast load: 299ms [Performance]
  ✅ Viewport tag present [Mobile]
```

## Why

Every founder and marketer has the same blind spot: you can't objectively evaluate your own landing page. You know too much about your product.

**roast-my-landing** is the harsh friend who tells you what's actually wrong — weak headlines, missing CTAs, no social proof, slow loads, broken mobile, bad SEO — before your bounce rate tells you instead.

## What It Checks

| Category | What it audits |
|----------|----------------|
| **Copy** | H1 quality, headline length, content depth, word count |
| **Conversion** | CTAs present, button text quality, form friction, exit links |
| **Trust** | Social proof, testimonials, trust badges, HTTPS |
| **SEO** | Title, meta description, Open Graph tags |
| **Performance** | Load time, script count, stylesheet bloat |
| **Mobile** | Viewport meta tag |
| **Accessibility** | Image alt text |
| **Polish** | Favicon, small details |

Each finding is rated: 🔴 Critical · 🟡 Warning · 🔵 Info · ✅ Pass

Your final score is **0-100** with a letter grade (A+ to F-).

## Install

```bash
# Run instantly (no install)
bunx roast-my-landing https://your-site.com

# Or install globally
bun install -g roast-my-landing

# Then just:
roast your-site.com
```

> Requires [Bun](https://bun.sh) runtime.

## Usage

```bash
# Basic roast
roast https://mysite.com

# Auto-adds https:// if you're lazy
roast mysite.com

# JSON output (for scripts, CI, dashboards)
roast mysite.com --json

# CI mode — fail the build if score is below threshold
roast mysite.com --ci --threshold 75
```

### CI Integration

Add to your CI pipeline to enforce landing page quality:

```yaml
# GitHub Actions
- name: Roast landing page
  run: bunx roast-my-landing https://staging.myapp.com --ci --threshold 70
```

If the score drops below 70, your build fails. Ship better pages.

### JSON Output

```bash
roast mysite.com --json
```

Returns structured data you can pipe to dashboards, Slack alerts, or monitoring:

```json
{
  "url": "https://mysite.com",
  "score": { "total": 72, "grade": "B", "breakdown": { ... } },
  "findings": [
    { "category": "Copy", "severity": "warning", "title": "...", "fix": "..." }
  ]
}
```

## Scoring

The score is weighted by what actually matters for conversions:

| Category | Weight |
|----------|--------|
| Copy | 25% |
| Conversion | 25% |
| Trust | 15% |
| SEO | 15% |
| Performance | 10% |
| Mobile | 5% |
| Accessibility | 3% |
| Polish | 2% |

Grades:
- **A+** (90+): Your page is dialed in
- **A** (80-89): Strong, minor tweaks needed
- **B** (70-79): Good foundation, room to improve
- **C** (60-69): Significant issues hurting conversions
- **D** (50-59): Major problems
- **F** (35-49): Needs a rebuild
- **F-** (<35): ☠️

## Philosophy

This isn't a generic SEO checker. It's opinionated about **conversions**.

- Headlines matter more than meta tags
- A missing CTA is worse than a missing favicon
- Social proof is not optional
- Every external link is a potential exit
- Speed kills (slowness kills conversions)

## Contributing

PRs welcome. Add rules to `src/rules.ts` — each rule is a function that takes page data and returns findings. Keep them opinionated.

## License

MIT

---

Built by [Bertuccio](https://github.com/bertuccio-admachine) ⚙️
