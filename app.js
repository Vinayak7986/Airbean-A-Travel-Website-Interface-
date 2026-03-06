if(process.env.NODE_ENV !="production"){
  require('dotenv').config();
}
console.log(process.env.SECRET);

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
// const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const router = express.Router();
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const User = require("./models/user.js");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");
const {
  isLoggedIn,
  isOwner,
  isReviewAuthor,
  saveRedirectUrl,
} = require("./middleware");
const ListingControl = require("./control/listings.js");
const reviewControl = require("./control/reviews.js");
const usercontrol = require("./control/user.js");

const app = express();

/* ---------------- VIEW ENGINE ---------------- */
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/* ---------------- MIDDLEWARE ---------------- */
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

/* ---------------- SESSION ---------------- */

// const store = MongoStore.createKrupteinAdapter({
//   mongoUrl:dburl,
//   crypto:{
//     secret:"mysupersecretcode",
//   },
//   touchAfter:24*3600,
// });

// store.on("error",()=>{
//   console.log("ERROR in MONGO SESSION STORE",err);
// });


const sessionOptions = {
  // store,
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};


app.use(session(sessionOptions));
app.use(flash());

/* ---------------- PASSPORT ---------------- */
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/* ---------------- LOCALS (VERY IMPORTANT) ---------------- */
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

/* ---------------- DATABASE ---------------- */
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
// const dburl = process.env.ATLASDB_URL;

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("DB connected"))
  .catch(err => console.log(err));

/* ---------------- SIGNUP ROUTES ---------------- */

app.route("/signup")
.get(usercontrol.rendersignupForm )
.post(wrapAsync(usercontrol.Signup));

app.route("/login")
.get(usercontrol.renderloginForm)
.post(
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
 usercontrol.login
);
app.get("/logout",usercontrol.logout);






/* ---------------- DEMO USER ---------------- */
// app.get("/demouser", async (req, res) => {
//   let fakeUser = new User({
//     email: "student@gmail.com",
//     username: "Delta-student",
//   });

//   let registeredUser = await User.register(fakeUser, "helloworld");
//   res.send(registeredUser);
// });

/* ---------------- ROOT ---------------- */
// app.get("/", (req, res) => {
//   res.send("Root route working");
// });

/* ---------------- VALIDATION ---------------- */
const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(",");
    throw new ExpressError(400, msg);
  }
  next();
};

/* ---------------- LISTINGS ---------------- */

const multer  = require('multer');
const { storage } = require("./cloudConfig.js");
const upload = multer({ storage});

// index and crete route
app
  .route("/listings")
  .get(wrapAsync(ListingControl.index))
 .post(
  isLoggedIn,
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(ListingControl.createListing)
);



// NEW
app.get("/listings/new",isLoggedIn,ListingControl.renderNewForm);

// show and update 
app.route("/listings/:id")
.get(
  wrapAsync(ListingControl.showListings)
)
.put(
  isLoggedIn,
  isOwner,
  upload.single("image"),
  validateListing,
  wrapAsync(ListingControl.updateListing)
)
.delete(
  isLoggedIn,
  isOwner,
  wrapAsync(ListingControl.deleteListing)
);



// EDIT
app.get(
  "/listings/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(ListingControl.editListing)
);




/* ---------------- REVIEWS ---------------- */
app.post(
  "/listings/:id/reviews",
  isLoggedIn,
  wrapAsync(reviewControl.createReview)
);

app.delete(
  "/listings/:id/reviews/:reviewId",
  wrapAsync(reviewControl.deletereview)
);

/* ---------------- ERROR HANDLING ---------------- */
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

/* ---------------- SERVER ---------------- */
app.listen(8080, () => {
  console.log("Server started on port 8080");
});
