import { BrowserRouter, Routes, Route } from "react-router-dom";
import Menu from "../components/Menu";

export default function AppRouter() {
  return (
    <BrowserRouter>
    <Menu />
      <Routes>
        <Route path="/" element={<h1>Ski Resort App</h1>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}