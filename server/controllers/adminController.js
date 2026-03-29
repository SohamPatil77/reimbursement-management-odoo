import bcrypt from 'bcrypt';
import User from '../models/User.js';
import ApprovalRule from '../models/ApprovalRule.js';

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, managerId, isManagerApprover } = req.body;
    
    // Admins creating users MUST attach their companyId
    const companyId = req.user.companyId;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'employee',
      companyId,
      managerId: managerId || null,
      isManagerApprover: isManagerApprover || false
    });

    await newUser.save();
    
    // Return created user without password
    const userToReturn = { ...newUser._doc };
    delete userToReturn.password;

    res.status(201).json(userToReturn);
  } catch (error) {
    console.error('Create User Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateRole = async (req, res) => {
  try {
    const { userId, role, managerId, isManagerApprover } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.companyId.toString() !== req.user.companyId.toString()) {
      return res.status(403).json({ error: 'Not authorized for this user' });
    }

    if (role) user.role = role;
    if (managerId !== undefined) user.managerId = managerId;
    if (isManagerApprover !== undefined) user.isManagerApprover = isManagerApprover;

    await user.save();
    
    const userToReturn = { ...user._doc };
    delete userToReturn.password;

    res.status(200).json(userToReturn);
  } catch (error) {
    console.error('Update Role Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createApprovalRule = async (req, res) => {
  try {
    const { name, type, approvers, conditionType, percentageThreshold, specificApproverId, isManagerApproverFirst } = req.body;

    const companyId = req.user.companyId;

    const newRule = new ApprovalRule({
      companyId,
      name,
      type,
      approvers,
      conditionType,
      percentageThreshold,
      specificApproverId,
      isManagerApproverFirst
    });

    await newRule.save();
    res.status(201).json(newRule);
  } catch (error) {
    console.error('Create Rule Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getApprovalRules = async (req, res) => {
  try {
    const rules = await ApprovalRule.find({ companyId: req.user.companyId })
      .populate('approvers.userId', 'name role')
      .populate('specificApproverId', 'name role')
      .sort({ createdAt: -1 });
    res.status(200).json(rules);
  } catch (error) {
    console.error('Get Rules Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const users = await User.find({ companyId })
      .select('-password')
      .populate('managerId', 'name email');

    res.status(200).json(users);
  } catch (error) {
    console.error('Get Users Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
