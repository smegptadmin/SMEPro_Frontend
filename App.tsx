// App.tsx (ensure Router is set up)
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PlanSelection from "./components/PlanSelection";
import Success from "./components/Success";
import Cancel from "./components/Cancel";
// import SmeSelector from "./components/SmeSelector"; // existing

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/plans" element={<PlanSelection />} />
        <Route path="/success" element={<Success />} />
        <Route path="/cancel" element={<Cancel />} />
        <Route path="/sme-selector" element={<div>Sme selector placeholder</div>} />
        <Route path="*" element={<PlanSelection />} />
      </Routes>
    </BrowserRouter>
  );
}
