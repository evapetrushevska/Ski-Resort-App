import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<h1>Ski Resort App</h1>} />
      </Routes>
    </BrowserRouter>
  );
}