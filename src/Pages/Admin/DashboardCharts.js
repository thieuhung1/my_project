import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';

const donutData = [
  { label: '01', value: 25 },
  { label: '02', value: 50 },
  { label: '03', value: 75 },
  { label: '04', value: 100 },
];

const lineData = [
  { m: 'Jan', v: 950 }, { m: 'Feb', v: 700 }, { m: 'Mar', v: 520 }, { m: 'Apr', v: 480 },
  { m: 'May', v: 520 }, { m: 'Jun', v: 620 }, { m: 'Jul', v: 620 }, { m: 'Aug', v: 620 },
  { m: 'Sep', v: 420 }, { m: 'Oct', v: 500 }, { m: 'Nov', v: 560 },
];

const dailyBars = [
  { name: '1', A: 500, B: 300 }, { name: '2', A: 480, B: 260 },
  { name: '3', A: 300, B: 200 }, { name: '4', A: 500, B: 240 },
  { name: '5', A: 520, B: 300 }, { name: '6', A: 460, B: 210 },
  { name: '7', A: 380, B: 300 },
];

const radarData = [
  { subject: 'A', A: 120, B: 110 },
  { subject: 'B', A: 98, B: 130 },
  { subject: 'C', A: 86, B: 130 },
  { subject: 'D', A: 99, B: 100 },
  { subject: 'E', A: 85, B: 90 },
  { subject: 'F', A: 65, B: 85 },
];

const barSmall = [
  { x: '1', v: 90 }, { x: '2', v: 100 }, { x: '3', v: 40 },
  { x: '4', v: 70 }, { x: '5', v: 90 }, { x: '6', v: 60 },
  { x: '7', v: 90 }, { x: '8', v: 100 }, { x: '9', v: 30 }, { x: '10', v: 60 },
];

function Donut({ value, label }) {
  const r = 28, c = 2 * Math.PI * r;
  const dash = (value / 100) * c;
  return (
    <div className="analysis-card">
      <div className="analysis-head">
        <span>Analysis</span>
        <div className="toggle">
          <button>Month</button>
          <button className="active">Year</button>
        </div>
      </div>
      <div className="analysis-body">
        <svg viewBox="0 0 80 80" className="donut">
          <circle cx="40" cy="40" r={r} className="track" />
          <circle
            cx="40" cy="40" r={r} className="progress"
            strokeDasharray={`${dash} ${c - dash}`} transform="rotate(-90 40 40)"
          />
          <text x="40" y="44" textAnchor="middle" className="donut-text">{value}%</text>
        </svg>
        <div className="analysis-meta">
          <div className="big-num">{label}</div>
          <p>Lorem ipsum dolor sit amet, consectetur.</p>
          <div className="analysis-foot">
            <div className="pill">100</div>
            <button className="icon-btn">→</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardCharts() {
  return (
    <section className="grid">
      <div className="top-cards">
        {donutData.map(d => <Donut key={d.label} value={d.value} label={d.label} />)}

        <div className="panel daily">
          <div className="panel-head">
            <span>Daily charts</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={dailyBars}>
              <CartesianGrid vertical={false} stroke="#eef2f7" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="A" radius={[6, 6, 0, 0]} fill="#2f6bff" />
              <Bar dataKey="B" radius={[6, 6, 0, 0]} fill="#2ecc71" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mini-table">
            <div>Direction <b>FTM 01</b></div>
            <div>Circle <b>21</b></div>
            <div>Time <b>3.5</b></div>
            <div>Distance <b>22.75</b></div>
          </div>
        </div>
      </div>

      <div className="middle">
        <div className="panel line">
          <div className="panel-head">
            <span>Analysis</span>
            <div className="toggle">
              <button>Month</button><button className="active">Year</button>
            </div>
            <div className="right-tools">
              <span className="legend-dot">01</span>
              <span className="legend-dot active">01</span>
              <span className="legend-dot">01</span>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span />
                <em>Daily charts</em>
              </label>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={lineData}>
              <CartesianGrid stroke="#eef2f7" />
              <XAxis dataKey="m" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="v" stroke="#2f6bff" strokeWidth={3} dot={{ r: 4 }} fillOpacity={1} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="panel radar">
          <div className="panel-head">
            <span>Type of Load</span>
            <div className="toggle small">
              <button>Month</button><button>Day</button><button className="active">Year</button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
              <Radar name="A" dataKey="A" stroke="#2ecc71" fill="#2ecc71" fillOpacity={0.4} />
              <Radar name="B" dataKey="B" stroke="#27ae60" fill="#27ae60" fillOpacity={0.3} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bottom">
        <div className="panel bars">
          <div className="panel-head">
            <span>Analysis</span>
            <div className="toggle">
              <button>Month</button><button className="active">Year</button>
            </div>
          </div>
          <div className="bars-wrap">
            <div className="bars-left">
              <div className="big-num">01</div>
              <p>Lorem ipsum dolor sit amet, consectetur.</p>
              <div className="analysis-foot">
                <div className="pill">100</div>
                <button className="icon-btn">→</button>
              </div>
            </div>
            <div className="bars-list">
              {Array.from({ length: 8 }).map((_, i) => (
                <div className="bar-row" key={i}>
                  <div className="track"><div className="fill" style={{ width: `${30 + i * 8}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel small-bars">
          <div className="panel-head"><span>Analysis</span>
            <div className="toggle"><button>Month</button><button className="active">Year</button></div>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={barSmall}>
              <Bar dataKey="v" radius={[6, 6, 0, 0]} fill="#2f6bff" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel activity">
          <div className="panel-head"><span>Activity</span>
            <div className="toggle"><button>Month</button><button className="active">Year</button></div>
          </div>
          <div className="kpi">
            <div className="kpi-row">
              <span className="kpi-icon">≡</span> 9600$ <span className="mini-bars blue" />
            </div>
            <div className="kpi-row">
              <span className="kpi-icon">≡</span> 960$ <span className="mini-bars green" />
            </div>
          </div>
          <div className="gauge">
            <svg viewBox="0 0 120 70">
              <path d="M10,60 A50,50 0 0,1 110,60" className="gauge-track" />
              <path d="M10,60 A50,50 0 0,1 60,10" className="gauge-fill" />
              <line x1="60" y1="60" x2="60" y2="18" className="needle" />
              <text x="60" y="58" textAnchor="middle" className="g-text">50%</text>
              <text x="12" y="68" className="g-min">25%</text>
              <text x="108" y="68" textAnchor="end" className="g-max">100%</text>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}