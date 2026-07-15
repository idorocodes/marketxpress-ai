import { BrowserRouter, Route, Routes } from "react-router-dom";
import Landing from "./Landing";
import Login from "./Login";
import Signup from "./Signup";
import ProtectedRoute from "./protected";
import ClientDashboard from "./clientDashboard.";
import VendorDashboard from "./VendorDashbaord";
import MarketplaceOptimizer from "./MarketOptimizer";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/buyer-dashboard" element={<ClientDashboard />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/vendor-dashboard" element={<VendorDashboard />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/optimizer" element={<MarketplaceOptimizer />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
