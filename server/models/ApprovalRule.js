import mongoose from 'mongoose';

const approvalRuleSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['sequential', 'conditional', 'hybrid'], 
    required: true 
  },
  approvers: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sequence: { type: Number } // Important for sequential logic
  }],
  conditionType: { 
    type: String, 
    enum: ['percentage', 'specific', 'hybrid'] 
  },
  percentageThreshold: { type: Number },
  specificApproverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isManagerApproverFirst: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('ApprovalRule', approvalRuleSchema);
