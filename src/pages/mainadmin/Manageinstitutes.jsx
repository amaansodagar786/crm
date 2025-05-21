import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import Sidebar from '../../components/Sidebar';
import './Manageinstitutes.scss';

const Manageinstitutes = () => {
  const [institutes, setInstitutes] = useState([]);
  const adminId = localStorage.getItem('adminId');
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
        const response = await fetch(`http://localhost:5000/crm/institutes/${adminId}`);
        const data = await response.json();
        setInstitutes(data);
      } catch (error) {
        console.error('Error fetching institutes:', error);
      }
    };

    fetchInstitutes();
  }, [adminId]);

  // Handle click on institute card
  const handleInstituteClick = (institute) => {
    if (institute.status === 'Active' && new Date(institute.planExpiryDate) > new Date()) {
      navigate(`/mainadmin/institute/dashboard/${institute.instituteId}`, { state: { institute } });
    }
  };

  // Check if the institute is active and not expired
  const isInstituteActive = (institute) => {
    return institute.status === 'Active' && new Date(institute.planExpiryDate) > new Date();
  };

  return (
    <>
      <Sidebar />
      <div className="manage-institutes">
        <h1>Manage Institutes</h1>
        <div className="institutes-container">
          {institutes.length > 0 ? (
            institutes.map((institute) => (
              <div
                key={institute._id}
                className={`institute-card ${!isInstituteActive(institute) ? 'disabled' : ''}`}
                onClick={() => handleInstituteClick(institute)} // Redirect on click
              >
                {!isInstituteActive(institute) && (
                  <p className="purchase-plan-text">Please Purchase Plan</p>
                )}
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
            ))
          ) : (
            <p className="no-institutes">No institutes found.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default Manageinstitutes;