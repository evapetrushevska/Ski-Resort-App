import { BrowserRouter, Routes, Route } from "react-router-dom";
import Menu from "../components/Menu";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
import Slopes from "../pages/Slopes";
import Equipment from "../pages/Equipment";
import Passes from "../pages/Passes";
import Lessons from "../pages/Lessons";

export default function AppRouter() {
  return (
    <BrowserRouter>
    <Menu />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/slopes" element={<Slopes />} />
        <Route path="/equipment" element={<Equipment />} />
        <Route path="/passes" element={<Passes />} />
        <Route path="/lessons" element={<Lessons />} />
      </Routes>
    </BrowserRouter>
  );
}