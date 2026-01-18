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
        color: 'green',
        fillColor: 'lightgreen',
        averageOutbreakRisk: 15.2,
        recentReportedCases: 0,
        weatherCondition: "Clear skies",
        priorityLevel: "Low",
        waterQuality: "Excellent quality",
        recommendedAction: "Continue monitoring"
      },
      {
        id: "polygon-5",
        name: "Dharampeth - Zone E",
        positions: [
          [21.072551, 79.069261], // Node67
          [21.072231, 79.069690], // Node69
          [21.070944, 79.069787], // Node74
          [21.070614, 79.069658], // Node81
          [21.070689, 79.069374], // Node80
          [21.070994, 79.069374], // Node73
          [21.072176, 79.069309], // Node68
          [21.072551, 79.069261], // Node67 again to close
        ],
        color: 'orange',
        fillColor: 'orange',
        averageOutbreakRisk: 42.3,
        recentReportedCases: 2,
        weatherCondition: "Heavy rainfall",
        priorityLevel: "Medium",
        waterQuality: "pH levels concerning",
        recommendedAction: "Increase monitoring frequency"
      },
      {
        id: "polygon-6",
        name: "Dharampeth - Zone F",
        positions: [
          [21.072231, 79.069690], // Node69
          [21.072246, 79.070077], // Node70
          [21.072281, 79.070420], // Node71
          [21.071580, 79.070500], // Node72
          [21.070819, 79.070763], // Node77
          [21.070544, 79.071267], // Node78
          [21.070534, 79.070559], // Node82
          [21.070614, 79.069658], // Node81
          [21.070944, 79.069787], // Node74
          [21.072231, 79.069690], // Node69 again to close
        ],
        color: 'green',
        fillColor: 'lightgreen',
        averageOutbreakRisk: 12.8,
        recentReportedCases: 0,
        weatherCondition: "Clear skies",
        priorityLevel: "Low",
        waterQuality: "Good quality",
        recommendedAction: "Continue routine checks"
      },
      {
        id: "polygon-7",
        name: "Dharampeth - Zone G",
        positions: [
          [21.071395, 79.067521], // Node15
          [21.070015, 79.067354], // Node11
          [21.067926, 79.066375], // Node62
          [21.067962, 79.066011], // Node14
          [21.067991, 79.065570], // Node61
          [21.068086, 79.064541], // Node60
          [21.068407, 79.064586], // Node8
          [21.068837, 79.064682], // Node7
          [21.069256, 79.064727], // Node5
          [21.070308, 79.065248], // Node2
          [21.070579, 79.066300], // Node57
          [21.070829, 79.066595], // Node21
          [21.071495, 79.066676], // Node35
          [21.071435, 79.067078], // Node36
          [21.071395, 79.067521], // Node15 again to close
        ],
        color: 'green',
        fillColor: 'lightgreen',
        averageOutbreakRisk: 5.1,
        recentReportedCases: 0,
        weatherCondition: "Clear skies",
        priorityLevel: "Low",
        waterQuality: "Excellent quality",
        recommendedAction: "Maintain current monitoring"
      },
      {
        id: "polygon-8",
        name: "Dharampeth - Zone H",
        positions: [
          [21.069256, 79.064727], // Node5
          [21.070394, 79.064868], // Node52
          [21.071019, 79.064964], // Node53
          [21.071179, 79.065055], // Node44
          [21.071665, 79.065511], // Node17
          [21.071250, 79.065469], // Node18
          [21.070747, 79.065341], // Node1
          [21.070308, 79.065248], // Node2
          [21.069256, 79.064727], // Node5 again to close
        ],
        color: 'orange',
        fillColor: 'orange',
        averageOutbreakRisk: 38.9,
        recentReportedCases: 1,
        weatherCondition: "Moderate rainfall",
        priorityLevel: "Medium",
        waterQuality: "Slightly elevated contamination",
        recommendedAction: "Investigate source"
      },
      {
        id: "polygon-9",
        name: "Dharampeth - Zone I",
        positions: [
          [21.071665, 79.065511], // Node17
          [21.071635, 79.065903], // Node33
          [21.071565, 79.066305], // Node19
          [21.071495, 79.066676], // Node35
          [21.071096, 79.066184], // Node95
          [21.070747, 79.065341], // Node1
          [21.071665, 79.065511], // Node17 (close polygon)
        ],
        color: 'red',
        fillColor: 'red',
        averageOutbreakRisk: 92.1,
        recentReportedCases: 12,
        weatherCondition: "Severe weather",
        priorityLevel: "High",
        waterQuality: "Severely contaminated",
        recommendedAction: "Immediate evacuation and treatment"
      },
      {
        id: "polygon-10",
        name: "Dharampeth - Zone J",
        positions: [
          [21.070747, 79.065341], // Node1
          [21.071096, 79.066184], // Node95
          [21.071495, 79.066676], // Node35
          [21.070829, 79.066595], // Node21
          [21.070579, 79.066300], // Node57
          [21.070308, 79.065248], // Node2
          [21.070747, 79.065341], // Node1 (close polygon)
        ],
        color: 'orange',
        fillColor: 'orange',
        averageOutbreakRisk: 28.3,
        recentReportedCases: 1,
        weatherCondition: "Light rain",
        priorityLevel: "Medium",
        waterQuality: "Good quality",
        recommendedAction: "Standard monitoring"
      },
      {
        id: "polygon-11",
        name: "Dharampeth - Zone K",
        positions: [
          [21.071775, 79.064771], // Node40
          [21.071845, 79.064385], // Node41
          [21.071310, 79.064288], // Node42
          [21.071235, 79.064664], // Node43
          [21.071775, 79.064771], // Node40 (close polygon)
        ],
        color: 'green',
        fillColor: 'lightgreen',
        averageOutbreakRisk: 3.2,
        recentReportedCases: 0,
        weatherCondition: "Clear skies",
        priorityLevel: "Low",
        waterQuality: "Excellent quality",
        recommendedAction: "Maintain current monitoring"
      },
      {
        id: "polygon-12",
        name: "Dharampeth - Zone L",
        positions: [
          [21.071665, 79.065511], // Node17
          [21.071720, 79.065147], // Node39
          [21.071775, 79.064771], // Node40
          [21.071235, 79.064664], // Node43
          [21.071019, 79.064964], // Node53
          [21.071665, 79.065511], // Node17 (close polygon)
        ],
        color: 'green',
        fillColor: 'lightgreen',
        averageOutbreakRisk: 18.3,
        recentReportedCases: 1,
        weatherCondition: "Light rain",
        priorityLevel: "Low",
        waterQuality: "Good quality",
        recommendedAction: "Standard monitoring"
      },
      {
        id: "polygon-13",
        name: "Dharampeth - Zone M",
        positions: [
          [21.072211, 79.063371], // Node45
          [21.072211, 79.063532], // Node46
          [21.072171, 79.064144], // Node47
          [21.071845, 79.064385], // Node41
          [21.071310, 79.064288], // Node42
          [21.071204, 79.063972], // Node49
          [21.071159, 79.063505], // Node48
          [21.072211, 79.063371], // Node45 (close polygon)
        ],
        color: 'green',
        fillColor: 'lightgreen',
        averageOutbreakRisk: 7.5,
        recentReportedCases: 0,
        weatherCondition: "Clear skies",
        priorityLevel: "Low",
        waterQuality: "Good quality",
        recommendedAction: "Continue routine checks"
      },
      {
        id: "polygon-14",
        name: "Dharampeth - Zone N",
        positions: [
          [21.072576, 79.064600], // Node55
          [21.072911, 79.064573], // Node54
          [21.072756, 79.065672], // Node28
          [21.072416, 79.065629], // Node29
          [21.072576, 79.064600], // Node55 (closing)
        ],
        color: 'red',
        fillColor: 'red',
        averageOutbreakRisk: 95.8,
        recentReportedCases: 15,
        weatherCondition: "Extreme weather",
        priorityLevel: "High",
        waterQuality: "Critically contaminated",
        recommendedAction: "Immediate emergency response"
      },
      {
        id: "polygon-15",
        name: "Dharampeth - Zone O",
        positions: [
          [21.072576, 79.064600], // Node55
          [21.072416, 79.065629], // Node29
          [21.072756, 79.065672], // Node28
          [21.072696, 79.066059], // Node27
          [21.072631, 79.066418], // Node26
          [21.072571, 79.066826], // Node24
          [21.071495, 79.066676], // Node35
          [21.071665, 79.065511], // Node17
          [21.071845, 79.064385], // Node41
          [21.072171, 79.064144], // Node47
          [21.072576, 79.064600], // Node55 (closing)
        ],
        color: 'green',
        fillColor: 'lightgreen',
        averageOutbreakRisk: 11.2,
        recentReportedCases: 0,
        weatherCondition: "Clear skies",
        priorityLevel: "Low",
        waterQuality: "Good quality",
        recommendedAction: "Continue routine monitoring"
      }
    ];

    // Function to handle polygon click
    const handlePolygonClick = (polygonData) => {
      setSelectedPolygon(polygonData);
      setShowPolygonInfo(true);
    };

    // Function to close polygon info
    const closePolygonInfo = () => {
      setShowPolygonInfo(false);
      setSelectedPolygon(null);
    };
    
    // Function to handle polyline click
    const handlePolylineClick = (polylineIndex, polylinePositions) => {
      // Generate dummy data for water leakage, pilferage, and quality
      const polylineData = {
        id: `polyline-${polylineIndex}`,
        name: `Pipeline Segment ${polylineIndex + 1}`,
        positions: polylinePositions,
        waterLeakage: (Math.random() * 100).toFixed(1) + '%',
        pilferage: (Math.random() * 50).toFixed(1) + '%',
        waterQuality: ['Excellent', 'Good', 'Fair', 'Poor'][Math.floor(Math.random() * 4)],
        pressureLevel: (Math.random() * 100).toFixed(1) + ' PSI',
        flowRate: (Math.random() * 50).toFixed(2) + ' L/min',
        lastInspection: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        recommendedAction: ['Maintain current monitoring', 'Schedule maintenance', 'Immediate inspection required'][Math.floor(Math.random() * 3)]
      };
      setSelectedPolyline(polylineData);
      setShowPolylineInfo(true);
    };
    
    // Function to close polyline info
    const closePolylineInfo = () => {
      setShowPolylineInfo(false);
      setSelectedPolyline(null);
    };

      function MyComponent() {
      useMapEvents({
        click(e) {
          console.log("component used");
          const { lat, lng } = e.latlng;
          console.log(`Coordinates: Lat ${lat.toFixed(6)}, Lng ${lng.toFixed(6)}`);
          setUserCoordinates({
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6),
          popUp: "", // Clear the popUp field when clicking on the map
          });
          setCurrentPolylineStart({
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6),

          })
        },
        zoomend(e) {
          const zoom = e.target.getZoom();
          setCurrentZoom(zoom);
        },
      });
    
      return null;
    }
    

    const [markers, setMarkers] = useState([
      
  {
        geocode:[21.071880,79.066724],
        popUp:"Node34"
      },
  {
        geocode:[21.071495,79.066676],
        popUp:"Node35"
      },
  {
        geocode:[21.071435,79.067078],
        popUp:"Node36"
      },
  {
        geocode:[21.071775,79.067550],
        popUp:"Node37"
      },
  {
        geocode:[21.072095,79.067609],
        popUp:"Node38"
      },{
        geocode:[21.071720,79.065147],
        popUp:"Node39"
      },

  {
        geocode:[21.071775,79.064771],
        popUp:"Node40"
      },

  {
        geocode:[21.071845,79.064385],
        popUp:"Node41"
      },

  {
        geocode:[21.071310,79.064288],
        popUp:"Node42"
      },

  {
        geocode:[21.071235,79.064664],
        popUp:"Node43"
      },

  {
        geocode:[21.071179,79.065055],
        popUp:"Node44"
      },
      {
        geocode:[21.072211,79.063371],
        popUp:"Node45"
      },

  {
        geocode:[21.072211,79.063532],
        popUp:"Node46"
      },

  {
        geocode:[21.072171,79.064144],
        popUp:"Node47"
      },

  {
        geocode:[21.071159,79.063505],
        popUp:"Node48"
      },

  {
        geocode:[21.071204,79.063972],
        popUp:"Node49"
      },

      

  {
        geocode:[21.070394,79.064868],
        popUp:"Node52"
      },

  {
        geocode:[21.071019,79.064964],
        popUp:"Node53"
      },{
        geocode:[21.072911,79.064573],
        popUp:"Node54"
      },
  {
        geocode:[21.072576,79.064600],
        popUp:"Node55"
      },

  {
        geocode:[21.071179,79.065892],
        popUp:"Node56"
      },
  {
        geocode:[21.070579,79.066300],
        popUp:"Node57"
      },

  {
        geocode:[21.070183,79.066257],
        popUp:"Node58"
      },

  {
        geocode:[21.068316,79.065603],
        popUp:"Node59"
      },

  {
        geocode:[21.068086,79.064541],
        popUp:"Node60"
      },

  {
        geocode:[21.067991,79.065570],
        popUp:"Node61"
      },

  {
        geocode:[21.067926,79.066375],
        popUp:"Node62"
      },

  {
        geocode:[21.073317,79.069218],
        popUp:"Node63"
      },


  {
        geocode:[21.073357,79.069594],
        popUp:"Node64"
      },
  {
    geocode:[21.071096,79.066184],
    popUp:"Node95"
  },

  {
        geocode:[21.073392,79.069969],
        popUp:"Node65"
      },


  {
        geocode:[21.073412,79.070302],
        popUp:"Node66"
      },


  {
        geocode:[21.072551,79.069261],
        popUp:"Node67"
      },


  {
        geocode:[21.072176,79.069309],
        popUp:"Node68"
      },


  {
        geocode:[21.072231,79.069690],
        popUp:"Node69"
      },


  {
        geocode:[21.072246,79.070077],
        popUp:"Node70"
      },


  {
        geocode:[21.072281,79.070420],
        popUp:"Node71"
      },


  {
        geocode:[21.071580,79.070500],
        popUp:"Node72"
      },


  {
        geocode:[21.070994,79.069374],
        popUp:"Node73"
      },


  {
        geocode:[21.070944,79.069787],
        popUp:"Node74"
      },


  {
        geocode:[21.070879,79.070173],
        popUp:"Node75"
      },


  {
        geocode:[21.070844,79.070516],
        popUp:"Node76"
      },


  {
        geocode:[21.070819,79.070763],
        popUp:"Node77"
      },


  {
        geocode:[21.070544,79.071267],
        popUp:"Node78"
      },



  {
        geocode:[21.070659,79.068746],
        popUp:"Node79"
      },

  {
        geocode:[21.070689,79.069374],
        popUp:"Node80"
      },


  {
        geocode:[21.070614,79.069658],
        popUp:"Node81"
      },


  {
        geocode:[21.070534,79.070559],
        popUp:"Node82"
      },


  {
        geocode:[21.070414,79.070543],
        popUp:"Node83"
      },



  {
        geocode:[21.070338,79.071219],
        popUp:"Node84"
      },


  {
        geocode:[21.070343,79.071225],
        popUp:"Node85"
      },{
        geocode:[21.070163,79.071198],
        popUp:"Node86"
      },


  {
        geocode:[21.070479,79.067856],
        popUp:"Node87"
      },


  {
        geocode:[21.070348,79.068660],
        popUp:"Node88"
      },



  {
        geocode:[21.070258,79.069572],
        popUp:"Node89"
      },


  {
        geocode:[21.070133,79.070500],
        popUp:"Node90"
      },



  {
        geocode:[21.070033,21.070033],
        popUp:"Node91"
      },


  {
        geocode:[21.069848,79.071139],
        popUp:"Node92"
      },



  {
        geocode:[21.069708,79.072185],
        popUp:"Node93"
      },


  {
        geocode:[21.069568,79.071112],
        popUp:"Node94"
      },


      {
        geocode:[21.072756,79.065672],
        popUp:"Node28"
      },
  {
        geocode:[21.072416,79.065629],
        popUp:"Node29"
      },
  {
        geocode:[21.072055,79.065560],
        popUp:"Node30"
      },
  {
        geocode:[21.072060,79.065565],
        popUp:"Node31"
      },
  {
        geocode:[21.072136,79.065045],
        popUp:"Node32"
      },
  {
        geocode:[21.071635,79.065903],
        popUp:"Node33"
      },
      {
        geocode:[21.072696,79.066059],
        popUp:"Node27"
      },
      {
        geocode:[21.072631,79.066418],
        popUp:"Node26"
      },
      {
        geocode:[21.072236,79.066788],
        popUp:"Node25"
      },
      {
        geocode:[21.072571,79.066826],
        popUp:"Node24"
      },
        {
          geocode:[21.072451,79.067663],
          popUp:"Node23"
        },
        {
          geocode:[21.070744,79.066949],
          popUp:"Node22"
        },
        {
        geocode:[21.070829,79.066595],
        popUp:"Node21"
      },
      {
        geocode:[21.070844,79.066177],
        popUp:"Node20"
      },
    
      {
        geocode:[21.071565,79.066305],
        popUp:"Node19"
      },
      {
        geocode:[21.071665,79.065511],
        popUp: "Node17"
      },
      {
        geocode: [21.071250,79.065469],
        popUp: "Node18"
      },
      {
        geocode: [21.070747,79.065341],
        popUp: "Node 1"
      },
      {
        geocode: [21.070308,79.065248],
        popUp: "Node 2"
      },
      {
        geocode: [21.070211,79.065853],
        popUp: "Node 3"
      },
      {
        geocode: [21.069082,79.065665],
        popUp: "Node 4"
      },
      {
        geocode: [21.069256,79.064727],
        popUp: "Node 5"
      },
      {
        geocode: [21.068633,79.065626],
        popUp: "Node 6"
      },
      {
        geocode: [21.068837,79.064682],
        popUp: "Node 7"
      },
      {
        geocode: [21.068407,79.064586],
        popUp: "Node 8"
      },
      {
        geocode: [21.070102,79.066756],
        popUp: "Node 9"
      },
      {
        geocode: [21.070545,79.066820],
        popUp: "Node 10"
      },
      {
        geocode : [21.070015,79.067354],    
        popUp: "Node 11"
      },
      {
        geocode: [21.069682,79.066709],
        popUp: "Node 12"
      },
      {
        geocode: [21.069764,79.066254],
        popUp: "Node 13"
      },
      {
        geocode: [21.067962,79.066011],
        popUp: "Node 14"
      },
      {
        geocode: [21.071395,79.067521],
        popUp: "Node 15"
      },
      {
        geocode: [21.069860,79.068613],
        popUp: "Node 16"
      }
    ]);
    // eslint-disable-next-line no-sparse-arrays
    const [userPolylines, setUserPolylines] = useState([
      // ...existing polylines...
      [
        [21.072911, 79.064573], // Node54
        [21.072756, 79.065672], // Node28
      ],
      [
        [21.072756, 79.065672], // Node28
        [21.072696, 79.066059], // Node27
    ],
    [
      [21.072696, 79.066059], // Node27
      [21.072631, 79.066418], // Node26
      [21.072571, 79.066826], // Node24
      [21.072451, 79.067663], // Node23
    ],
    [
      [21.071395, 79.067521], // Node15
      [21.071775, 79.067550], // Node37
      [21.072095, 79.067609], // Node38
      [21.072451, 79.067663], // Node23
    ],[
      [21.072756, 79.065672], // Node28
      [21.072416, 79.065629], // Node29
      [21.072055, 79.065560], // Node30
      [21.071665, 79.065511], // Node17
      [21.071250, 79.065469], // Node18
    ],[
      [21.071250, 79.065469], // Node18
      [21.070747, 79.065341], // Node1
    ],
      [
          [21.1490, 79.0890], // Start coordinate
          [21.1467, 79.0867], // End coordinate
        ],
        [
          [21.070747,79.065341],  //Node1
          [21.070308,79.065248],  //Node2
        ],
        [
          [21.070308,79.065248],  //Node2
          [21.070211,79.065853],  //Node3
        ],
        [
          [21.070211,79.065853],  //Node3
          [21.069082,79.065665],  //Node4
        ],
        [
          [21.069082,79.065665],  //Node4
          [21.069256,79.064727],  //Node5
        ],
        [
          [21.069082,79.065665],  //Node4
          [21.068633,79.065626],  //Node6
        ],
        [
          [21.069256,79.064727],  //Node5
          [21.068837,79.064682],  //Node7
        ],
        [
          [21.068837,79.064682],  //Node7
          [21.068407,79.064586],  //Node8
        ],
        [[21.070394,79.064868],[21.069256,79.064727]], // Node52 → Node5
    [[21.071775,79.067550],[21.071775,79.067550]],
        ,
        [
          [21.071179,79.065914],
          [21.071096,79.066184]
        ],
        [
          [21.070211,79.065853],  //Node3
          [21.070102,79.066756],  //Node9 
        ],
        [
          [21.070102,79.066756],  //Node9 
          [21.070545,79.066820],  //Node10
        ],
        [
          [21.070015,79.067354],  //Node11
          [21.070102,79.066756],  //Node9 
        ],
        [
          [21.069682,79.066709],  //Node12
          [21.070102,79.066756],  //Node9 
        ],
        [
          [21.069764,79.066254],  //Node13
          [21.069682,79.066709],  //Node12
        ],
        [
          [21.069764,79.066254],  //Node13
          [21.067962,79.066011],  //Node14
        ],
        [
          [21.070015,79.067354],  //Node11
          [21.071395,79.067521],  //Node15
        ],
        [
    [21.070394,79.064868], // Node52
    [21.071019,79.064964], // Node53
  ]
    
  
  ,[
    [21.071845,79.064385], // Node41
    [21.071775,79.064771], // Node40
    [21.071720,79.065147], // Node39
    [21.071665,79.065511], // Node17
    [21.071635,79.065903], // Node33
    [21.071565,79.066305], // Node19
    [21.071495,79.066676], // Node35
    [21.071435,79.067078], // Node36
    [21.071395,79.067521], // Node15
  ]
  ,[
    [21.070994,79.069374], // Node73
    [21.070944,79.069787], // Node74
    [21.070879,79.070173], // Node75
    [21.070844,79.070516], // Node76
    [21.070819,79.070763], // Node77
  ]
  ,[
    [21.070659,79.068746], // Node79
    [21.070689,79.069374], // Node80
    [21.070614,79.069658], // Node81
    [21.070534,79.070559], // Node82
  ]
  ,[
    [21.070659,79.068746], // Node79
    [21.070348,79.068660], // Node88
    [21.069860,79.068613], // Node16
  ]
  ,[
    [21.070479,79.067856], // Node87
    [21.070348,79.068660], // Node88
    [21.070258,79.069572], // Node89
    [21.070133,79.070500], // Node90
    [21.070163,79.071198], // Node86
  ]
  ,[
    [21.070544,79.071267], // Node78
    [21.070338,79.071219], // Node84
    [21.070163,79.071198], // Node86
    [21.069848,79.071139], // Node92
    [21.069568,79.071112], // Node94
  ]
  ,[
    [21.073317,79.069218], // Node63
    [21.073357,79.069594], // Node64
    [21.073392,79.069969], // Node65
    [21.073412,79.070302], // Node66
  ]
  ,[
    [21.072176,79.069309], // Node68
    [21.072231,79.069690], // Node69
    [21.072246,79.070077], // Node70
    [21.072281,79.070420], // Node71
  ]
  ,[
    [21.073317,79.069218], // Node63
    [21.072551,79.069261], // Node67
    [21.072176,79.069309], // Node68
    [21.070994,79.069374], // Node73
    [21.070689,79.069374], // Node80
  ]
  ,[
    [21.073357,79.069594], // Node64
    [21.072231,79.069690], // Node69
    [21.070944,79.069787], // Node74
  ]
  ,[
    [21.073392,79.069969], // Node65
    [21.072246,79.070077], // Node70
    [21.070879,79.070173], // Node75
  ]
  ,[
      [21.073412,79.070302], // Node66
      [21.072281,79.070420], // Node71
    ],
    [
      [21.071580,79.070500], // Node72
      [21.070844,79.070516], // Node76
    ],
    [
      [21.072451,79.067663], // Node23
      [21.072551,79.069261], // Node67
    ],
    [
      [21.070534,79.070559], // Node82
      [21.070414,79.070543], // Node83
    ],[[21.070414,79.070543],[21.070133,79.070500]], // Node83 → Node90
    [[21.070414,79.070543],[21.070338,79.071219]], // Node83 → Node84
    [[21.069848,79.071139],[21.069708,79.072185]], // Node92 → Node93
    [[21.069860,79.068613],[21.069568,79.071112]], // Node16 → Node94
    [[21.068086,79.064541],[21.067991,79.065570],[21.067962,79.066011],[21.067926,79.066375]], // Node60 → Node61 → Node14 → Node62
    [[21.068633,79.065626],[21.068316,79.065603],[21.067991,79.065570]], // Node6 → Node59 → Node61
    [[21.068407,79.064586],[21.068086,79.064541]],[[21.067926,79.066375],[21.069682,79.066709]], // Node62 → Node12
    [[21.068837,79.064682],[21.068633,79.065626]], // Node7 → Node6
    [[21.068407,79.064586],[21.068316,79.065603]], // Node8 → Node59
    
    [[21.071159,79.063505],[21.071204,79.063972]], // Node48 → Node49
    [[21.071204,79.063972],[21.072171,79.064144]], // Node49 → Node47
    [[21.071845,79.064385],[21.071310,79.064288]], // Node41 → Node42
    [[21.071775,79.064771],[21.071235,79.064664]], // Node40 → Node43
    [[21.071720,79.065147],[21.071179,79.065055]], // Node39 → Node44
    [[21.072136,79.065045],[21.072055,79.065560]], // Node32 → Node30
    [[21.072416,79.065629],[21.072576,79.064600]], // Node27 → Node33
    [[21.072571,79.066826],[21.072236,79.066788]],
    [[21.071775,79.067550],[21.071775,79.067550]], // Node34 → Node37
    [[21.072236,79.066788],[21.072095,79.067609]], // Node25 → Node38
    [[21.071635,79.065903],[21.071179,79.065892]], // Node33 → Node56
    [[21.071250,79.065469],[21.071179,79.065892]], // Node18 → Node56
  // Node19 → Node20
    // Node35 → Node21
    [[21.071435,79.067078],[21.070744,79.066949]],
    [
    [21.072696,79.066059], // Node27
    [21.071635,79.065903], // Node33
  ]
  ,[
    [21.072631,79.066418], // Node26
    [21.071565,79.066305], // Node19
    [21.071096,79.066184], // Node95
    [21.070844,79.066177], // Node20
  ]
  ,
  [
    [21.072236,79.066788], // Node25
    [21.07188,79.066724], // Node34
    [21.071495,79.066676], // Node35
  ]
  ,
  [
    [21.071775,79.067550], // Node34
    [21.071775,79.067550], // Node37
  ]
  ,
        [
          [21.070015,79.067354],  //Node11
          [21.069860,79.068613],  //Node16
        ],
        [
    [21.071495,79.066676], // Node35
    [21.070829,79.066595], // Node21
  ],
  [
    [21.070747,79.065341], // Node1
    [21.070579,79.066300], // Node57
  ]
  ,
  [
    [21.070579,79.066300], // Node57
    [21.070183,79.066257], // Node58
  ]


    ]);
    const [currentPolylineStart, setCurrentPolylineStart] = useState({
      latitude: "",
      longitude: "",
    });
    const [currentPolylineEnd, setCurrentPolylineEnd] = useState({
      latitude: "",
      longitude: "",
    });

    const handleAddMarker = () => {
      if (
        (userCoordinates.latitude && userCoordinates.longitude) &&
        userCoordinates.popUp
      ) {
        const newMarker = {
          geocode: [
            parseFloat(userCoordinates.latitude),
            parseFloat(userCoordinates.longitude),
          ],

          popUp: userCoordinates.popUp,
        };
        const jsonDataForNode ={
          latitude: parseFloat(userCoordinates.latitude),
          longitude:parseFloat(userCoordinates.longitude),
          popUp: userCoordinates.popUp,
          IsContaminated : 0,
          IsLeaking : 0,
          CaseOfProliferation : 0,
        };
        uploadJSONDynamically(jsonDataForNode); // Replace 'unique_document_name' with a unique identifier for the document
      
    

        setMarkers((prevMarkers) => [...prevMarkers, newMarker]);

        setUserCoordinates({
          latitude: "",
          longitude: "",
          popUp: "",
        });
      } else {
        // Handle error or validation message when not all input fields are filled
        // You can display an error message or handle it in your preferred way.
      }
    };

    const handleAddPolyline = () => {
      if (
        currentPolylineStart.latitude &&
        currentPolylineStart.longitude &&
        currentPolylineEnd.latitude &&
        currentPolylineEnd.longitude
      ) {
        const newPolyline = [
          [
            parseFloat(currentPolylineStart.latitude),
            parseFloat(currentPolylineStart.longitude),
          ],
          [
            parseFloat(currentPolylineEnd.latitude),
            parseFloat(currentPolylineEnd.longitude),
          ],
        ];

        setUserPolylines((prevPolylines) => [...prevPolylines, newPolyline]);
        setCurrentPolylineStart({
          latitude: "",
          longitude: "",
        });
        setCurrentPolylineEnd({
          latitude: "",
          longitude: "",
        });
      } else {
        // Handle error or validation message when the inputs are missing
        // You can display an error message or handle it in your preferred way.
      }
    };

    // eslint-disable-next-line no-unused-vars
    const handleMapClick = (e) => {
      // eslint-disable-next-line no-console
      console.log("Using the function");
      const { lat, lng } = e.latlng;
      
      // Update the input fields with the clicked coordinates
      setUserCoordinates({
        latitude: lat.toFixed(6),
        longitude: lng.toFixed(6),
        popUp: "", // Clear the popUp field when clicking on the map
      });
      // eslint-disable-next-line no-console
      console.log(userCoordinates.latitude);
      // eslint-disable-next-line no-console
      console.log(userCoordinates.longitude)
    };

    // eslint-disable-next-line no-unused-vars
    const handleSetLatitude = () => {
      setUserCoordinates({
        ...userCoordinates,
        latitude: "42.123456",
      });
    };

    const handleMarkerClick = (coordinates) => {
      // eslint-disable-next-line no-console
      console.log(`Clicked Marker: Lat ${coordinates[0]}, Lng ${coordinates[1]}`);
      setCurrentPolylineEnd({
          latitude:coordinates[0],
          longitude:coordinates[1]
      })
      // You can perform any desired actions with the coordinates here
    };


    // eslint-disable-next-line no-unused-vars
    const getCoordinatesAsJSON = () => {
      const coordinatesJSON = markers.map((marker) => ({
        latitude: marker.geocode[0],
        longitude: marker.geocode[1],
        popUp: marker.popUp,
        IsContaminated : 0,
        IsLeaking : 0,
        CaseOfProliferation : 0,
      }));

      // Call the upload function from FireApp.js
      uploadJSONToFirestore(coordinatesJSON);
    };

    const getPolylinesAsJSON = () => {
      const polylinesJSON = userPolylines.map((polyline) => ({
        coordinates: polyline.map((coord) => ({
          latitude: coord[0],
          longitude: coord[1],
        })),
      }));
    
      // Call the upload function from FireApp.js to upload the polylines to Firestore
      uploadPolylinesToFirestore(polylinesJSON);
    };

    return (
      <div>
        <br />
        <br />
        <br />

        {/* Input fields for latitude and longitude */}
        <input
          type="text"
          placeholder="Latitude"
          value={userCoordinates.latitude}
          onChange={(e) =>
            setUserCoordinates({ ...userCoordinates, latitude: e.target.value })
            
          }
          
        />
        <input
          type="text"
          placeholder="Longitude"
          value={userCoordinates.longitude}
          onChange={(e) =>
            setUserCoordinates({ ...userCoordinates, longitude: e.target.value })
          }
        />

        <input
          type="text"
          placeholder="Popup Content"
          value={userCoordinates.popUp}
          onChange={(e) =>
            setUserCoordinates({ ...userCoordinates, popUp: e.target.value })
          }
        />
        <button onClick={handleAddMarker}>Add Marker</button>
        <button onClick={() => console.log(getPolylinesAsJSON())}>GetCoordinates</button>

        <hr />


        <input
          type="text"
          placeholder="Start Node Latitude"
          value={currentPolylineStart.latitude}
          onChange={(e) =>
            setCurrentPolylineStart({
              ...currentPolylineStart,
              latitude: e.target.value,
            })
          }
        />
        <input
          type="text"
          placeholder="Start Node Longitude"
          value={currentPolylineStart.longitude}
          onChange={(e) =>
            setCurrentPolylineStart({
              ...currentPolylineStart,
              longitude: e.target.value,
            })
          }
        />
        <input
          type="text"
          placeholder="End Node Latitude"
          value={currentPolylineEnd.latitude}
          onChange={(e) =>
            setCurrentPolylineEnd({
              ...currentPolylineEnd,
              latitude: e.target.value,
            })
          }
        />
        <input
          type="text"
          placeholder="End Node Longitude"
          value={currentPolylineEnd.longitude}
          onChange={(e) =>
            setCurrentPolylineEnd({
              ...currentPolylineEnd,
              longitude: e.target.value,
            })
          }
        />
        <button onClick={handleAddPolyline}>Add Polyline</button>
        <button 
          onClick={() => setShowDeepInsights(!showDeepInsights)}
          style={{
            marginLeft: '10px',
            padding: '8px 16px',
            backgroundColor: showDeepInsights ? '#dc3545' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {showDeepInsights ? 'Hide Deep Insights' : 'Deep Insights'}
        </button>

        <MapContainer center={[21.069082, 79.065665]} zoom={20}>
          <MyComponent />
          {/* Only show blue polylines */}
          {userPolylines.map((polyline, index) => (
            <Polyline 
              key={index} 
              positions={polyline} 
              pathOptions={{
                color: "blue",
                weight: 4,
                opacity: 0.8
              }}
              eventHandlers={{
                click: () => handlePolylineClick(index, polyline),
                mouseover: (e) => {
                  const layer = e.target;
                  layer.setStyle({
                    weight: 6,
                    opacity: 1
                  });
                },
                mouseout: (e) => {
                  const layer = e.target;
                  layer.setStyle({
                    weight: 4,
                    opacity: 0.8
                  });
                }
              }}
            />
          ))}

          {/* Dynamic Polygons with Click Handlers - Only show when Deep Insights is active */}
          {showDeepInsights && polygonData.map((polygon) => (
            <Polygon
              key={polygon.id}
              positions={polygon.positions}
              pathOptions={{ 
                color: polygon.color, 
                fillColor: polygon.fillColor, 
                fillOpacity: 0.3,
                weight: 2
              }}
              eventHandlers={{
                click: () => handlePolygonClick(polygon)
              }}
            />
          ))}



          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MarkerClusterGroup
            chunkedLoading
            iconCreateFunction={createClusterCustomIcon}
            maxClusterRadius={120}
            disableClusteringAtZoom={18}
            spiderfyOnMaxZoom={false}
            showCoverageOnHover={true}
            zoomToBoundsOnClick={true}
            removeOutsideVisibleBounds={true}
            animate={true}
            animateAddingMarkers={true}
            maxZoom={17}
            spiderfyDistanceMultiplier={1.5}
            polygonOptions={{
              fillColor: '#007bff',
              color: '#007bff',
              weight: 2,
              opacity: 0.3,
              fillOpacity: 0.1
            }}
          >
            {markers.map((marker, index) => (
              <Marker key={index} position={marker.geocode} icon={customIcon} eventHandlers={{
                click: () => handleMarkerClick(marker.geocode),
              }}>
                <Popup>{marker.popUp}</Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
        
        {/* Polygon Information Popup/Sidebar */}
        {showPolygonInfo && selectedPolygon && (
          <div className="polygon-info-overlay">
            <div className="polygon-info-popup">
              <div className="polygon-info-header">
                <h3>{selectedPolygon.name}</h3>
                <button 
                  className="close-button" 
                  onClick={closePolygonInfo}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              
              <div className="polygon-info-content">
                <div className="info-row">
                  <span className="parameter">Location (Node name or ID)</span>
                  <span className="value">{selectedPolygon.name}</span>
                </div>
                
                <div className="info-row">
                  <span className="parameter">Average Outbreak Risk (%)</span>
                  <span className="value">{selectedPolygon.averageOutbreakRisk}%</span>
                </div>
                
                <div className="info-row">
                  <span className="parameter">Recent Reported Cases</span>
                  <span className="value">{selectedPolygon.recentReportedCases}</span>
                </div>
                
                <div className="info-row">
                  <span className="parameter">Weather Condition</span>
                  <span className="value">{selectedPolygon.weatherCondition}</span>
                </div>
                
                <div className="info-row">
                  <span className="parameter">Priority Level</span>
                  <span className="value priority">
                    <span className={`priority-dot priority-${selectedPolygon.priorityLevel.toLowerCase()}`}></span>
                    {selectedPolygon.priorityLevel}
                  </span>
                </div>
                
                <div className="info-row">
                  <span className="parameter">Water Quality</span>
                  <span className="value">{selectedPolygon.waterQuality}</span>
                </div>
                
                <div className="info-row">
                  <span className="parameter">Recommended Action</span>
                  <span className="value">{selectedPolygon.recommendedAction}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Polyline Information Popup/Sidebar */}
        {showPolylineInfo && selectedPolyline && (
          <div className="polygon-info-overlay">
            <div className="polygon-info-popup">
              <div className="polygon-info-header">
                <h3>{selectedPolyline.name}</h3>
                <button 
                  className="close-button" 
                  onClick={closePolylineInfo}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              
              <div className="polygon-info-content">
                <div className="info-row">
                  <span className="parameter">Location (Pipeline Segment)</span>
                  <span className="value">{selectedPolyline.name}</span>
                </div>
                
                <div className="info-row">
                  <span className="parameter">Water Leakage (%)</span>
                  <span className="value">{selectedPolyline.waterLeakage}</span>
                </div>
                
                <div className="info-row">
                  <span className="parameter">Pilferage (%)</span>
                  <span className="value">{selectedPolyline.pilferage}</span>
                </div>
                
                <div className="info-row">
                  <span className="parameter">Water Quality</span>
                  <span className="value">{selectedPolyline.waterQuality}</span>
                </div>
                
                <div className="info-row">
                  <span className="parameter">Pressure Level</span>
                  <span className="value">{selectedPolyline.pressureLevel}</span>
                </div>
                
                <div className="info-row">
                  <span className="parameter">Flow Rate</span>
                  <span className="value">{selectedPolyline.flowRate}</span>
                </div>
                
                <div className="info-row">
                  <span className="parameter">Last Inspection</span>
                  <span className="value">{selectedPolyline.lastInspection}</span>
                </div>
                
                <div className="info-row">
                  <span className="parameter">Recommended Action</span>
                  <span className="value">{selectedPolyline.recommendedAction}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
      </div>
    );
  }