// Generated by CoffeeScript 1.6.3
'use strict';
var app, authorization, convert, env, errorHandling, express, extract, fs, host, http, logging, nconf, path, primus, routes, server, user;

fs = require('fs');

nconf = require('nconf');

nconf.argv().env();

nconf.defaults({
  host: 'localhost'
});

express = require('express');

routes = require('./routes');

http = require('http');

path = require('path');

user = require('./routes/user');

convert = require('./routes/convert');

extract = require('./routes/extract');

errorHandling = require('./errorHandling');

authorization = require('./authorization');

logging = require('./logging');

app = express();

env = app.get('env');

logging.logGreen("Starting in mode " + env);

if (env !== 'production') {
  primus = require('./primus');
}

host = nconf.get('host');

logging.logGreen('Using hostname ' + nconf.get('host'));

app.set('port', process.env.PORT || 80);

logging.logGreen('Using port ' + app.get('port'));

app.set('views', __dirname + '/views');

app.set('view engine', 'ejs');

app.use(express.favicon());

if (env === 'production') {
  app.use(express.logger('default'));
} else {
  app.use(express.logger('dev'));
}

app.use(express.bodyParser());

app.use(express.methodOverride());

app.use(express.cookieParser('93AAAE3G205OI33'));

app.use(express.session());

app.use(app.router);

app.use(express["static"](path.join(__dirname, 'public')));

app.use(errorHandling.errorHandler);

app.get('/', routes.index);

app.get('/users', user.list);

app.get('/convert', convert.go);

app.get('/extract', extract.go);

authorization.googleAuthSetup(app, host, routes);

server = http.createServer(app);

server.listen(app.get('port'), function() {
  return logging.logGreen('Server listening on port ' + app.get('port') + '....');
});

/*
# In dev mode, self-test on startup
unless env is 'production' 
  testFile = 'leZrsgpZQOSCCtS98bsu'
  http.get('http://localhost/extract?name=' + testFile, (res) -> # xt7duLM0Q3Ow2gIBOvED
    logging.logBlue 'Server response to its own synthetic client is: ' + res.statusCode)
*/


if (env !== 'production') {
  primus.start(server);
}
