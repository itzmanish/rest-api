const express = require("express");
const BodyParser = require("body-parser");
const morgan = require("morgan");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const hbs = require("express-handlebars");
const hpp = require("hpp");
const https = require("https");
const fs = require("fs");
const path = require("path");
const config = require("./config");

require("./middlewares/database/mongoose");
const app = express();
const PORT = process.env.PORT || 3000;
// https server config
const httpsOptions = {
  cert: fs.readFileSync(path.join(__dirname, "ssl", "server.crt")),
  key: fs.readFileSync(path.join(__dirname, "ssl", "server.key"))
};

app.use(morgan("dev"));

app.use(express.static(path.join(__dirname, "public")));

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: false }));
// i should use hpp for preventing dos attack on my express app
app.use(hpp());
// security is important so helmet is
app.use(helmet());
app.use(helmet.frameguard("SAMEORIGIN"));
app.use(helmet.xssFilter({ setOnOldIE: true }));
app.use(helmet.noSniff());

// using handlebars for views
// right now no need of this
// app.engine(".handlebars", hbs({ extname: ".handlebars" }));
// app.set("view engine", ".handlebars");
// app.set("views", path.join(__dirname, "views"));

// using sessions
app.use(cookieParser());
app.use(
  session({
    secret: config.secretSession,
    key: config.sessionKey,
    resave: true,
    saveUninitialized: true,
    expires: 1800000,
    secure: true,
    cookie: { httpOnly: true }
  })
);

app.use(passport.initialize());
app.use(passport.session());

// middleware for CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

// All routes is initialized here
const HomeRoutes = require("./routes/home");
const AuthRoutes = require("./routes/auth");
app.use("/", HomeRoutes);
app.use("/auth", AuthRoutes);

https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log(`server is running on https://localhost:${PORT}`);
});

// app.listen(PORT, () => {
//   console.log("server running");
// });
