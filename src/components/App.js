import React from "react";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import Chats from "./Chats";
import Login from "./Login";

function Gate() {
  const { user } = useAuth();
  return user ? <Chats /> : <Login />;
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
