import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './LeaveAccept.scss';

const LeaveAccept = () => {
  const { instituteId } = useParams();
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedLeave, setSelectedLeave] = useState(null);

  useEffect(() => {
    const fetchPendingLeaves = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/leave/pending/${instituteId}`);
        setPendingLeaves(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch leave requests');
        setLoading(false);
        toast.error('Failed to load leave requests');
      }
    };

    fetchPendingLeaves();
  }, [instituteId]);

  const handleProcessLeave = async (leaveId, action) => {
    try {
      if (action === 'reject' && !rejectionReason) {
        toast.warning('Please provide a reason for rejection');
        return;
      }

      await axios.put(`http://localhost:5000/leave/process/${leaveId}`, {
        action,
        reason: rejectionReason
      });

      // Update the local state
      setPendingLeaves(pendingLeaves.filter(leave => leave._id !== leaveId));
      setRejectionReason('');
      setSelectedLeave(null);
      
      toast.success(`Leave ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to process leave request';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="leave-accept-container">
      <ToastContainer 
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      <h1>Pending Leave Requests</h1>
      
      {pendingLeaves.length === 0 ? (
        <div className="no-leaves">No pending leave requests</div>
      ) : (
        <div className="leave-cards">
          {pendingLeaves.map((leave) => (
            <div key={leave._id} className="leave-card">
              <div className="leave-header">
                <h3>{leave.userInfo.name}</h3>
                <div className="user-meta">
                  <span className="user-role">{leave.userInfo.role}</span>
                  <span className={`leave-type ${leave.leaveType.toLowerCase()}`}>
                    {leave.leaveType}
                  </span>
                </div>
              </div>
              
              <div className="leave-details">
                <p><strong>Email:</strong> {leave.userInfo.email}</p>
                <p><strong>Dates:</strong> {leave.dates.map(date => formatDate(date)).join(', ')}</p>
                <p><strong>Duration:</strong> {leave.dates.length} day(s)</p>
                <p><strong>Reason:</strong> {leave.reason}</p>
                <p><strong>Salary:</strong> ₹{leave.salary.toLocaleString()}/month</p>
                <p><strong>Applied On:</strong> {formatDate(leave.appliedOn)}</p>
                
                <div className="leave-balances">
                  <strong>Leave Balances:</strong>
                  {leave.leaveBalances.map(balance => (
                    <span key={balance.type} className="balance-tag">
                      {balance.type}: {balance.count}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="leave-actions">
                <button 
                  className="approve-btn"
                  onClick={() => handleProcessLeave(leave._id, 'approve')}
                >
                  Approve
                </button>
                <button 
                  className="reject-btn"
                  onClick={() => setSelectedLeave(leave)}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedLeave && (
        <div className="rejection-modal">
          <div className="modal-content">
            <h3>Reject Leave Request</h3>
            <p>For: {selectedLeave.userInfo.name} ({selectedLeave.userInfo.role})</p>
            <p>Dates: {selectedLeave.dates.map(date => formatDate(date)).join(', ')}</p>
            
            <textarea
              placeholder="Enter reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              required
            />
            
            <div className="modal-actions">
              <button 
                className="confirm-reject-btn"
                onClick={() => handleProcessLeave(selectedLeave._id, 'reject')}
              >
                Confirm Rejection
              </button>
              <button 
                className="cancel-btn"
                onClick={() => {
                  setSelectedLeave(null);
                  setRejectionReason('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveAccept;