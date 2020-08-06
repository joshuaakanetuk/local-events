// server.js
// where your node app starts

// init project
var express = require("express");
var bodyParser = require("body-parser");
var session = require("express-session");
var database = require("./db");
var pug = require("pug");
const ical = require("ical-generator");
var path = require("path");
const multer = require("multer");
var moment = require('moment');

var pattern = new RegExp(
  "^(https?:\\/\\/)?" + // protocol
  "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|" + // domain name
  "((\\d{1,3}\\.){3}\\d{1,3}))" + // ip (v4) address
  "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + //port
  "(\\?[;&amp;a-z\\d%_.~+=-]*)?" + // query string
    "(\\#[-a-z\\d_]*)?$",
  "i"
);

// //ical
// const cal = ical({
//     domain: 'local-events',
//     prodId: {company: 'TKC', product: 'local-events'},
//     name: 'Local Events',
//     timezone: 'America/New_York'
// });

// // create a new event
// const event = cal.createEvent({
//     start: Date(),
//     end: Date() + 1,
//     timestamp: Date(),
//     summary: 'My Event',
//     organizer: 'The Knowhere Club<mail@cam.com>'
// });

// cal.saveSync('public/call.ics');

// https://code.tutsplus.com/tutorials/file-upload-with-multer-in-node--cms-32088
// SET STORAGE
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "uploads");
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + ".png");
  }
});

var upload = multer({ storage: storage });

var passport = require("passport");
var Strategy = require("passport-local").Strategy;
var app = express();
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({ secret: "mySecretKey", resave: false, saveUninitialized: false })
);
app.use(passport.initialize());
app.use(passport.session());
app.locals.moment = require('moment');

// http://expressjs.com/en/starter/static-files.html

// init sqlite db
var fs = require("fs");
var dbFile = "./sqlite.db";
var exists = fs.existsSync(dbFile);
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(dbFile);
var newJSON = [];

passport.use(
  new Strategy(function(username, password, cb) {
    database.users.findByUsername(username, function(err, user) {
      if (err) {
        return cb(err);
      }
      if (!user) {
        return cb(null, false);
      }
      if (user.password != password) {
        return cb(null, false);
      }
      return cb(null, user);
    });
  })
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  database.users.findById(id, function(err, user) {
    done(err, user);
  });
});

function jsonPrep() {
  var newj = [];

  db.each("SELECT * from Events", function(err, row) {
    var tempj = {};
    if (row) {
      tempj = {
        name: row.name,
        location: row.location,
        start_time: row.start_time,
        event_url: row.event_url
      };
      newj.push(tempj);
    }
    fs.writeFileSync(__dirname + "/public/feed.json", JSON.stringify(newj));
  });
}

function epoch(time) {
  var tim = new Date(time);
  var myEpoch = tim.getTime() / 1000.0;
  console.log(myEpoch);
  return myEpoch;
}

function validate(clientData) {
  //if not a url cancel
  var urlTest = pattern.test(clientData.event_url);

  //Time init
  clientData.start_time = clientData.start_time[0] + "T" + clientData.start_time[1];
  clientData.end_time = clientData.end_time[0] + "T" + clientData.end_time[1];
  
  //If not a number cancel
  clientData.start_time = epoch(clientData.start_time);
  clientData.end_time = epoch(clientData.end_time);
  
  return clientData;
}

function isLoggedIn(req, res, next) {
  if (req.session.user !== undefined) {
    next();
  } else {
    res.redirect("/admin");
  }
}

// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(function() {
  if (!exists) {
    db.run(
      "CREATE TABLE Events (id INTEGER PRIMARY KEY, name TEXT, description TEXT, location TEXT, event_url TEXT, start_time INTEGER, end_time INTEGER, contact TEXT, cover_image TEXT, status INTEGER)"
    );
    console.log("New table: Events created!");
  } else {
    console.log('Database "Events" ready to go!');
    db.each("SELECT * from Events", function(err, row) {
      if (row) {
        console.log('Record:', row);
      }
    });
  }
});

// http://expressjs.com/en/starter/basic-routing.html

app.get("/", function(request, response) {
  
  var tim = new Date();
  tim.setDate(tim.getDate() - 1);
  var myEpoch = tim.getTime() / 1000.0;
  
  db.all("SELECT * from Events WHERE status=1 AND start_time > (?) ORDER BY start_time", myEpoch, function(err, rows) {
    //if(request.session.passport) console.log(request.session.passport);

    var compiledFunction = pug.compileFile(__dirname + "/views/index.pug");
    var output = compiledFunction({ events: rows, name: process.env.ORG_NAME });

    if (
      request.session.passport !== undefined &&
      request.session.passport.user !== undefined
    ) {
      var output = compiledFunction({
        events: rows,
        name: process.env.ORG_NAME,
        userStatus: "Edit Events"
      });
    } else {
      var output = compiledFunction({
        events: rows,
        name: process.env.ORG_NAME,
        userStatus: "Login"
      });
    }
    jsonPrep();
    response.send(output);
  });
});

