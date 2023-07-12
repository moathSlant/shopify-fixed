import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth } from "../firebase";

const SignInWithGoogleButton = () => {
  const { user } = useContext(AuthContext);

  const handleGoogleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div>
      {user ? (
        <div className="flex items-center space-x-2">
          {/* <img
            className="rounded-full"
            src={user?.photoURL || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
            alt={user.displayName}
            width={32}
            height={32}
          />
          <span className="text-white">{user.displayName}</span> */}
          {/* <button
            className="bg-red-500 hover:bg-red-600 px-3 py-1 text-white rounded"
            onClick={handleLogout}
          >
            Log out
          </button> */}
        </div>
      ) : (
        <button
          className="bg-white hover:bg-white px-3 py-1 text-dark rounded"
          onClick={handleGoogleLogin}
        >
          Log in with Google
        </button>
      )}
    </div>
  );
};

export default SignInWithGoogleButton;
