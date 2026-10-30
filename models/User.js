// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");

// const userSchema = new mongoose.Schema(
//   {
//     farmName: { type: String, trim: true },
//     username: { type: String, trim: true, unique: true, sparse: true },
//     email: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
//     password: { type: String, required: true, minlength: 6, select: false },
//     role: {
//       type: String,
//       enum: ["Administrator", "Manager", "Veterinary Staff", "Field Staff"],
//       default: "Administrator",
//     },
//     isActive: { type: Boolean, default: true },
//   },
//   { timestamps: true }
// );

// userSchema.pre("save", async function hashPassword(next) {
//   if (!this.isModified("password")) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// userSchema.methods.matchPassword = function matchPassword(enteredPassword) {
//   return bcrypt.compare(enteredPassword, this.password);
// };

// module.exports = mongoose.model("User", userSchema);





const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Delivery addresses saved by customers on the online store.
const addressSchema = new mongoose.Schema({
  label: { type: String, trim: true, default: "Home" },
  line1: { type: String, trim: true, required: true },
  area: { type: String, trim: true, required: true },
  city: { type: String, trim: true, required: true },
  state: { type: String, trim: true, default: "Maharashtra" },
  pincode: { type: String, trim: true, match: /^\d{6}$/, required: true },
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    farmName: { type: String, trim: true },
    username: { type: String, trim: true, lowercase: true, unique: true, sparse: true }, // always saved in small letters
    email: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ["Administrator", "Doctor", "Caretaker", "customer"],
      default: "Caretaker", // safest default: lowest access, never silently Administrator
    },
    // Customer (online store) fields
    name: { type: String, trim: true, maxlength: 80 },
    mobileNumber: { type: String, trim: true, unique: true, sparse: true, match: /^[6-9]\d{9}$/ },
    addresses: [addressSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
