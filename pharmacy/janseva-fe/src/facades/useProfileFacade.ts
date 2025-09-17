import { userProfileStore } from '@/store/useProfile';

const useProfileFacade = () => {
  const { profile, setProfile, resetProfile } = userProfileStore();  

  return {
    profile,
    setProfile,
    resetProfile
  };
};

export default useProfileFacade;
