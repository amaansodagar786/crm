import React from 'react';
import { useLocation } from 'react-router-dom'; // Import useLocation
import InstSidebar from '../InstSidebar';
import './InstituteDashboard.scss';

const InstituteDashboard = () => {
  const location = useLocation();
  const { institute } = location.state; // Access institute details from state

  return (
    <>
      <InstSidebar instituteId={institute.instituteId} />
      <div className="institute-dashboard">
        <h1>Institute Dashboard</h1>
        <div className="institute-details">
          <h2>{institute.instituteName}</h2>
          <p><strong>Address:</strong> {institute.address}</p>
          <p><strong>Plan:</strong> {institute.plan}</p>
          <p><strong>Status:</strong> {institute.status}</p>
          <p><strong>Plan Start Date:</strong> {new Date(institute.planStartDate).toLocaleDateString()}</p>
          <p>
            <strong>Plan Expiry Date:</strong>{' '}
            {institute.planExpiryDate
              ? new Date(institute.planExpiryDate).toLocaleDateString()
              : 'N/A'}
          </p>
        </div>
      </div>
    </>
  );
};

export default InstituteDashboard;