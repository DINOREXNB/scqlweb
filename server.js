const express=require("express");
var querystring=require("querystring");
var bodyParser=require('body-parser');
var session=require('express-session');
var http=require("http");
var mysql=require('mysql2');
const fs=require("fs");
const yaml = require('js-yaml');
const axios=require('axios');
/********************读取Settings.yaml********************/
var settings;
try {
  const yamlContent = fs.readFileSync('Settings.yaml', 'utf8');
  settings = yaml.load(yamlContent);
  console.log(settings);
} catch (error) {
  console.error('Error reading or parsing YAML file:', error);
}
var app=express();
const host=settings.server.host;
const port=settings.server.port;
const location=settings.server.location;
/********************创建服务器********************/
server=http.createServer((request,response)=>{
    response.writeHead(200,{'Content-Type':'text/plain'});
});
console.log(`Server is running at http://${host}:${port}`);
var server=app.listen(port,()=>{});
/*********************创建session**********************/
app.use(session({
  secret:'scqlkey',
  cookie:{maxAge:30*60*1000},
  resave: false,
  saveUninitialized: false
}));
/********************MySQL数据库********************/
//配置本机mysql连接基本信息
let connectInfo = mysql.createConnection({
	host: settings.mysql.host,
	port: settings.mysql.port,
	user: settings.mysql.user,
	password: settings.mysql.password,
	database: settings.mysql.database,
})
//数据库建立连接
connectInfo.connect((err)=>{
  if(err){
    console.log('[query] - :'+err);
  }
  console.log("MySQL connection succeed!");
});
//加载静态资源
app.use('/scqlweb',express.static('scqlweb'));
app.get('/', (req,res)=>{
  if (req.session.sign) {//检查用户是否已经登录
    console.log(req.session);//打印session的值
    res.redirect(`${location}/hall.html`);
  }else{
    res.sendFile(__dirname+"/"+"html/index.html");
  }
  console.log("Current Page:index.html");
});
app.get('/hall.html', (req,res)=>{
  res.sendFile(__dirname+"/html/hall.html");
  console.log("Current Page:hall.html")
});
app.get('/loginerror.html', (req,res)=>{
  res.sendFile(__dirname+"/html/loginerror.html");
  console.log("Current Page:loginerror.html")
});
app.get('/css/:cssName', (req, res) => {
  const cssName = req.params.cssName;
  fs.readFile(`./css/${cssName}`,(err,data)=>{
    if(err){
      console.log(`加载${cssName}失败！`);
    }
    res.writeHead(200,{
      "Content-type":"text/css"
    });
    res.end(data)
  });
});
app.get('/js/:jsName',(req,res)=>{
  const jsName=req.params.jsName;
  fs.readFile(`./js/${jsName}`,(err,data)=>{
    if(err){
      console.log(`加载${jsName}失败！`);
      throw err;
    }
    res.writeHead(200,{
      "Content-type":"text/javascript"
    });
    res.end(data)
  });
});
app.get('/images/:imageName',(req,res)=>{
  const imageName=req.params.imageName;
  fs.readFile(`./images/${imageName}`,(err,data)=>{
    if(err){
      console.log(`加载${imageName}失败！`);
      throw err;
    }
    res.writeHead(200,{
      "Content-type":"x-icon"
    });
    res.end(data)
  });
});
/********************处理请求********************/
var account="";
app.post('/login',(req,res)=>{
  var body=[];
  req.on("data", (chunk) => {
    body.push(chunk);
  });
  req.on("end",()=>{
    req.session.name = 'user';
    body = Buffer.concat(body).toString();
    body = querystring.parse(body);
    console.log(body);
    req.session.account=body.account;
    account=body.account;

    //检测是否注册
    if (body.isRegister == 'register') {
      const sql_check_isregistered =
        "SELECT * FROM `userinfo` WHERE " +
        `account=${JSON.stringify(body.account)}`;
      connectInfo.query(sql_check_isregistered, (err, result, field) => {
        if (err) {
          console.log('[SELECT ERROR] - ', err.message);
          return;
        }
        if (result.length != 0) {
          res.redirect(`${location}/loginerror.html`);
        }
      });

      const sql_register =
        'INSERT INTO `userinfo` VALUES ' +
        `(${JSON.stringify(body.account)},${JSON.stringify(body.password)})`;
      connectInfo.query(sql_register, (err, result, field) => {
        if (err) {
          console.log('[INSERT ERROR] - ', err.message);
          return;
        }
        req.session.sign = true;
        res.redirect(`${location}/hall.html`);
      });

      // 将新用户信息添加到uses.json文件中
      const filePath = 'C:\\Users\\86135\\Desktop\\scql\\examples\\docker-compose\\client\\users.json';
      let jsonData = fs.readFileSync(filePath);
      let usersData = JSON.parse(jsonData);
      
      usersData[body.account] = { UserName: body.account, Password: body.password };

      jsonData = JSON.stringify(usersData, null, 2);
      fs.writeFileSync(filePath, jsonData);

    }else{
      sql_login="SELECT * FROM `userinfo` WHERE "+`account=${JSON.stringify(body.account)} AND password=${JSON.stringify(body.password)}`;
      connectInfo.query(sql_login,(err,result,filed)=>{
        if(err){
          console.log("[SELECT ERROR] - ",err.message);
          return;
        }
        if(result.length==0){
          res.redirect(`${location}/loginerror.html`);
        }else{
          req.session.sign = true;
          res.redirect(`${location}/hall.html`);
        }
      });
    }
    body=[];
  })
});
app.post('/getAccount',(req,res)=>{
  if(req.session.sign==true){
    res.json({
      "account":req.session.account
    });
  }else{
    res.json({
      "account":"forbidden"
    });
  }
});
app.get('/logout',(req,res)=>{
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.json({
      status:'success'
    });
  });
});
app.post('/submit_get',(req,res)=>{
  let body="";
  let password="";
  req.on('data',(chunk)=>{
    body+=chunk.toString();
  });
  req.on('end',()=>{
    body=JSON.parse(body);
    sql_getpassword=`SELECT * FROM`+" `userinfo` WHERE account="+`"${body.account}"`;
    connectInfo.query(sql_getpassword,(err,result,field)=>{
      if(err){
        console.log(`[SELECT ERROR] - ${err.message}`);
        return;
      }
      if(result.length!=0){
        password=result[0].password;
        let data={
          "user": {
              "user": {
                  "account_system_type": "NATIVE_USER",
                  "native_user": { 
                    "name": body.account, 
                    "password": password 
                  }
              }
          },
          "query": body.query,
          "biz_request_id": "",
          "db_name": body.dbname
        }
        console.log("-------------------------------");
        console.log("查询请求:")
        console.dir(data,{depth:null});
        //SCDB HOST待部署
        axios.post('http://localhost:8080/public/submit_and_get',data)
        .then(response => {
          console.log("-------------------------------");
          console.log("回复生成:")
          console.dir(response.data,{depth:null});
          const data=response.data;
          res.json(data);
        })
        .catch(error => {
          console.error(error);
        });
      }
    });
  });
});

