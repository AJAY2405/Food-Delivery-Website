// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema(
//   {
//     username: { type: String },
//     email: { type: String, required: true, unique: true },
//     phone: { type: Number, required: true, unique: true },
//     password: { type: String },
//     googleId: { type: String },
//     avatar: { type: String },
//     role: {
//       type: String,
//       enum: ["restaurant", "customer"],
//       default: "customer",
//     },
//     photoUrl: {
//       type: String,
//       default: "",
//     },
//     isVerified: { type: Boolean, default: false },
//     isLoggedIn: { type: Boolean, default: false },
//     token: { type: String, default: null },
//     otp: { type: String, default: null },
//     otpExpiry: { type: Date, default: null },
//   },
//   { timestamps: true },
// );

// export const User = mongoose.model("User", userSchema);
import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: "Home" }, // Home, Work, Other
    fullAddress: { type: String, required: true },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    phone: { type: String }, // extra phone number tied to this address
    isDefault: { type: Boolean, default: false },
  },
  { _id: true },
);

const userSchema = new mongoose.Schema(
  {
    username: { type: String },
    email: { type: String, required: true, unique: true },
    phone: { type: Number, required: true, unique: true },
    password: { type: String },
    googleId: { type: String },
    avatar: { type: String },
    role: {
      type: String,
      enum: ["restaurant", "customer"],
      default: "customer",
    },
    photoUrl: {
      type: String,
      default: "",
    },

    // ---------- Customer-specific fields ----------
    addresses: { type: [addressSchema], default: [] },
    altPhone: { type: String, default: null },

    // ---------- Restaurant-specific fields ----------
    restaurantName: { type: String },
    restaurantDescription: { type: String },
    cuisine: { type: String },
    openingTime: { type: String },
    closingTime: { type: String },
    isOpen: { type: Boolean, default: true },
    address: { type: String },
    // Real coordinates captured once, at the source (GPS), instead of
    // being re-derived later by forward-geocoding the address string —
    // that round-trip was the reason distance filtering never matched.
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },

    isVerified: { type: Boolean, default: false },
    isLoggedIn: { type: Boolean, default: false },
    token: { type: String, default: null },
    otp: { type: String, default: null },
    otpExpiry: { type: Date, default: null },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);