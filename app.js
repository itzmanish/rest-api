const express = require("express");
const BodyParser = require("body-parser");
const morgan = require("morgan");
const helmet = require("helmet");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");

require("./middlewares/database/mongoose");
const app = express();
const PORT = process.env.PORT || 5000;

app.use(morgan("dev"));

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: false }));
// i should use hpp for preventing dos attack on my express app
app.use(hpp());
// security is important so helmet is
app.use(helmet());
app.use(helmet.frameguard("SAMEORIGIN"));
app.use(helmet.xssFilter({ setOnOldIE: true }));
app.use(helmet.noSniff());

app.use(cookieParser());
app.use(
  session({
    secret: "mostsecretkey",
    key: "secretSession",
    resave: true,
    saveUninitialized: true,
    expires: 1800000,
    secure: true,
    cookie: { httpOnly: true, secure: true }
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
app.use("/", HomeRoutes);

app.listen(PORT, () => {
  console.log(`server started at ${PORT}`);
});
