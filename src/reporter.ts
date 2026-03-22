import chalk from "chalk";
import type { Finding } from "./rules";
import type { Score } from "./scorer";

const severityIcon: Record<string, string> = {
  critical: "🔴",
  warning: "🟡",
  info: "🔵",
  pass: "✅",
};

const severityColor: Record<string, (s: string) => string> = {
  critical: chalk.red.bold,
  warning: chalk.yellow,
  info: chalk.blue,
  pass: chalk.green,
};

export function printReport(url: string, findings: Finding[], score: Score, json: boolean) {
  if (json) {
    console.log(JSON.stringify({ url, score, findings }, null, 2));
    return;
  }

  console.log("");
  console.log(chalk.bold.magenta("╔══════════════════════════════════════════╗"));
  console.log(chalk.bold.magenta("║") + chalk.bold("   🔥 ROAST MY LANDING PAGE 🔥            ") + chalk.bold.magenta("║"));
  console.log(chalk.bold.magenta("╚══════════════════════════════════════════╝"));
  console.log("");
  console.log(chalk.dim("  URL: ") + chalk.underline(url));
  console.log("");

  // Score card
  const scoreColor = score.total >= 70 ? chalk.green : score.total >= 50 ? chalk.yellow : chalk.red;
  console.log(chalk.bold("  SCORE: ") + scoreColor.bold(`${score.total}/100 ${score.emoji} (${score.grade})`));
  console.log("");

  // Breakdown
  console.log(chalk.bold.dim("  Category Breakdown:"));
  for (const [cat, pts] of Object.entries(score.breakdown)) {
    const bar = "█".repeat(Math.round(pts)) + "░".repeat(Math.max(0, 25 - Math.round(pts)));
    console.log(`    ${cat.padEnd(15)} ${bar} ${pts}`);
  }
  console.log("");

  // Findings by severity
  const grouped: Record<string, Finding[]> = {};
  for (const f of findings) {
    if (!grouped[f.severity]) grouped[f.severity] = [];
    grouped[f.severity].push(f);
  }

  for (const sev of ["critical", "warning", "info", "pass"]) {
    const items = grouped[sev];
    if (!items?.length) continue;

    const label = sev === "critical" ? "CRITICAL ISSUES" : sev === "warning" ? "WARNINGS" : sev === "info" ? "SUGGESTIONS" : "PASSING";
    console.log(severityColor[sev](`  ── ${label} ${"─".repeat(35 - label.length)}`));
    console.log("");

    for (const f of items) {
      console.log(`  ${severityIcon[sev]} ${chalk.bold(f.title)} ${chalk.dim(`[${f.category}]`)}`);
      console.log(`    ${f.detail}`);
      if (f.fix) console.log(`    ${chalk.green("→")} ${chalk.green(f.fix)}`);
      console.log("");
    }
  }

  // Summary
  const criticals = grouped.critical?.length || 0;
  const warnings = grouped.warning?.length || 0;
  console.log(chalk.dim("─".repeat(44)));
  if (criticals > 0)
    console.log(chalk.red.bold(`  🚨 ${criticals} critical issue(s) need immediate attention.`));
  if (warnings > 0)
    console.log(chalk.yellow(`  ⚠️  ${warnings} warning(s) worth addressing.`));
  if (criticals === 0 && warnings === 0)
    console.log(chalk.green.bold("  🎉 No major issues found. Nice work!"));
  console.log("");
}
