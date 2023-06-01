import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RoomInfo from "./RoomInfo";
import { fetchRoomDetailsById, fetchSensorDataByRoomId } from "../api";

jest.mock("../api", () => ({
  fetchRoomDetailsById: jest.fn(),
  fetchSensorDataByRoomId: jest.fn(),
}));

describe("RoomInfo", () => {
  const roomId = "10";
  const onCloseMock = jest.fn();

  test("renders the component with room data", async () => {
    const roomData = {
      name: "Room A",
      capacity: 10,
      availability: "Available",
      sensors: [
        { id: 1, type: "Temperature", values: [{ value: 25 }] },
        { id: 2, type: "Humidity", values: [{ value: 50 }] },
        { id: 3, type: "CO2", values: [{ value: 800 }] },
      ],
      patients: [{ name: "John Doe" }, { name: "Jane Smith" }],
    };
    
    fetchRoomDetailsById.mockResolvedValueOnce(roomData);
    fetchSensorDataByRoomId.mockResolvedValueOnce([
      { value: 25 },
      { value: 50 },
      { value: 800 },
    ]);

    render(<RoomInfo roomId={roomId} onClose={onCloseMock} />);
    
    //Check if the component renders loading state initially
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    
    //Wait for room data to be fetched and rendered
    await waitFor(() => {
      expect(screen.getByText("Room A")).toBeInTheDocument();
      expect(screen.getByText("Capacity: 10")).toBeInTheDocument();
      expect(screen.getByText("Availability: Available")).toBeInTheDocument();
      expect(screen.getByText("Temperature: 25°C")).toBeInTheDocument();
      expect(screen.getByText("Humidity: 50%")).toBeInTheDocument();
      expect(screen.getByText("CO2: 800 ppm")).toBeInTheDocument();
      expect(screen.getByText("Patients:")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("Show Sensor Logs")).toBeInTheDocument();
    });
    
    //Check if fetchRoomDetailsById and fetchSensorDataByRoomId were called with the correct arguments
    expect(fetchRoomDetailsById).toHaveBeenCalledWith(roomId);
    expect(fetchSensorDataByRoomId).toHaveBeenCalledWith(roomId);
  });

  test("handles closing", async () => {
    const roomData = {
      name: "Room A",
      capacity: 10,
      availability: "Available",
      sensors: [],
      patients: [],
    };

    fetchRoomDetailsById.mockResolvedValueOnce(roomData);
    fetchSensorDataByRoomId.mockResolvedValueOnce([]);

    render(<RoomInfo roomId={roomId} onClose={onCloseMock} />);
    
    await waitFor(() => {
      expect(screen.getByText("Room A")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("closeButton"));
    
    // Assert that the onClose function was called
    expect(onCloseMock).toHaveBeenCalled();
  });

  test("toggles the sensor log display", async () => {
    const roomData = {
      name: "Room A",
      capacity: 10,
      availability: "Available",
      sensors: [{ id: 1, type: "Temperature", values: [] }],
      patients: [],
    };

    fetchRoomDetailsById.mockResolvedValueOnce(roomData);
    fetchSensorDataByRoomId.mockResolvedValueOnce([]);

    render(<RoomInfo roomId={roomId} onClose={onCloseMock} />);
    
    await waitFor(() => {
      expect(screen.getByText("Room A")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("toggleSensorLogButton"));
    
    // Assert that the sensor log is shown
    expect(screen.getByTestId("sensorInfo")).toBeInTheDocument();
    
    fireEvent.click(screen.getByTestId("toggleSensorLogButton"));
    
    // Assert that the sensor log is hidden
    expect(screen.queryByTestId("sensorInfo")).not.toBeInTheDocument();
  });

  test("handles error while fetching room data", async () => {
    const errorMessage = "Failed to fetch room data";
    
    fetchRoomDetailsById.mockRejectedValueOnce(new Error(errorMessage));
    fetchSensorDataByRoomId.mockResolvedValueOnce([]);

    render(<RoomInfo roomId={roomId} onClose={onCloseMock} />);
    
    // Wait for the error message to be rendered
    await waitFor(() => {
      expect(screen.getByText("Error fetching room data:")).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
    
    // Assert that the onClose function was not called
    expect(onCloseMock).not.toHaveBeenCalled();
  });

  // Add more tests as needed...

});
