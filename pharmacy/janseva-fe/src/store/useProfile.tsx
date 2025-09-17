import { create } from "zustand";
import { createJSONStorage, devtools } from "zustand/middleware";
import { persist } from "zustand/middleware";

interface Profile {
    firstName: string;
    lastName: string;
    age: number;
    gender: string;
    phone: string;
    profileImageUrl: string;
}

interface ProfileState {
    profile: Profile | null;
    setProfile: (profile: Profile) => void;
    resetProfile: () => void;
}

export const userProfileStore = create<ProfileState>()(
    devtools(
        persist(
            (set) => ({
                profile: {
                    firstName: "",
                    lastName: "",
                    age: 0,
                    gender: "",
                    phone: "",
                    profileImageUrl: "",
                },
                setProfile: (profile: Profile) => set({ profile }),
                resetProfile: () => set({ profile: null }),
            }),
            {
                name: 'profile-storage',
                storage: createJSONStorage(() => localStorage),
            }
        )
    )
)