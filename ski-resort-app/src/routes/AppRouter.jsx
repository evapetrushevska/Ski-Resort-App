import { BrowserRouter, Routes, Route } from "react-router-dom";
import Menu from "../components/Menu";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
import Slopes from "../pages/Slopes";

export default function AppRouter() {
  return (
    <BrowserRouter>
    <Menu />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/slopes" element={<Slopes />} />
      </Routes>
    </BrowserRouter>
  );
}