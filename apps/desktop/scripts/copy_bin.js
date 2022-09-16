const fs = require("fs")
const path = require("path")

function copyRecursiveSync (src, dest) {
  var exists = fs.existsSync(src);
  var stats = exists && fs.statSync(src);
  var isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    fs.mkdirSync(dest)
    fs.readdirSync(src)
      .forEach((childItemName) => copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName)))
  } else {
    fs.copyFileSync(src, dest);
  }
};

const src = path.join(__dirname, '..', 'bin')
const dest = path.join(__dirname, '..', 'deploy', 'win32', 'build', 'apm-monitor', 'dist', 'bin')

console.log('Copying bin folder to build folder')

copyRecursiveSync(src, dest)

console.log('Done!')

