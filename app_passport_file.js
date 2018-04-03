var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var bkfd2Password = require("pbkdf2-password");  //암호 인증 모듈
var hasher = bkfd2Password();
var FileStore = require('session-file-store')(session); //session file에 저장할때 사용하는 모듈
var passport = require('passport')   //인증관련모듈
var LocalStrategy = require('passport-local').Strategy;  //나의 id,password를 사용하는 인증하는 방법사용시 사용

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: '1234qwert',  // 내가 임의로 넣어줌
  resave: false,
  saveUninitialized: true,
  store: new FileStore(),  //sessions 디렉토리 생성됨, session이 저장될곳
}));
app.use(passport.initialize());
app.use(passport.session());  //session 미들웨어가 먼저 선행되어야함

var users = [
  {
    username:'dohyub',
    password:'s47oawjF+k4Y6zmPyg5mxSjeyFoXv03TaPvNqd2i89iHxJdSGiQ3vsqJrsdRcVIEPrN8RqU+f/b17kpy9fEauOJDkqaPGuCot99Qne47em1H+GequWL6ktxpZfYCzGpnhyth87QO4PbMXqMtBDFiLlf8/I30ioZtzfE11mUlstw=',
    salt:'QD9F3FwgBhzaaPBi+mASzP9IjOjuG1/qCz4hEd82bGJgf896ksAhNLddJCsyDhonJ7rB90jqF6Xy8WMAhmpuxg==',
    displayName:'Dohyub'  //화면에 표시할 이름
  }
]
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
// app.post('/auth/login', (req, res) => {
//   var username = req.body.username;
//   var pwd = req.body.password;
//   for(var i=0; i<users.length; i++) {
//     var user = users[i];
//     if (username === user.username) {
//       return hasher({password:pwd, salt:user.salt}, (err, pass, salt, hash) => {
//         if (hash === user.password) {
//           req.session.displayName = user.displayName;
//           req.session.save(() => {
//             res.redirect('/welcome');
//           })
//         } else {
//           res.send('who are you? <a href="/auth/login">login</a>');
//         }
//       })
//     }
//   }
// })
passport.serializeUser(function(user, done) {    //딱 한번 호출됨, 그담부터 deserializeUser 실행
  console.log('serializeUser', user);
  done(null, user.username);   //session에 저장, 식별자로 사용할값 지정해줌
});

passport.deserializeUser(function(id, done) {  //serializeUser통해 한번 session이 생성된유저는 여기로 실행됨
  console.log('deserializeUser', id);
  for(var i=0; i<users.length; i++) {
    var user = users[i];
    if (user.username === id) {
      return done(null, user);  //req.user라는 객체로 값에 접근할수있어짐
    }
  }
});
passport.use(new LocalStrategy(   //'local' 인증방식사용시 설정해야함
  function(username, password, done) {  //username, password는 form에서 전달된 정보
    var username = username;
    var pwd = password;
    for(var i=0; i<users.length; i++) {
      var user = users[i];
      if (username === user.username) {
        return hasher({password:pwd, salt:user.salt}, (err, pass, salt, hash) => {
          if (hash === user.password) {
            console.log('LocalStrategy', user);
            done(null, user); //done의 두번째 인자가 false가 아니면 passport.serializeUser()의 콜백함수가 실행됨
          } else {
            done(null, false); //false는 로그인 실패시를 의미
          }
        })
      }
    }
    done(null, false);
  }
));
app.post('/auth/login',passport.authenticate(   //passport 미들웨어
    'local',  //인증방식설정
    { 
      successRedirect: '/welcome', //로그인 성공시
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
      username:req.body.username,
      password:hash,
      salt:salt,
      displayName:req.body.displayName
    };
    users.push(user);
    req.login(user, () => {   //session 생성해줌
      req.session.save(() => {
        res.redirect('/welcome');
      })
    })
  })  
})
app.get('/auth/logout', (req, res) => {
  req.logout();  //session 지워줌
  req.session.save(() => {
    res.redirect('/welcome');
  });
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