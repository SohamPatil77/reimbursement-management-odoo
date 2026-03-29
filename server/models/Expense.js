import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  convertedAmount: { type: Number, required: true },
  category: { 
    type: String, 
    enum: ['Food', 'Travel', 'Accommodation', 'Medical', 'Other'], 
    required: true 
  },
  description: { type: String },
  date: { type: Date, required: true },
  receiptImage: { type: String },
  ocrData: { type: String },
  status: { 
    type: String, 
    enum: ['draft', 'pending', 'approved', 'rejected'], 
    default: 'draft' 
  },
  currentApproverIndex: { type: Number, default: 0 },
  approvers: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sequence: { type: Number },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    comment: { type: String },
    actionDate: { type: Date }
  }],
  approvalRuleId: { type: mongoose.Schema.Types.ObjectId, ref: 'ApprovalRule' }
}, { timestamps: true });

export default mongoose.model('Expense', expenseSchema);
