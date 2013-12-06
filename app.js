// Generated by CoffeeScript 1.4.0
var GoogleStrategy, app, convert, express, extract, fs, host, http, nconf, passport, path, routes, user;

fs = require("fs");

nconf = require("nconf");

nconf.argv().env();

nconf.defaults({
  host: "localhost"
});

host = nconf.get("host");

console.log("Host is " + nconf.get("host"));

require("appRequires")

routes = require("./routes");
user = require("./routes/user");

http = require("http");
path = require("path");
express = require("express");
app = express();

app.set("port", process.env.PORT || 80);

console.log("Port is " + app.get("port"));

app.set("views", __dirname + "/views");

app.set("view engine", "ejs");

app.use(express.favicon());

app.use(express.logger("dev"));

app.use(express.bodyParser());

app.use(express.methodOverride());

app.use(express.cookieParser("93ADEE3820567DB"));

app.use(express.session());

app.use(app.router);

app.use(require("stylus").middleware(__dirname + "/public"));

app.use(express["static"](path.join(__dirname, "public")));

if ("development" === app.get("env")) {
  app.use(express.errorHandler());
}

app.get("/", routes.index);

app.get("/users", user.list);

app.get("/convert", convert.go);

app.get("/extract", extract.go);

http.createServer(app).listen(app.get("port"), function() {
  return console.log("Express server listening on port " + app.get("port"));
});

passport = require("passport");

GoogleStrategy = require("passport-google").Strategy;

passport.use(new GoogleStrategy({
  returnURL: "http://" + host + "/auth/google/return",
  realm: "http://" + host + "/auth/google"
}, function(identifier, profile, done) {
  return console.log("authorized user " + identifier + "\n" + JSON.stringify(profile));
}));

app.get("/auth/google", passport.authenticate("google"));

app.get("/auth/google/return", routes.index);
