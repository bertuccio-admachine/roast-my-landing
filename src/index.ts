#!/usr/bin/env bun
import { program } from "commander";
import ora from "ora";
import chalk from "chalk";
import { fetchPage } from "./fetcher";
import { runRules } from "./rules";
import { calculateScore } from "./scorer";
import { printReport } from "./reporter";

program
  .name("roast")
  .description("Brutally honest landing page conversion auditor")
  .version("1.0.0")
  .argument("<url>", "URL of the landing page to roast")
  .option("--json", "Output as JSON")
  .option("--ci", "Exit with code 1 if score < threshold")
  .option("--threshold <n>", "Minimum passing score for --ci", "70")
  .action(async (url: string, opts: { json?: boolean; ci?: boolean; threshold?: string }) => {
    // Normalize URL
    if (!url.startsWith("http")) url = "https://" + url;

    const spinner = opts.json ? null : ora("Fetching page...").start();

    try {
      const page = await fetchPage(url);
      spinner?.succeed("Page fetched");

      spinner?.start("Running conversion audit...");
      const findings = runRules(page);
      const score = calculateScore(findings);
      spinner?.succeed("Audit complete");

      printReport(url, findings, score, !!opts.json);

      if (opts.ci && score.total < parseInt(opts.threshold || "70")) {
        console.log(chalk.red(`Score ${score.total} is below threshold ${opts.threshold}. Failing CI.`));
        process.exit(1);
      }
    } catch (err: any) {
      spinner?.fail(err.message);
      process.exit(1);
    }
  });

program.parse();
