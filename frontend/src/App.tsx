import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import {
  ForgotPassword,
  LandingPage,
  PersonalForm,
  ResetPassword,
  SignInPage,
  SignUpPage,
  UploadPage,
} from "./pages";
import ContentPage from "./pages/main/ContentPage";
import { ToastContainer } from "react-toastify";
import Room from "./pages/main/Room";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" index element={<LandingPage />} />
        <Route path="/main" element={<UploadPage />} />
        <Route path="/login" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/personal-form" element={<PersonalForm />} />
        <Route path="/content" element={<ContentPage />} />
        <Route path="/room/:id" element={<Room />} />
      </Routes>

      <ToastContainer />
    </Router>
  );
}

export default App;
