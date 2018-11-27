var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressValidator = require('express-validator');

var indexRouter = require('./routes/index');

var apiRoutes = {
    'indexRouter' : require('./routes/api/index'),
    'queuesRouter' : require('./routes/api/queues'),
    'nodesRouter' : require('./routes/api/nodes'),
};

var Responder = require('./core/responder');
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

app.use('/', indexRouter);

// api routes
// TODO: fancy key value thing to clean this up
app.use('/api/', apiRoutes['indexRouter']);
app.use('/api/queues', apiRoutes['queuesRouter']);
app.use('/api/nodes', apiRoutes['nodesRouter']);

// catch 404 and send not found response
app.use(function(req, res, next) {
    responder.notFoundResponse(res);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
