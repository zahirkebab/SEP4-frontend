import React from "react";
import { render, screen } from "@testing-library/react";
import SensorInfo from "./SensorInfo";
import { fetchSensorLogById } from "@/api";

jest.mock("@/api", () => ({
  fetchSensorLogById: jest.fn(),
}));

describe("SensorInfo", () => {
  const sensors = [
    { id: 1, type: "Temperature" },
    { id: 2, type: "Humidity" },
    { id: 3, type: "CO2" },
  ];

  test("renders the component with sensor logs", async () => {
    const sensorLogs = [
      { id: 1, values: [{ timeStamp: "2023-05-30T10:00:00Z", value: 25 }] },
      { id: 2, values: [] },
      { id: 3, values: [{ timeStamp: "2023-05-30T11:00:00Z", value: 800 }] },
    ];
    
    fetchSensorLogById.mockImplementation(async (sensorId) => {
      const sensorLog = sensorLogs.find((log) => log.id === sensorId);
      return sensorLog ? sensorLog.values : [];
    });

    render(<SensorInfo sensors={sensors} />);
    
    expect(screen.getByText("Sensor Logs:")).toBeInTheDocument();
    expect(screen.getByText("Type")).toBeInTheDocument();
    expect(screen.getByText("Timestamp")).toBeInTheDocument();
    expect(screen.getByText("Value")).toBeInTheDocument();
    
    // Assert that sensor logs are rendered correctly
    expect(screen.getByText("Temperature")).toBeInTheDocument();
    expect(screen.getByText("2023-05-30 10:00:00")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
    expect(screen.queryByText("Humidity")).not.toBeInTheDocument();
    expect(screen.queryByText("CO2")).not.toBeInTheDocument();
    
    //Check if fetchSensorLogById is called with the correct sensor ids
    expect(fetchSensorLogById).toHaveBeenCalledTimes(2);
    expect(fetchSensorLogById).toHaveBeenCalledWith(1);
    expect(fetchSensorLogById).toHaveBeenCalledWith(3);
  });

  test("handles error while fetching sensor logs", async () => {
    const errorMessage = "Failed to fetch sensor logs";
    
    fetchSensorLogById.mockRejectedValueOnce(new Error(errorMessage));
    render(<SensorInfo sensors={sensors} />);
    
    //Wait for the error message to be rendered
    expect(await screen.findByText("Error fetching sensor logs:")).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    
    //Check if fetchSensorLogById is called for each sensor
    expect(fetchSensorLogById).toHaveBeenCalledTimes(3);

    expect(fetchSensorLogById).toHaveBeenCalledWith(1);
    expect(fetchSensorLogById).toHaveBeenCalledWith(2);
    expect(fetchSensorLogById).toHaveBeenCalledWith(3);
  });

  test("handles missing sensor logs", async () => {
    const sensorLogs = [
      { id: 1, values: [] },
      { id: 2, values: null },
      { id: 3 },
    ];
    
    fetchSensorLogById.mockImplementation(async (sensorId) => {
      const sensorLog = sensorLogs.find((log) => log.id === sensorId);
      return sensorLog ? sensorLog.values : [];
    });
    render(<SensorInfo sensors={sensors} />);
    
    //Check if sensor logs are not rendered when values are missing or empty
    expect(screen.queryByText("Temperature")).not.toBeInTheDocument();
    expect(screen.queryByText("Humidity")).not.toBeInTheDocument();
    expect(screen.queryByText("CO2")).not.toBeInTheDocument();
    
    //Check if  fetchSensorLogById is called with the correct sensor ids
    expect(fetchSensorLogById).toHaveBeenCalledTimes(3);

    expect(fetchSensorLogById).toHaveBeenCalledWith(1);
    expect(fetchSensorLogById).toHaveBeenCalledWith(2);
    expect(fetchSensorLogById).toHaveBeenCalledWith(3);
  });

  // Add more tests as needed...

});
