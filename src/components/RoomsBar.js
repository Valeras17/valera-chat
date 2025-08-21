import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import firebase, { db } from "../firebase";

export default function RoomsBar({ activeRoomId, onSelect }) {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const unsub = db
      .collection("rooms")
      .orderBy("updatedAt", "desc")
      .onSnapshot(s =>
        setRooms(s.docs.map(d => ({ id: d.id, ...d.data() })))
      );
    return unsub;
  }, []);

  const createRoom = async () => {
    const name = prompt("Room name?");
    if (!name || !user) return;
    const now = firebase.firestore.FieldValue.serverTimestamp();

    const ref = await db.collection("rooms").add({
      name,
      createdBy: user.uid,
      updatedAt: now,
    });
    onSelect(ref.id);
  };

  const removeRoom = async (id, createdBy) => {
    if (createdBy !== user?.uid) return alert("Only owner can delete.");
    if (!window.confirm("Delete room?")) return;

    // удаляем сообщения батчами (минимально)
    const msgs = await db.collection("rooms").doc(id).collection("messages").limit(500).get();
    const batch = db.batch();
    msgs.forEach(d => batch.delete(d.ref));
    batch.delete(db.collection("rooms").doc(id));
    await batch.commit();

    if (activeRoomId === id) onSelect("general");
  };

  return (
    <>
      <button className="new-room" onClick={createRoom}>+ New room</button>
      {rooms.map(r => (
        <div key={r.id} className={`room-row ${activeRoomId === r.id ? "active" : ""}`}>
          <button className="room-btn" onClick={() => onSelect(r.id)} title={r.id}>
            {r.name || r.id}
          </button>
          {r.createdBy === user?.uid && (
            <button className="room-del" onClick={() => removeRoom(r.id, r.createdBy)}>✕</button>
          )}
        </div>
      ))}
    </>
  );
}
