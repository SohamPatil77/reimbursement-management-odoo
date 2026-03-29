import Expense from '../models/Expense.js';
import ApprovalRule from '../models/ApprovalRule.js';

export const getPendingApprovals = async (req, res) => {
  try {
    const expenses = await Expense.find({ status: 'pending', companyId: req.user.companyId })
      .populate('employeeId', 'name email');

    // Filter expenses where the current approver is the logged-in user
    const pendingForMe = expenses.filter((exp) => {
      if (req.user.role === 'admin') return true;
      const current = exp.approvers[exp.currentApproverIndex];
      return current && current.userId.toString() === req.user._id.toString() && current.status === 'pending';
    });

    res.status(200).json(pendingForMe);
  } catch (error) {
    console.error('Get Pending Approvals Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const takeAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, comment } = req.body; // action = 'approved' or 'rejected'
    const userId = req.user._id;

    if (!['approved', 'rejected'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Use approved or rejected.' });
    }

    const expense = await Expense.findById(id).populate('approvalRuleId');
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    if (expense.status !== 'pending') return res.status(400).json({ error: 'Expense is no longer pending' });

    const currentIdx = expense.currentApproverIndex;
    const currentApprover = expense.approvers[currentIdx];

    // Verify it is their turn
    const isAdmin = req.user.role === 'admin';
    if (!isAdmin && (!currentApprover || currentApprover.userId.toString() !== userId.toString())) {
      return res.status(403).json({ error: 'Not your turn to approve' });
    }

    if (isAdmin) {
      expense.status = action;
      if (currentApprover) {
        currentApprover.status = action;
        currentApprover.comment = comment || 'Admin Override';
        currentApprover.actionDate = new Date();
      }
      await expense.save();
      return res.status(200).json({ message: `Expense forcibly ${action} by Admin`, expense });
    }

    // Apply action
    currentApprover.status = action;
    currentApprover.comment = comment;
    currentApprover.actionDate = new Date();

    if (action === 'rejected') {
      expense.status = 'rejected';
      await expense.save();
      return res.status(200).json({ message: 'Expense rejected successfully', expense });
    }

    // If approved, verify the rules
    const rule = expense.approvalRuleId;
    let autoApprove = false;
    
    // Default: Check if sequential is completely done
    if (currentIdx === expense.approvers.length - 1) {
      autoApprove = true;
    } else {
      // Evaluate complex rules
      if (rule) {
        let totalApprovers = expense.approvers.length;
        let approvedCount = expense.approvers.filter(a => a.status === 'approved').length;
        
        const isSpecificApproverMet = rule.specificApproverId && 
          expense.approvers.some(a => a.userId.toString() === rule.specificApproverId.toString() && a.status === 'approved');

        const percentage = (approvedCount / totalApprovers) * 100;
        const isPercentageMet = rule.percentageThreshold && percentage >= rule.percentageThreshold;

        if (rule.conditionType === 'specific' && isSpecificApproverMet) {
          autoApprove = true;
        } else if (rule.conditionType === 'percentage' && isPercentageMet) {
          autoApprove = true;
        } else if (rule.conditionType === 'hybrid' && (isSpecificApproverMet || isPercentageMet)) {
          autoApprove = true;
        }
      }
    }

    if (autoApprove) {
      expense.status = 'approved';
    } else {
      // Move to next approver
      expense.currentApproverIndex++;
    }

    await expense.save();
    return res.status(200).json({ message: `Expense ${autoApprove ? 'approved fully' : 'moved to next step'}`, expense });

  } catch (error) {
    console.error('Take Action Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
