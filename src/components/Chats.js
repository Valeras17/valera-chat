import React, { useState } from "react";
import { auth } from "../firebase";
import RoomsBar from "./RoomsBar";
import MessageList from "./MessageList";
import Composer from "./Composer";
import usePresence from "../hooks/usePresence";
import OnlineList from "./OnlineList";

export default function Chats() {
  const [roomId, setRoomId] = useState("general");
  const [menuOpen, setMenuOpen] = useState(false);

  usePresence(roomId);

  return (
    <div className="chats-page">
      <div className="nav-bar">
        <button
          className="rooms-toggle"
          aria-label="Open rooms"
          onClick={() => setMenuOpen(v => !v)}
        >
          <span></span><span></span><span></span>
        </button>

        <div className="logo-tab">ValeraChat</div>
        <button className="logout-tab" onClick={() => auth.signOut()}>
          Logout
        </button>
      </div>

      <div className={`chats-body ${menuOpen ? "rooms-open" : ""}`}>
        <aside className="rooms-bar" onClick={() => setMenuOpen(false)}>
          <RoomsBar activeRoomId={roomId} onSelect={setRoomId} />
          <OnlineList roomId={roomId} />
        </aside>

        <div className="backdrop" onClick={() => setMenuOpen(false)} />

        <section className="chat-main">
          <MessageList roomId={roomId} />
          <Composer roomId={roomId} />
        </section>
      </div>
    </div>
  );
}
