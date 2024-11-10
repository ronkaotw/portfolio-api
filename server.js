const express = require('express');
const app = express();
// const host = '127.0.0.1'   //無法使用
const port = 3000
const morgan = require('morgan');
// api 引入
const apiResume = require('./routes/resume.js');
const apiContact = require('./routes/contact.js');
const apiPorfolio = require('./routes/portfolios.js');
const apiAbout = require('./routes/abouts.js');
const apiUser = require('./routes/users.js');
// 引入db config設定
const db = require('./config/db.js'); 

// 同步時使用，引入資料庫 Model
    // require('./models/Users.js');
    // require('./models/Abouts.js');
    // require('./models/Portfolio.js');
    // require('./models/Contacts.js')
    // require('./models/resume.js')


// 與資料庫進行連線
async function connDB() {
    try {
        await db.client.connect();
        console.log( "伺服器連接成功！");
    }catch (error) {
        console.error(error,"伺服器連接失敗！")
    }finally{
        // await db.client.end();
        // console.log("連線關閉，您不能重複連線。")
    }
  } 
  connDB();

// 中介軟體使用
 //morgan  
 morgan.format('Aaron','[Aaron] :method :url :status'),
 morgan.token('from', function(req, res){
     return req.query.from || '-';   
 })
 
// 中介軟體執行 
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(morgan('Aaron'));
 // API 執行
 app.use('/users', apiUser);
 app.use('/about', apiAbout);
 app.use('/portfolio', apiPorfolio);
 app.use('/contact', apiContact);
 app.use('/resume', apiResume);

 app.use('/', (req,res) => {
    res.status(200).json({
        "name": "portfolio-api",
        "version": "1.0.0",
    })
})
// 啟動伺服器
app.listen(port, () => {
    console.log(`伺服器啟動在 http://localhost :${port}`);
});

// ${host}

module.exports = app