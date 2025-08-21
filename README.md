Here’s a clean, English README you can drop into your repo as `README.md`:

---

# ValeraChat

A real-time group chat built with **React + Firebase** featuring rooms, per-room online presence, and a polished responsive UI.

![stack](https://img.shields.io/badge/React-18-blue)
![stack](https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-orange)
![stack](https://img.shields.io/badge/Realtime-enabled-success)
![stack](https://img.shields.io/badge/UI-Responsive-informational)
<img width="760" height="1595" alt="image" src="https://github.com/user-attachments/assets/ef9b240f-59a8-4334-9ae2-a347580a9c92" />

<img width="1485" height="1403" alt="image" src="https://github.com/user-attachments/assets/59806cfe-895e-4782-bea9-eda7bb0591d0" />
<img width="1503" height="1672" alt="image" src="https://github.com/user-attachments/assets/58a0bd50-cb47-4f3d-8cdb-a287f8423e24" />
<img width="1493" height="1131" alt="image" src="https://github.com/user-attachments/assets/b622570b-7e8e-42a4-bf60-e9b8d49bed33" />
<img width="1498" height="1121" alt="image" src="https://github.com/user-attachments/assets/79a387e9-0995-48da-b2f8-4e83a3a3abcc" />




---

## ✨ Features

* **Google sign-in** (Firebase Auth)
* **Rooms** with `updatedAt` sorting
* **Realtime messages**: `rooms/{roomId}/messages`
* **Who’s online** per room: `rooms/{roomId}/presence`
  (`usePresence` hook updates `lastActive`)
* **Security rules** enforce:

  * read by any authenticated user
  * message creation by the author only (validated fields)
  * room rename/delete by the room owner; owner can clean messages
* Modern UI: gradient top bar, message bubbles, mobile **off-canvas** sidebar, soft shadows & animations
* Production-ready Firestore **Rules** (below)

---

## 🧱 Tech stack

* React (Context API)
* Firebase Auth (Google), Cloud Firestore (realtime)
* Plain CSS (responsive, custom scrollbars)
* Create React App + ESLint

---

## 📁 Project structure

```
valera-chat/
  public/                 static assets, favicons, manifest
  src/
    components/           RoomsBar, MessageList, Composer, OnlineList, Login…
    contexts/             AuthContext
    hooks/                usePresence
    firebase.js           Firebase init (auth, db, providers)
    index.css             full app styling
    index.js              app entry
  .env.local.example      environment variables template
```

---

## 🚀 Quick start

1. **Clone**

```bash
git clone https://github.com/Valeras17/valera-vhat.git
cd valera-vhat
```

2. **Environment variables**

```bash
cp .env.local.example .env.local
```

Fill with your Firebase config:

```dotenv
REACT_APP_FIREBASE_API_KEY=xxxx
REACT_APP_FIREBASE_AUTH_DOMAIN=xxxx.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=xxxx
REACT_APP_FIREBASE_STORAGE_BUCKET=xxxx.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=xxxx
REACT_APP_FIREBASE_APP_ID=1:xxxx:web:xxxx
# optional:
REACT_APP_FIREBASE_MEASUREMENT_ID=G-xxxx
```

3. **Install & run**

```bash
npm install
npm start
```

Open `http://localhost:3000`.

---

## ⚙️ Firebase setup

1. Create a Firebase project → **Web app** → copy the config.
2. Enable **Authentication → Sign-in method → Google**.
3. Create **Cloud Firestore** (any mode; we’ll use Rules).
4. Paste these **Firestore Rules**:

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {

    function authed() { return request.auth != null; }
    function isRoomOwner(roomId) {
      return authed() &&
             get(/databases/$(db)/documents/rooms/$(roomId)).data.createdBy
               == request.auth.uid;
    }

    match /rooms/{roomId} {
      // list/read rooms — any authenticated user
      allow read: if authed();

      // create a room
      allow create: if authed()
        && request.resource.data.keys().hasOnly(['name','createdBy','updatedAt'])
        && request.resource.data.createdBy == request.auth.uid
        && request.resource.data.name is string
        && request.resource.data.name.size() > 0;

      // update room:
      // - any authed user may touch only 'updatedAt' (timestamp)
      // - owner may change 'name' (+ optional 'updatedAt')
      allow update: if authed() && (
        (
          request.resource.data.diff(resource.data).changedKeys().hasOnly(['updatedAt']) &&
          request.resource.data.updatedAt is timestamp
        ) || (
          resource.data.createdBy == request.auth.uid &&
          request.resource.data.diff(resource.data).changedKeys().hasOnly(['name','updatedAt']) &&
          (!('updatedAt' in request.resource.data) || request.resource.data.updatedAt is timestamp)
        )
      );

      // delete room — owner only
      allow delete: if authed() && resource.data.createdBy == request.auth.uid;

      // messages in a room
      match /messages/{msgId} {
        allow read: if authed();
        allow create: if authed()
          && request.resource.data.uid == request.auth.uid
          && request.resource.data.text is string
          && request.resource.data.text.size() > 0
          && request.resource.data.createdAt is timestamp;

        // author can edit own message
        allow update: if authed() && resource.data.uid == request.auth.uid;

        // author can delete own OR room owner can clean
        allow delete: if authed() &&
          (resource.data.uid == request.auth.uid || isRoomOwner(roomId));
      }

      // presence (who’s online)
      match /presence/{uid} {
        allow read: if authed();
        allow create, update: if authed()
          && request.auth.uid == uid
          && request.resource.data.keys().hasOnly(['displayName','photoURL','lastActive'])
          && request.resource.data.lastActive is timestamp;
        allow delete: if authed() && (request.auth.uid == uid || isRoomOwner(roomId));
      }
    }
  }
}
```

---

## 🔑 `src/firebase.js` example

```js
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const db = firebase.firestore();
export const googleProvider = new firebase.auth.GoogleAuthProvider();

export default firebase;
```

> 🔒 `.env.local` is **git-ignored**. Only `.env.local.example` is committed.

---

## 🧭 NPM scripts

```bash
npm start       # dev server
npm run build   # production build
```

---

## 📌 Usage

* Click **Sign in with Google**
* Create a room in the left sidebar (**+ New room**)
* Type and press **Enter** to send (Shift+Enter for newline)
* Online list shows active users in the current room
* On mobile, the rooms sidebar opens as an off-canvas panel

---

## 🧩 Notes

* Firebase config keys in the client are not secrets; **Rules** protect your data.
* The UI is fully responsive; desktop and mobile layouts are optimized.
* Owner can rename/delete rooms; everyone can bump `updatedAt` via activity.

---

## 📄 License

MIT — feel free to use and modify. If you like it, a ⭐ on the repo is appreciated!
