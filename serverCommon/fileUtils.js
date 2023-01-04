const fs = require("fs");
const os = require("os");

const getSystemPlateFormPath = () => {
  if (os.type() === "Windows_NT") {
    return "\\";
  } else if (os.type() === "Darwin" || os.type() === "Linux") {
    return "//";
  } else {
    // do not support
  }
};

const writeImageBlob = (tokenId, imageBlob, path) => {
  fs.writeFileSync(path + "\\" + tokenId + ".png", imageBlob, (err) => {
    if (err != null) {
      console.log(err);
      return;
    }
  });
};

//删除文件
function removeDir(dir) {
  return new Promise(async (resolve, reject) => {
    let isExist = await getStat(dir);
    if (isExist) {
      let files = fs.readdirSync(dir);
      files.forEach(function (file, index) {
        var curPath = dir + "/" + file;
        fs.unlinkSync(curPath, function (err) {
          if (err) reject(err);
        });
      });
      fs.rmdirSync(dir);
    }
  });
}

// create the filePath
function mkdir(dir) {
  return new Promise((resolve, reject) => {
    fs.mkdir(dir, (err) => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

function getStat(path) {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err) => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

async function dirExists(dir) {
  let isExists = await getStat(dir);
  if (!isExists) {
    mkdir(dir);
  }
  return dir;
}

module.exports = {
  dirExists,
  writeImageBlob,
  removeDir,
};
