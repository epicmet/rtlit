import fs from "node:fs/promises";

import * as esbuild from "esbuild";
import copy from "esbuild-plugin-copy";

// TODO: Make an abstraction of all these common use cases.
// Like logging, running jobs and build steps.

// *** Utilities *** //
function getBoolEnv(key) {
  return ["true", "1", "t"].includes(process.env[key]?.toLowerCase());
}

function print(level = "log", ...meta) {
  console.log(`esbuild:${level} ->`, ...meta);
}

function log(...meta) {
  print("log", ...meta);
}

// *** Args *** //
const watchMode = getBoolEnv("ESB_WATCH");

function onExit(fn) {
  /**
   * @type {NodeJS.SignalsListener}
   */
  function signalHandler(signal) {
    console.log(); /* Inset a new line. */

    log(`Received ${signal} signal. Existing...`);

    fn()
      .then(() => {
        process.exit(0);
      })
      .catch((err) => {
        console.error(`Could not run onExit function because: ${err}`);
        process.exit(1);
      });
  }

  process.on("SIGINT", signalHandler);
  process.on("SIGTERM", signalHandler);
  process.on("SIGQUIT", signalHandler);
}

// TODO: Tsconfig:
// I can d a shared tsconfig and a specefic one for each build?

// TODO: Functoins for moving things (html, and manifest.json)

const TARGET_PATH = "build";

/**
 * @type {esbuild.BuildOptions}
 */
const buildOptions = {
  entryPoints: [
    { in: "src/content-script/index.ts", out: "content-script/index" },
    { in: "src/sw/index.js", out: "sw/index" },
    { in: "src/popup/index.html", out: "popup/index" },
    { in: "src/popup/main.js", out: "popup/main" },
  ],
  // tsconfig: "src/scripts/tsconfig.json",
  outdir: TARGET_PATH,
  loader: { ".html": "copy" },
  write: true,
  bundle: true,
  plugins: [
    copy({
      resolveFrom: "cwd",
      assets: {
        from: ['./src/images/*'],
        to: [`./${TARGET_PATH}/images`]
      },
      watch: watchMode
    })
  ],
};

if (watchMode) {
  log("Watching...");
  const ctx = await esbuild.context(buildOptions);

  ctx.watch();
  onExit(async () => {
    log("Disposing the watcher...");
    await ctx.dispose();
    log("Existed watch mode");
  });
} else {
  esbuild.build(buildOptions);
  log("Built 🎉");
}
