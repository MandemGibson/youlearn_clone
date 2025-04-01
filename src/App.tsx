import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import {
  ForgotPassword,
  LandingPage,
  PersonalForm,
  SignInPage,
  SignUpPage,
  UploadPage,
} from "./pages";
import ContentPage from "./pages/main/ContentPage";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" index element={<LandingPage />} />
        <Route path="/main" element={<UploadPage />} />
        <Route path="/login" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/reset-password" element={<ForgotPassword />} />
        <Route path="/personal-form" element={<PersonalForm />} />
        <Route path="/content" element={<ContentPage />} />
      </Routes>

      <ToastContainer />
    </Router>
  );
}

export default App;
