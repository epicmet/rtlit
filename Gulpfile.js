const { task, dest, series, src } = require("gulp");
const ts = require("gulp-typescript");
const tsProject = ts.createProject("./tsconfig.json");

const injectPaths = {
  CONTENT_SCRIPT: "./build/scripts",
  POPUP: "./build/popup",
  MANIFEST: "./build/",
  ASSESTS: "./build/images",
  SW: "./build/sw",
};

const readPaths = {
  POPUP: "./popup/*",
  MANIFEST: "./manifest.json",
  ASSESTS: "./images/*",
  SW: "./sw/*",
};

function bundleContentScript(cb) {
  tsProject.src().pipe(tsProject()).js.pipe(dest(injectPaths.CONTENT_SCRIPT));
  cb();
}

function buildPopup(cb) {
  src(readPaths.POPUP).pipe(dest(injectPaths.POPUP));
  cb();
}

function buildServiceWorker(cb) {
  src(readPaths.SW).pipe(dest(injectPaths.SW));
  cb();
}

function buildConfigs(cb) {
  src(readPaths.MANIFEST).pipe(dest(injectPaths.MANIFEST));
  src(readPaths.ASSESTS).pipe(dest(injectPaths.ASSESTS));
  cb();
}

task(
  "default",
  series(bundleContentScript, buildPopup, buildConfigs, buildServiceWorker),
);
