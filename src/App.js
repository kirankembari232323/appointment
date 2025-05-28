// src/App.js
import React from "react";
import "./App.css";
import DoctorAppointment from "./AppointmentForm";
import "bootstrap/dist/css/bootstrap.min.css";
function App() {
  return (
    <div className="App">
      <header className="bg-primary text-white text-center p-3">
        <h1> Doctor Appointment Booking</h1>{" "}
      </header>
      <main className="container mt-4">
        <DoctorAppointment />
      </main>
    </div>
  );
}
export default App;
