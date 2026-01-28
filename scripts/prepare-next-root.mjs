// scripts/prepare-next-root.mjs
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const rootNext = path.join(root, ".next");
const webNext = path.join(root, "apps", "web", ".next");

// Borra .next de la raíz si existe
fs.rmSync(rootNext, { recursive: true, force: true });

// Copia recursiva apps/web/.next -> .next
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDir(webNext, rootNext);
console.log("✅ Copiado apps/web/.next → .next");
