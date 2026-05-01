import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const shimDir = resolve(root, "tests/shims/server-only");
const targetDir = resolve(root, "node_modules/server-only");

mkdirSync(targetDir, { recursive: true });
copyFileSync(resolve(shimDir, "package.json"), resolve(targetDir, "package.json"));
copyFileSync(resolve(shimDir, "index.js"), resolve(targetDir, "index.js"));
