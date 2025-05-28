import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { Toast, ToastContainer } from "react-bootstrap";

// Main component for Doctor Appointment Form
const DoctorAppointmentForm = () => {
  const [appointments, setAppointments] = useState([]); // State to store all appointments
  const [selectedDate, setSelectedDate] = useState(null); // State to track the selected date
  const [availableSlots, setAvailableSlots] = useState([]); // State to store available time slots
  const [selectedTime, setSelectedTime] = useState(""); // State to store the selected time slot
  const [showToast, setShowToast] = useState(false); // State to control toast visibility
  const [toastMessage, setToastMessage] = useState(""); // State to hold toast message

  const validDays = [1, 3, 5]; // Monday, Wednesday, Friday

  // Load saved appointments from local storage on initial mount
  useEffect(() => {
    const savedAppointments =
      JSON.parse(localStorage.getItem("appointments")) || [];
    setAppointments(savedAppointments);
  }, []);

  // Update available time slots whenever selectedDate or appointments change
  useEffect(() => {
    if (selectedDate) {
      updateAvailableSlots();
    }
  }, [selectedDate, appointments]);

  // Function to generate time slots in 30-minute intervals
  const generateTimeSlots = (startHour, endHour) => {
    const slots = [];
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = new Date(0, 0, 0, hour, minute);
        slots.push(
          time.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        );
      }
    }
    return slots;
  };

  // Generate time slots for the specified ranges
  const timeSlots = [
    ...generateTimeSlots(12, 15), // 12 PM to 3 PM
    ...generateTimeSlots(18, 22), // 6 PM to 9:30 PM, to include 9:00 PM
  ];

  // Update available slots based on the selected date and existing appointments
  const updateAvailableSlots = () => {
    // Get the booked slots for the selected date
    const bookedSlots = appointments
      .filter(
        (appointment) =>
          appointment.date === selectedDate.toISOString().split("T")[0]
      )
      .map((appointment) => appointment.time);

    const now = new Date();

    // Create a list of available slots
    const updatedSlots = timeSlots.map((slot) => {
      // Split the slot time into hours and minutes
      const [time, modifier] = slot.split(" "); // e.g., "08:30 PM" -> ["08:30", "PM"]
      const [hour, minute] = time.split(":"); // e.g., "08:30" -> ["08", "30"]

      // Convert hour to 24-hour format
      let hours = parseInt(hour, 10);
      if (modifier === "PM" && hours < 12) {
        hours += 12; // Convert PM hour to 24-hour format
      }
      if (modifier === "AM" && hours === 12) {
        hours = 0; // Convert 12 AM to 0 hours
      }

      // Create a date object for the slot time
      const slotDate = new Date(1970, 0, 1, hours, minute);

      // Check if the slot is passed
      const isPassed = slotDate.getTime() < now.getTime();

      // Return the slot information along with its status
      return {
        time: slot,
        isBooked: bookedSlots.includes(slot),
        isPassed: isPassed,
      };
    });
    const currentTime = new Date();

    updatedSlots.forEach((slot) => {
      const slotTime = new Date();
      const [hours, minutes] = slot.time.split(":");
      const isPM = slot.time.includes("PM");
      slotTime.setHours(
        isPM ? parseInt(hours) + 12 : parseInt(hours),
        parseInt(minutes),
        0,
        0
      );

      slot.isPassed = currentTime > slotTime;
    });

    console.log("Updated Slots:", updatedSlots); // Debugging line to check slots
    setAvailableSlots(updatedSlots);
  };

  // Handle changes in the date picker
  const handleDateChange = (date) => {
    if (date && validDays.includes(date.getDay())) {
      setSelectedDate(date);
    } else {
      setToastMessage(
        "Please select a valid booking day (Monday, Wednesday, or Friday)."
      );
      setShowToast(true);
    }
  };

  // Handle the selection of a time slot
  const handleTimeSlotSelect = (event) => {
    const time = event.target.value;
    if (availableSlots.some((slot) => slot.time === time && !slot.isBooked)) {
      setSelectedTime(time);
    } else {
      suggestNextAvailableSlot();
    }
  };

  // Suggest the next available time slot
  const suggestNextAvailableSlot = () => {
    const nextAvailable = availableSlots.find((slot) => !slot.isBooked);
    if (nextAvailable) {
      setToastMessage(
        `The selected time slot is unavailable. Next available slot is ${nextAvailable.time}.`
      );
    } else {
      setToastMessage("No available slots for the selected date.");
    }
    setShowToast(true);
  };

  // Handle the appointment booking
  const handleBookAppointment = () => {
    if (!selectedDate || !selectedTime) {
      setToastMessage("Please select both date and time slot.");
      setShowToast(true);
      return;
    }

    const newAppointment = {
      date: selectedDate.toISOString().split("T")[0],
      time: selectedTime,
    };

    const updatedAppointments = [...appointments, newAppointment];
    setAppointments(updatedAppointments);
    localStorage.setItem("appointments", JSON.stringify(updatedAppointments));
    setToastMessage("Appointment booked successfully.");
    setShowToast(true);
    setSelectedTime(""); // Reset selected time after booking
  };

  return (
    <div className="appointment-form-container">
      <div className="appointment-form-content">
        <h1 className="mb-4">Book Doctor Appointment</h1>
        <div className="alert alert-info">
          <h4>Available Days and Slots</h4>
          <p>Appointments can be booked on Monday, Wednesday, and Friday.</p>
          <p>The available time slots are:</p>
          <ul>
            {timeSlots.map((slot, index) => (
              <li key={index}>{slot}</li>
            ))}
          </ul>
          <p>Each slot lasts 30 minutes.</p>
          <p>Passed time slots will be marked as "Passed".</p>
        </div>

        <label htmlFor="appointmentDate" className="form-label">
          Select Date:
        </label>
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          dateFormat="yyyy-MM-dd"
          className="form-control"
        />
        {selectedDate && (
          <div className="mb-3">
            <label htmlFor="timeSlot" className="form-label">
              Select Time Slot:
            </label>
            <select
              id="timeSlot"
              className="form-control"
              value={selectedTime}
              onChange={handleTimeSlotSelect}
            >
              <option value="">Choose a time slot</option>
              {availableSlots.map((slot, index) => (
                <option key={index} value={slot.time} disabled={slot.isBooked}>
                  {slot.isPassed ? `${slot.time} Passed` : slot.time}
                </option>
              ))}
            </select>
          </div>
        )}
        <button className="btn btn-primary" onClick={handleBookAppointment}>
          Book Appointment
        </button>
      </div>
      <ToastContainer position="top-center" className="p-3">
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
        >
          <Toast.Header>
            <strong className="me-auto">Notification</strong>
          </Toast.Header>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default DoctorAppointmentForm;
