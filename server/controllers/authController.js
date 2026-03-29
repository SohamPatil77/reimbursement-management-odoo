import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Company from '../models/Company.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const signup = async (req, res) => {
  try {
    const { name, email, password, companyName, country } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    // Fetch currency for the country using restcountries API
    let currency = 'USD'; // Default fallback
    try {
      const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(country)}?fields=name,currencies`);
      const data = await response.json();
      if (data && data.length > 0 && data[0].currencies) {
        currency = Object.keys(data[0].currencies)[0];
      }
    } catch (apiError) {
      console.error('Error fetching country data', apiError);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create Admin User (without companyId first)
    const newAdmin = new User({
      name,
      email,
      password: hashedPassword,
      role: 'admin'
    });
    const savedAdmin = await newAdmin.save();

    // Create Company
    const newCompany = new Company({
      name: companyName,
      country,
      currency,
      createdBy: savedAdmin._id
    });
    const savedCompany = await newCompany.save();

    // Update Admin with companyId
    savedAdmin.companyId = savedCompany._id;
    await savedAdmin.save();

    res.status(201).json({
      message: 'Admin and Company created successfully',
      token: generateToken(savedAdmin._id),
      user: {
        id: savedAdmin._id,
        name: savedAdmin.name,
        email: savedAdmin.email,
        role: savedAdmin.role,
        companyId: savedCompany._id
      },
      company: savedCompany
    });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ error: 'Server error during signup' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate('companyId');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    res.status(200).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId?._id,
        company: user.companyId
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};
