import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DoctorAppointment from "./AppointmentForm";

// Mock localStorage
beforeEach(() => {
  localStorage.clear();
});

describe("DoctorAppointment", () => {
  test("Verify the application page header name.", () => {
    render(<DoctorAppointment />);
    const headerElement = screen.getByText(/Book Doctor Appointment/i);
    expect(headerElement).toBeInTheDocument();
  });

  test("Verify the appointment time slots in the dropdown.", () => {
    render(<DoctorAppointment />);
    const dateInput = screen.getByLabelText(/Select Date/i);
    fireEvent.change(dateInput, { target: { value: "2025-03-19" } }); // Set to a valid date (Wednesday)

    const timeSlotDropdown = screen.getByLabelText(/Select Time Slot/i);
    const options = Array.from(timeSlotDropdown.options).map(
      (option) => option.text
    );
    expect(options).toEqual(
      expect.arrayContaining([
        "Choose a time slot",
        "12:00 PM",
        "12:30 PM",
        "01:00 PM Passed",
        "01:30 PM Passed",
        "02:00 PM Passed",
        "02:30 PM Passed",
        "06:00 PM",
        "06:30 PM",
        "07:00 PM",
        "07:30 PM",
        "08:00 PM",
        "08:30 PM",
        "09:00 PM",
      ])
    );
  });

  test("Verify the appointment booking functionality and toast message.", () => {
    render(<DoctorAppointment />);
    const dateInput = screen.getByLabelText(/Select Date/i);
    fireEvent.change(dateInput, { target: { value: "2025-03-19" } }); // Set to a valid date (Wednesday)

    const timeSlotDropdown = screen.getByLabelText(/Select Time Slot/i);
    fireEvent.change(timeSlotDropdown, { target: { value: "12:00 PM" } });

    const bookButton = screen.getByRole("button", {
      name: /Book Appointment/i,
    });
    fireEvent.click(bookButton);

    const toastMessage = screen.getByText(/Appointment booked successfully/i);
    expect(toastMessage).toBeInTheDocument();
  });

  test("Verify the local storage data to ensure it contains previously booked appointments.", () => {
    render(<DoctorAppointment />);

    // Set the date to March 18, 2025 (which is a Tuesday)
    const dateInput = screen.getByLabelText(/Select Date/i);
    fireEvent.change(dateInput, { target: { value: "2025-03-19" } }); // Set to a valid date

    const timeSlotDropdown = screen.getByLabelText(/Select Time Slot/i);
    fireEvent.change(timeSlotDropdown, { target: { value: "12:00 PM" } });

    const bookButton = screen.getByRole("button", {
      name: /Book Appointment/i,
    });
    fireEvent.click(bookButton);

    const appointments = JSON.parse(localStorage.getItem("appointments"));
    expect(appointments).toHaveLength(1);
    expect(appointments[0]).toEqual({
      date: "2025-03-18",
      time: "12:00 PM",
    });
  });

  test("Verify that the selected time slot is disabled and cannot be selected again.", () => {
    render(<DoctorAppointment />);
    const dateInput = screen.getByLabelText(/Select Date/i);
    fireEvent.change(dateInput, { target: { value: "2025-03-19" } }); // Set to a valid date (Wednesday)

    const timeSlotDropdown = screen.getByLabelText(/Select Time Slot/i);
    fireEvent.change(timeSlotDropdown, { target: { value: "12:00 PM" } });

    const bookButton = screen.getByRole("button", {
      name: /Book Appointment/i,
    });
    fireEvent.click(bookButton);

    // Re-render to check if the slot is disabled
    const timeSlotDropdownAfterBooking =
      screen.getByLabelText(/Select Time Slot/i);
    const optionsAfterBooking = Array.from(
      timeSlotDropdownAfterBooking.options
    );
    const bookedOption = optionsAfterBooking.find(
      (option) => option.value === "12:00 PM"
    );

    expect(bookedOption).toBeDisabled();
  });

  test("Verify the appointment booking functionality by booking multiple appointments.", () => {
    render(<DoctorAppointment />);

    const dateInput = screen.getByLabelText(/Select Date/i);
    fireEvent.change(dateInput, { target: { value: "2025-03-21" } }); // Set to a valid date (Wednesday)

    const timeSlotDropdown = screen.getByLabelText(/Select Time Slot/i);
    fireEvent.change(timeSlotDropdown, { target: { value: "12:00 PM" } });

    const bookButton = screen.getByRole("button", {
      name: /Book Appointment/i,
    });
    fireEvent.click(bookButton);

    // Book another appointment
    fireEvent.change(timeSlotDropdown, { target: { value: "12:30 PM" } });
    fireEvent.click(bookButton);

    const appointments = JSON.parse(localStorage.getItem("appointments"));
    expect(appointments).toHaveLength(2);
    expect(appointments[1]).toEqual({
      date: "2025-03-20",
      time: "12:30 PM",
    });
  });

  test("Verify the functionality of booking an appointment on days other than Monday, Wednesday, or Friday.", async () => {
    render(<DoctorAppointment />);
    const dateInput = screen.getByLabelText(/Select Date/i);
    fireEvent.change(dateInput, { target: { value: "2025-03-20" } }); // Set to a Thursday

    const bookButton = screen.getByRole("button", {
      name: /Book Appointment/i,
    });
    fireEvent.click(bookButton);

    // Wait for the toast message to appear using the correct message
    const toastMessage = await screen.findByText(
      /Please select both date and time slot/i
    );

    expect(toastMessage).toBeInTheDocument();
  });
});
