import { useEffect, useState } from "react";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
} from "firebase/auth";
import app from "../firebase/config";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export default function AuthTest() {
  const [msg, setMsg] = useState("init");

  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setMsg(`REDIRECT OK: ${result.user.email}`);
        } else {
          setMsg("redirect sem user");
        }
      })
      .catch((err) => {
        setMsg(`redirect error: ${err.code} | ${err.message}`);
      });

    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setMsg(`AUTH STATE OK: ${user.email}`);
      }
    });

    return () => unsub();
  }, []);

  return (
    <div style={{ padding: 24, color: "#fff", background: "#000", minHeight: "100vh" }}>
      <h1>Auth Test</h1>
      <p>{msg}</p>
      <button onClick={() => signInWithRedirect(auth, provider)}>
        Login Google
      </button>
    </div>
  );
}