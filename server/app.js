var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var expressValidator = require('express-validator');

var indexRouter = require('./src/http/routes/index');

var Responder = require('./src/core/responder');
var responder = new Responder();

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressValidator());

// Add headers
app.use(cors());

app.use('/', indexRouter);

// API routes
const apiRoutes = {
    'index': '',
    'queues': 'queues',
    'nodes': 'nodes',
    'users': 'users',
};
for (const [key, route] of Object.entries(apiRoutes)) {
    app.use(`/api/${route}`, require(`./src/http/routes/api/${key}`));
}

// catch 404 and send not found response
app.use(function (req, res, next) {
    responder.notFoundResponse(res);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    console.log(err);
    responder.ohShitResponse(res, err.message);
});

module.exports = app;
