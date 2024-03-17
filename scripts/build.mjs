import fsp from "node:fs/promises";

import * as esbuild from "esbuild";
import copy from "esbuild-plugin-copy";

// TODO: Make an abstraction of all these common use cases.
// Like logging, running jobs and build steps.

/**
 * Manifest v3 types -> https://json.schemastore.org/chrome-manifest
 *
 * @typedef {Object} ContentScripts
 * @property {string[]} js
 * @property {string[]} matches
 *
 * @typedef {Object} Icons
 * @property {string} 16
 * @property {string} 32
 * @property {string} 48
 * @property {string} 128
 *
 * @typedef {Object} Background
 * @property {string} service_worker
 *
 * @typedef {Object} Action
 * @property {string} default_popup
 *
 * @typedef {Object} Manifest
 * @property {string} manifest_version
 * @property {string} name
 * @property {string} description
 * @property {string} version
 * @property {ContentScripts[]} content_scripts
 * @property {string[]} permissions
 * @property {Icons} icons
 * @property {Background} background
 * @property {Action} action
 */

/**
 * @typedef {"chrome"|"firefox"} TargetBrowser
 */

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
const targetBrowser = process.env.ESB_TARGET_BROWSER;
if (!targetBrowser) {
  print("error", "Please specify the target browser via ESB_TARGET_BROWSER environment variable");
  process.exit(1);
}

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

class ManifestTrasnformer {
  /**
   * @type {Manifest}
   */
  rawManifest = undefined;

  /**
   * @type {TargetBrowser}
   */
  target = undefined;

  /**
   * @param {Manifest} rawManifest
   * @param {TargetBrowser} target
   */
  constructor(rawManifest) {
    this.rawManifest = rawManifest;
  }

  /**
   * @param {TargetBrowser} target
   */
  build(target) {
    return this[target]();
  }

  firefox() {
    const fManifest = this.rawManifest

    fManifest.background = {
      scripts: ["sw/index.js"]
    }

    fManifest.browser_specific_settings = {
      gecko: {
        id: "mahd@gmail.com"
      }
    }

    return fManifest;
  }

  chrome() {
    const cManifest = this.rawManifest

    cManifest.background = {
      service_worker: "sw/index.js"
    }

    return cManifest;
  }
}

/**
 * @param {TargetBrowser} target
 * @returns {esbuild.Plugin}
 */
function createManifestPlugin(target) {
  return {
    name: "plugin:create-manifest",
    setup(build) {
      build.onEnd(async (_result) => {
        /**
         * @type {Manifest}
         */
        const rawManifest = JSON.parse(await fsp.readFile("./manifest.json", { encoding: "utf8" }));

        const manifest = new ManifestTrasnformer(rawManifest).build(target);

        await fsp.writeFile(`${TARGET_PATH}/manifest.json`, JSON.stringify(manifest, null, 2));
      });
    },
  }
}

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
      assets: [
        {
          from: ['./src/images/*'],
          to: [`./${TARGET_PATH}/images`]
        },
      ],
      watch: watchMode
    }),
    createManifestPlugin(targetBrowser),
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
