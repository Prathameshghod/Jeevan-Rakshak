 import React, { useState } from "react";
  import { MapContainer, Marker, Popup, TileLayer, Polyline, Polygon, useMapEvents } from "react-leaflet";
  import MarkerClusterGroup from "react-leaflet-cluster";
  import "./App.css";
  import { Icon, divIcon } from "leaflet";
  import "leaflet/dist/leaflet.css";
  import { uploadJSONToFirestore , uploadJSONDynamically , uploadPolylinesToFirestore } from './FireApp'; // Import the function

  const customIcon = new Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/5968/5968526.png",
    iconSize: [20, 20],
  });

  const createClusterCustomIcon = function (cluster) {
    const count = cluster.getChildCount();
    let size = 'small';
    let color = '#007bff';
    
    if (count > 20) {
      size = 'large';
      color = '#dc3545'; // Red for large clusters
    } else if (count > 10) {
      size = 'medium';
      color = '#ffc107'; // Yellow for medium clusters
    } else {
      size = 'small';
      color = '#28a745'; // Green for small clusters
    }
    
    return new divIcon({
      html: `<div class="cluster-icon cluster-${size}" style="background-color: ${color}; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${count}</div>`,
      className: "custom-marker-cluster",
      iconSize: [40, 40],
    });
  };



  export default function App() {
    const [userCoordinates, setUserCoordinates] = useState({
      latitude: "",
      longitude: "",
      popUp: "",
    });

    // eslint-disable-next-line no-unused-vars
    const [currentZoom, setCurrentZoom] = useState(20);
    // eslint-disable-next-line no-unused-vars
    const CLUSTERING_ZOOM_THRESHOLD = 18; // Cluster below zoom 18, uncluster at 18+
    
    // State for polygon popup/sidebar
    const [selectedPolygon, setSelectedPolygon] = useState(null);
    const [showPolygonInfo, setShowPolygonInfo] = useState(false);
    
    // State for deep insights mode
    const [showDeepInsights, setShowDeepInsights] = useState(false);
    
    // State for polyline popup
    const [selectedPolyline, setSelectedPolyline] = useState(null);
    const [showPolylineInfo, setShowPolylineInfo] = useState(false);

    // Polygon data with dummy outbreak risk information - matching the screenshot colors
    const polygonData = [
      {
        id: "polygon-1",
        name: "Dharampeth - Zone A",
        positions: [
          [21.072451, 79.067663], // Node23
          [21.072551, 79.069261], // Node67
          [21.072176, 79.069309], // Node68
          [21.070994, 79.069374], // Node73
          [21.070689, 79.069374], // Node80
          [21.070659, 79.068746], // Node79
          [21.070479, 79.067856], // Node87
          [21.070015, 79.067354], // Node11
          [21.072451, 79.067663], // Node23 again to close
        ],
        color: 'orange',
        fillColor: 'orange',
        averageOutbreakRisk: 65.5,
        recentReportedCases: 3,
        weatherCondition: "Light rainfall",
        priorityLevel: "Medium",
        waterQuality: "pH slightly unsafe",
        recommendedAction: "Monitor water source"
      },
      {
        id: "polygon-2", 
        name: "Dharampeth - Zone B",
        positions: [
          [21.072571, 79.066826], // Node24
          [21.072451, 79.067663], // Node23
          [21.072095, 79.067609], // Node38
          [21.071775, 79.067550], // Node37
          [21.071395, 79.067521], // Node15
          [21.071435, 79.067078], // Node36
          [21.071495, 79.066676], // Node35
          [21.071880, 79.066724], // Node34
          [21.072236, 79.066788], // Node25
        ],
        color: 'red',
        fillColor: 'red',
        averageOutbreakRisk: 87.4,
        recentReportedCases: 8,
        weatherCondition: "Storm conditions",
        priorityLevel: "High",
        waterQuality: "Contaminated - immediate action needed",
        recommendedAction: "Emergency response required"
      },
      {
        id: "polygon-3",
        name: "Dharampeth - Zone C", 
        positions: [
          [21.070015, 79.067354], // Node11
          [21.070479, 79.067856], // Node87
          [21.070659, 79.068746], // Node79
          [21.070689, 79.069374], // Node80
          [21.070614, 79.069658], // Node81
          [21.070534, 79.070559], // Node82
          [21.070544, 79.071267], // Node78
          [21.069708, 79.072185], // Node93
          [21.069568, 79.071112], // Node94
          [21.069860, 79.068613], // Node16
          [21.070015, 79.067354], // Node11 (close polygon)
        ],
        color: 'green',
        fillColor: 'lightgreen',
        averageOutbreakRisk: 8.7,
        recentReportedCases: 1,
        weatherCondition: "Partly cloudy",
        priorityLevel: "Low",
        waterQuality: "Good quality",
        recommendedAction: "Routine check"
      },
      {
        id: "polygon-4",
        name: "Dharampeth - Zone D",
        positions: [
          [21.073317, 79.069218], // Node63
          [21.073357, 79.069594], // Node64
          [21.073392, 79.069969], // Node65
          [21.073412, 79.070302], // Node66
          [21.072281, 79.070420], // Node71
          [21.072246, 79.070077], // Node70
          [21.072231, 79.069690], // Node69
          [21.072551, 79.069261], // Node67
          [21.073317, 79.069218], // Node63 again to close
        ],
    ]
    }
