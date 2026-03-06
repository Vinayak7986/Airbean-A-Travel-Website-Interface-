const User = require("../models/user"); // Fix: was lowercase 'user'

module.exports.rendersignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.renderloginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.Signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Create a new user
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);

    // Log the user in immediately
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Wanderlust!");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

module.exports.login = (req, res) => {
  req.flash("success", "Welcome back to Wanderlust!");
  const redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "You are logged out!");
    res.redirect("/listings");
  });
};
