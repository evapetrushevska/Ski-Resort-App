import { BrowserRouter, Routes, Route } from "react-router-dom";
import Menu from "../components/Menu";
import Login from "../pages/Login";
import Register from "../pages/Register";

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