const express = require("express");
const app = express();
const formidable = require("formidable");
const {
  dirExists,
  writeImageBlob,
  removeDir,
} = require("./serverCommon/fileUtils");
const fs = require("fs");
const nodemailer = require("nodemailer");
const {log4js} = require('./serverCommon/log4jConfig');
// 当不传参或找不到对应 category时，默认使用default的配置
const logger = log4js.getLogger();
const errLogger = log4js.getLogger('err');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// app.use(express.json());
app.all("*", function (req, res, next) {
  //设置允许跨域的域名，*代表允许任意域名跨域
  res.header("Access-Control-Allow-Origin", "*");
  //允许的header类型
  res.header("Access-Control-Allow-Headers", "content-type");
  //跨域允许的请求方式
  res.header("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS");
  if (req.method.toLowerCase() == "options") {
    /*让options请求快速返回*/
    res.sendStatus(200);
  } else {
    next();
  }
});

//mysql连接
var mysql = require("mysql");
// const connection = mysql.createConnection({
//   host: "localhost",
//   port: 3306,
//   user: "mythArt",
//   password: "MythArt8869?!",
//   database: "leno",
// });

//local连接
const connection = mysql.createConnection({
  host: "localhost",
  port:3306,
  user: "root",
  password: "1026929",
  database: "news",
});

connection.connect();

const addApiPrefix = (endpoint) => {
  return `/leno/${endpoint}`;
};

//保存数据到数据库
app.post(addApiPrefix("newData"), async (req, res) => {
  const form = formidable({ multiples: true });
  //时间
  var date = new Date();
  let time =
    date.getFullYear() + "." + (date.getMonth() + 1) + "." + date.getDate();
  form.parse(req, (err, fields, files) => {
    //数据插入mysql
    const insert =
      "insert into braftcontent(date,img,title,content,file) values(?,?,?,?,?)";
    connection.query(
      insert,
      [time, fields.newImg, fields.title, fields.content, fields.imgsFile],
      (err, result) => {
        if (err) {
          logger.error(err.message);
        } else {
          logger.info("数据插入成功");
        }
      }
    );
    res.send("Succeed");
  });
});

//保存图片到本地并返回地址
app.post(addApiPrefix("saveImg"), async (req, res) => {
  const form = formidable({ multiples: true });
  var date = new Date();
  let time =
    date.getFullYear().toString() +
    (date.getMonth() + 1).toString() +
    date.getDate().toString() +
    date.getHours().toString() +
    date.getMinutes().toString() +
    date.getSeconds().toString() +
    date.getMilliseconds().toString();

  let imgFile = await dirExists("D:\\work\\leno\\newsImg\\" + time);
  form.parse(req, async (err, fields, files) => {
    let imgs = [];
    let imgsPath = [];
    imgs.push(files.newImg.filepath);
    if (files.compressImgs) {
      for (let i = 0; i < files.compressImgs.length; i++) {
        imgs.push(files.compressImgs[i].filepath);
      }
    }
    for (let i = 0; i < imgs.length; i++) {
      writeImageBlob(i, fs.readFileSync(imgs[i]), imgFile);
      imgsPath.push(imgFile + "\\" + i + ".png");
    }
    res.send([imgsPath, imgFile]);
  });
});

//从数据库获取数据(时间，标题，封面图，id)
app.get(addApiPrefix("newsBoxData"), async (req, res) => {
  connection.query(
    `SELECT braftcontent.date ,braftcontent.title ,braftcontent.Img,braftcontent.id FROM braftcontent`,
    function (error, results, fields) {
      res.send(JSON.stringify(results));
    }
  );
});

//从数据库获取数据(标题，id)
app.get(addApiPrefix("newsTitle"), async (req, res) => {
  connection.query(
    `SELECT braftcontent.title,braftcontent.id FROM braftcontent`,
    function (error, results, fields) {
      res.send(JSON.stringify(results));
    }
  );
});

//从数据库获取数据(id)
app.get(addApiPrefix("newsId"), async (req, res) => {
  connection.query(
    `SELECT braftcontent.id FROM braftcontent`,
    function (error, results, fields) {
      res.send(JSON.stringify(results));
    }
  );
});

//从数据库获取数据(标题，内容)
app.get(addApiPrefix("newsContent"), async (req, res) => {
  connection.query(
    `SELECT braftcontent.content,braftcontent.title FROM braftcontent WHERE braftcontent.id =${req.query.id}`,
    function (error, results, fields) {
      res.send(JSON.stringify(results));
    }
  );
});

//删除新闻
app.post(addApiPrefix("deleteNew"), async (req, res) => {
  connection.query(
    `DELETE FROM braftcontent WHERE braftcontent.id=${req.query.id};`,
    function (error, results, fields) {
      if (results) {
        res.send("删除成功");
      }
      return;
    }
  );
});

//删除临时图片
app.get(addApiPrefix("deleteImgsFile"), async (req, res) => {
  connection.query(
    `SELECT braftcontent.file FROM braftcontent WHERE braftcontent.id = ${req.query.id};`,
    function (error, results, fields) {
      const imgFile = JSON.stringify(results);
      if (JSON.parse(imgFile)[0].file) {
        removeDir(JSON.parse(imgFile)[0].file);
      }
      res.send("succeed");
    }
  );
});

//发送邮箱
app.post(addApiPrefix("sendEmail"), async (req, res) => {
  var transporter = nodemailer.createTransport({
    service: "qq",
    port: 465, // SMTP 端口
    secureConnection: true, // 使用 SSL
    auth: {
      user: "2936875129@qq.com",
      //这里密码不是qq密码，是你设置的smtp密码
      pass: "oxdkisyomyjrdgei",
    },
  });
  var mailOptions = {
    from: "客户<2936875129@qq.com>", // 发件地址
    to: "2936875129@qq.com", // 收件列表
    subject: req.body.userName, // 标题
    html:
      "<b>邮箱:" +
      req.body.Email +
      "</b><br /><b>电话:" +
      req.body.Phone +
      "</b><br /><b>正文:" +
      req.body.Message +
      "</b>", // html 内容
  };
  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      res.send(error);
    } else {
      res.send("succeed");
    }
  });
});

app.listen(3001);
errLogger.error("Server launch Succeed");
