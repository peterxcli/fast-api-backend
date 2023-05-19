import { serverLogout } from "@/apis/auth";
import { StateCreator } from "zustand";

export interface UserSlice {
    isAuthenticated?: boolean;
    user?: User;
    token?: Token;
    setUser: (user: User) => void;
    setToken: (token: Token) => void;
    setAuthenticated: (isAuthenticated: boolean) => void;
    logout: () => void;
}

export const createUserSlice: StateCreator<UserSlice> = (set) => ({
    user: undefined,
    token: undefined,
    isAuthenticated: false,
    setUser: (user: User) => set({ user: user }),
    setToken: (token: Token) => set({ token: token }),
    setAuthenticated: (isAuthenticated: boolean) => set( { isAuthenticated: isAuthenticated  }),
    logout: async () => {
        await serverLogout()
        set({ user: undefined, token: undefined, isAuthenticated: false })
    }
})
