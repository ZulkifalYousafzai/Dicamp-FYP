import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export const loginUser = async (email, password) => {
  try {
    console.log("🔐 Attempting login for:", email);
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("✅ User authenticated, UID:", user.uid);
    
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    console.log("📄 User document exists:", userDoc.exists());
    
    let userRole = 'judge';
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log("📄 User data:", userData);
      
      // ✅ FIX: Try multiple variations of the field name
      const roleFromFirestore = userData.role ||      // Normal field
                                 userData['role'] ||   // Normal field
                                 userData['role '] ||  // Field with space at end
                                 userData.Role ||      // Capital R
                                 userData['Role'] ||   // Capital R
                                 null;
      
      console.log("🎯 Extracted role value:", roleFromFirestore);
      
      if (roleFromFirestore === 'admin' || roleFromFirestore === 'Admin') {
        userRole = 'admin';
        console.log("✅ Set role to: admin");
      } else if (roleFromFirestore === 'judge' || roleFromFirestore === 'Judge') {
        userRole = 'judge';
        console.log("✅ Set role to: judge");
      } else {
        console.log("⚠️ Unknown or no role found, using default: judge");
        userRole = 'judge';
      }
    } else {
      console.log("📝 Creating new user document...");
      await setDoc(userDocRef, {
        email: user.email,
        role: 'judge',
        createdAt: serverTimestamp()
      });
      userRole = 'judge';
    }
    
    const result = {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        role: userRole
      }
    };
    
    console.log("🔑 Final result:", result);
    return result;
    
  } catch (error) {
    console.error("❌ Login error:", error);
    let errorMessage = 'Failed to login. Please try again.';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'User not found. Please check your email.';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password. Please try again.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email format.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed attempts. Please try again later.';
    } else if (error.code === 'auth/invalid-credential') {
      errorMessage = 'Invalid credentials. Please check your email and password.';
    }
    throw new Error(errorMessage);
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    console.log("✅ User logged out");
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    throw new Error('Failed to logout. Please try again.');
  }
};

export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) {
        console.log("👤 getCurrentUser: User found:", user.uid);
        resolve(user);
      } else {
        console.log("👤 getCurrentUser: No user found");
        resolve(null);
      }
    }, reject);
  });
};

export const getUserRole = async (uid) => {
  try {
    console.log("🔍 Getting role for UID:", uid);
    
    if (!uid) {
      console.log("❌ No UID provided");
      return null;
    }
    
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    console.log("📄 Document exists:", userDoc.exists());
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log("📄 User data:", userData);
      
      // ✅ FIX: Try multiple variations of the field name
      const role = userData.role ||      // Normal field
                   userData['role'] ||   // Normal field
                   userData['role '] ||  // Field with space at end
                   userData.Role ||      // Capital R
                   userData['Role'] ||   // Capital R
                   null;
      
      console.log("🎯 Found role:", role);
      return role;
    } else {
      console.log("⚠️ No user document found");
      return null;
    }
  } catch (error) {
    console.error("❌ Error getting user role:", error);
    return null;
  }
};

// Optional: Fix function to remove the space from the field name
export const fixRoleField = async (uid) => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // If there's a field with a space, copy it to the correct field
      if (userData['role '] && !userData.role) {
        await setDoc(userDocRef, {
          ...userData,
          role: userData['role '],
          'role ': delete userData['role ']
        });
        console.log("✅ Fixed role field for UID:", uid);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error("Error fixing role field:", error);
    return false;
  }
};