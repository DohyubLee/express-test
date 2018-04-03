var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var bkfd2Password = require("pbkdf2-password");  //암호 인증 모듈
var MySQLStore = require('express-mysql-session')(session);  //session을 mysql에 저장할때 사용하는 모뮬
var passport = require('passport')   //인증관련모듈
var LocalStrategy = require('passport-local').Strategy;  //나의 id,password를 사용하는 인증하는 방법사용시 사용
var mysql = require('mysql');

var hasher = bkfd2Password();
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '2ehguq',
  database : 'o2'
});
connection.connect();  //DB 연결
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
app.use(passport.initialize());
app.use(passport.session());  //session 미들웨어가 먼저 선행되어야함

passport.serializeUser(function(user, done) {    //딱 한번 호출됨, 그담부터 deserializeUser 실행
  console.log('serializeUser', user);
  done(null, user.authId);   //session에 저장, 식별자로 사용할값 지정해줌
});
passport.deserializeUser(function(id, done) {  //serializeUser통해 한번 session이 생성된유저는 여기로 실행됨
  console.log('deserializeUser', id);
  var sql = 'SELECT * FROM users WHERE authId=?';
  connection.query(sql, [id], (err, results) => {
    if (err) {
      console.log(err);
      return done('There is no user.');
    } else {
      done(null, results[0]);
    }
  })
});
passport.use(new LocalStrategy(   //'local' 인증방식사용시 설정해야함
  function(username, password, done) {  //username, password는 form에서 전달된 정보
    var username = username;
    var pwd = password;
    var sql = 'SELECT * FROM users WHERE authId=?';
    connection.query(sql, ['local:'+username], (err, results) => {
      if (err) {
        return done('There is no user.');
      }
      var user = results[0];
      return hasher({password:pwd, salt:user.salt}, (err, pass, salt, hash) => {
        if (hash === user.password) {
          console.log('LocalStrategy', user);
          done(null, user); //done의 두번째 인자가 false가 아니면 passport.serializeUser()의 콜백함수가 실행됨
        } else {
          done(null, false); //false는 로그인 실패시를 의미
        }
      })
    })
  }
));

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
app.post('/auth/login',passport.authenticate(   //passport 미들웨어
    'local',  //인증방식설정
    { 
      successRedirect: '/welcome', //로그인 성공시
      // successRedirect: 'http://www.naver.com/', //이렇게도 가능
      failureRedirect: '/auth/login', //로그인 실패시
      failureFlash: false
    }
  )
);
app.get('/welcome', (req, res) => {    //deserializeUser()에서 실행된 done(null, user)의 두번째 인자가 req.user의 값임
  if (req.user && req.user.displayName) {  //passport는 user라는 객체를 사용하세해줌
    res.send(`
      <h1>Hello, ${req.user.displayName}</h1>
      <a href="/auth/logout">logout</a>
      `)
  } else {
    res.send(`
      <h1>welcome</h1>
      <ul>
        <li><a href="/auth/login">Login</a></li>
        <li><a href="/auth/register">register</a></li>
      </ul>
      `)
  }
})
app.get('/auth/register', (req, res) => {
  var output = `
  <h1>Register</h1>
  <form action="/auth/register" method="post">
    <p>
      <input type="text" name="username" placeholder="username">
    </p>
    <p>
      <input type="password" name="password" placeholder="password">
    </p>
    <p>
      <input type="text" name="displayName" placeholder="displayName">
    </p>
    <p>
      <input type="submit">
    </p>
  </form>
  `
  res.send(output);
})
app.post('/auth/register', (req, res) => {
  hasher({password:req.body.password}, (err, pass, salt, hash) => {
    var user = {
      authId:'local:'+req.body.username,
      username:req.body.username,
      password:hash,
      salt:salt,
      displayName:req.body.displayName
    };
    var sql = 'INSERT INTO users SET ?';
    connection.query(sql, user, (err, results) => {
      if (err) {
        console.log(err);
        res.status(500);
      } else {
        req.login(user, () => {   //session 생성해줌
          req.session.save(() => {
            res.redirect('/welcome');
          })
        })
      }
    })
  })  
})
app.get('/auth/logout', (req, res) => {
  req.logout();  //session 지워줌
  req.session.save(() => {
    res.redirect('/welcome');
  });
})

app.listen(3003, () => {
  console.log('Connected 3003 port!!!');
});