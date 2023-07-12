import React, { createContext, useEffect, useState } from "react";
import { auth } from "../firebase";

export const AuthContext = createContext();

export const useAuth = () => {
  return React.useContext(AuthContext);
};

const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        // User is signed in.
        setUser({
          uid: authUser.uid,
          displayName: authUser.displayName,
          photoURL: authUser.photoURL,
          email: authUser.email,
        });
      } else {
        // User is signed out.
        setUser(null);
      }
    });

    // unsubscribe to the listener when unmounting
    return () => unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
};

export default AuthContextProvider;