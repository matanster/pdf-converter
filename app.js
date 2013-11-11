// Generated by CoffeeScript 1.4.0
var GoogleStrategy, app, express, fs, host, http, nconf, passport, path, routes, user;

fs = require("fs");

nconf = require("nconf");

nconf.argv().env();

nconf.defaults({
  host: "localhost"
});

host = nconf.get("host");

console.log("Host is " + nconf.get("host"));

express = require("express");

routes = require("./routes");

user = require("./routes/user");

http = require("http");

path = require("path");

app = express();

app.set("port", process.env.PORT || 3000);

app.set("views", __dirname + "/views");

app.set("view engine", "ejs");

app.use(express.favicon());

app.use(express.logger("dev"));

app.use(express.bodyParser());

app.use(express.methodOverride());

app.use(express.cookieParser("your secret here"));

app.use(express.session());

app.use(app.router);

app.use(require("stylus").middleware(__dirname + "/public"));

app.use(express["static"](path.join(__dirname, "public")));

if ("development" === app.get("env")) {
  app.use(express.errorHandler());
}

app.get("/", routes.index);

app.get("/users", user.list);

http.createServer(app).listen(app.get("port"), function() {
  return console.log("Express server listening on port " + app.get("port"));
});

passport = require("passport");

GoogleStrategy = require("passport-google").Strategy;

passport.use(new GoogleStrategy({
  returnURL: "http://" + host + "/auth/google/return",
  realm: "http://" + host + "/auth/google"
}, function(identifier, profile, done) {
  return console.log("authorized user " + identifier + "\n" + json.stringify(profile), function(err, user) {}, done(err, user));
}));

app.get("/auth/google", passport.authenticate("google"));

app.get("/auth/google/return", passport.authenticate("google", {
  successRedirect: "/landing.html",
  failureRedirect: "/login"
}));
