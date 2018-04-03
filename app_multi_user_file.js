var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var bkfd2Password = require("pbkdf2-password");  //암호 인증 모듈
var hasher = bkfd2Password();
var FileStore = require('session-file-store')(session); //session file에 저장할때 사용하는 모듈
var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: '1234qwert',  // 내가 임의로 넣어줌
  resave: false,
  saveUninitialized: true,
  store: new FileStore(),  //sessions 디렉토리 생성됨, session이 저장될곳
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
  var username = req.body.username;
  var pwd = req.body.password;
  for(var i=0; i<users.length; i++) {
    var user = users[i];
    if (username === user.username) {
      return hasher({password:pwd, salt:user.salt}, (err, pass, salt, hash) => {
        if (hash === user.password) {
          req.session.displayName = user.displayName;
          req.session.save(() => {
            res.redirect('/welcome');
          })
        } else {
          res.send('who are you? <a href="/auth/login">login</a>');
        }
      })
    }
    // if (username === user.username && md5(pwd) === user.password) {
    //   req.session.displayName = user.displayName;
    //   return req.session.save(() => {  //return post() 종료시켜줌
    //     res.redirect('/welcome');
    //   })
    // }
  }
  // res.send('who are you? <a href="/auth/login">login</a>');
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
var users = [
  {
    username:'dohyub',
    password:'s47oawjF+k4Y6zmPyg5mxSjeyFoXv03TaPvNqd2i89iHxJdSGiQ3vsqJrsdRcVIEPrN8RqU+f/b17kpy9fEauOJDkqaPGuCot99Qne47em1H+GequWL6ktxpZfYCzGpnhyth87QO4PbMXqMtBDFiLlf8/I30ioZtzfE11mUlstw=',
    salt:'QD9F3FwgBhzaaPBi+mASzP9IjOjuG1/qCz4hEd82bGJgf896ksAhNLddJCsyDhonJ7rB90jqF6Xy8WMAhmpuxg==',
    displayName:'Dohyub'  //화면에 표시할 이름
  }
]
app.post('/auth/register', (req, res) => {
  hasher({password:req.body.password}, (err, pass, salt, hash) => {
    var user = {
      username:req.body.username,
      password:hash,
      salt:salt,
      displayName:req.body.displayName
    };
    users.push(user);
    req.session.displayName = req.body.displayName;
    req.session.save(() => {
      res.redirect('/welcome');
    })
  })  
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