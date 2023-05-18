import { StateCreator } from "zustand";

export interface TimeSlice {
    time: number; //seconds
    idle: boolean;
    countDown: boolean;
    timeUnit: number;

    setTime: (time: number) => void;
    incrementTime: (delta : number) => void;
    toggleCountDown: () => void;
    toggleIdle: () => void;
    setCountDown: (countDown: boolean) => void;
    resetTimer: () => void;
}

export const createTimeSlice: StateCreator<TimeSlice> = (set) => ({
    time: 0,
    idle: true,
    countDown: false,
    timeUnit: 20,
    setTime: (time: number) => set({ time: time }),
    incrementTime: (delta: number) => set((state) => ({ time: Math.max(state.time + delta, 0) })),
    toggleCountDown: () => set((state) => ({ countDown: !state.countDown })),
    toggleIdle: () => set((state) => ({ idle: !state.idle })),
    setCountDown: (countDown: boolean) => set({ countDown }),
    resetTimer: () => set({ time: 0, idle: true, countDown: false })
})
