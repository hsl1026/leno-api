const fs = require("fs");
const os = require("os");
var log4js = require("log4js");
var logger = log4js.getLogger();

const writeImageBlob = (tokenId, imageBlob, path) => {
  fs.writeFileSync(path + "\\" + tokenId + ".png", imageBlob, (err) => {
    if (err != null) {
      logger.error(err);
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
