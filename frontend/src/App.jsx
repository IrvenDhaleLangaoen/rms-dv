import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./utilities/AuthContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddEntry from "./pages/AddEntry";
import AuditTrail from "./pages/AuditTrail";


function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          {/* Removed Sidebar */}
          <Navbar />
          <div className="flex-grow container mx-auto px-4">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/add-entry" element={<AddEntry />} />
              <Route path="/audit-trail" element={<AuditTrail />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
