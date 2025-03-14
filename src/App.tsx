import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { LandingPage, SignInPage, UploadPage } from "./pages";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/main" element={<UploadPage />} />
        <Route path="/login" element={<SignInPage />} />
      </Routes>
    </Router>
  );
}

export default App;
