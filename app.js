const createError = require("http-errors");
const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const multer = require("multer");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const hbs = require("express-handlebars");
const Handlebars = require("handlebars");
dotenv.config();
const userRouter = require("./routes/user");
const adminRouter = require("./routes/admin");
const session = require("express-session");
const app = express();
const fileUpload = require("express-fileupload");
const db = require("./config/connection");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

// caching disabled for every route
app.use((req, res, next) => {
  res.set(
    "Cache-Control",
    "no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0"
  );
  next();
});

app.engine(
  "hbs",
  hbs.engine({
    extname: "hbs",
    defaultLayout: "layout",
    layoutsDir: __dirname + "/views/layout/",
    partialsDir: __dirname + "/views/partials/",
  })
);
// app.use('/uploads' , express.static(path.join(__dirname, 'uploads')))
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// index of tables
Handlebars.registerHelper("inc", function (value, options) {
  return parseInt(value) + 1;
});
// session
const oneDay = 1000 * 60 * 60 * 24;
app.use(
  session({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false,
  })
);

// database connect
db.connect((err) => {
  if (err) console.log("connection Error" + err);
  else console.log("Database connected to the port");
});
// file upload
app.use(fileUpload());

// rout setting
app.use("/", userRouter);
app.use("/admin", adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error",{err:true});
});

module.exports = app;
