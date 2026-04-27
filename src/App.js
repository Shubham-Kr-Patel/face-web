import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Register from "./components/Register";
import Recognize from "./components/Recognize";

function App() {
  return (
    <BrowserRouter>
      <div style={{ textAlign: "center" }}>
        <h1>Face Recognition System</h1>

        {/* Navigation */}
        <nav style={{ marginBottom: "20px" }}>
          <Link to="/register" style={{ marginRight: "10px" }}>
            Register
          </Link>
          <Link to="/recognize">
            Recognize
          </Link>
        </nav>

        <hr />

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recognize" element={<Recognize />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;