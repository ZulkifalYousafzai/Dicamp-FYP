import './EvaluationSummary.css';

function EvaluationSummary({ project }) {
  if (!project || !project.evaluation) {
    return null;
  }

  const evaluation = project.evaluation;

  return (
    <div className="evaluation-summary-container">
      {/* Project Header */}
      <div className="eval-summary-header">
        <h2>Project Details</h2>
        <div className="project-title-section">
          <h3>{project.title || project.projectTitle}</h3>
          <div className="student-info">
            <span className="student-name">{project.studentName}</span>
            <span className="reg-number">Reg: {project.registrationNo}</span>
          </div>
        </div>
      </div>

      {/* Project Info Grid */}
      <div className="project-info-grid">
        <div className="info-item">
          <span className="info-label">Supervisor</span>
          <span className="info-value">{project.supervisorName || 'N/A'}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Category</span>
          <span className="info-value">{project.category || 'N/A'}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Semester</span>
          <span className="info-value">{project.semester || 'N/A'}</span>
        </div>
      </div>

      {/* Team Members */}
      {project.teamMembers && project.teamMembers.length > 0 && (
        <div className="team-members-section">
          <span className="info-label">Team Members</span>
          <div className="team-members-list">
            {project.teamMembers.map((member, idx) => (
              <span key={idx} className="team-member-tag">{member}</span>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {project.description && (
        <div className="description-section">
          <h4>Detailed Description</h4>
          <p>{project.description}</p>
          <div className="highlight-tags">
            {project.category && <span className="highlight-tag">{project.category}</span>}
            
          </div>
        </div>
      )}

      {/* Evaluation Breakdown */}
      <div className="evaluation-breakdown">
        <h4>Evaluation Breakdown</h4>
        
        {/* Single Judge Evaluation */}
        <div className="judge-evaluation-card">
          <div className="judge-header">
            <div className="judge-info">
              <span className="judge-id">J8</span>
              <span className="judge-name">Judge: 0008</span>
              <span className="judge-role">SENIOR TECHNICAL LEAD</span>
            </div>
            <div className="judge-score">
              <span className="score">{evaluation.totalMarks || evaluation.totalMarks || 49} / 50</span>
              <span className="percentage">{evaluation.percentage || 98}%</span>
            </div>
          </div>

          <div className="criteria-grid">
            <div className="criteria-item">
              <span className="criteria-name">Product Pitch & Presentation</span>
              <span className="criteria-score">{evaluation.presentation || 9}/10</span>
            </div>
            <div className="criteria-item">
              <span className="criteria-name">Real User Validation & Traction</span>
              <span className="criteria-score">{evaluation.userValidation || 10}/10</span>
            </div>
            <div className="criteria-item">
              <span className="criteria-name">Completeness & Deployment</span>
              <span className="criteria-score">{evaluation.completeness || 9}/10</span>
            </div>
            <div className="criteria-item">
              <span className="criteria-name">Innovation & Problem Solving</span>
              <span className="criteria-score">{evaluation.innovation || 5}/5</span>
            </div>
            <div className="criteria-item">
              <span className="criteria-name">Commercialization Potential</span>
              <span className="criteria-score">{evaluation.commercialization || 15}/15</span>
            </div>
          </div>

          <div className="investment-decision">
            <span className={`investment-badge ${evaluation.investmentInterest === 'interested' ? 'interested' : 'not-interested'}`}>
              {evaluation.investmentInterest === 'interested' ? '✅ Interested to Invest / Support' : '❌ Not Interested to Invest'}
            </span>
          </div>
        </div>

        {/* Additional Judges - You can add multiple judges here */}
        {/* This would come from an array of evaluations in the future */}
      </div>

      {/* Grand Total Summary */}
      <div className="grand-total-summary">
        <h4>Grand Total Summary</h4>
        <p className="grand-total-subtitle">Cumulative evaluation across 1 independent faculty judge.</p>
        <div className="grand-total-score">
          <span className="grand-total-value">{evaluation.totalMarks || 49} / 50</span>
          <span className="grand-total-percentage">{evaluation.percentage || 98}%</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="edit-btn">✏️ Edit Project</button>
      </div>
    </div>
  );
}

export default EvaluationSummary;