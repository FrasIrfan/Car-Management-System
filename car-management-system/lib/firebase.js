import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup 
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {

  apiKey: "AIzaSyDsXS1vhUGDVZVaFR_XKpdhzQAzLTyV6kg",
  authDomain: "car-management-system-d6ff2.firebaseapp.com",
  projectId: "car-management-system-d6ff2",
  storageBucket: "car-management-system-d6ff2.firebasestorage.app",
  messagingSenderId: "07165218280",
  appId: "1:707165218280:web:7e719544c58d5b49f1f05d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    // The signed-in user info.
    const user = result.user;
    
    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      // Add user to Firestore if they don't exist
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        name: user.displayName,
        role: 'purchaser', // Default role
        createdAt: new Date().toISOString(),
      });
    }
    
    return user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export { auth, db, signInWithGoogle, googleProvider };
