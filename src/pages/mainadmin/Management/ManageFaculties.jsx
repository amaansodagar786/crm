import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './ManageFaculties.scss';
import { ToastContainer, toast } from 'react-toastify';


const ManageFaculties = () => {
  const { instituteId } = useParams(); // Get instituteId from URL
  const [faculty, setFaculty] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [employeeMeta, setEmployeeMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('salary');
  const [formData, setFormData] = useState({
    monthlySalary: 0,
    leaves: [
      { type: 'Casual', count: 0 },
      { type: 'Sick', count: 0 },
      { type: 'Earned', count: 0 },
      { type: 'Paid', count: 0 }
    ],
    accessRights: [
      { module: 'Timetable', permission: 'none' },
      { module: 'Students', permission: 'none' },
      { module: 'Reports', permission: 'none' },
      { module: 'Attendance', permission: 'none' },
      { module: 'Exams', permission: 'none' }
    ]
  });

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const response = await fetch(`http://localhost:5000/employee/faculty/${instituteId}`);
        const data = await response.json();
        setFaculty(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching faculty:', error);
        toast.error(`Error fetching faculty: ${error.message}`);
        setLoading(false);
      }
    };

    if (instituteId) {
      fetchFaculty();
    }
  }, [instituteId]);

  const handleFacultySelect = async (facultyMember) => {
    setSelectedFaculty(facultyMember);
    try {
      const response = await fetch(
        `http://localhost:5000/employee/meta/${facultyMember.teacherId || facultyMember.adminId}?role=${facultyMember.role}&instituteId=${instituteId}`
      );
      const meta = await response.json();
      setEmployeeMeta(meta);

      setFormData({
        monthlySalary: meta.monthlySalary || 0,
        leaves: meta.leaves.length > 0 ? meta.leaves : [
          { type: 'Casual', count: 0 },
          { type: 'Sick', count: 0 },
          { type: 'Earned', count: 0 },
          { type: 'Paid', count: 0 }
        ],
        accessRights: meta.accessRights.length > 0 ? meta.accessRights : [
          { module: 'Timetable', permission: 'none' },
          { module: 'Students', permission: 'none' },
          { module: 'Reports', permission: 'none' },
          { module: 'Attendance', permission: 'none' },
          { module: 'Exams', permission: 'none' }
        ]
      });
    } catch (error) {
      console.error('Error fetching employee meta:', error);
      toast.error(`Error loading employee details: ${error.message}`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLeaveChange = (index, value) => {
    const newLeaves = [...formData.leaves];
    newLeaves[index].count = parseInt(value) || 0;
    setFormData(prev => ({ ...prev, leaves: newLeaves }));
  };

  const handlePermissionChange = (index, permission) => {
    const newAccessRights = [...formData.accessRights];
    newAccessRights[index].permission = permission;
    setFormData(prev => ({ ...prev, accessRights: newAccessRights }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employeeMeta) {
      console.error('Submit attempted but no employeeMeta available');
      toast.error('No employee selected');
      return;
    }

    console.log('Submitting form data:', formData);

    try {
      const response = await fetch(`http://localhost:5000/employee/meta/${employeeMeta.metaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server responded with error:', errorData);
        throw new Error(errorData.message || 'Failed to update employee details');
      }

      const updatedMeta = await response.json();
      console.log('Successfully updated employee meta:', updatedMeta);

      setEmployeeMeta(updatedMeta);
      toast.success('Employee details updated successfully!');
    } catch (error) {
      console.error('Error updating employee meta:', {
        error: error.message,
        stack: error.stack
      });
      toast.error(`Failed to update: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="manage-faculties">
      <h1>Manage Faculty</h1>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="faculty-container">
        <div className="faculty-list">
          <h2>Faculty Members</h2>
          <ul>
            {faculty.map(member => (
              <li
                key={member.teacherId || member.adminId}
                className={selectedFaculty?.teacherId === member.teacherId ||
                  selectedFaculty?.adminId === member.adminId ? 'active' : ''}
                onClick={() => handleFacultySelect(member)}
              >
                <div className="faculty-info">
                  <span className="name">{member.name}</span>
                  <span className="role">{member.role}</span>
                  <span className="email">{member.email}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {selectedFaculty && (
          <div className="faculty-details">
            <div className="faculty-header">
              <h2>{selectedFaculty.name}</h2>
              <p>{selectedFaculty.role.toUpperCase()} • {selectedFaculty.email}</p>
            </div>

            <div className="tabs">
              <button
                className={activeTab === 'salary' ? 'active' : ''}
                onClick={() => setActiveTab('salary')}
              >
                Salary
              </button>
              <button
                className={activeTab === 'leaves' ? 'active' : ''}
                onClick={() => setActiveTab('leaves')}
              >
                Leaves
              </button>
              <button
                className={activeTab === 'access' ? 'active' : ''}
                onClick={() => setActiveTab('access')}
              >
                Access Rights
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {activeTab === 'salary' && (
                <div className="tab-content">
                  <div className="form-group">
                    <label>Monthly Salary (₹)</label>
                    <input
                      type="number"
                      name="monthlySalary"
                      value={formData.monthlySalary}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'leaves' && (
                <div className="tab-content">
                  <h3>Leave Allocation</h3>
                  {formData.leaves.map((leave, index) => (
                    <div key={leave.type} className="form-group">
                      <label>{leave.type} Leaves</label>
                      <input
                        type="number"
                        value={leave.count}
                        onChange={(e) => handleLeaveChange(index, e.target.value)}
                        min="0"
                      />
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'access' && (
                <div className="tab-content">
                  <h3>Access Permissions</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Module</th>
                        <th>Permission</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.accessRights.map((access, index) => (
                        <tr key={access.module}>
                          <td>{access.module}</td>
                          <td>
                            <select
                              value={access.permission}
                              onChange={(e) => handlePermissionChange(index, e.target.value)}
                            >
                              <option value="none">No Access</option>
                              <option value="view">View Only</option>
                              <option value="edit">Edit</option>
                              <option value="full">Full Access</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="save-btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {!selectedFaculty && (
          <div className="no-selection">
            <p>Select a faculty member from the list to view or edit their details</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageFaculties;