var express = require('express');
var cookieParser = require('cookie-parser');  //쿠키 모듈
var app = express();
app.use(cookieParser('eerer54513#$%$#')); //미들웨어

var products = {
  1:{title:'The history of web 1'},
  2:{title:'The next web'}
}
app.get('/products', (req, res) => {
  var output = '';
  for(var name in products) {
    output += `<li>
    <a href="/cart/${name}">${products[name].title}</a>
    </li>`
  }
  res.send(`<h1>Products</h1>
    <ul>${output}</ul>
    <a href="/cart">Cart</a>`);
})
app.get('/cart/:id', (req, res) => {
  var id =req.params.id;
  if (req.cookies.cart) {
    var cart = req.cookies.cart;
  } else {
    var cart = {};
  }
  if (!cart[id]) {
    cart[id] = 0;
  }
  cart[id] = parseInt(cart[id])+1;
  res.cookie('cart', cart);
  res.redirect('/cart');
})
app.get('/cart', (req, res) => {
  var cart = req.cookies.cart;
  if (!cart) {
    res.send('Empty!')
  } else {
    var output = '';
    for(var id in cart) {
      output += `<li>${products[id].title} (${cart[id]})</li>`
    }
  }
  res.send(`<h1>Cart</h1>
    <ul>${output}</ul>
    <a href='/products'>Products List</a>`)
})

app.get('/count', (req, res) => {
  if (req.signedCookies.count) {  //signedCookies 암호된쿠키
    var count = parseInt(req.signedCookies.count);   //문자를 숫자로 바꾸어줌
  } else {
    var count = 0;
  }
  count = count + 1;
  res.cookie('count', count, {signed:true});   // signed:true 암호화된 쿠키사용,서버 -> 브라우저  쿠키보냄 count라는 변수명으로
  res.send('count : '+req.signedCookies.count);  
})

app.listen(3003, () => {
  console.log('Connented 3003 port!!!');
})