import { useState } from 'react';
import './EvaluationModal.css';

function EvaluationModal({ isOpen, project, onClose, onSubmit }) {
  const [evaluationData, setEvaluationData] = useState({
    // Completeness & Deployment
    completeness: 0,
    commercialization: 0,
    presentation: 0,
    userValidation: 0,
    
    // Innovation & Problem Solving
    innovation: 0,
    
    // Investment Interest
    investmentInterest: '',
    
    // Remarks
    remarks: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !project) return null;

  // Calculate total marks (out of 50)
  const totalMarks = 
    evaluationData.completeness +
    evaluationData.commercialization +
    evaluationData.presentation +
    evaluationData.userValidation +
    evaluationData.innovation;
  
  const percentage = (totalMarks / 50) * 100;

  const handleSliderChange = (field, value) => {
    setEvaluationData({
      ...evaluationData,
      [field]: parseInt(value)
    });
  };

  const handleInvestmentChange = (value) => {
    setEvaluationData({
      ...evaluationData,
      investmentInterest: value
    });
  };

  const handleSubmit = async (e) => {
   e.preventDefault();
  
  // Check if any ratings are given
  const hasRatings = 
    evaluationData.completeness > 0 ||
    evaluationData.commercialization > 0 ||
    evaluationData.presentation > 0 ||
    evaluationData.userValidation > 0 ||
    evaluationData.innovation > 0;
  
  if (!hasRatings) {
    alert('Please provide ratings before submitting the evaluation.');
    return;
  }

  setIsSubmitting(true);
  
  // Prepare the data to submit
  const submitData = {
    completeness: evaluationData.completeness,
    commercialization: evaluationData.commercialization,
    presentation: evaluationData.presentation,
    userValidation: evaluationData.userValidation,
    innovation: evaluationData.innovation,
    investmentInterest: evaluationData.investmentInterest,
    remarks: evaluationData.remarks,
    totalMarks: totalMarks,
    percentage: percentage,
    evaluatedAt: new Date().toISOString()
  };
  
  console.log("Submitting data:", submitData);
  
  try {
    await onSubmit(submitData);
  } catch (error) {
    console.error("Submission error:", error);
    alert('Failed to submit evaluation. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};

  // Get label for completeness
  const getCompletenessLabel = (value) => {
    if (value <= 3) return 'MINIMAL';
    if (value <= 6) return 'PARTIAL';
    return 'FULL';
  };

  // Get label for commercialization
  const getCommercializationLabel = (value) => {
    if (value <= 5) return 'LOW';
    if (value <= 10) return 'MEDIUM';
    return 'SCALABLE';
  };

  // Get label for presentation
  const getPresentationLabel = (value) => {
    if (value <= 3) return 'WEAK';
    if (value <= 6) return 'GOOD';
    return 'PERSUASIVE';
  };

  // Get label for user validation
  const getUserValidationLabel = (value) => {
    if (value <= 3) return 'THEORETICAL';
    if (value <= 6) return 'EARLY ADOPTERS';
    return 'ACTIVE USERS';
  };

  // Get label for innovation
  const getInnovationLabel = (value) => {
    if (value <= 1) return 'COMMON';
    if (value <= 3) return 'INCREMENTAL';
    return 'NOVEL';
  };

  return (
    <div className="eval-modal-overlay" onClick={onClose}>
      <div className="eval-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="eval-modal-header">
          <h2>Project Evaluation</h2>
          <button className="eval-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="eval-project-info">
          <h3>{project.title}</h3>
          <div className="project-meta">
            <div className="meta-item">
              <span className="meta-label">STUDENT</span>
              <span className="meta-value">{project.studentName}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">SUPERVISOR</span>
              <span className="meta-value">{project.supervisorName}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="eval-form">
          <div className="eval-rubric">
            <h4 className="rubric-title">Project Evaluation Rubric</h4>
            <p className="rubric-subtitle">Carefully rate each criterion below based on the project demonstration.</p>

            {/* Completeness & Deployment */}
            <div className="rubric-section">
              <div className="section-header">
                <h5>Completeness & Deployment</h5>
                <div className="range-labels">
                  <span>MINIMAL</span>
                  <span>EXCEPTIONAL</span>
                </div>
              </div>
              <div className="slider-container">
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={evaluationData.completeness}
                  onChange={(e) => handleSliderChange('completeness', e.target.value)}
                  className="rubric-slider"
                />
                <div className="slider-values">
                  <span>0</span>
                  <span>2</span>
                  <span>4</span>
                  <span>6</span>
                  <span>8</span>
                  <span>10</span>
                </div>
                <div className="slider-status">
                  <span className="status-badge completeness">
                    {getCompletenessLabel(evaluationData.completeness)}
                  </span>
                  <span className="slider-score">{evaluationData.completeness} / 10</span>
                </div>
              </div>
            </div>

            {/* Commercialization Potential */}
            <div className="rubric-section">
              <div className="section-header">
                <h5>Commercialization Potential</h5>
                <div className="range-labels">
                  <span>LOW</span>
                  <span>SCALABLE</span>
                </div>
              </div>
              <div className="slider-container">
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="1"
                  value={evaluationData.commercialization}
                  onChange={(e) => handleSliderChange('commercialization', e.target.value)}
                  className="rubric-slider"
                />
                <div className="slider-values">
                  <span>0</span>
                  <span>3</span>
                  <span>6</span>
                  <span>9</span>
                  <span>12</span>
                  <span>15</span>
                </div>
                <div className="slider-status">
                  <span className="status-badge commercialization">
                    {getCommercializationLabel(evaluationData.commercialization)}
                  </span>
                  <span className="slider-score">{evaluationData.commercialization} / 15</span>
                </div>
              </div>
            </div>

            {/* Product Pitch & Presentation */}
            <div className="rubric-section">
              <div className="section-header">
                <h5>Product Pitch & Presentation</h5>
                <div className="range-labels">
                  <span>WEAK</span>
                  <span>PERSUASIVE</span>
                </div>
              </div>
              <div className="slider-container">
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={evaluationData.presentation}
                  onChange={(e) => handleSliderChange('presentation', e.target.value)}
                  className="rubric-slider"
                />
                <div className="slider-values">
                  <span>0</span>
                  <span>2</span>
                  <span>4</span>
                  <span>6</span>
                  <span>8</span>
                  <span>10</span>
                </div>
                <div className="slider-status">
                  <span className="status-badge presentation">
                    {getPresentationLabel(evaluationData.presentation)}
                  </span>
                  <span className="slider-score">{evaluationData.presentation} / 10</span>
                </div>
              </div>
            </div>

            {/* Real User Validation & Traction */}
            <div className="rubric-section">
              <div className="section-header">
                <h5>Real User Validation & Traction</h5>
                <div className="range-labels">
                  <span>THEORETICAL</span>
                  <span>ACTIVE USERS</span>
                </div>
              </div>
              <div className="slider-container">
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={evaluationData.userValidation}
                  onChange={(e) => handleSliderChange('userValidation', e.target.value)}
                  className="rubric-slider"
                />
                <div className="slider-values">
                  <span>0</span>
                  <span>2</span>
                  <span>4</span>
                  <span>6</span>
                  <span>8</span>
                  <span>10</span>
                </div>
                <div className="slider-status">
                  <span className="status-badge validation">
                    {getUserValidationLabel(evaluationData.userValidation)}
                  </span>
                  <span className="slider-score">{evaluationData.userValidation} / 10</span>
                </div>
              </div>
            </div>

            {/* Innovation & Problem Solving */}
            <div className="rubric-section">
              <div className="section-header">
                <h5>Innovation & Problem Solving</h5>
                <div className="range-labels">
                  <span>COMMON</span>
                  <span>NOVEL</span>
                </div>
              </div>
              <div className="slider-container">
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="1"
                  value={evaluationData.innovation}
                  onChange={(e) => handleSliderChange('innovation', e.target.value)}
                  className="rubric-slider"
                />
                <div className="slider-values">
                  <span>0</span>
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                </div>
                <div className="slider-status">
                  <span className="status-badge innovation">
                    {getInnovationLabel(evaluationData.innovation)}
                  </span>
                  <span className="slider-score">{evaluationData.innovation} / 5</span>
                </div>
              </div>
            </div>

            {/* Investment Interest */}
            <div className="rubric-section investment-section">
              <h5>Investment Interest</h5>
              <div className="investment-options">
                <label className="investment-option">
                  <input
                    type="radio"
                    name="investment"
                    value="interested"
                    checked={evaluationData.investmentInterest === 'interested'}
                    onChange={(e) => handleInvestmentChange(e.target.value)}
                  />
                  <span>Interested to Invest / Support</span>
                </label>
                <label className="investment-option">
                  <input
                    type="radio"
                    name="investment"
                    value="not-interested"
                    checked={evaluationData.investmentInterest === 'not-interested'}
                    onChange={(e) => handleInvestmentChange(e.target.value)}
                  />
                  <span>Not Interested to Invest</span>
                </label>
              </div>
            </div>
          </div>

          {/* Evaluation Summary */}
          <div className="eval-summary">
            <h4>Evaluation Summary</h4>
            <div className="summary-stats">
              <div className="summary-item">
                <span className="summary-label">Total Marks</span>
                <span className="summary-value">{totalMarks} / 50</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Percentage</span>
                <span className="summary-value">{percentage.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Remarks & Suggestions */}
          <div className="eval-remarks">
            <label>Remarks & Suggestions</label>
            <p className="remarks-subtitle">Optional. Provide constructive feedback and suggestions.</p>
            <textarea
              value={evaluationData.remarks}
              onChange={(e) => setEvaluationData({...evaluationData, remarks: e.target.value})}
              placeholder="Enter your remarks and suggestions here..."
              rows="4"
              className="remarks-textarea"
            />
          </div>

          <div className="eval-modal-footer">
            <button type="button" className="eval-cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="eval-update-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Update Evaluation'}
            </button>
          </div>
        </form>

        <div className="eval-footer-note">
          <p>© 2024 Dicamp Project Evaluation System. Institutional Support | Academic Terms | Terms of Service</p>
        </div>
      </div>
    </div>
  );
}

export default EvaluationModal;