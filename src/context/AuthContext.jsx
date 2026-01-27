import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile 
} from "firebase/auth";
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore"; 
import { auth, googleProvider, db } from "../firebase";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  function loginWithGoogle() {
    return signInWithPopup(auth, googleProvider);
  }

  async function registerWithEmail(email, password, name) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    
    await setDoc(doc(db, "users", result.user.uid), {
      balance: 0,
      email: email,
      name: name
    });
  }

  function loginWithEmail(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setCurrentUser(user);
        
        if (user) {
          const userRef = doc(db, "users", user.uid);
          
          // Перевірка існування юзера
          const docSnap = await getDoc(userRef);
          if (!docSnap.exists()) {
            await setDoc(userRef, { 
              balance: 0, 
              email: user.email, 
              name: user.displayName 
            });
          }

          // Слухаємо баланс
          onSnapshot(userRef, (doc) => {
            setUserData(doc.data());
          });
        } else {
          setUserData(null);
        }
      } catch (error) {
        console.error("Помилка авторизації або БД:", error);
      } finally {
        // 👇 ЦЕЙ РЯДОК ГАРАНТУЄ, ЩО БІЛИЙ ЕКРАН ЗНИКНЕ
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    loginWithGoogle,
    registerWithEmail,
    loginWithEmail,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}