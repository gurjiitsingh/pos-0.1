"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Delete,
  LogIn,
  UserRound,
} from "lucide-react";

import {
  usePosTheme,
} from "@/PosThemeStore/PosThemeContext";

import {
  usePosAuth,
  PosUser,
} from "@/store/PosAuthContext";
import SyncButton from "@/app/(home)/SyncButton"; 


// =====================================================
// COMPONENT
// =====================================================

export default function LoginScreen() {
  const {
    login,
    isLoading: authLoading,
  } = usePosAuth();

  const {
    background,
  } = usePosTheme();


  // ===================================================
  // STATE
  // ===================================================

  const [users, setUsers] =
    useState<PosUser[]>([]);

  const [selectedUser, setSelectedUser] =
    useState<PosUser | null>(null);

  const [pin, setPin] =
    useState("");

  const [loadingUsers, setLoadingUsers] =
    useState(true);

  const [error, setError] =
    useState("");


  // ===================================================
  // LOAD USERS
  // ===================================================

  useEffect(() => {
    loadUsers();
  }, []);


  async function loadUsers() {
    try {
      setLoadingUsers(true);
      setError("");

      const result =
        await window.posApi.getPosLoginUsers();

      if (!result?.success) {
        setError(
          result?.error ||
          "Failed to load users."
        );

        return;
      }

      setUsers(
        result.users || []
      );

    } catch (error) {
      console.error(
        "Failed to load POS users:",
        error
      );

      setError(
        "Unable to load POS users."
      );

    } finally {
      setLoadingUsers(false);
    }
  }


  // ===================================================
  // SELECT USER
  // ===================================================

  function handleSelectUser(
    user: PosUser
  ) {
    setSelectedUser(user);
    setPin("");
    setError("");
  }


  // ===================================================
  // PIN
  // ===================================================

  function handlePin(
    value: string
  ) {
    if (!selectedUser) {
      return;
    }

    if (pin.length >= 6) {
      return;
    }

    setPin(
      `${pin}${value}`
    );

    setError("");
  }


  // ===================================================
  // DELETE
  // ===================================================

  function handleDelete() {
    setPin(
      pin.slice(0, -1)
    );

    setError("");
  }


  // ===================================================
  // LOGIN
  // ===================================================

  async function handleLogin() {
    if (!selectedUser) {
      setError(
        "Select an employee first."
      );

      return;
    }

    if (!pin) {
      setError(
        "Enter your PIN."
      );

      return;
    }

    const result =
      await login(
        selectedUser.userId,
        pin
      );

    if (!result.success) {
      setError(
        result.error ||
        "Invalid PIN."
      );

      setPin("");
    }
  }


  // ===================================================
  // KEYBOARD
  // ===================================================

  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (!selectedUser) {
        return;
      }

      if (
        event.key >= "0" &&
        event.key <= "9"
      ) {
        handlePin(event.key);
        return;
      }

      if (
        event.key === "Backspace"
      ) {
        handleDelete();
        return;
      }

      if (
        event.key === "Enter"
      ) {
        handleLogin();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    selectedUser,
    pin,
  ]);


  // ===================================================
  // LOADING
  // ===================================================

  if (loadingUsers) {
    return (
      <div
        className={`
          h-full
          min-h-screen
          flex
          items-center
          justify-center
          ${background.className}
          ${background.text}
        `}
      >
        <div
          className="
            text-sm
            opacity-60
          "
        >
          Loading POS...
        </div>
      </div>
    );
  }


  // ===================================================
  // LOGIN SCREEN
  // ===================================================

  return (
<div
  className="
    w-full
    h-full
    flex
    items-center
    justify-center
    overflow-hidden
    bg-transparent
    z-50
  "
>

      {/* =================================================
          COMPACT POS LOGIN
      ================================================= */}

      <div
        className="
          w-[760px]
          max-w-[calc(100vw-32px)]
          rounded-2xl
          border
          border-black/10
          dark:border-white/10
          shadow-2xl
          overflow-hidden
         bg-white dark:bg-slate-900
text-slate-900 dark:text-slate-100
backdrop-blur-md
border-slate-300 dark:border-slate-700
        "
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="
            h-[64px]
            px-5
            flex
            items-center
            justify-between
            border-b
            border-black/10
            dark:border-white/10
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <div
              className="
                w-9
                h-9
                rounded-xl
                flex
                items-center
                justify-center
                bg-black/10
                dark:bg-white/10
              "
            >
              <UserRound
                size={18}
              />
            </div>

            <div>

              <div
                className="
                  text-sm
                  font-semibold
                  leading-tight
                "
              >
                POS Login
              </div>
  
              <div
                className="
                  text-[11px]
                  opacity-50
                  leading-tight
                  mt-0.5
                "
              >
                Select employee to continue
              </div>

            </div>

          </div>


          {/* STATUS */}

          <div
            className="
              flex
              items-center
              gap-2
              text-[11px]
              opacity-50
            "
          >
            <SyncButton />
            <span
              className="
                w-2
                h-2
                rounded-full
                bg-emerald-500
              "
            />

            POS Ready

          </div>

        </div>


        {/* =================================================
            BODY
        ================================================= */}

        <div
          className="
            flex
            min-h-[430px]
          "
        >

          {/* =================================================
              EMPLOYEES
          ================================================= */}

          <div
            className="
              flex-1
              min-w-0
              p-5
              border-r
              border-black/10
              dark:border-white/10
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
                mb-3
              "
            >

              <div
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  opacity-60
                "
              >
                Employees
              </div>

              <div
                className="
                  text-[11px]
                  opacity-40
                "
              >
                {users.length} users
              </div>

            </div>


            {/* USER LIST */}

            {users.length === 0 ? (
              <div
                className="
                  h-[340px]
                  flex
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-dashed
                  border-black/10
                  dark:border-white/10
                  text-xs
                  opacity-50
                "
              >
                No POS users available
              </div>
            ) : (

              <div
                className="
                  grid
                  grid-cols-3
                  gap-2
                  max-h-[360px]
                  overflow-y-auto
                  app-scrollbar
                  pr-1
                "
              >

                {users.map(
                  (user) => {

                    const selected =
                      selectedUser?.userId ===
                      user.userId;

                    const initial =
                      user.fullName
                        ?.charAt(0)
                        ?.toUpperCase() ||
                      "?";

                    return (
                      <button
                        key={
                          user.userId
                        }
                        type="button"
                        onClick={() =>
                          handleSelectUser(
                            user
                          )
                        }
                        className={`
                          h-[82px]
                          rounded-xl
                          border
                          px-3
                          py-2
                          text-left
                          transition
                          active:scale-[0.98]

                          ${
                            selected
                              ? `
                                border-blue-500/70
                                bg-blue-500/10
                                ring-1
                                ring-blue-500/40
                              `
                              : `
                                border-black/10
                                dark:border-white/10
                                bg-black/[0.02]
                                dark:bg-white/[0.025]
                                hover:bg-black/[0.05]
                                dark:hover:bg-white/[0.06]
                              `
                          }
                        `}
                      >

                        <div
                          className="
                            flex
                            items-center
                            gap-2.5
                          "
                        >

                          {/* AVATAR */}

                          <div
                            className={`
                              w-9
                              h-9
                              shrink-0
                              rounded-lg
                              flex
                              items-center
                              justify-center
                              text-sm
                              font-semibold

                              ${
                                selected
                                  ? `
                                    bg-blue-500
                                    text-white
                                  `
                                  : `
                                    bg-black/10
                                    dark:bg-white/10
                                  `
                              }
                            `}
                          >
                            {initial}
                          </div>


                          {/* NAME */}

                          <div
                            className="
                              min-w-0
                            "
                          >

                            <div
                              className="
                                text-xs
                                font-semibold
                                truncate
                              "
                            >
                              {user.fullName}
                            </div>

                            <div
                              className="
                                text-[10px]
                                uppercase
                                opacity-45
                                mt-0.5
                                truncate
                              "
                            >
                              {user.role}
                            </div>

                          </div>

                        </div>

                      </button>
                    );
                  }
                )}

              </div>
            )}

          </div>


          {/* =================================================
              PIN PANEL
          ================================================= */}

          <div
            className="
              w-[285px]
              shrink-0
              p-5
              flex
              flex-col
            "
          >

            {/* USER */}

            <div
              className="
                text-center
                min-h-[48px]
              "
            >

              {selectedUser ? (
                <>
                  <div
                    className="
                      text-sm
                      font-semibold
                      truncate
                    "
                  >
                    {selectedUser.fullName}
                  </div>

                  <div
                    className="
                      text-[10px]
                      uppercase
                      opacity-45
                      mt-0.5
                    "
                  >
                    {selectedUser.role}
                  </div>
                </>
              ) : (
                <div
                  className="
                    text-xs
                    opacity-45
                    pt-3
                  "
                >
                  Select an employee
                </div>
              )}

            </div>


            {/* PIN DISPLAY */}

            <div
              className="
                h-[42px]
                mt-3
                mb-3
                rounded-lg
                border
                border-black/10
                dark:border-white/10
                bg-black/[0.03]
                dark:bg-white/[0.03]
                flex
                items-center
                justify-center
                gap-2
              "
            >

              {[0, 1, 2, 3, 4, 5].map(
                (index) => (
                  <span
                    key={index}
                    className={`
                      w-[7px]
                      h-[7px]
                      rounded-full
                      border
                      transition

                      ${
                        index <
                        pin.length
                          ? `
                            bg-current
                            border-current
                          `
                          : `
                            border-current
                            opacity-20
                          `
                      }
                    `}
                  />
                )
              )}

            </div>


            {/* ERROR */}

            <div
              className="
                h-[20px]
                text-center
                text-[11px]
                text-red-500
                truncate
                mb-2
              "
            >
              {error}
            </div>


            {/* KEYPAD */}

            <div
              className="
                grid
                grid-cols-3
                gap-2
              "
            >

              {[
                "1",
                "2",
                "3",
                "4",
                "5",
                "6",
                "7",
                "8",
                "9",
              ].map(
                (number) => (
                  <button
                    key={number}
                    type="button"
                    disabled={
                      !selectedUser ||
                      authLoading
                    }
                    onClick={() =>
                      handlePin(
                        number
                      )
                    }
                    className="
                      h-[48px]
                      rounded-lg
                      border
                      border-black/10
                      dark:border-white/10
                      bg-black/[0.025]
                      dark:bg-white/[0.035]
                      text-base
                      font-medium
                      hover:bg-black/[0.06]
                      dark:hover:bg-white/[0.08]
                      active:scale-[0.96]
                      disabled:opacity-45
                      transition
                    "
                  >
                    {number}
                  </button>
                )
              )}


              {/* CLEAR */}

              <button
                type="button"
                disabled={
                  !selectedUser ||
                  authLoading ||
                  !pin
                }
                onClick={() =>
                  setPin("")
                }
                className="
                  h-[48px]
                  rounded-lg
                  border
                  border-black/10
                  dark:border-white/10
                  text-[10px]
                  font-semibold
                  opacity-70
                  hover:bg-black/[0.05]
                  dark:hover:bg-white/[0.07]
                  active:scale-[0.96]
                  disabled:opacity-20
                  transition
                "
              >
                CLEAR
              </button>


              {/* ZERO */}

              <button
                type="button"
                disabled={
                  !selectedUser ||
                  authLoading
                }
                onClick={() =>
                  handlePin("0")
                }
                className="
                  h-[48px]
                  rounded-lg
                  border
                  border-black/10
                  dark:border-white/10
                  bg-black/[0.025]
                  dark:bg-white/[0.035]
                  text-base
                  font-medium
                  hover:bg-black/[0.06]
                  dark:hover:bg-white/[0.08]
                  active:scale-[0.96]
                  disabled:opacity-25
                  transition
                "
              >
                0
              </button>


              {/* BACKSPACE */}

              <button
                type="button"
                disabled={
                  !selectedUser ||
                  authLoading ||
                  !pin
                }
                onClick={
                  handleDelete
                }
                className="
                  h-[48px]
                  rounded-lg
                  border
                  border-black/10
                  dark:border-white/10
                  flex
                  items-center
                  justify-center
                  opacity-70
                  hover:bg-black/[0.05]
                  dark:hover:bg-white/[0.07]
                  active:scale-[0.96]
                  disabled:opacity-20
                  transition
                "
              >
                <Delete
                  size={17}
                />
              </button>

            </div>


            {/* LOGIN */}

            <button
              type="button"
              disabled={
                !selectedUser ||
                !pin ||
                authLoading
              }
              onClick={
                handleLogin
              }
              className="
                h-[46px]
                mt-3
                rounded-lg
                bg-blue-600
                text-white
                text-xs
                font-semibold
                flex
                items-center
                justify-center
                gap-2
                hover:bg-blue-700
                active:scale-[0.98]
                disabled:opacity-30
                disabled:cursor-not-allowed
                transition
              "
            >

              {authLoading ? (
                "Signing in..."
              ) : (
                <>
                  <LogIn
                    size={16}
                  />

                  Sign in
                </>
              )}

            </button>


            {/* CHANGE USER */}

            {selectedUser && (
              <button
                type="button"
                disabled={
                  authLoading
                }
                onClick={() => {
                  setSelectedUser(
                    null
                  );

                  setPin("");
                  setError("");
                }}
                className="
                  h-[30px]
                  mt-1
                  text-[10px]
                  opacity-45
                  hover:opacity-80
                  transition
                "
              >
                Change employee
              </button>
            )}

          </div>

        </div>


        {/* =================================================
            FOOTER
        ================================================= */}

        <div
          className="
            h-[34px]
            px-5
            flex
            items-center
            justify-between
            border-t
            border-black/10
            dark:border-white/10
            text-[10px]
            opacity-35
          "
        >

          <span>
            POS Terminal
          </span>

          <span>
            PIN Login
          </span>

        </div>

      </div>

    </div>
  );
}