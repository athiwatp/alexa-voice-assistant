var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');

var app = express();

var PORT = 3000;

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Set Statuc Path
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
    res.render('index')
});

app.listen(PORT, function() {
    console.log(`Server Started on Port ${PORT}....`);
})