import { useState } from 'react';
import './AddProjectModal.css';

function AddProjectModal({ isOpen, onClose, onProjectAdded }) {
  const [formData, setFormData] = useState({
    projectTitle: '',
    category: '',
    description: '',
    studentName: '',
    registrationNo: '',
    semester: '',
    supervisorName: '',
    teamMembers: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  
  // Process team members - convert string to array
  let teamMembersArray = [];
  if (formData.teamMembers) {
    teamMembersArray = formData.teamMembers.split(',').map(m => m.trim()).filter(m => m);
  }
  
  // Prepare the data for Firebase
  const projectData = {
    projectTitle: formData.projectTitle,
    category: formData.category,
    description: formData.description,
    studentName: formData.studentName,
    registrationNo: formData.registrationNo,
    semester: formData.semester,
    supervisorName: formData.supervisorName,
    teamMembers: teamMembersArray
  };
  
  console.log("Submitting project:", projectData);
  
  try {
    await onProjectAdded(projectData);
    onClose();
    // Reset form
    setFormData({
      projectTitle: '',
      category: '',
      description: '',
      studentName: '',
      registrationNo: '',
      semester: '8',
      supervisorName: '',
      teamMembers: ''
    });
  } catch (error) {
    console.error("Error adding project:", error);
    alert("Failed to add project. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Project</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-subheader">
          <p className="academic-year">ACADEMIC YEAR 2023-24 • FALL SEMESTER</p>
          <h3>Project Registration Portal</h3>
          <p className="info-text">
            Please provide accurate information for the Final Year Project. 
            This data will be used by faculty judges and industry investors for evaluation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Project Information Section */}
          <div className="form-section">
            <h4 className="section-title">Project Information</h4>
            
            <div className="form-group">
              <label>Project Title</label>
              <input
                type="text"
                name="projectTitle"
                value={formData.projectTitle}
                onChange={handleChange}
                placeholder="Enter project title"
                required
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g. Web App, Mobile App, AI/ML"
                required
              />
            </div>

            <div className="form-group">
              <label>Project Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter detailed project description..."
                rows="4"
                required
              />
            </div>
          </div>

          {/* Student Information Section */}
          <div className="form-section">
            <h4 className="section-title">Student Information</h4>
            
            <div className="form-group">
              <label>Student Name</label>
              <input
                type="text"
                name="studentName"
                value={formData.studentName}
                onChange={handleChange}
                placeholder="Enter student name"
                required
              />
            </div>

            <div className="form-group">
              <label>Registration Number</label>
              <input
                type="text"
                name="registrationNo"
                value={formData.registrationNo}
                onChange={handleChange}
                placeholder="e.g. 14845"
                required
              />
            </div>

            <div className="form-group">
              <label>Semester</label>
              <select
                name="semester"
                value={formData.semester || '8'}
                onChange={handleChange}
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
              </select>
            </div>
          </div>

          {/* Team & Supervisor Section */}
          <div className="form-section">
            <h4 className="section-title">Team & Supervisor</h4>
            
            <div className="form-group">
              <label>Supervisor Name</label>
              <input
                type="text"
                name="supervisorName"
                value={formData.supervisorName}
                onChange={handleChange}
                placeholder="Enter supervisor name"
                required
              />
            </div>

            <div className="form-group">
              <label>Team Members</label>
              <input
                type="text"
                name="teamMembers"
                value={formData.teamMembers}
                onChange={handleChange}
                placeholder="Separate with commas e.g. Ali, Ahmed, Hassan"
              />
              <small className="helper-text">Separate multiple names with commas</small>
            </div>
          </div>

          <div className="form-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Adding Project...' : 'Add Project'}
            </button>
          </div>

          <div className="form-note">
            <p>Confirm all details before submitting. Project data cannot be changed once the evaluation phase begins.</p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProjectModal;