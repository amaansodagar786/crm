import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import InstSidebar from '../InstSidebar';
import './PendingRequest.scss';

const PendingRequest = () => {
  const { instituteId } = useParams();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState({}); // Track loading state for each user

  // Fetch pending users for the institute
useEffect(() => {
  const fetchPendingUsers = async () => {
    console.log(`[FETCH] Fetching pending users for institute ID: ${instituteId}`);
    try {
      const response = await fetch(`http://localhost:5000/crm/pending-users/${instituteId}`);
      const data = await response.json();

      console.log('[SUCCESS] Fetched pending users:', data);
      // Extract just the pendingUsers array from the response
      setPendingUsers(data.pendingUsers || []);
    } catch (error) {
      console.error('[ERROR] Failed to fetch pending users:', error);
      toast.error('Failed to fetch pending users. Please try again.');
    }
  };

  fetchPendingUsers();
}, [instituteId]);

  // Handle Accept button click
  const handleAccept = async (userId) => {
    console.log(`[ACTION] Approving user with ID: ${userId}`);
    setLoading((prev) => ({ ...prev, [userId]: true }));

    try {
      const response = await fetch(`http://localhost:5000/crm/pending-users/${userId}/approve`, {
        method: 'PUT',
      });

      if (response.ok) {
        console.log('[SUCCESS] User approved:', userId);
        toast.success('User Approved Successfully!');
        setPendingUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
      } else {
        const data = await response.json();
        console.error('[FAILURE] Failed to approve user:', data);
        toast.error(data.message || 'Failed to approve user.');
      }
    } catch (error) {
      console.error('[ERROR] Error approving user:', error);
      toast.error('Failed to approve user. Please try again.');
    } finally {
      setLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  // Handle Reject button click
  const handleReject = async (userId) => {
    console.log(`[ACTION] Rejecting user with ID: ${userId}`);
    setLoading((prev) => ({ ...prev, [userId]: true }));

    try {
      const response = await fetch(`http://localhost:5000/crm/pending-users/${userId}/reject`, {
        method: 'PUT',
      });

      if (response.ok) {
        console.log('[SUCCESS] User rejected:', userId);
        toast.success('User Rejected Successfully!');
        setPendingUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
      } else {
        const data = await response.json();
        console.error('[FAILURE] Failed to reject user:', data);
        toast.error(data.message || 'Failed to reject user.');
      }
    } catch (error) {
      console.error('[ERROR] Error rejecting user:', error);
      toast.error('Failed to reject user. Please try again.');
    } finally {
      setLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  return (
    <>
      <InstSidebar instituteId={instituteId} />
      <div className="pending-request">
        <h1>Pending Requests</h1>
        <div className="pending-users-container">
          {pendingUsers.length > 0 ? (
            pendingUsers.map((user) => (
              <div key={user._id} className="pending-user-card">
                <h2>{user.name}</h2>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Phone:</strong> {user.phoneNo}</p>
                <p><strong>Role:</strong> {user.role}</p>
                <div className="action-buttons">
                  <button
                    className="accept-button"
                    onClick={() => handleAccept(user._id)}
                    disabled={loading[user._id]}
                  >
                    {loading[user._id] ? (
                      <span className="loading-spinner"></span>
                    ) : (
                      'Accept'
                    )}
                  </button>
                  <button
                    className="reject-button"
                    onClick={() => handleReject(user._id)}
                    disabled={loading[user._id]}
                  >
                    {loading[user._id] ? (
                      <span className="loading-spinner"></span>
                    ) : (
                      'Reject'
                    )}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="no-pending-users">No pending requests found.</p>
          )}
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};

export default PendingRequest;
