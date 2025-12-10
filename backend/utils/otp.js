const crypto = require("crypto");

exports.generateOtp = (digits = 6) => {
  const min = Math.pow(10, digits - 1);
  const num = Math.floor(Math.random() * (9 * min)) + min;
  return String(num);
};

exports.hashOtp = (otp, salt = process.env.OTP_SALT || "default_salt") => {
  return crypto.createHmac("sha256", salt).update(otp).digest("hex");
};
