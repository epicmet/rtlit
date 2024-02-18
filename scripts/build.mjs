import esbuild from "esbuild";

esbuild
  .build({
    entryPoints: ["src/scripts/content.ts"],
    bundle: true,
    outfile: "dist/content.js",
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
