import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, username, password } =
      req.body;

    if (!first_name || !email || !username || !password) {
      return res.status(400).json({
        message: "Required fields missing",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }, { phone }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const user = await User.create({
      first_name,
      last_name,
      email,
      phone,
      username,
      password,
    });

    const userData = user.toJSON();
    delete userData.password;

    res.status(201).json({
      message: "Signup successful",
      user: userData,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

 

    const token = jwt.sign({ id: user._id, email: user.email}, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,  // 24h
    });

    const userData = user.toJSON();
    delete userData.password;

    res.status(200).json({
      message: "Signin successful",
      token,
      user: userData,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
