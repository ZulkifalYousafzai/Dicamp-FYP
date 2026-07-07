import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  updateDoc, 
  deleteDoc,
  doc, 
  query, 
  where,
  serverTimestamp 
} from 'firebase/firestore';

const projectsCollection = collection(db, 'projects');

// Add a new project
export const addProject = async (projectData) => {
  try {
    let teamMembers = projectData.teamMembers;
    if (typeof teamMembers === 'string') {
      teamMembers = teamMembers.split(',').map(m => m.trim()).filter(m => m);
    }
    if (!Array.isArray(teamMembers)) {
      teamMembers = [];
    }

    const docRef = await addDoc(projectsCollection, {
      projectTitle: projectData.projectTitle || '',
      category: projectData.category || '',
      description: projectData.description || '',
      studentName: projectData.studentName || '',
      registrationNo: projectData.registrationNo || '',
      semester: projectData.semester || '8',
      supervisorName: projectData.supervisorName || '',
      teamMembers: teamMembers,
      status: 'pending',
      createdAt: serverTimestamp(),
      evaluatedAt: null,
      evaluation: null
    });
    
    return { 
      id: docRef.id, 
      ...projectData, 
      teamMembers: teamMembers,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error adding project:", error);
    throw error;
  }
};

// Get all projects - FIXED to include semester
export const getAllProjects = async () => {
  try {
    const querySnapshot = await getDocs(projectsCollection);
    const projects = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Create project object with ALL fields from Firebase
      const project = {
        id: doc.id,
        title: data.projectTitle || data.title || 'Untitled',
        studentName: data.studentName || 'N/A',
        registrationNo: data.registrationNo || 'N/A',
        supervisorName: data.supervisorName || 'Not assigned',
        category: data.category || 'General',
        semester: data.semester || 'N/A', // This should now work
        description: data.description || 'No description',
        teamMembers: Array.isArray(data.teamMembers) ? data.teamMembers : [],
        status: data.status || 'pending',
        evaluation: data.evaluation || null,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        evaluatedAt: data.evaluatedAt?.toDate?.() || null
      };
      
      // Debug log to verify semester is being read
      console.log(`Project: ${project.title}, Semester: ${project.semester}`);
      
      projects.push(project);
    });
    
    return projects.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error("Error getting projects:", error);
    throw error;
  }
};

// Get pending projects - FIXED
export const getPendingProjects = async () => {
  try {
    const q = query(projectsCollection, where('status', '==', 'pending'));
    const querySnapshot = await getDocs(q);
    const projects = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      projects.push({
        id: doc.id,
        title: data.projectTitle || data.title || 'Untitled',
        studentName: data.studentName || 'N/A',
        registrationNo: data.registrationNo || 'N/A',
        supervisorName: data.supervisorName || 'Not assigned',
        category: data.category || 'General',
        semester: data.semester || 'N/A', // Fixed
        description: data.description || 'No description',
        teamMembers: Array.isArray(data.teamMembers) ? data.teamMembers : [],
        status: data.status || 'pending',
        evaluation: data.evaluation || null,
        createdAt: data.createdAt?.toDate?.() || new Date()
      });
    });
    
    return projects.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error("Error getting pending projects:", error);
    throw error;
  }
};

// Get evaluated projects - FIXED
export const getEvaluatedProjects = async () => {
  try {
    const q = query(projectsCollection, where('status', '==', 'evaluated'));
    const querySnapshot = await getDocs(q);
    const projects = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      projects.push({
        id: doc.id,
        title: data.projectTitle || data.title || 'Untitled',
        studentName: data.studentName || 'N/A',
        registrationNo: data.registrationNo || 'N/A',
        supervisorName: data.supervisorName || 'Not assigned',
        category: data.category || 'General',
        semester: data.semester || 'N/A', // Fixed
        description: data.description || 'No description',
        teamMembers: Array.isArray(data.teamMembers) ? data.teamMembers : [],
        status: data.status || 'evaluated',
        evaluation: data.evaluation || null,
        evaluatedAt: data.evaluatedAt?.toDate?.() || new Date()
      });
    });
    
    return projects.sort((a, b) => b.evaluatedAt - a.evaluatedAt);
  } catch (error) {
    console.error("Error getting evaluated projects:", error);
    throw error;
  }
};

// Get single project - FIXED
export const getProjectById = async (projectId) => {
  try {
    const docRef = doc(db, 'projects', projectId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        title: data.projectTitle || data.title || 'Untitled',
        studentName: data.studentName || 'N/A',
        registrationNo: data.registrationNo || 'N/A',
        supervisorName: data.supervisorName || 'Not assigned',
        category: data.category || 'General',
        semester: data.semester || 'N/A', // Fixed
        description: data.description || 'No description',
        teamMembers: Array.isArray(data.teamMembers) ? data.teamMembers : [],
        status: data.status || 'pending',
        evaluation: data.evaluation || null,
        createdAt: data.createdAt?.toDate?.() || new Date()
      };
    } else {
      throw new Error("Project not found");
    }
  } catch (error) {
    console.error("Error getting project:", error);
    throw error;
  }
};

// Evaluate project
export const evaluateProject = async (projectId, evaluationData) => {
  try {
    console.log("Starting evaluation for project:", projectId);
    console.log("Evaluation data:", evaluationData);
    
    if (!projectId) {
      throw new Error("Project ID is required");
    }
    
    const docRef = doc(db, 'projects', projectId);
    
    await updateDoc(docRef, {
      status: 'evaluated',
      evaluation: {
        completeness: Number(evaluationData.completeness) || 0,
        commercialization: Number(evaluationData.commercialization) || 0,
        presentation: Number(evaluationData.presentation) || 0,
        userValidation: Number(evaluationData.userValidation) || 0,
        innovation: Number(evaluationData.innovation) || 0,
        investmentInterest: evaluationData.investmentInterest || '',
        remarks: evaluationData.remarks || '',
        totalMarks: Number(evaluationData.totalMarks) || 0,
        percentage: Number(evaluationData.percentage) || 0
      },
      evaluatedAt: serverTimestamp()
    });
    
    console.log("Evaluation saved successfully!");
    return { 
      id: projectId, 
      status: 'evaluated', 
      evaluation: evaluationData 
    };
  } catch (error) {
    console.error("Error in evaluateProject:", error);
    throw error;
  }
};

// Delete project
export const deleteProject = async (projectId) => {
  try {
    await deleteDoc(doc(db, 'projects', projectId));
    return { id: projectId, deleted: true };
  } catch (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
};

// Update project status
export const updateProjectStatus = async (projectId, status) => {
  try {
    const docRef = doc(db, 'projects', projectId);
    await updateDoc(docRef, { status });
    return { id: projectId, status };
  } catch (error) {
    console.error("Error updating project status:", error);
    throw error;
  }
};