app.get("/add", function(request, response) {
  var compiledFunction = pug.compileFile(__dirname + "/views/add.pug");
  if (
    request.session.passport !== undefined &&
    request.session.passport.user !== undefined
  ) {
    var output = compiledFunction({
      name: process.env.ORG_NAME,
      userStatus: "Edit Events"
    });
  } else {
    var output = compiledFunction({
      name: process.env.ORG_NAME,
      userStatus: "Login"
    });
  }

  response.send(output);
});

app.get("/login", function(request, response) {
  if (request.user) {
    response.redirect("/admin");
  } else {
    var compiledFunction = pug.compileFile(__dirname + "/views/login.pug");
    var output = compiledFunction({ name: process.env.ORG_NAME });
    response.sendFile(__dirname + "/views/login.html");
  }
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/admin",
    failureRedirect: "/login"
  })
);

app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

// app.get('/json', function(req, res) {

// });

app.get("/admin", require("connect-ensure-login").ensureLoggedIn(), function(
  request,
  response
) {
  
  
  // var compiledFunction = pug.compileFile(__dirname + "/views/admin.pug");
  // var output = compiledFunction({ events, name: process.env.ORG_NAME });
  // response.send(output);
  
  db.all("SELECT * from Events", function(err, rows) {
    //if(request.session.passport) console.log(request.session.passport);

    var compiledFunction = pug.compileFile(__dirname + "/views/admin.pug");
    var output = compiledFunction({ events: rows, name: process.env.ORG_NAME });

    // if (
    //   request.session.passport !== undefined &&
    //   request.session.passport.user !== undefined
    // ) {
    //   var output = compiledFunction({
    //     events: rows,
    //     name: process.env.ORG_NAME,
    //     userStatus: "Edit Events"
    //   });
    // } else {
    //   var output = compiledFunction({
    //     events: rows,
    //     name: process.env.ORG_NAME,
    //     userStatus: "Login"
    //   });
    // }
    jsonPrep();
    response.send(output);
  });
  
  
});

app.get("/getEvents", function(request, response) {
  db.all("SELECT * from Events", function(err, rows) {
    response.send(JSON.stringify(rows));
  });
});

app.post("/postEvents", upload.single("file"), function(request, response) {
  
  console.log(request.body);
  
  
  const file = request.file;
  if (!file) {
    const error = new Error("Please upload a file");
    //error.httpStatusCode = 400
    //return next(error)
  }

  var newEvent = validate(request.body);

  db.run(
    'INSERT INTO Events (name, description, location, event_url, start_time, end_time, contact, cover_image)  VALUES (?,?,?,?,?,?,?,?)', newEvent.name, newEvent.description, newEvent.location, newEvent.event_url, newEvent.start_time, newEvent.end_time, newEvent.contact, '');
  console.log("New event " + newEvent.name + " was added.");

  response.redirect("/");
});

app.post(
  "/deleteEvents",
  require("connect-ensure-login").ensureLoggedIn(),
  function(request, response) {
    //console.log(request.body);
    db.run("DELETE FROM Events WHERE id = " + request.body.id, function(e, r) {
      console.log(e, r);
    });
    // console.log('deleted');
    //response.redirect("/admin");
    jsonPrep();
  }
);

app.post(
  "/updateEvent",
  require("connect-ensure-login").ensureLoggedIn(),
  function(request, response) {
    console.log(request.body);
    db.run("UPDATE Events SET status=1, name = (?), description = (?) WHERE id = (?)", request.body.name, request.body.description, request.body.id, function(e, r) {
      console.log(e, r);
    });
    jsonPrep();
  }
);

app.use(function(req, res, next) {
  res.status(404).send("Sorry can't find that!");
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});

//https://www.freecodecamp.org/news/shared-element-transition-with-react-native-159f8bc37f50/
//https://gist.github.com/sauravtom/e688d059a929196f924f4ca132799739#file-ticker-L28
//https://medium.com/@prateekbh/shared-elements-transitions-for-web-6fa9d31d4d6a
//https://stackoverflow.com/questions/44313986/shared-element-transition-using-reactjs
