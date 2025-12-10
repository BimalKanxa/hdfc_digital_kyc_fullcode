const crypto = require("crypto");

exports.hashDocumentNumber = (docNumber) => {
  return crypto.createHash("sha256").update(docNumber).digest("hex");
};
