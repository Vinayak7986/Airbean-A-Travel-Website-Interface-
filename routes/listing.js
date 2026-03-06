// const express = require("express");
// const router = express.Router();
// const wrapAsync = require("../utils/wrapAsync.js");
// const { listingSchema } = require("../schema.js");
// const ExpressError = require("../utils/ExpressError.js");
// const Listing = require("../models/listing.js");

// const validateListing = (req, res, next) => {
//   let { error } = listingSchema.validate(req.body);

//   if (error) {
//     let errMsg = error.details.map(el => el.message).join(",");
//     throw new ExpressError(400, errMsg);
//   }
//   next();
// };

// // INDEX
// router.get(
//   "/",
//   wrapAsync(async (req, res) => {
//     const allListings = await Listing.find({});
//     res.render("listings/index.ejs", { allListings });
//   })
// );

// // NEW
// router.get("/new", (req, res) => {
//   res.render("listings/new.ejs");
// });

// // SHOW
// router.get(
//   "/:id",
//   wrapAsync(async (req, res) => {
//     let { id } = req.params;
//     const listing = await Listing.findById(id).populate("reviews");
//     if (!listing) {
//       throw new ExpressError(404, "Listing not found");
//     }
//     res.render("listings/show.ejs", { listing });
//   })
// );

// // CREATE
// router.post(
//   "/",
//   validateListing,
//   wrapAsync(async (req, res) => {
//     const newListing = new Listing(req.body.listing);
//     await newListing.save();
//     res.redirect("/listings");
//   })
// );

// // EDIT FORM
// router.get(
//   "/:id/edit",
//   wrapAsync(async (req, res) => {
//     let { id } = req.params;
//     const listing = await Listing.findById(id);
//     if (!listing) {
//       throw new ExpressError(404, "Listing not found");
//     }
//     res.render("listings/edit.ejs", { listing });
//   })
// );

// // UPDATE
// router.put(
//   "/:id",
//   validateListing,
//   wrapAsync(async (req, res) => {
//     let { id } = req.params;
//     await Listing.findByIdAndUpdate(id, req.body.listing, {
//       runValidators: true,
//     });
//     res.redirect("/listings");
//   })
// );

// // DELETE
// router.delete(
//   "/:id",
//   wrapAsync(async (req, res) => {
//     let { id } = req.params;
//     await Listing.findByIdAndDelete(id);
//     res.redirect("/listings");
//   })
// );

// module.exports = router;
