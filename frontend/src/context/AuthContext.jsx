// ═══════════════════════════════════════════════════════════
//  NΞXUS — AuthContext  (src/context/AuthContext.jsx)
//  Firebase Auth + Perfil Firestore (real-time) — robusto mobile
// ═══════════════════════════════════════════════════════════
import {
  createContext, useContext, useEffect, useRef, useState, useCallback,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

import { auth, googleProvider, appleProvider } from "../firebase/config";
import {
  upsertUserProfile,
  subscribeUserProfile,
  updateUserProfile,
} from "../firebase/userService";

// ──────────────────────────────────────────────
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// ──────────────────────────────────────────────
export function AuthProvider({ children }) {
  // undefined = ainda carregando o estado inicial do Firebase
  const [firebaseUser, setFirebaseUser] = useState(undefined);
  const [profile, setProfile] = useState(null);

  // Loading separado (isso aqui é a chave do teu bug)
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [authError, setAuthError] = useState("");
  const [xpToast, setXpToast] = useState(null);

  const profileUnsub = useRef(null);
  const bootstrapping = useRef(false);

  // ── Inicializa persistência + redirect result + auth listener ──
  useEffect(() => {
  let mounted = true;

  async function initAuth() {

    try {
      await setPersistence(auth, browserLocalPersistence);
    } catch {}

    // 🔥 IMPORTANTE PARA iOS
    try {
      const result = await getRedirectResult(auth);

      if (result?.user && mounted) {
        setFirebaseUser(result.user);
        setLoadingAuth(false);
        safeBootstrapProfile(result.user);
        return;
      }

    } catch (err) {
      console.log("redirect error:", err);
    }

    const unsub = onAuthStateChanged(auth, async (user) => {

      if (!mounted) return;

      setLoadingAuth(false);

      if (user) {
        setFirebaseUser(user);
        safeBootstrapProfile(user);
      } else {
        profileUnsub.current?.();
        setFirebaseUser(null);
        setProfile(null);
        setLoadingProfile(false);
      }

    });

    return () => unsub();
  }

  initAuth();

  return () => {
    mounted = false;
    profileUnsub.current?.();
  };

}, []);

  // ── Bootstrap do perfil (não travar auth se falhar) ──
  async function safeBootstrapProfile(user) {
    // evita rodar em paralelo múltiplas vezes
    if (bootstrapping.current) return;
    bootstrapping.current = true;

    setLoadingProfile(true);

    try {
      // cria/atualiza perfil
      await upsertUserProfile(user);

      // sub em tempo real
      profileUnsub.current?.();
      profileUnsub.current = subscribeUserProfile(user.uid, (data) => {
        setProfile(data || null);
        setLoadingProfile(false);
      });

      // ⚠️ fallback: se por qualquer motivo o subscribe não disparar,
      // não deixa loadingProfile travar pra sempre
      setTimeout(() => {
        setLoadingProfile((prev) => (prev ? false : prev));
      }, 5000);
    } catch (err) {
      console.error("bootstrap profile error:", err);
      // Se der erro de regra/permissão, você ainda está logado
      setLoadingProfile(false);
      // opcional: setAuthError("Perfil indisponível no momento.");
    } finally {
      bootstrapping.current = false;
    }
  }

  // ──────────────────────────────────────────────
  //  MÉTODOS DE AUTH
  // ──────────────────────────────────────────────

  const signInWithGoogle = useCallback(async () => {
    setAuthError("");
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

    try {
      if (isMobile) {
        await signInWithRedirect(auth, googleProvider);
        return; // vai recarregar
      }

      const result = await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged vai cuidar, mas isso acelera no desktop:
      setFirebaseUser(result.user);
      safeBootstrapProfile(result.user);
    } catch (err) {
      setAuthError(friendlyError(err.code));
      throw err;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signInWithApple = useCallback(async () => {
    setAuthError("");
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

    try {
      if (isMobile) {
        await signInWithRedirect(auth, appleProvider);
        return;
      }

      const result = await signInWithPopup(auth, appleProvider);
      setFirebaseUser(result.user);
      safeBootstrapProfile(result.user);
    } catch (err) {
      setAuthError(friendlyError(err.code));
      throw err;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signUpWithEmail = useCallback(async (email, password, displayName) => {
    setAuthError("");
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName });
      setFirebaseUser(user);
      safeBootstrapProfile(user);
    } catch (err) {
      setAuthError(friendlyError(err.code));
      throw err;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signInWithEmail = useCallback(async (email, password) => {
    setAuthError("");
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      setFirebaseUser(user);
      safeBootstrapProfile(user);
    } catch (err) {
      setAuthError(friendlyError(err.code));
      throw err;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetPassword = useCallback(async (email) => {
    setAuthError("");
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      setAuthError(friendlyError(err.code));
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      profileUnsub.current?.();
      await signOut(auth);
    } finally {
      setFirebaseUser(null);
      setProfile(null);
      setLoadingProfile(false);
    }
  }, []);

  const updateMyProfile = useCallback(async (fields) => {
    if (!firebaseUser) return;

    if (fields.displayName) {
      await updateProfile(firebaseUser, { displayName: fields.displayName });
    }
    await updateUserProfile(firebaseUser.uid, fields);
  }, [firebaseUser]);

  const showXPToast = useCallback((data) => {
    setXpToast(data);
    setTimeout(() => setXpToast(null), 3500);
  }, []);

  // ✅ Agora “logado” é só Firebase Auth, não depende do Firestore
  const isAuthenticated = !!firebaseUser;

  const value = {
    firebaseUser,
    profile,
    loadingAuth,
    loadingProfile,
    // se você quiser manter compatibilidade:
    loading: loadingAuth || loadingProfile,

    authError,
    xpToast,

    isAuthenticated,

    signInWithGoogle,
    signInWithApple,
    signUpWithEmail,
    signInWithEmail,
    resetPassword,
    logout,

    updateMyProfile,
    showXPToast,
    clearError: () => setAuthError(""),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ──────────────────────────────────────────────
//  ERROS AMIGÁVEIS
// ──────────────────────────────────────────────
function friendlyError(code) {
  const map = {
    "auth/email-already-in-use": "Este e-mail já está em uso.",
    "auth/invalid-email": "E-mail inválido.",
    "auth/weak-password": "Senha muito fraca. Mínimo 6 caracteres.",
    "auth/user-not-found": "Operador não encontrado.",
    "auth/wrong-password": "Chave de acesso incorreta.",
    "auth/too-many-requests": "Muitas tentativas. Aguarde um momento.",
    "auth/popup-closed-by-user": "Login cancelado.",
    "auth/cancelled-popup-request": "Login cancelado.",
    "auth/network-request-failed": "Falha de conexão. Verifique sua internet.",
    "auth/account-exists-with-different-credential":
      "Este e-mail já está vinculado a outro método de login.",
  };
  return map[code] || "Erro inesperado. Tente novamente.";
}