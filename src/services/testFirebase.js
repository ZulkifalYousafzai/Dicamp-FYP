import { db } from './firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

// Test function to add a sample project
export const testFirebase = async () => {
  try {
    // Add a test project
    const docRef = await addDoc(collection(db, 'projects'), {
      title: "Test Project",
      studentName: "Test Student",
      status: "pending",
      createdAt: new Date().toISOString()
    });
    console.log("✅ Firebase working! Project added with ID:", docRef.id);
    
    // Read projects back
    const querySnapshot = await getDocs(collection(db, 'projects'));
    console.log("✅ Total projects in database:", querySnapshot.size);
    
    return true;
  } catch (error) {
    console.error("❌ Firebase error:", error);
    return false;
  }
};