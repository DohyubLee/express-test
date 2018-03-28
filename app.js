const express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');

const app = express();

app.set('view engine', 'pug'); //사용할 템플릿 엔진설정
app.set('views', './views'); //템플릿파일이 있을 디렉토리 설정

//use는 미들웨어를 사용할때
app.use(express.static('public')); //정적파일(이미지 등등)을 서비스하는 디렉토리 설정
app.use(bodyParser.urlencoded({ extended: false })); //req 객체에 body라는 객체를 추가해줌, post방식을 사용할수 있게해줌

app.get('/',function(req, res) {  //get방식, 첫번째 인자는 경로를 의미
  res.send("hello home!!");  //브라우져에 출력됨
})
app.get('/route', function(req, res){
    res.send('Hello Router, <img src="/image1.jpg">')
})
app.get('/topic', (req, res) => { //쿼리 스트링 예제
  // res.send(req.query.id); //id라는 파라미터로 들어온 쿼리스트링값을 브라우져에 출력, ex) http://localhost:3000/topic?id=1
  let topics = [
    'javascript is ...',
    'nodejs is ...',
    'express is ...'
  ];
  let output = `
    <a href="/topic?id=0">javascript</a><br>
    <a href="/topic?id=1">nodejs</a><br>
    <a href="/topic?id=2">express</a><br><br>
    ${topics[req.query.id]}
  `
  res.send(output);
})
app.get('/topic/:id/:mode', (req, res) => { //시멘틱 url방식의 정보전달, ex) http://localhost:3000/topic/1/sementic
  res.send(req.params.id + ',' + req.params.mode);  //1,sementic으로 브라우저에 출력
})

app.get('/form', (req, res) => {
  let output = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body>
        <form action="/form_receiver" method="post">
          <p>
            <input type="text" name="title">
          </p>
          <p>
            <textarea name="description"></textarea>
          </p>
          <p>
            <input type="submit">
          </p>
        </form>
      </body>
    </html>
  `
  res.send(output);
})
app.get('/form_receiver', (req, res) => {  //get 방식
  var title = req.query.title;
  var description = req.query.description;
  res.send(title + ',' + description);
})
app.post('/form_receiver', (req, res) => { //post 방식
  var title = req.body.title;  //body를 사용하기위해선 body-parser라는 미들웨어를 npm에서 가져와야함, req라는 객체에 body를 사용가능하게; 
  var description = req.body.description;
  res.send(title + ',' + description);
})
//앱 만들어 보기
app.get('/topics/new', (req, res) => {
  fs.readdir('data', (err, files) => {
    if (err) {
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
    res.render('new', {topics:files}); //템플릿파일을 랜더해줌
  })
})
app.post('/topics', (req, res) => {
  var title = req.body.title;
  var description = req.body.description;
  fs.writeFile('data/'+title, description, err => {
    if (err) {
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
    res.redirect('/topics/'+title);
  })
})
app.get(['/topics', '/topics/:id'], (req, res) => {
  fs.readdir('data', (err, files) => {  //data 디렉토리에서 데이터를 가져옴
    if (err) {
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
    var id = req.params.id;
    if (id) {
      fs.readFile('data/'+id, 'utf8', (err, data) => {
        if (err) {
          console.log(err);
          res.status(500).send('Internal Server Error');
        }
        res.render('view', {topics:files, title:id, description:data});
      })
    } else {
      res.render('view', {topics:files, title:'Welcome', description: 'hello, javascript server!!'});
    }
  })
})

app.listen(3000, function() {
  console.log('Connented 3000 port!!');
})