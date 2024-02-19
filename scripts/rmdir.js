const exec = require("child_process").exec;

const targetPath = process.argv[2];

if (!targetPath) {
  console.error("Usage: node rmdir.js <path>");

  process.exit(1);
}

function main() {
  exec(`rm -rf ${targetPath}`, (error) => {
    if (error) {
      console.error(error);
      process.exit(1);
    }
  });

  console.log(`=== ${targetPath} Cleaned up ===`);
}

main();
