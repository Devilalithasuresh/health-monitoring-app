import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserLogin from "./Components/LoginPage/UserLogin";
import AdminLogin from "./Components/LoginPage/AdminLogin";
import HomePage from "./Components/HomePage/HomePage";
import AdminDashboard from "./Components/AdminDashboard/AdminDashboard";
import UserDashboard from "./Components/HomePage/UserDashboard"; // ADD THIS
import OutbreakMap from "./Components/Map/OutbreakMap";
import DiseaseInfo from "./Components/DiseaseInfo/DiseaseInfo";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserLogin />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/user-dashboard" element={<HomePage />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        {/* ADD NEW ROUTE HERE */}
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/outbreak-map" element={<OutbreakMap />} />
        <Route path="/disease-info" element={<DiseaseInfo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;