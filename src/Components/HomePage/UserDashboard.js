import React, { useEffect, useMemo, useState } from "react";
import "./UserDashboard.css";
import { supabase } from "../../supabase";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#00e5ff", "#007bff", "#8ab4f8", "#4fc3f7", "#81d4fa"];

const UserDashboard = () => {
  const [hospitalData, setHospitalData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHospitalData();
  }, []);

  const fetchHospitalData = async () => {
    const { data, error } = await supabase
      .from("hospital_data")
      .select("*")
      .order("date", { ascending: true });

    if (error) {
      alert(error.message);
      return;
    }

    setHospitalData(data || []);
  };

  const pieData = useMemo(() => {
    const diseaseCases = {};

    hospitalData.forEach((item) => {
      const disease = item.disease;
      const cases = Number(item.admitted_cases || 0);

      diseaseCases[disease] =
        (diseaseCases[disease] || 0) + cases;
    });

    return Object.entries(diseaseCases).map(
      ([name, value]) => ({
        name,
        value,
      })
    );
  }, [hospitalData]);

  const graphData = useMemo(() => {
    const dateCases = {};

    hospitalData.forEach((item) => {
      const date = item.date;
      const cases = Number(item.admitted_cases || 0);

      dateCases[date] = (dateCases[date] || 0) + cases;
    });

    return Object.entries(dateCases).map(
      ([date, cases]) => ({
        date,
        cases,
      })
    );
  }, [hospitalData]);

  const totalCases = hospitalData.reduce(
    (sum, item) =>
      sum + Number(item.admitted_cases || 0),
    0
  );

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <h2>🏥 Smart Health</h2>
        <ul>
          <li className="active">Dashboard</li>
          <li onClick={fetchHospitalData}>Refresh</li>
          <li onClick={() => navigate("/outbreak-map")}>Outbreak Map</li>
          <li onClick={() => navigate("/disease-info")}>Disease Info & AI</li>
          <li onClick={logout}>Logout</li>
        </ul>
      </aside>

      <main className="main-dashboard">
        <header className="topbar">
          <h1>Hospital Analytics Dashboard</h1>
        </header>

        <section className="stats-grid">
          <div className="glass-card">
            <h3>Total Cases</h3>
            <p>{totalCases}</p>
          </div>

          <div className="glass-card">
            <h3>Total Reports</h3>
            <p>{hospitalData.length}</p>
          </div>

          <div className="glass-card">
            <h3>Diseases</h3>
            <p>{pieData.length}</p>
          </div>
        </section>

        <section className="charts-grid">
          <div className="glass-card chart-card">
            <h3>Cases Trend Report</h3>

            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={graphData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="cases"
                  stroke="#00e5ff"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card pie-card">
            <h3>Disease Cases Distribution</h3>

            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={
                        COLORS[index % COLORS.length]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="table-card glass-card">
          <h3>Hospital Report Table</h3>

          <table>
            <thead>
              <tr>
                <th>Hospital</th>
                <th>Disease</th>
                <th>Date</th>
                <th>Cases</th>
              </tr>
            </thead>

            <tbody>
              {hospitalData.map((item) => (
                <tr key={item.id}>
                  <td>{item.hospital_name}</td>
                  <td>{item.disease}</td>
                  <td>{item.date}</td>
                  <td>{item.admitted_cases}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default UserDashboard;