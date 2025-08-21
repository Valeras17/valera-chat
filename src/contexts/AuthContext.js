import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";

const AuthCtx = createContext(null);

export function useAuth() {
  return useContext(AuthCtx);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    return auth.onAuthStateChanged(u => {
      setUser(u);
      setReady(true);
    });
  }, []);

  return (
    <AuthCtx.Provider value={{ user }}>
      {ready ? children : null}
    </AuthCtx.Provider>
  );
}
