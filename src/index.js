const express = require("express");
const Collection = require("./mongo");

const app = express();
const path = require("path");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const bcryptjs = require("bcryptjs");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

const tempelatePath = path.join(__dirname, "../tempelates");
const publicPath = path.join(__dirname, "../public");

app.set("view engine", "hbs");
app.set("views", tempelatePath);
app.use(express.static(publicPath));

async function hashPass(password) {
  const res = await bcryptjs.hash(password, 10);
  return res;
}
async function compare(userPass, hashPass) {
  const res = await bcryptjs.compare(userPass, hashPass);
  return res;
}

app.get("/", (req, res) => {
  if (req.cookies.jwt) {
    const verify = jwt.verify(
      req.cookies.jwt,
      "qwertyuiopplkjhgfdsxcvbnmmjhdsertyuioiufdcvbjhfcsqazxswerfcvtyhbnkuikjmoplkiuhhgvygfcffdxawefg"
    );
    res.render("home", { name: verify.name });
  } else {
    res.render("login");
  }
});
app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/signup", async (req, res) => {
  try {
    const check = await Collection.findOne({ phone: req.body.phone });

    if (check) {
      res.send("user already exist. Please login");
    } else {
      var passwordcheck =
        /^(?=.*[0-9])(?=.*[!@#$%&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/;
      if (!passwordcheck.test(req.body.password)) {
        res
          .send(
            "Please enter a valid password. It must contain atleast a digit and special character must be 8 chracters long"
          );
         res.render("signup")
      } else {
        const token = jwt.sign(
          { name: req.body.name },
          "qwertyuiopplkjhgfdsxcvbnmmjhdsertyuioiufdcvbjhfcsqazxswerfcvtyhbnkuikjmoplkiuhhgvygfcffdxawefg"
        );

        res.cookie("jwt", token, {
          maxAge: 600000,
          httpOnly: true,
        });

        const data = {
          name: req.body.name,
          password: await hashPass(req.body.password),
          phone: req.body.phone,
          email: req.body.email,
          token: token,
        };

        await Collection.insertMany([data]);

        res.render("home", { name: req.body.name });
      }
    }
  } catch {
    res.send("wrong details");
  }
});

app.post("/login", async (req, res) => {
  try {
    const check = await Collection.findOne({ name: req.body.name });
    const passCheck = await compare(req.body.password, check.password);

    if (check && passCheck) {
      res.cookie("jwt", check.token, {
        maxAge: 600000,
        httpOnly: true,
      });

      res.render("home", { name: req.body.name });
    } else {
      res.send("wrong details");
    }
  } catch {
    res.send("wrong details");
  }
});

app.listen(3000, () => {
  console.log("port connected");
});
