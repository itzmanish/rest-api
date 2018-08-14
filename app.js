const express = require("express");
const BodyParser = require("body-parser");
const morgan = require("morgan");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const session = require("express-session");
require("./middlewares/database/mongoose");
const app = express();
const PORT = process.env.PORT || 5000;

app.use(morgan("dev"));
app.use(helmet());

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: false }));

const HomeRoutes = require("./routes/home");
app.use("/", HomeRoutes);

app.use(cookieParser);
app.use(
  session({
    secret: "mostsecretkey",
    resave: true,
    saveUninitialized: true,
    expires: 1800000,
    secure: true,
    cookie: { httpOnly: true }
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.listen(PORT, () => {
  console.log(`server started at ${PORT}`);
});