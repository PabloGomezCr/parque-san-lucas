import { mkdtemp, copyFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
const dir = await mkdtemp(join(tmpdir(), "sanlucas-qa-"));
const file = join(dir, "db.json");
await copyFile(new URL("../db.json", import.meta.url), file);
const server = spawn(
  process.execPath,
  [
    "node_modules/json-server/lib/bin.js",
    file,
    "--host",
    "127.0.0.1",
    "--port",
    "3101",
  ],
  { stdio: "inherit" },
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => server.kill(signal));
server.on("exit", async (code) => {
  await rm(dir, { recursive: true, force: true });
  process.exit(code || 0);
});
