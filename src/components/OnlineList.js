import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

export default function OnlineList({ roomId }) {
  const { user } = useAuth();
  const [people, setPeople] = useState([]);

  useEffect(() => {
    if (!roomId) return;
    const unsub = db
      .collection("rooms").doc(roomId)
      .collection("presence")
      .orderBy("lastActive", "desc")
      .onSnapshot(s =>
        setPeople(s.docs.map(d => ({ id: d.id, ...d.data() })))
      );
    return unsub;
  }, [roomId]);

  return (
    <div className="online-list">
      <div className="online-title">Online</div>
      <ul>
        {people.length === 0 && <li className="online-empty">no one yet</li>}
        {people.map(p => {
          const name = p.displayName || p.email || p.id;
          const letter = (name?.[0] || "?").toUpperCase();
          const isMe = user?.uid === p.id;

          return (
            <li key={p.id} className="online-item">
              {p.photoURL ? (
                <img
                  className="online-ava"
                  src={p.photoURL}
                  alt=""
                  referrerPolicy="no-referrer"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              ) : (
                <div
                  className="online-ava"
                  style={{
                    display: "grid",
                    placeItems: "center",
                    background: "linear-gradient(135deg, #93c5fd, #60a5fa)",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 700
                  }}
                >
                  {letter}
                </div>
              )}
              <span className="online-name">
                {name}{isMe ? " (you)" : ""}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
