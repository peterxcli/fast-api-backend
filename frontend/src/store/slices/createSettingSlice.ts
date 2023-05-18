import { StateCreator } from "zustand";

import { Track } from "@/lib/player";
import config from "@/config";

export interface SettingSlice {
    audioIndex: number;
    audios: Track[];
    isOpen: boolean;

    setAudioIndex: (index: number) => void;
    initAudios: (audios: Track[]) => void;
    resetSetting: () => void;
    toggleIsOpen: () => void;
}

export const createSettingSlice: StateCreator<SettingSlice> = (set) => ({
    audioIndex : 0,
    audios: config.tracks,
    isOpen: false,
    setAudioIndex: (index: number) => {
        set({ audioIndex: index });
    },
    initAudios: (audios: Track[]) => {
        set({ audios: audios });
    },
    resetSetting: () => {
        set({ audioIndex: 0, audios: [] });
    },
    toggleIsOpen: () => {
        set((state) => ({ isOpen: !state.isOpen }));
    }
})