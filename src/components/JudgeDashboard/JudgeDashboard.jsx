import { useState, useEffect } from 'react';
import { getPendingProjects, getEvaluatedProjects, evaluateProject } from '../../services/ProjectService.js';
import { getCurrentUser, getUserRole } from '../../services/authService.js';
import EvaluationModal from '../EvaluationModal/EvaluationModal.jsx';
import Settings from '../Settings/Settings.jsx';
import './JudgeDashboard.css';

function JudgeDashboard({ onLogout }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedProject, setSelectedProject] = useState(null);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [judgeInfo, setJudgeInfo] = useState({
    name: 'Judge',
    role: 'Judge',
    uid: ''
  });
  const [stats, setStats] = useState({
    pending: 0,
    assigned: 0,
    evaluated: 0
  });

  // Load judge info and projects
  useEffect(() => {
    const loadJudgeData = async () => {
      try {
        // Get current user info
        const user = await getCurrentUser();
        if (user) {
          const role = await getUserRole(user.uid);
          setJudgeInfo({
            name: user.displayName || user.email?.split('@')[0] || 'Judge',
            role: role === 'judge' ? 'Senior Judge' : 'Judge',
            uid: user.uid
          });
        }
        
        // Load projects
        await loadProjects();
      } catch (error) {
        console.error('Failed to load judge data:', error);
      }
    };
    
    loadJudgeData();
  }, []);

  // Reload projects when tab changes
  useEffect(() => {
    if (!loading) {
      loadProjects();
    }
  }, [activeTab]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      let projectsData;
      
      if (activeTab === 'pending') {
        projectsData = await getPendingProjects();
      } else {
        projectsData = await getEvaluatedProjects();
      }
      
      setProjects(projectsData);
      
      // Update stats
      const allPending = await getPendingProjects();
      const allEvaluated = await getEvaluatedProjects();
      setStats({
        pending: allPending.length,
        assigned: allPending.length + allEvaluated.length,
        evaluated: allEvaluated.length
      });
      
    } catch (error) {
      console.error('Failed to load projects:', error);
      alert('Failed to load projects. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = (project) => {
    setSelectedProject(project);
    setIsEvaluationModalOpen(true);
  };

  const handleEvaluationSubmit = async (evaluationData) => {
    console.log("Received evaluation data:", evaluationData);
    console.log("Selected project:", selectedProject);
    
    if (!selectedProject || !selectedProject.id) {
      console.error("No project selected");
      alert("No project selected. Please try again.");
      return;
    }
    
    try {
      await evaluateProject(selectedProject.id, evaluationData);
      alert(`Project "${selectedProject.title}" has been evaluated successfully!`);
      setIsEvaluationModalOpen(false);
      setSelectedProject(null);
      // Refresh the list
      await loadProjects();
    } catch (error) {
      console.error('Failed to submit evaluation:', error);
      alert(`Failed to submit evaluation: ${error.message || 'Please try again.'}`);
    }
  };

  // Filter projects based on search
  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.registrationNo?.includes(searchTerm);
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="judge-dashboard-container">
      {/* Sidebar */}
      <aside className="judge-sidebar">
        <div className="sidebar-header">
          <h2>DICAMP</h2>
          <p>Edwardes College</p>
          <div className="judge-badge">Judge Portal</div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            <span className="nav-icon"><img src="../../public/images/dashboard.png" alt="" /></span>
            <span>Pending Evaluations</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'evaluated' ? 'active' : ''}`}
            onClick={() => setActiveTab('evaluated')}
          >
            <span className="nav-icon"><img src="../../public/images/projects.png" alt="" /></span>
            <span>Evaluated Projects</span>
          </button>
          
        </nav>

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
            <span className="nav-icon"><img src="../../public/images/logout.png" alt="" /></span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
      {/* Main Content */}
      {currentPage === 'settings' ? (
        <Settings onLogout={onLogout} />
      ) : (
      <main className="judge-main-content">
        <header className="judge-header">
          <div className="judge-header-left">
            <h1>
              {activeTab === 'pending' ? 'Pending Evaluations' : 'Evaluated Projects'}
            </h1>
            <p className="judge-subtitle">
              {activeTab === 'pending' 
                ? `${filteredProjects.length} projects waiting for your review` 
                : `${filteredProjects.length} projects you've evaluated`}
            </p>
          </div>
          <div className="judge-info">
            <span className="judge-name">{judgeInfo.name}</span>
            <span className="judge-role">{judgeInfo.role}</span>
          </div>
        </header>

        {/* Stats Cards - Dynamic */}
        <div className="judge-stats-grid">
          <div className="judge-stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>Pending for Review</h3>
              <p className="stat-number">{stats.pending}</p>
            </div>
          </div>
          <div className="judge-stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <h3>Total Assigned</h3>
              <p className="stat-number">{stats.assigned}</p>
            </div>
          </div>
          <div className="judge-stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>Evaluated</h3>
              <p className="stat-number">{stats.evaluated}</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="judge-search-bar">
          <input 
            type="text" 
            placeholder="Search by project title, student name, or registration number..."
            className="judge-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Projects List */}
        <div className="judge-projects-list">
          {filteredProjects.length === 0 ? (
            <div className="judge-empty-state">
              <div className="empty-icon">🎉</div>
              <h3>
                {activeTab === 'pending' ? 'No Pending Evaluations' : 'No Evaluated Projects Yet'}
              </h3>
              <p>
                {searchTerm 
                  ? `No projects matching "${searchTerm}"` 
                  : activeTab === 'pending' 
                    ? 'All caught up! Check back later for new projects.' 
                    : 'You haven\'t evaluated any projects yet.'}
              </p>
            </div>
          ) : (
            filteredProjects.map(project => (
              <div key={project.id} className="judge-project-card">
                <div className="project-header">
                  <h3>{project.title}</h3>
                  <span className={`priority-badge ${project.status === 'evaluated' ? 'evaluated' : 'pending'}`}>
                    {project.status === 'evaluated' ? '✓ Evaluated' : 'Ready for Review'}
                  </span>
                </div>
                
                <div className="project-details">
                  <div className="detail-row">
                    <span className="detail-label">Student:</span>
                    <span className="detail-value">{project.studentName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Registration:</span>
                    <span className="detail-value">{project.registrationNo}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Supervisor:</span>
                    <span className="detail-value">{project.supervisorName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Category:</span>
                    <span className="detail-value">{project.category || 'Not specified'}</span>
                  </div>
                  {project.status === 'evaluated' && project.evaluation && (
                    <div className="detail-row">
                      <span className="detail-label">Score:</span>
                      <span className="detail-value score-value">
                        {project.evaluation.totalMarks || project.evaluation.percentage}/50
                      </span>
                    </div>
                  )}
                </div>

                <div className="project-description">
                  <p>{project.description}</p>
                </div>

                {project.teamMembers && project.teamMembers.length > 0 && (
                  <div className="team-members">
                    <strong>Team Members:</strong>
                    <div className="team-tags">
                      {project.teamMembers.map((member, idx) => (
                        <span key={idx} className="team-tag">{member}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="project-actions">
                  {project.status === 'pending' ? (
                    <button 
                      className="evaluate-now-btn"
                      onClick={() => handleEvaluate(project)}
                    >
                      📝 Evaluate Now
                    </button>
                  ) : (
                    <button 
                      className="view-report-btn"
                      onClick={() => {
                        setSelectedProject(project);
                        setIsEvaluationModalOpen(true);
                      }}
                    >
                      📄 Update Evaluation Report
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <footer className="judge-footer">
          <p>© 2024 Dicamp Project Evaluation System. Institutional Excellence.</p>
        </footer>
      </main>

      )}

      {/* Evaluation Modal */}
      <EvaluationModal 
        isOpen={isEvaluationModalOpen}
        project={selectedProject}
        onClose={() => {
          setIsEvaluationModalOpen(false);
          setSelectedProject(null);
        }}
        onSubmit={handleEvaluationSubmit}
      />
    </div>
  );
}

export default JudgeDashboard;