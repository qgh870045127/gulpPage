var express = require('express')
var app = express()

app.use('/', express.static(__dirname + '/dist/html'))
app.use('/js', express.static(__dirname + '/dist/js'))
app.use('/css', express.static(__dirname + '/dist/css'))

app.listen(8899, function () {
  console.log(`子进程运行在${process.pid}`)
})
 