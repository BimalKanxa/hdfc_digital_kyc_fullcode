// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
//   name: { type: String },
//   phone: { type: String, required: true, unique: true },
//   email: { type: String },

//   // each user may have multiple attempts across processes
//   createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model("User", userSchema);


const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
    trim: true
  },

  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/^[6-9]\d{9}$/, "Invalid phone number"]
  },

  email: {
    type: String,
    unique: true,
    sparse: true, // allows unique but optional
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Invalid email address"]
  },

  // for Digital KYC flow, store basic profile details
  profileStatus: {
    type: String,
    enum: ["INCOMPLETE", "KYC_PENDING", "KYC_COMPLETED"],
    default: "INCOMPLETE"
  }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
