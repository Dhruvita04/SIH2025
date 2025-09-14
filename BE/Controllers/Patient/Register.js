// Ensure env is loaded regardless of where server is started
require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
const database = require("../../Database/Patient/Register");
const { passwordValidation } = require("../../Utilities");
const bcrypt = require("bcryptjs");
const saltRounds = 10;

const patientRegister = async (req, res) => {
  let message = "";
  const { fName, lName, email, password, gender, phone, birthDate } = req.body;
  console.log("[Patient/Register] Incoming payload:", {
    fName, lName, email, gender, phone, birthDate
  });
  if (
    !fName ||
    !lName ||
    !email ||
    !password ||
    !gender ||
    !phone ||
    !birthDate
  ) {
    message = "Please fill all the fields";
    console.log(message);
    return res.status(404).json({ message });
  }
  const emailFlag = await database.checkUserEmail(email);
  if (emailFlag) {
    message = "Email already exists";
    console.log(message);
    return res.status(400).json({ message });
  }
  const passwordFlag = passwordValidation(password);
  if (!passwordFlag) {
    message =
      "Password must contain at least 8 characters, one number, one alphabet, and one special character";
    console.log(message);
    return res.status(400).json({ message });
  }
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  req.body.fName =
    req.body.fName[0].toUpperCase() + req.body.fName.slice(1).toLowerCase();
  req.body.lName =
    req.body.lName[0].toUpperCase() + req.body.lName.slice(1).toLowerCase();
  // Normalize gender to match schema enum
  const normalizedGender = typeof req.body.gender === "string" ? (req.body.gender[0].toUpperCase() + req.body.gender.slice(1).toLowerCase()) : req.body.gender;
  const user = {
    fName: req.body.fName,
    lName: req.body.lName,
    email: req.body.email,
    phone: req.body.phone,
    gender: normalizedGender,
    role: "Patient",
    password: hashedPassword,
    birthDate: req.body.birthDate,
  };
  try {
    const patient = await database.insertPatient(user);
    if (patient) {
      message = "Patient created successfully";
      console.log(message, patient.user_email);
      return res.json({ message: message, patient: patient });
    }
    message = "Could not create patient";
    console.warn("[Patient/Register] Insert returned false for:", user.email);
    return res.status(400).json({ message });
  } catch (err) {
    console.error("[Patient/Register] Error:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { patientRegister };
