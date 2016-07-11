var express = require('express');
var socket_io = require('socket.io');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var redis = require('redis');
var client = redis.createClient(); //creates a new client

var app = express();

var io = socket_io();
app.io = io;

client.on('connect', function() {
  console.log('connected');
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

//TODO: game logic should ge on separate file

/**
 * Game settings
 */
var GAME_RADIUS = 80;
var MINIMUM_FOUND_DISTANCE = 20;

var randomCoords = function(windowProps) {
  var randX = Math.floor(Math.random() * Math.floor(windowProps.windowWidth)) + 1;
  var randY = Math.floor(Math.random() * Math.floor(windowProps.windowHeight)) + 1;
  return {
    x: randX,
    y: randY
  }
};

io.on('connection', function (socket) {
  socket.on('join', function (data) {
    console.log("Join socket for uuid:", data.uuid);
    socket.join(data.uuid);
    var windowProps = data.windowProps;
    client.hmset(data.uuid, [
      "goalCoords", JSON.stringify(randomCoords(windowProps)),
      "windowProps", JSON.stringify(windowProps)
    ], redis.print);
  });

  socket.on('position', function (data) {
    client.hgetall(data.uuid, function(err, reply) {
      // reply is null when the key is missing
      console.log("Server respond with coordinates:", reply);
      var goalCoords = JSON.parse(reply.goalCoords);
      var distance = Math.sqrt(parseFloat(
          (data.x - goalCoords.x) * (data.x - goalCoords.x) +
          (data.y - goalCoords.y) * (data.y - goalCoords.y)));
      if (distance > MINIMUM_FOUND_DISTANCE) {
        io.sockets.in(data.uuid).emit('distance', parseInt(distance / GAME_RADIUS));
      } else {
        var rc = randomCoords(JSON.parse(reply.windowProps));
        client.hmset(data.uuid, [
          "goalCoords", JSON.stringify(rc)
        ], function() {
          io.sockets.in(data.uuid).emit('foundGoal');
        });
      }
    });
  });

});

module.exports = app;
