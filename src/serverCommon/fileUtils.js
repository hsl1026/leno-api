const fs = require("fs");
const os = require("os");
const { log4js } = require('./log4jConfig');
// 当不传参或找不到对应 category时，默认使用default的配置
const errLogger = log4js.getLogger('err');

const getSystemPlateFormPath = () => {
  if (os.type() === 'Windows_NT') {
    return '\\'
  } else if (os.type() === 'Darwin' || os.type() === 'Linux') {
    return '/'
  } else {
    // do not support
  }
}

const writeImageBlob = (tokenId, imageBlob, path) => {
  fs.writeFileSync(path + getSystemPlateFormPath() + tokenId + ".png", imageBlob, (err) => {
    if (err != null) {
      errLogger.error(err);
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
        const curPath = dir + getSystemPlateFormPath() + file;
        fs.unlinkSync(curPath, function (err) {
          if (err) errLogger.error(err);;
        });
      });
      fs.rmdirSync(dir, function (err) {
        if (err) errLogger.error(err);;
      });
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
  getSystemPlateFormPath
};
