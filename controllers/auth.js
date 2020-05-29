var mysql = require("mysql");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  port: process.env.DATABASE_PORT,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
});

exports.register = (req, res) => {
  console.log(req.body);

  const { name, email, password, passwordConfirm } = req.body;

  db.query(
    "select email from user where email = ?",
    [email],
    async (error, results) => {
      if (error) {
        console.log(error);
      }

      if (results.length > 0) {
        return res.render("register", {
          message: " That email is already in use",
        });
      } else if (password !== passwordConfirm) {
        return res.render("register", {
          message: "Password do not match",
        });
      }

      let hashedPasword = await bcrypt.hash(password, 8);
      console.log(hashedPasword);

      db.query(
        "INSERT INTO user set ?",
        { name: name, email: email, password: hashedPasword },
        (error, results) => {
          if (error) {
            console.log(error);
          } else {
            console.log(results);
            return res.render("register", {
              message: "User registered..!",
            });
          }
        }
      );
    }
  );
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).render("login", {
        message: "Please provide an email and password",
      });
    }

    db.query(
      "select * from user where email = ?",
      [email],
      async (error, results) => {
        if (
          !results ||
          !(await bcrypt.compare(password, results[0].password))
        ) {
          res.status(401).render("login", {
            message: "Email or password is incorrect",
          });
        } else {
          var id = results[0].id;
          var token = jwt.sign({ id }, process.env.JWT_SECRET, {
              expiresIn : process.env.JWT_EXPIRES_IN
          });

          console.log("The Token is : " + token);
          var cookieOptions = {
              expires: new Date(
                  Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
              ),
              httpOnly:true
          }

          res.cookie('jwt',token, cookieOptions);
          res.status(200).redirect('/');
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};
