import { useEffect, useRef } from "react";
import firebase, { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

export default function usePresence(roomId) {
  const { user } = useAuth();
  const prevRoom = useRef(null);
  const tick = useRef(null);

  useEffect(() => {
    if (!user || !roomId) return;

    // убрать presence из прошлой комнаты
    if (prevRoom.current && prevRoom.current !== roomId) {
      db.collection("rooms").doc(prevRoom.current)
        .collection("presence").doc(user.uid).delete().catch(() => {});
    }
    prevRoom.current = roomId;

    const ref = db.collection("rooms").doc(roomId).collection("presence").doc(user.uid);

    const write = () => ref.set({
      displayName: user.displayName || user.email,
      photoURL: user.photoURL || "",
      lastActive: firebase.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    write();
    tick.current = setInterval(write, 25_000);

    const onLeave = () => {
      navigator.sendBeacon?.("", ""); // noop — просто чтобы событие дошло
      ref.delete().catch(() => {});
    };
    window.addEventListener("beforeunload", onLeave);

    return () => {
      clearInterval(tick.current);
      window.removeEventListener("beforeunload", onLeave);
      ref.delete().catch(() => {});
    };
  }, [user, roomId]);
}
