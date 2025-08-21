import React, { useEffect, useRef, useState } from "react";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

export default function MessageList({ roomId }) {
  const { user } = useAuth();
  const [msgs, setMsgs] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!roomId) return;
    const unsub = db
      .collection("rooms").doc(roomId)
      .collection("messages")
      .orderBy("createdAt")
      .limit(500)
      .onSnapshot(s => setMsgs(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    return unsub;
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  return (
    <div className="messages">
      {msgs.map(m => (
        <div key={m.id} className={`message-row ${m.uid === user?.uid ? "self" : "other"}`}>
          <div className="bubble">
            <div className="meta">
              <span>{m.displayName || m.email}</span>
              {m.createdAt?.toDate && (
                <span>· {m.createdAt.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              )}
            </div>
            <div>{m.text}</div>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
