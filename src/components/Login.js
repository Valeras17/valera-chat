// src/components/Login.js
import React from "react";
import { GoogleOutlined } from "@ant-design/icons";
import firebase, { auth, googleProvider } from "../firebase";

const Login = () => {
  const signInWithGoogle = async () => {
    try {
      // гарантируем персистентность
      await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
      // 1) пробуем popup (на десктопе проще)
      await auth.signInWithPopup(googleProvider);
    } catch (e) {
      // если попап блокируется браузером или окружение не поддерживает попапы — fallback
      if (e?.code === "auth/popup-blocked" || e?.code === "auth/operation-not-supported-in-this-environment") {
        await auth.signInWithRedirect(googleProvider);
      } else {
        console.error("Google sign-in error:", e);
        alert(e.message || "Google sign-in failed");
      }
    }
  };

  return (
    <div id="login-page">
      <div id="login-card">
        <h2>Welcome to Valerachat!</h2>
        <button className="login-button google" onClick={signInWithGoogle}>
          <GoogleOutlined /> Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
