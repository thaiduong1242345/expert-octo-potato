import { Request, Response } from "express";

// Mock GPS data for demonstration purposes
const mockGpsData = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [-122.4194, 37.7749], // San Francisco start
          [-122.4180, 37.7750],
          [-122.4170, 37.7755],
          [-122.4160, 37.7760],
          [-122.4150, 37.7765],
          [-122.4140, 37.7770],
          [-122.4130, 37.7775],
          [-122.4120, 37.7780],
          [-122.4110, 37.7785],
          [-122.4100, 37.7790]  // End point
        ]
      },
      properties: {
        device_id: "car01",
        timestamps: [
          "2025-01-13T13:00:00Z",
          "2025-01-13T13:01:00Z",
          "2025-01-13T13:02:00Z",
          "2025-01-13T13:03:00Z",
          "2025-01-13T13:04:00Z",
          "2025-01-13T13:05:00Z",
          "2025-01-13T13:06:00Z",
          "2025-01-13T13:07:00Z",
          "2025-01-13T13:08:00Z",
          "2025-01-13T13:09:00Z"
        ]
      }
    }
  ]
};

// Route to provide mock data when external API is unavailable
export const getMockTrackingData = (req: Request, res: Response) => {
  res.set({
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json'
  });
  res.json(mockGpsData);
};