import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(import.meta.dirname, "../..");
const outputDir = mkdtempSync(join(tmpdir(), "siro-security-tests-"));

const compile = spawnSync("npx", [
  "tsc",
  "--target", "ES2022",
  "--module", "CommonJS",
  "--moduleResolution", "Node",
  "--esModuleInterop",
  "--skipLibCheck",
  "--types", "node",
  "--lib", "ES2022,DOM",
  "--outDir", outputDir,
  "tests/security/public-form-security.test.ts",
  "lib/public-form-utils.ts",
  "lib/rate-limit-key.ts",
], { cwd: root, stdio: "inherit" });

let exitCode = compile.status ?? 1;
if (exitCode === 0) {
  const testFile = join(outputDir, "tests/security/public-form-security.test.js");
  const result = spawnSync(process.execPath, ["--test", testFile], { cwd: root, stdio: "inherit" });
  exitCode = result.status ?? 1;
}

rmSync(outputDir, { recursive: true, force: true });
process.exit(exitCode);
