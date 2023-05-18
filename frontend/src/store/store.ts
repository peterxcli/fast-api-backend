import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { TimeSlice, createTimeSlice } from './slices/createTimeSlice'
import { createSettingSlice, SettingSlice } from './slices/createSettingSlice'
import { createUserSlice, UserSlice } from './slices/createUserSlice'

type StoreState = TimeSlice & SettingSlice & UserSlice

export const useAppStore = create<StoreState>()(devtools((...a) => ({
    ...createTimeSlice(...a),
    ...createSettingSlice(...a),
    ...createUserSlice(...a)
})))