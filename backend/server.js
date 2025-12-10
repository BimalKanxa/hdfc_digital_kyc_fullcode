const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();
// const ocrRoutes = require("./routes/ocrRoutes");
// const uploadRoutes = require("./routes/uploadRoutes");
const kycRoutes = require("./routes/kycRoutes");
const userRoutes = require("./routes/userRoutes");
const approveRoutes = require("./routes/approveRoutes");
// const faceRoutes = require("./routes/uploadSelfieRoutes");
const aadhaarRoutes = require("./routes/aadhaarRoutes");
// const panRoutes = require("./routes/panRoutes");
// const panOcrRoutes = require("./routes/panOcrRoutes");
const getKycRoutes = require("./routes/getKycRoutes");
const uploadAadhaarRoutes = require("./routes/uploadAadhaarRoutes");
const uploadPanRoutes = require("./routes/uploadPanRoutes");
const uploadSelfieRoutes = require("./routes/uploadSelfieRoutes");
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const adminKycRoutes = require("./routes/adminKycRoutes");
const uploadDocsRoutes = require("./routes/uploadDocsRoutes")
 


const connectDB = require("./config/db");

const app = express();

app.use(express.json()); 
app.use(cors());
app.use(helmet()); 
 
// basic rate limit
app.use(rateLimit({ windowMs: 1 * 60 * 1000, max: 50 })); 

connectDB();  

app.use("/api", userRoutes);
app.use("/api", kycRoutes);
app.use("/api", uploadAadhaarRoutes);
app.use("/api", uploadPanRoutes);
app.use("/api", uploadSelfieRoutes);
app.use("/api", approveRoutes)
app.use("/api", getKycRoutes);
app.use("/api", adminAuthRoutes);
app.use("/api", adminKycRoutes);
app.use("/api", aadhaarRoutes);
app.use("/api", uploadDocsRoutes);



app.get("/", (req, res) => {
    res.send("Digital KYC API is running...");
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
