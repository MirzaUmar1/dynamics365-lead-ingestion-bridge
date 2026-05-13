require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the current directory
app.use(express.static(__dirname));

// 1. GET THE SECURITY TOKEN
async function getAccessToken() {
  const url = `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`;
  const params = new URLSearchParams({
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    scope: `${process.env.CRM_URL}/.default`,
    grant_type: "client_credentials",
  });
  const response = await axios.post(url, params);
  return response.data.access_token;
}

// 2. THE SUBMISSION ENDPOINT
app.post("/api/submit-lead", async (req, res) => {
  try {
    const token = await getAccessToken();

    // EXACT MAPPING FROM YOUR IMAGE
    const crmPayload = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      address1_line1: req.body.address1_line1,
      address1_city: req.body.address1_city,
      address1_stateorprovince: req.body.address1_stateorprovince,
      address1_postalcode: req.body.address1_postalcode,
      telephone2: req.body.telephone2,
      birthdate: req.body.birthdate, // Format: YYYY-MM-DD
      newdyn_prospectsource: 405670021, // Hardcoded from your image
      description: req.body.comments || "Lead from Web Form",
    };

    const response = await axios.post(
      `${process.env.CRM_URL}/api/data/v9.2/contacts`,
      crmPayload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
      },
    );

    res
      .status(201)
      .json({
        success: true,
        message: "Contact Created!",
        id: response.data.contactid,
      });
  } catch (error) {
    console.error("CRM Error:", error.response?.data || error.message);
    const errorDetails = error.response?.data ? JSON.stringify(error.response.data) : error.message;
    res.status(500).json({ success: false, error: "Failed to push to CRM.", details: errorDetails });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`),
);
