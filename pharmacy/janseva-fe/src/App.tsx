import { Toaster } from "react-hot-toast";
import AuthCallback from "./components/authentication/AuthCallback";
import { PrivacyPolicy, ReturnsCancellation, TermsConditions } from "./components/legal";
import { ACCOUNT_DETAILS, HELP, MANAGE_ADDRESS } from "./CONFIG/routes";
import { AccountLayout, AuthLayout, HomeLayout } from "./layouts";
import { About, AccountDetails, Cart, ChangePassword, Address, FAQ, ForgotPassword, ForgotPasswordOTP, Help, Home, Login, ManageAddress, OrderDetails, OrderPrescription, OrderPrescriptionDetails, Orders, OrderStatus, OrderSummary, PasswordChangeSuccess, Search, SignUpPage, SingleProduct, VerifyAccount, VerifyAccountSuccess, Payment, Contact, Substitutes } from "./pages"
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { useTheme } from "./store/useTheme";
import { DeliveryFAQ, DoctorConsultationFAQ, MedicineSubstitutesFAQ, PaymentFAQ, ReturnsRefundsFAQ, GeneralIssuesFAQ } from "./pages/FAQ/index";
import { useEffect } from "react";
import useAuthFacade from "./facades/useAuthFacade";
import axiosInstance from "./utils/API";

function AppContent() {
  const { isAuthenticated, token, storeLogout } = useAuthFacade();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    const validateToken = async () => {
      if (isAuthenticated && token) {
        try {
          const response = await axiosInstance.get('/auth/validate-token');
          
          if (response.data.status === "success" && response.data.data.valid === true) {
            // Token is valid, continue
            return;
          } else {
            // Token is invalid, logout user
            storeLogout();
          }
        } catch (error) {
          // API call failed, logout user
          storeLogout();
        }
      }
    };

    validateToken();
  }, [location.pathname, isAuthenticated, token, storeLogout]);

  return (
    <Routes>
      <Route path="/" element={<HomeLayout />} >
        <Route path="" Component={Home} />
        <Route path="product/:slug" Component={SingleProduct} />
        <Route path="search" Component={Search} />
        <Route path="cart" Component={Cart} />
        <Route path="contact" Component={Contact} />
        <Route path="address" Component={Address} />
        <Route path="summary" Component={OrderSummary} />
        <Route path="payment" Component={Payment} />
        <Route path="order/status/:id" Component={OrderStatus} />
        <Route path="order/prescription" Component={OrderPrescription} />
        <Route path="order/prescription/:id" Component={OrderPrescriptionDetails} />
        <Route path="about" Component={About} />
        <Route path="substitutes" Component={Substitutes} />
        <Route path="faq" element={<FAQ />}>
          <Route path="medicine-substitutes" element={<MedicineSubstitutesFAQ />} />
          <Route path="delivery" element={<DeliveryFAQ />} />
          <Route path="doctor-consultation" element={<DoctorConsultationFAQ />} />
          <Route path="payment" element={<PaymentFAQ />} />
          <Route path="returns-refunds" element={<ReturnsRefundsFAQ />} />
          <Route path="general-issues" element={<GeneralIssuesFAQ />} />
        </Route>
        <Route path="terms-conditions" Component={TermsConditions} />
        <Route path="privacy-policy" Component={PrivacyPolicy} />
        <Route path="return-policy" Component={ReturnsCancellation} />

        <Route element={<AccountLayout />}>
          <Route path={ACCOUNT_DETAILS} Component={AccountDetails} />
          <Route path={MANAGE_ADDRESS} Component={ManageAddress} />
          <Route path={HELP} Component={Help} />
          <Route path="orders" Component={Orders} />
          <Route path="orders/:id" Component={OrderDetails} />
        </Route>
      </Route>

      <Route path="/auth/" element={<AuthLayout />}>
        <Route path="login" Component={Login} />
        <Route path="signup" Component={SignUpPage} />
        <Route path="forgotpassword" Component={ForgotPassword} />
        <Route path="forgotpassword/otp" Component={ForgotPasswordOTP} />
        <Route path="changepassword" Component={ChangePassword} />
        <Route path="passwordchangesuccess" Component={PasswordChangeSuccess} />
        <Route path="verifyaccount" Component={VerifyAccount} />
        <Route path="verifyaccountsuccess" Component={VerifyAccountSuccess} />
        <Route path="google/callback" element={<AuthCallback />} />
      </Route>
    </Routes>
  );
}

function App() {
  const { isDarkMode } = useTheme();

  return (
    <BrowserRouter>
      <AppContent />
      <Toaster
        position="top-right"
        gutter={12}
        toastOptions={{
          style: {
            borderRadius: '3rem',
            background: isDarkMode ? '#27272a' : '#ffffff',
            color: isDarkMode ? '#ffffff' : '#27272a'
          }
        }}
      />
    </BrowserRouter>
  )
}

export default App
