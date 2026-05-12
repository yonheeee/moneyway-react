// stores/useUserStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      isInitialized: false,

      setUser: (userInfo) => set({ user: userInfo }),
      clearUser: () => set({ user: null }),
      logout: () => {
        set({ user: null });
        localStorage.removeItem("user"); // user 정보만 제거
      },

      setInitialized: (value) => set({ isInitialized: value }),
    }),
    {
      name: "user-storage",
    }
  )
);

export default useUserStore;
