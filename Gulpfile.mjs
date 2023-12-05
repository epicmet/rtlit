import fsp from "node:fs/promises";
import fs from "node:fs";
import path from "node:path";

import gulp from "gulp";
import ts from "gulp-typescript";

const tsProject = ts.createProject("./tsconfig.json");

const BUILD_DIR = "./build";

const injectPaths = {
  CONTENT_SCRIPT: "./build/scripts",
  POPUP: "./build/popup",
  MANIFEST: "./build/",
  ASSESTS: "./build/images",
  SW: "./build/sw",
};

const readPaths = {
  POPUP: "./popup/**/*",
  MANIFEST: "./manifest.json",
  ASSESTS: "./images/**/*",
  SW: "./sw/**/*",
};

async function clean() {
  if (!fs.existsSync(BUILD_DIR)) {
    return Promise.resolve();
  }

  const res = await fsp.readdir(BUILD_DIR, { withFileTypes: true });

  for (const d of res) {
    const targetPath = path.join(BUILD_DIR, d.name);

    if (d.isFile()) {
      await fsp.unlink(targetPath);
    } else if (d.isDirectory()) {
      await fsp.rm(targetPath, { force: true, recursive: true });
    }
  }
}

function bundleContentScript(cb) {
  tsProject
    .src()
    .pipe(tsProject())
    .js.pipe(gulp.dest(injectPaths.CONTENT_SCRIPT));
  cb();
}

function buildPopup(cb) {
  gulp.src(readPaths.POPUP).pipe(gulp.dest(injectPaths.POPUP));
  cb();
}

function buildServiceWorker(cb) {
  gulp.src(readPaths.SW).pipe(gulp.dest(injectPaths.SW));
  cb();
}

function buildConfigs(cb) {
  gulp.src(readPaths.MANIFEST).pipe(gulp.dest(injectPaths.MANIFEST));
  gulp.src(readPaths.ASSESTS).pipe(gulp.dest(injectPaths.ASSESTS));
  cb();
}

gulp.task(
  "default",
  gulp.series(
    clean,
    gulp.parallel(
      bundleContentScript,
      buildPopup,
      buildConfigs,
      buildServiceWorker,
    ),
  ),
);
