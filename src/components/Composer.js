import React, { useState } from "react";
import firebase, { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

export default function Composer({ roomId }) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);

  const send = async (e) => {
    e?.preventDefault?.();
    const t = text.trim();
    if (!t || !roomId || !user || pending) return;

    setPending(true);
    setText("");

    const nowTS = firebase.firestore.FieldValue.serverTimestamp();

    // пробуем заранее обновить updatedAt (может быть запрещено — ок)
    try {
      await db.collection("rooms").doc(roomId).set({ updatedAt: nowTS }, { merge: true });
    } catch (err) {
      console.warn("room updatedAt pre-update denied:", err.message);
    }

    // добавляем сообщение
    await db.collection("rooms").doc(roomId).collection("messages").add({
      text: t,
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email,
      photoURL: user.photoURL || "",
      createdAt: nowTS,
    });

    // ещё раз обновим updatedAt (если было запрещено раньше)
    try {
      await db.collection("rooms").doc(roomId).update({ updatedAt: nowTS });
    } finally {
      setPending(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      send(e);
    }
  };

  return (
    <form className="composer" onSubmit={send}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Type a message…"
        disabled={pending}
      />
      <button type="submit" disabled={!text.trim() || pending}>
        {pending ? "…" : "Send"}
      </button>
    </form>
  );
}
