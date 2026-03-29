import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'manager', 'employee'], 
    default: 'employee' 
  },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isManagerApprover: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
