const KycRequest = require("../models/KycRequest");
const User = require("../models/User");

exports.getAllKycs = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      status,
      stage
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;

    // Build filter query dynamically
    const query = {};

    if (status) {
      query.status = status.toUpperCase();
    }

    if (stage) {
      query.stage = stage.toUpperCase();
    }

    // SEARCH LOGIC
    if (search.trim()) {
      query.$or = [
        { "aadhaar.extractedData.aadhaarNumber": { $regex: search, $options: "i" } },
        { "pan.extractedData.panNumber": { $regex: search, $options: "i" } },
        { "aadhaar.extractedData.name": { $regex: search, $options: "i" } },
        { "pan.extractedData.name": { $regex: search, $options: "i" } },
      ];
    }

    // Fetch all KYC records with pagination
    const kycs = await KycRequest.find(query)
      .populate("userId", "name phone email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await KycRequest.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: kycs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Admin Get All KYCs Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch KYC records",
      error: error.message
    });
  }
};


exports.getSingleKyc = async (req, res) => {
  try {
    const { kycId } = req.params;

    if (!kycId) {
      return res.status(400).json({
        success: false,
        message: "KYC ID is required"
      });
    }

    // Populate linked user details
    const kyc = await KycRequest.findById(kycId).populate(
      "userId",
      "name phone email profileStatus"
    );

    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: "KYC record not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "KYC details fetched successfully",
      data: {
        _id: kyc._id,
        user: kyc.userId,
        aadhaar: kyc.aadhaar,
        pan: kyc.pan,
        faceMatch: kyc.faceMatch,
        status: kyc.status,
        stage: kyc.stage,
        failureReason: kyc.failureReason,
        createdAt: kyc.createdAt,
        updatedAt: kyc.updatedAt
      }
    });

  } catch (error) {
    console.error("Admin Get Single KYC Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch KYC details",
      error: error.message
    });
  }
};

exports.approveKyc = async (req, res) => {
  try {
    const { kycId } = req.params;

    if (!kycId) {
      return res.status(400).json({
        success: false,
        message: "KYC ID is required"
      });
    }

    const kyc = await KycRequest.findById(kycId).populate("userId");

    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: "KYC record not found"
      });
    }

    // Update KYC status
    kyc.status = "APPROVED";
    kyc.stage = "COMPLETED";
    kyc.failureReason = null;
    kyc.updatedAt = new Date();

    await kyc.save();

    // Update user's profile
    const user = await User.findById(kyc.userId._id);
    if (user) {
      user.profileStatus = "KYC_COMPLETED";
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: "KYC approved successfully",
      kycId: kycId
    });

  } catch (error) {
    console.error("Admin Approve KYC Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to approve KYC",
      error: error.message
    });
  }
};


exports.rejectKyc = async (req, res) => {
  try {
    const { kycId } = req.params;
    const { reason } = req.body;

    if (!kycId) {
      return res.status(400).json({
        success: false,
        message: "KYC ID is required"
      });
    }

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required"
      });
    }

    const kyc = await KycRequest.findById(kycId).populate("userId");
    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: "KYC record not found"
      });
    }

    // Update KYC
    kyc.status = "REJECTED";
    kyc.stage = "COMPLETED"; // Universal final stage
    kyc.failureReason = reason;
    kyc.updatedAt = new Date();

    await kyc.save();

    // Update user status
    const user = await User.findById(kyc.userId._id);
    if (user) {
      user.profileStatus = "INCOMPLETE";  
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: "KYC rejected successfully",
      kycId,
      reason
    });

  } catch (error) {
    console.error("Admin Reject KYC Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reject KYC",
      error: error.message
    });
  }
};
