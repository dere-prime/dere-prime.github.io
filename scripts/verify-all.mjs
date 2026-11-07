import { spawnSync } from "node:child_process";

function run(args, env = {}) {
  const result = spawnSync(process.execPath, args, {
    stdio: "inherit",
    env: { ...process.env, ...env },
  });
  if (result.status !== 0) process.exit(result.status || 1);
}

run(["node_modules/astro/bin/astro.mjs", "build"], { BASE_PATH: "/" });
run(["scripts/verify.mjs"], { BASE_PATH: "/", VERIFY_DIR: "dist" });
run(
  ["node_modules/astro/bin/astro.mjs", "build", "--outDir", "qa-output/prefix"],
  { BASE_PATH: "/portfolio/" },
);
run(["scripts/verify.mjs"], {
  BASE_PATH: "/portfolio/",
  VERIFY_DIR: "qa-output/prefix",
});
