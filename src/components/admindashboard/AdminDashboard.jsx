import { useState } from 'react';
import { useEffect } from 'react';
import './AdminDashboard.css';
import AddProjectModal from '../Addproject/AddProjectModal.jsx';
import { getAllProjects, addProject, deleteProject } from '../../services/ProjectService';
import EvaluationSummary from '../EvaluationSummary/EvaluationSummary.jsx';
import Settings from '../Settings/Settings.jsx';
function AdminDashboard({ onLogout }) {
   const [currentPage, setCurrentPage] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [projects, setProjects] = useState([]); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const projectsData = await getAllProjects();
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to load projects:', error);
      alert('Failed to load projects. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async (newProject) => {
    try {
      const addedProject = await addProject(newProject);
      setProjects([addedProject, ...projects]);
      alert('Project added successfully!');
    } catch (error) {
      console.error('Failed to add project:', error);
      alert('Failed to add project. Please try again.');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(projectId);
        setProjects(projects.filter(p => p.id !== projectId));
        alert('Project deleted successfully!');
      } catch (error) {
        console.error('Failed to delete project:', error);
        alert('Failed to delete project.');
      }
    }
  };

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setShowDetailsModal(true);
  };

  // Filter projects based on tab and search
  const filteredProjects = projects.filter(project => {
    const matchesTab = activeTab === 'all' || project.status === activeTab;
    const matchesSearch = 
      project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.registrationNo?.includes(searchTerm);
    return matchesTab && matchesSearch;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading projects from database...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>DICAMP</h2>
          <p>Edwardes College</p>
        </div>

        <div className="sidebar-footer">
          <button
            className={`nav-item ${currentPage === "settings" ? "active" : ""}`}
            onClick={() => setCurrentPage("settings")}
          >
            <span className="nav-icon">
              <img src="../../public/images/settings.png" alt="" />
            </span>
            <span>Settings</span>
          </button>
          <button className="nav-item logout" onClick={onLogout}>
            <span className="nav-icon">
              <img src="../../public/images/logout.png" alt="" />
            </span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}

      {currentPage === 'settings' ? (
        <Settings onLogout={onLogout} />
      ) : (
      <main className="main-content">
        {/* Header */}
        <header className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <div className="header-actions">
            <button
              className="add-project-btn"
              onClick={() => setIsModalOpen(true)}
            >
              + Add Project
            </button>
          </div>
        </header>

        {/* Projects Overview Section */}
        <section className="overview-section">
          <div className="section-header">
            <h2>Projects Overview</h2>
            <p className="section-subtitle">
              Academic year 2023-2024 final year project evaluation and
              management dashboard.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Projects</h3>
              <p className="stat-number">{projects.length}</p>
            </div>
            <div className="stat-card">
              <h3>Evaluated</h3>
              <p className="stat-number">
                {projects.filter((p) => p.status === "evaluated").length}
              </p>
            </div>
            <div className="stat-card">
              <h3>Pending</h3>
              <p className="stat-number">
                {projects.filter((p) => p.status === "pending").length}
              </p>
            </div>
          </div>
        </section>

        {/* Projects List Section */}
        <section className="projects-section">
          {/* Search and Filters */}
          <div className="filters-bar">
            <input
              type="text"
              placeholder="Search by title or student name..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="filter-tabs">
              <button
                className={`filter-tab ${activeTab === "all" ? "active" : ""}`}
                onClick={() => setActiveTab("all")}
              >
                All
              </button>
              <button
                className={`filter-tab ${activeTab === "pending" ? "active" : ""}`}
                onClick={() => setActiveTab("pending")}
              >
                Pending
              </button>
              <button
                className={`filter-tab ${activeTab === "evaluated" ? "active" : ""}`}
                onClick={() => setActiveTab("evaluated")}
              >
                Evaluated
              </button>
            </div>
          </div>

          {/* Projects List */}
          <div className="projects-list">
            {filteredProjects.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3>No Projects Found</h3>
                <p>
                  {searchTerm
                    ? `No projects matching "${searchTerm}"`
                    : 'Click "Add Project" to submit your first FYP project.'}
                </p>
              </div>
            ) : (
              filteredProjects.map((project) => (
                <div key={project.id} className="admin-project-card">
                  <div className="project-header">
                    <h3>{project.title}</h3>
                    <span className={`status-badge ${project.status}`}>
                      {project.status === "evaluated"
                        ? "✓ Evaluated"
                        : "⏳ Pending"}
                    </span>
                  </div>

                  <div className="project-details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Student:</span>
                      <span className="detail-value">
                        {project.studentName || "N/A"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Registration:</span>
                      <span className="detail-value">
                        {project.registrationNo || "N/A"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Supervisor:</span>
                      <span className="detail-value">
                        {project.supervisorName || "Not assigned"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Category:</span>
                      <span className="detail-value">
                        {project.category || "N/A"}
                      </span>
                    </div>
                  </div>

                  {project.evaluation && (
                    <div className="evaluation-indicator">
                      <span className="eval-score-badge">
                        ✓ Evaluated: {project.evaluation.totalMarks || 0}/50
                      </span>
                    </div>
                  )}

                  <div className="project-actions">
                    <button
                      className="view-btn"
                      onClick={() => handleViewDetails(project)}
                    >
                      View Details
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteProject(project.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="dashboard-footer">
          <p>
            © 2024 Dicamp Project Evaluation System. Institutional Excellence.
          </p>
        </footer>
      </main>
      )}

      {/* Add Project Modal */}
      <AddProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectAdded={handleAddProject}
      />

      {/* Project Details Modal with Evaluation Summary */}
      {showDetailsModal && selectedProject && (
        <div
          className="details-modal-overlay"
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="details-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="details-modal-header">
              <h2>Project Details</h2>
              <button
                className="details-close-btn"
                onClick={() => setShowDetailsModal(false)}
              >
                ×
              </button>
            </div>
            <div className="details-modal-body">
              {selectedProject.evaluation ? (
                <EvaluationSummary project={selectedProject} />
              ) : (
                <>
                  <div className="basic-details">
                    <h3>{selectedProject.title}</h3>
                    <div className="basic-info-grid">
                      <div className="basic-info-item">
                        <span className="info-label">Student</span>
                        <span className="info-value">
                          {selectedProject.studentName}
                        </span>
                      </div>
                      <div className="basic-info-item">
                        <span className="info-label">Registration</span>
                        <span className="info-value">
                          {selectedProject.registrationNo}
                        </span>
                      </div>
                      <div className="basic-info-item">
                        <span className="info-label">Supervisor</span>
                        <span className="info-value">
                          {selectedProject.supervisorName}
                        </span>
                      </div>
                      <div className="basic-info-item">
                        <span className="info-label">Category</span>
                        <span className="info-value">
                          {selectedProject.category}
                        </span>
                      </div>
                      <div className="basic-info-item">
                        <span className="info-label">Semester</span>
                        <span className="info-value">
                          {selectedProject.semester}
                        </span>
                      </div>
                    </div>

                    {selectedProject.teamMembers &&
                      selectedProject.teamMembers.length > 0 && (
                        <div className="basic-team-members">
                          <span className="info-label">Team Members</span>
                          <div className="team-tags">
                            {selectedProject.teamMembers.map((member, idx) => (
                              <span key={idx} className="team-tag">
                                {member}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    {selectedProject.description && (
                      <div className="basic-description">
                        <span className="info-label">Description</span>
                        <p>{selectedProject.description}</p>
                      </div>
                    )}

                    <div className="not-evaluated-message">
                      <p>⏳ This project has not been evaluated yet.</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;