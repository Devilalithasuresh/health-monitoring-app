import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./OutbreakMap.css";
import { supabase } from "../../supabase";
import { useNavigate } from "react-router-dom";

const GEOCODE_CACHE = {};

const OutbreakMap = () => {
  const [locationsData, setLocationsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getCoordinates = async (city) => {
    if (GEOCODE_CACHE[city]) return GEOCODE_CACHE[city];
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
          city
        )}`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        GEOCODE_CACHE[city] = coords;
        return coords;
      }
    } catch (e) {
      console.error("Geocoding failed for:", city, e);
    }
    return null;
  };

  const fetchOutbreakData = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("hospital_data").select("*");

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const aggregated = {};
    data.forEach((row) => {
      const loc = (row.location || "Unknown").toLowerCase().trim();
      if (!aggregated[loc]) {
        aggregated[loc] = {
          location: loc,
          totalCases: 0,
          diseases: {},
        };
      }
      aggregated[loc].totalCases += Number(row.admitted_cases || 0);

      const dName = row.disease || "Unknown";
      aggregated[loc].diseases[dName] =
        (aggregated[loc].diseases[dName] || 0) + Number(row.admitted_cases || 0);
    });

    const mapDataPoints = [];
    for (const key of Object.keys(aggregated)) {
      const item = aggregated[key];
      const coords = await getCoordinates(item.location);
      if (coords) {
        mapDataPoints.push({
          ...item,
          coordinates: coords,
        });
      }
      await new Promise((res) => setTimeout(res, 500));
    }

    setLocationsData(mapDataPoints);
    setLoading(false);
  };

  useEffect(() => {
    fetchOutbreakData();
  }, []);

  let initialCenter = [20, 0];
  let initialZoom = 2;
  if (!loading && locationsData.length > 0) {
    const maxLoc = locationsData.reduce((prev, curr) => (prev.totalCases > curr.totalCases) ? prev : curr);
    initialCenter = maxLoc.coordinates;
    initialZoom = 8;
  }

  return (
    <div className="map-dashboard-layout">
      <aside className="sidebar">
        <h2>🏥 Smart Health</h2>
        <ul>
          <li onClick={() => navigate("/dashboard")}>User Dashboard</li>
          <li onClick={() => navigate("/admin-dashboard")}>Admin Dashboard</li>
          <li className="active" onClick={fetchOutbreakData}>
            Outbreak Map (Refresh)
          </li>
        </ul>
      </aside>

      <main className="main-map">
        <header className="topbar map-header">
          <h1>Global Outbreak Tracking</h1>
          <p>
            Monitor high-risk regions in real-time. Red zones signify severe
            outbreaks .
          </p>
        </header>

        <section className="map-view-container glass-card">
          {loading ? (
            <div className="map-loader">
              <div className="spinner"></div>
              <p>Fetching geographical outbreak data...</p>
            </div>
          ) : (
            <MapContainer
              center={initialCenter}
              zoom={initialZoom}
              style={{ height: "100%", width: "100%", borderRadius: "10px" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {locationsData.map((loc, idx) => {
                let color, radius, zoneClass, zoneText;

                if (loc.totalCases > 500) {
                  color = "#ff4d4d"; // Red
                  radius = 35;
                  zoneClass = "risk-red";
                  zoneText = "High Outbreak (Red Zone)";
                } else if (loc.totalCases > 250) {
                  color = "#ffa64d"; // Orange
                  radius = 25;
                  zoneClass = "risk-orange";
                  zoneText = "Moderate Outbreak (Orange Zone)";
                } else {
                  color = "#ffff4d"; // Yellow
                  radius = 15;
                  zoneClass = "risk-yellow";
                  zoneText = "Warning Area (Yellow Zone)";
                }

                return (
                  <CircleMarker
                    key={idx}
                    center={loc.coordinates}
                    pathOptions={{
                      color: color,
                      fillColor: color,
                      fillOpacity: 0.6,
                    }}
                    radius={radius}
                  >
                    <Popup className="custom-popup">
                      <div className="map-popup-inner">
                        <h3 style={{ textTransform: "capitalize" }}>
                          {loc.location}
                        </h3>
                        <div className={`zone-status ${zoneClass}`}>
                          {zoneText}
                        </div>
                        <p className="total-cases">
                          <strong>Total Cases:</strong> {loc.totalCases}
                        </p>
                        <div className="disease-breakdown">
                          <h4>Breakdown:</h4>
                          <ul>
                            {Object.entries(loc.diseases).map(
                              ([diseaseName, count]) => (
                                <li key={diseaseName}>
                                  <span>{diseaseName}:</span> {count}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          )}
        </section>
      </main>
    </div>
  );
};

export default OutbreakMap;
