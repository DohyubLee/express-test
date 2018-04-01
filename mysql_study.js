var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '2ehguq',
  database : 'o2'
});
 
connection.connect();  //DB 연결

// var sql = 'SELECT * FROM topic';
// connection.query(sql, function (err, rows, fields) {
//   if (err) {
//     console.log(err);
//   } else {
//     for(var i=0; i<rows.length; i++) {
//       console.log(rows[i].title);
//     }
//   }
// });

// var sql = 'INSERT INTO topic (title, description, author) VALUES(?, ?, ?)';  //?로 해놓고
// var params = ['Supervisor', 'Watcher', 'graphitiie']; //배열에 데이터를 담고
// connection.query(sql, params, function(err, rows, fields) { //2번쨰 인자로 전달하면 ?에 입력되어 쿼리 실행됨
//   if (err) {
//     console.log(err);
//   } else {
//     console.log(rows);
//   }
// })

// var sql = 'UPDATE topic SET title=?, author=? WHERE id=?';  //업데이트
// var params = ['npm', 'Watcher', 2];
// connection.query(sql, params, function(err, rows, fields) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log(rows);
//   }
// })

// var sql = 'DELETE FROM topic WHERE id=?';  //삭제
// var params = [1];  //1행 삭제
// connection.query(sql, params, function(err, rows, fields) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log(rows);
//   }
// })
 
connection.end();  //접속 종료