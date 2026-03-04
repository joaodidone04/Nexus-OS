// ═══════════════════════════════════════════════════════════
//  NΞXUS — AuthContext  (src/context/AuthContext.jsx)
//  Substitui o NexusContext.  Envolve toda a app com
//  autenticação Firebase + perfil Firestore em tempo real.
// ═══════════════════════════════════════════════════════════
import {
  createContext, useContext, useEffect, useRef, useState, useCallback,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup, signInWithRedirect, getRedirectResult,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, updateProfile, sendPasswordResetEmail,
  linkWithPopup,
} from "firebase/auth";
import { auth, googleProvider, appleProvider } from "../firebase/config";
import { upsertUserProfile, subscribeUserProfile, updateUserProfile } from "../firebase/userService";

// ──────────────────────────────────────────────
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// ──────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(undefined); // undefined = carregando
  const [profile,      setProfile]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [authError,    setAuthError]    = useState("");
  const [xpToast,      setXpToast]      = useState(null); // { xp, label, icon, levelUp, rankUp }
  const profileUnsub     = useRef(null);
  const redirectHandled  = useRef(false); // evita double-bootstrap redirect + onAuthStateChanged

  // ── Listener de auth state ───────────────────
  useEffect(() => {
    // Resultado de redirect (Google/Apple em mobile)
    getRedirectResult(auth).then(async (result) => {
      if (result?.user) {
        redirectHandled.current = true;
        await bootstrapUser(result.user);
      }
    }).catch((err) => {
      console.error("getRedirectResult error:", err);
      setLoading(false);
    });

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Se o redirect já fez o bootstrap, evita duplicar
        if (redirectHandled.current) {
          redirectHandled.current = false;
          return;
        }
        await bootstrapUser(user);
      } else {
        // Deslogou
        profileUnsub.current?.();
        setFirebaseUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => { unsub(); profileUnsub.current?.(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Inicializa usuário após login ────────────
  async function bootstrapUser(user) {
    setFirebaseUser(user);
    // Cria/atualiza perfil no Firestore
    await upsertUserProfile(user);
    // Listener em tempo real no perfil
    profileUnsub.current?.();
    profileUnsub.current = subscribeUserProfile(user.uid, (data) => {
      setProfile(data);
      setLoading(false);
    });
  }

  // ──────────────────────────────────────────────
  //  MÉTODOS DE AUTH
  // ──────────────────────────────────────────────

  /** Login com Google (popup desktop, redirect mobile) */
  const signInWithGoogle = useCallback(async () => {
    setAuthError("");
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    try {
      if (isMobile) {
        // signInWithRedirect causa reload — a Promise não resolve na mesma sessão
        await signInWithRedirect(auth, googleProvider);
      } else {
        const result = await signInWithPopup(auth, googleProvider);
        await bootstrapUser(result.user);
      }
    } catch (err) {
      setAuthError(friendlyError(err.code));
      throw err;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Login com Apple */
  const signInWithApple = useCallback(async () => {
    setAuthError("");
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    try {
      if (isMobile) {
        await signInWithRedirect(auth, appleProvider);
      } else {
        const result = await signInWithPopup(auth, appleProvider);
        await bootstrapUser(result.user);
      }
    } catch (err) {
      setAuthError(friendlyError(err.code));
      throw err;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Cadastro com e-mail + senha */
  const signUpWithEmail = useCallback(async (email, password, displayName) => {
    setAuthError("");
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName });
      await bootstrapUser(user);
    } catch (err) {
      setAuthError(friendlyError(err.code));
      throw err;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Login com e-mail + senha */
  const signInWithEmail = useCallback(async (email, password) => {
    setAuthError("");
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      await bootstrapUser(user);
    } catch (err) {
      setAuthError(friendlyError(err.code));
      throw err;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Reset de senha */
  const resetPassword = useCallback(async (email) => {
    setAuthError("");
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      setAuthError(friendlyError(err.code));
      throw err;
    }
  }, []);

  /** Logout */
  const logout = useCallback(async () => {
    profileUnsub.current?.();
    await signOut(auth);
    setFirebaseUser(null);
    setProfile(null);
  }, []);

  /** Atualizar perfil (nome, bio, photoURL, settings) */
  const updateMyProfile = useCallback(async (fields) => {
    if (!firebaseUser) return;
    if (fields.displayName) {
      await updateProfile(firebaseUser, { displayName: fields.displayName });
    }
    await updateUserProfile(firebaseUser.uid, fields);
  }, [firebaseUser]);

  /** Mostra notificação de XP na tela */
  const showXPToast = useCallback((data) => {
    setXpToast(data);
    setTimeout(() => setXpToast(null), 3500);
  }, []);

  // ──────────────────────────────────────────────
  const value = {
    // Estado
    firebaseUser,
    profile,
    loading,
    authError,
    xpToast,
    isAuthenticated: !!firebaseUser && !loading,

    // Auth
    signInWithGoogle,
    signInWithApple,
    signUpWithEmail,
    signInWithEmail,
    resetPassword,
    logout,

    // Perfil
    updateMyProfile,
    showXPToast,
    clearError: () => setAuthError(""),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ──────────────────────────────────────────────
//  MENSAGENS DE ERRO AMIGÁVEIS
// ──────────────────────────────────────────────
function friendlyError(code) {
  const map = {
    "auth/email-already-in-use":    "Este e-mail já está em uso.",
    "auth/invalid-email":           "E-mail inválido.",
    "auth/weak-password":           "Senha muito fraca. Mínimo 6 caracteres.",
    "auth/user-not-found":          "Operador não encontrado.",
    "auth/wrong-password":          "Chave de acesso incorreta.",
    "auth/too-many-requests":       "Muitas tentativas. Aguarde um momento.",
    "auth/popup-closed-by-user":    "Login cancelado.",
    "auth/cancelled-popup-request": "Login cancelado.",
    "auth/network-request-failed":  "Falha de conexão. Verifique sua internet.",
    "auth/account-exists-with-different-credential":
      "Este e-mail já está vinculado a outro método de login.",
  };
  return map[code] || "Erro inesperado. Tente novamente.";
}