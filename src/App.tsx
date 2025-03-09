import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { LandingPage } from "./pages";
import UploadPage from "./pages/main/UploadPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/main" element={<UploadPage />} />
      </Routes>
    </Router>
  );
}

export default App;
