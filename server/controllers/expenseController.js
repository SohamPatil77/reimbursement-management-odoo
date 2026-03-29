import Tesseract from 'tesseract.js';
import Expense from '../models/Expense.js';
import User from '../models/User.js';
import Company from '../models/Company.js';
import ApprovalRule from '../models/ApprovalRule.js';

// Setup file structure needed for uploads folder
import fs from 'fs';
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

export const submitExpense = async (req, res) => {
  try {
    const { amount, currency, category, description, date, ruleId } = req.body;
    const employee = req.user;
    const companyId = employee.companyId;

    const company = await Company.findById(companyId);

    // Convert Currency via ExchangeRate API
    let convertedAmount = parseFloat(amount);
    if (currency.toUpperCase() !== company.currency.toUpperCase()) {
      try {
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${currency.toUpperCase()}`);
        const data = await response.json();
        const rate = data.rates[company.currency.toUpperCase()];
        if (rate) {
          convertedAmount = parseFloat(amount) * rate;
        } else {
           throw new Error('Rate not found');
        }
      } catch (err) {
        console.error('ExchangeRate API Error:', err);
        return res.status(400).json({ error: 'Failed to convert currency. Check provided currency string.' });
      }
    }

    // Determine Approval Queue
    let approversQueue = [];
    let currentSeq = 1;

    // 1. Manager First Rule
    if (employee.managerId) {
      const manager = await User.findById(employee.managerId);
      if (manager && manager.isManagerApprover) {
        approversQueue.push({ userId: manager._id, sequence: currentSeq, status: 'pending' });
        currentSeq++;
      }
    }

    // 2. Add rule approvers
    let appliedRuleId = null;
    if (ruleId) {
      const rule = await ApprovalRule.findById(ruleId);
      if (rule) {
        appliedRuleId = rule._id;
        if (rule.approvers && rule.approvers.length > 0) {
          // Sort by their defined sequence
          const sortedRuleApprovers = rule.approvers.sort((a,b) => a.sequence - b.sequence);
          for (let ruleApp of sortedRuleApprovers) {
            // Only add if not already in queue (e.g. manager was already added but is also in rule)
            const exists = approversQueue.find(a => a.userId.toString() === ruleApp.userId.toString());
            if (!exists) {
              approversQueue.push({ userId: ruleApp.userId, sequence: currentSeq, status: 'pending' });
              currentSeq++;
            }
          }
        }
      }
    }

    const expense = new Expense({
      employeeId: employee._id,
      companyId: companyId,
      amount,
      currency,
      convertedAmount,
      category,
      description,
      date,
      receiptImage: req.file ? req.file.path : null, // The disk path
      status: approversQueue.length > 0 ? 'pending' : 'approved', // auto-approve if no queue
      approvers: approversQueue,
      approvalRuleId: appliedRuleId
    });

    await expense.save();
    return res.status(201).json(expense);

  } catch (error) {
    console.error('Submit Expense Error:', error);
    res.status(500).json({ error: 'Server error during submission' });
  }
};

export const getMyExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ employeeId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ companyId: req.user.companyId })
      .populate('employeeId', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    console.error('Error fetching all expenses:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const ocrScan = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No receipt image uploaded' });
    }

    // req.file.buffer exists because memoryStorage was used
    const worker = await Tesseract.createWorker('eng');
    const result = await worker.recognize(req.file.buffer);
    const text = result.data.text;
    await worker.terminate();

    // Basic heuristic to find amount & date
    const amountRegex = /[\$£€₹]?\s*(\d+[.,]\d{2})/g;
    const amountsFound = text.match(amountRegex);
    let amount = 0;
    if (amountsFound) {
      const numbers = amountsFound.map(m => parseFloat(m.replace(/[^0-9.]/g, '')));
      amount = Math.max(...numbers);
    } // Returns largest amount found (Total)

    const dateRegex = /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})\b/;
    const dateFound = text.match(dateRegex);
    let date = dateFound ? dateFound[0] : null;

    res.status(200).json({
      success: true,
      data: {
        rawText: text,
        suggestedAmount: amount,
        suggestedDate: date
      }
    });

  } catch (error) {
    console.error('OCR Error:', error);
    res.status(500).json({ error: 'Server error during OCR processing' });
  }
};
