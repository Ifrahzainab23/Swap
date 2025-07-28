import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import validator from "validator";
import jwt from "jsonwebtoken";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User doesn't exist" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = createToken(user._id);
      res.json({ success: true, token, userId: user._id }); // <-- add userId here
    } else {
      res.json({ success: false, message: "Invalid credentials" }); // changed from error.message to a proper message
    }
  } catch (error) {
    console.log(error);
    res.json({ Success: false, message: error.message });
  }
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    //checking user already exist
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }
    //validating email
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter Valid Email" });
    }
    if (password.length < 8) {
      return res.json({ success: false, message: "Enter Strong Password" });
    }
    //hashing user pass
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });
    const user = await newUser.save();
    const token = createToken(user._id);
    res.json({ success: true, token, userId: user._id }); // <-- add userId here
  } catch (error) {
    console.log(error);
    res.json({ Success: false, message: error.message });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      // YE PART MISSING THA
      res.status(401).json({ success: false, message: "Invalid admin credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ Success: false, message: error.message });
  }
};

const UserProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).select("name email credit_points credit_history");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};



export { loginUser, registerUser, adminLogin, UserProfile };
