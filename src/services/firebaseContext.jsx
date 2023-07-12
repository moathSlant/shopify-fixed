import React, { createContext } from 'react';
import { db, auth, storage } from '../firebase';

const FirebaseContext = createContext();
function FirebaseProvider({ children }) {
  const value = { db, auth, storage };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}

export { FirebaseProvider }