"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";


// =====================================================
// TYPES
// =====================================================

export type PosUser = {
  userId: string;
  outletId: string;
  fullName: string;
  username: string;
  mobile: string;
  employeeId: string;
  role: string;
};

export interface PosAuthContextType {
  currentUser: PosUser | null;
  session: PosSession | null;

  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoading: boolean;
  isLoggingIn: boolean;

  login: (userId: string, pin: string) => Promise<PosLoginResult>;

  logout: () => Promise<void>;
  lock: () => void;
}
// =====================================================
// POS SESSION
// =====================================================

export type PosSession = {
  sessionId: string;
  userId: string;
  outletId: string;
  fullName: string;
  employeeId: string | null;
  role: string | null;
  loginAt: number;
  logoutAt: number | null;
  lastActivityAt: number;
  isActive: number;
};


// =====================================================
// LOGIN RESULT
// =====================================================

export type PosLoginResult = {
  success: boolean;
  user?: PosUser;
  session?: PosSession;
  error?: string;
};


// =====================================================
// CONTEXT TYPE
// =====================================================



// =====================================================
// CONTEXT
// =====================================================

const PosAuthContext =
  createContext<PosAuthContextType | undefined>(
    undefined
  );


// =====================================================
// PROVIDER
// =====================================================

export function PosAuthProvider({
  children,
}: {
  children: ReactNode;
}) {

  // ===================================================
  // CURRENT USER
  // ===================================================

  const [currentUser, setCurrentUser] =
    useState<PosUser | null>(null);


  // ===================================================
  // CURRENT SESSION
  // ===================================================

  const [session, setSession] =
    useState<PosSession | null>(null);


  // ===================================================
  // AUTH INITIALIZATION
  // ===================================================

  const [isInitializing, setIsInitializing] =
    useState(true);


  // ===================================================
  // LOGIN STATE
  // ===================================================

  const [isLoggingIn, setIsLoggingIn] =
    useState(false);


  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {

    // -------------------------------------------------
    // We currently do NOT restore the session
    // automatically when Electron starts.
    //
    // The user must login again after application
    // restart.
    // -------------------------------------------------

    setIsInitializing(false);

  }, []);


  // ===================================================
  // LOGIN
  // ===================================================

  const login = async (
    userId: string,
    pin: string
  ): Promise<PosLoginResult> => {

    // -------------------------------------------------
    // Prevent duplicate login requests
    // -------------------------------------------------

    if (isLoggingIn) {

      return {
        success: false,
        error: "Login already in progress.",
      };

    }


    try {

      setIsLoggingIn(true);


      // =================================================
      // ELECTRON AUTHENTICATION
      // =================================================

      const result =
        await window.posApi.loginUser({
          userId,
          pin,
        });


      // =================================================
      // LOGIN FAILED
      // =================================================

      if (!result?.success) {

        setCurrentUser(null);

        setSession(null);

        return {
          success: false,
          error:
            result?.error ||
            "Invalid user or PIN.",
        };

      }


      // =================================================
      // USER NOT RETURNED
      // =================================================

      if (!result.user) {

        setCurrentUser(null);

        setSession(null);

        return {
          success: false,
          error:
            "Login succeeded but user information was not returned.",
        };

      }


      // =================================================
      // SESSION NOT RETURNED
      // =================================================

      if (!result.session) {

        setCurrentUser(null);

        setSession(null);

        return {
          success: false,
          error:
            "Login succeeded but POS session was not created.",
        };

      }


      // =================================================
      // LOGIN SUCCESS
      // =================================================

      setCurrentUser(
        result.user
      );

      setSession(
        result.session
      );


      return {
        success: true,
        user: result.user,
        session: result.session,
      };


    } catch (error) {

      console.error(
        "POS login error:",
        error
      );


      setCurrentUser(null);

      setSession(null);


      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Login failed.",
      };


    } finally {

      setIsLoggingIn(false);

    }
  };


  // ===================================================
  // LOGOUT
  // ===================================================

  const logout = async () => {

    try {

      // -------------------------------------------------
      // Close the current Electron POS session.
      // -------------------------------------------------

      if (
        window.posApi &&
        typeof window.posApi.logoutUser ===
        "function"
      ) {

        await window.posApi.logoutUser(
          session?.sessionId
        );

      }

    } catch (error) {

      console.error(
        "POS logout error:",
        error
      );

    } finally {

      // -------------------------------------------------
      // Clear renderer authentication state.
      // -------------------------------------------------

      setCurrentUser(null);

      setSession(null);

    }
  };


  // ===================================================
  // LOCK
  // ===================================================

  const lock = () => {

    // -------------------------------------------------
    // For now lock only clears renderer authentication.
    //
    // We will later implement a real locked state where
    // the same session remains active and PIN is required
    // to unlock it.
    // -------------------------------------------------

    setCurrentUser(null);

    setSession(null);

  };


  // ===================================================
  // CONTEXT VALUE
  // ===================================================


const value: PosAuthContextType = {
  currentUser,
  session,

  isAuthenticated: currentUser !== null,
  isInitializing,

  isLoggingIn,
  isLoading: isLoggingIn,

  login,
  logout,
  lock,
};



  // ===================================================
  // PROVIDER
  // ===================================================

  return (
    <PosAuthContext.Provider
      value={value}
    >
      {children}
    </PosAuthContext.Provider>
  );
}


// =====================================================
// HOOK
// =====================================================

export function usePosAuth() {

  const context =
    useContext(PosAuthContext);


  if (!context) {

    throw new Error(
      "usePosAuth must be used inside PosAuthProvider"
    );

  }


  return context;
}