import useAuthStore from '@/store/useAuthStore';

const useAuthFacade = () => {
  const { user, token, isAuthenticated,setUser, login: storeLogin, logout: storeLogout, resetState,isForgotVerified,setIsForgotVerified } = useAuthStore();

  return {
    user,
    token,
    isAuthenticated,
    setUser,
    storeLogin, 
    storeLogout,
    resetState,
    isForgotVerified,
    setIsForgotVerified
  };
};

export default useAuthFacade;