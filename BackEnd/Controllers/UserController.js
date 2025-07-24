
// backend/Controllers/UserController.js
import User from "../Model/UserModel.js"; // Ensure the path is correct
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// For User Registration
export const RegisterUser = async (req, res) => {
  try {
    const { Name, Password } = req.body;

    if (!Name || !Password) {
      // Send JSON error response
      return res.status(400).json({ message: 'Name and Password are required' });
    }

    const existingUser = await User.findOne({ Name });
    if (existingUser) {
      // Send JSON error response
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(Password, 10);
    const user = new User({ Name, Password: hashedPassword });

    await user.save();
    // Send JSON success response
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error (server-side):", error); // Log for debugging
    // Send JSON error response, defaulting to a generic message if error.message isn't suitable
    res.status(500).json({ message: error.message || 'Internal server error during registration' });
  }
};

// For User Login
export const LoginUser = async (req, res) => {
  try {
    const { name, password } = req.body

    if (!name || !password) {
      // Send JSON error response
      return res.status(400).json({ message: 'Name and Password are required' });
    }

    const user = await User.findOne({ Name: name });
    if (!user) {
      // Send JSON error response
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.Password);
    if (!isMatch) {
      // Send JSON error response
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if JWT_SECRET is defined
    if (!process.env.JWT_SECRET) {
       console.error("ERROR: JWT_SECRET is not defined in environment variables!");
       return res.status(500).json({ message: 'Server configuration error (missing JWT secret)' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    // Send JSON success response with token
    res.json({ // 200 OK status by default, which is fine
      message: "Login successful",
      theme: user.theme, // Make sure 'theme' field exists in your User model, or handle if undefined
      token,
      userId: user._id
    });
  } catch (error) {
    console.error("Login error (server-side):", error); // Log for debugging
    // Send JSON error response
    res.status(500).json({ message: error.message || 'Internal server error during login' });
  }
};

export const GetAllUsers = async (req, res) => {
  try {
    // Fetch all users from the database
    // .select('-Password') excludes the Password field from the results for security
    const users = await User.find(); 

    // Send the list of users in the response
    res.status(200).json({ users });
  } catch (error) {
    // Handle potential errors during database query
    console.error("Error fetching users (server-side):", error);
    res.status(500).json({ message: error.message || 'Internal server error while fetching users' });
  }
};
