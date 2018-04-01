var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var MySQLStore = require('express-mysql-session')(session);  //session을 mysql에 저장할때 사용하는 모뮬
var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: '1234qwert',  // 내가 임의로 넣어줌
  resave: false,
  saveUninitialized: true,
  store: new MySQLStore({   //sessions 디렉토리 생성됨, session이 저장될곳
    host:'localhost',
    port:3306,
    user:'root',
    password:'2ehguq',
    database:'o2'
  })
}));
app.get('/auth/login', (req, res) => {
  var output = `
  <h1>Login</h1>
  <form action="/auth/login" method="post">
    <p>
      <input type="text" name="username" placeholder="username">
    </p>
    <p>
      <input type="password" name="password" placeholder="password">
    </p>
    <p>
      <input type="submit">
    </p>
  </form>
  `;
  res.send(output);
})
app.post('/auth/login', (req, res) => {
  var user = {
    username:'dohyub',
    password:'1111',
    displayName:'Dohyub'  //화면에 표시할 이름
  }
  var username = req.body.username;
  var pwd = req.body.password;
  if (username === user.username && pwd === user.password) {
    req.session.displayName = user.displayName;
    req.session.save(() => {    //저장완료후 리다이렉트 실행
      res.redirect('/welcome');
    })
  } else {
    res.send('who are you? <a href="/auth/login">login</a>');
  }
})
app.get('/welcome', (req, res) => {
  if (req.session.displayName) {   //로그인을 했다면 값이 존재
    res.send(`
      <h1>Hello, ${req.session.displayName}</h1>
      <a href="/auth/logout">logout</a>
      `)
  } else {
    res.send(`
      <h1>welcome</h1>
      <a href="/auth/login">Login</a>
      `)
  }
})
app.get('/auth/logout', (req, res) => {
  delete req.session.displayName;
  req.session.save(() => {
    res.redirect('/welcome');
  })
})

app.get('/count', (req, res) => {
  if (req.session.count) {  //서버에서 값을 읽어올수도있음
    req.session.count++;
  } else {
    req.session.count = 1;  //count라는 값을 서버에 저장
  }
  res.send('count : '+req.session.count);
})


app.listen(3003, () => {
  console.log('Connected 3003 port!!!');
});