import SDOFbPage from "../../assets/images/sdo_fbpage.png";
import useMainDashboardStats from "../../hooks/useMainDashboardStats";

const MainDashboard = () => {
  const { clusterCount, schoolCount, loading } = useMainDashboardStats();

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes pulse-ring {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.08); opacity: 0.8; }
        }

        .fade-up    { animation: fadeInUp 0.8s ease forwards; }
        .fade-up-d1 { opacity: 0; animation: fadeInUp 0.8s ease 0.2s forwards; }
        .fade-up-d2 { opacity: 0; animation: fadeInUp 0.8s ease 0.4s forwards; }
        .fade-up-d3 { opacity: 0; animation: fadeInUp 0.8s ease 0.6s forwards; }
        .fade-up-d4 { opacity: 0; animation: fadeInUp 0.8s ease 0.8s forwards; }
        .fade-left  { opacity: 0; animation: fadeInLeft 0.9s ease 0.2s forwards; }
        .fade-right { opacity: 0; animation: fadeInRight 0.9s ease 0.4s forwards; }

        .shimmer-text {
          background:#242424;
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          
        }

        .float        { animation: float 4s ease-in-out infinite; }
        .spin-slow    { animation: spin-slow 20s linear infinite; }
        .spin-reverse { animation: spin-reverse 15s linear infinite; }
        .pulse-ring   { animation: pulse-ring 3s ease-in-out infinite; }

        .stat-card {
          transition: all 0.3s ease;
        }
        .stat-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 35px rgba(0,0,0,0.12);
        }

        .info-card {
          background: white;
          border-radius: 1.25rem;
          transition: all 0.3s ease;
          overflow: hidden;
        }
        .info-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 45px rgba(0,0,0,0.1);
        }

        .section-divider {
          background: linear-gradient(90deg, transparent, #0097b2, #f472b6, #fb923c, transparent);
        }

        .badge-pill {
          background: linear-gradient(135deg, rgba(0,151,178,0.1), rgba(0,67,133,0.07));
          border: 1px solid rgba(0,151,178,0.2);
        }

        .announce-title {
          background: linear-gradient(90deg, #0097b2, #8b5cf6, #f472b6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* ── HERO SECTION ── */}
      <section className="relative mt-28 md:mt-24 lg:mt-16 w-full min-h-screen flex items-center px-6 md:px-16 lg:px-24 py-16 overflow-hidden">
        <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <div className="fade-left">
            {/* Badge */}
            <div className="badge-pill fade-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              <span className="text-cyan-700 text-xs font-semibold tracking-widest uppercase">
                Schools Division of Tayabas City
              </span>
            </div>

            {/* Main Title */}
            <h1 className="shimmer-text text-6xl md:text-7xl lg:text-8xl font-black leading-none mb-4 tracking-tight text-shadow-sm">
              TAYABAS
              <br />
              MPS
              <br />
              {/* <span className="text-5xl md:text-6xl lg:text-7xl">MPS</span> */}
            </h1>

            {/* Colorful Divider */}
            <div className="flex items-center gap-2 mb-6">
              <div className="h-1.5 w-10 rounded-full bg-cyan-500" />
              <div className="h-1.5 w-6 rounded-full bg-purple-500" />
              <div className="h-1.5 w-4 rounded-full bg-pink-400" />
              <div className="h-1.5 w-2 rounded-full bg-orange-400" />
              <div className="h-1.5 w-1 rounded-full bg-yellow-400" />
            </div>

            {/* Subtitle */}
            <p className="fade-up-d2 text-gray-600 text-lg md:text-xl font-light tracking-widest uppercase mb-4">
              Learning Outcomes Assessment
            </p>

            {/* Description */}
            <p className="fade-up-d3 text-gray-500 text-base md:text-lg max-w-lg leading-relaxed mb-10">
              A comprehensive monitoring system for tracking and evaluating Mean
              Percentage Scores across all schools in the Division of Tayabas
              City.
            </p>

            {/* Stat Cards */}
            <div className="fade-up-d4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: "Clusters",
                  value: loading ? "..." : clusterCount,
                  color: "#ffffff",
                  bg: "linear-gradient(135deg, #0097b2, #00b4d8)",
                  shadow: "rgba(0,151,178,0.4)",
                },
                {
                  label: "Schools",
                  value: loading ? "..." : schoolCount,
                  color: "#ffffff",
                  bg: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
                  shadow: "rgba(139,92,246,0.4)",
                },
                {
                  label: "Teachers",
                  value: "—",
                  color: "#ffffff",
                  bg: "linear-gradient(135deg, #f97316, #fb923c)",
                  shadow: "rgba(249,115,22,0.4)",
                },
                {
                  label: "Students",
                  value: "—",
                  color: "#ffffff",
                  bg: "linear-gradient(135deg, #ec4899, #f472b6)",
                  shadow: "rgba(236,72,153,0.4)",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="stat-card float rounded-2xl p-4 text-center"
                  style={{
                    background: item.bg,
                    animationDelay: `${i * 0.4}s`,
                    boxShadow: `0 8px 20px ${item.shadow}`,
                  }}
                >
                  <p className="text-2xl font-black text-white">{item.value}</p>
                  <p className="text-xs text-white/80 mt-1 tracking-wider uppercase font-medium">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="fade-right hidden lg:flex items-center justify-center">
            <div className="relative w-full max-w-md aspect-square">
              <div
                className="pulse-ring absolute inset-0 rounded-full"
                style={{ border: "2px solid rgba(0,151,178,0.25)" }}
              />

              <div className="spin-slow absolute inset-4">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <circle
                    cx="100"
                    cy="100"
                    r="95"
                    fill="none"
                    stroke="url(#grad1)"
                    strokeWidth="1.5"
                    strokeDasharray="6 8"
                  />
                  <defs>
                    <linearGradient
                      id="grad1"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#0097b2" />
                      <stop offset="50%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#f472b6" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div className="spin-reverse absolute inset-10">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="url(#grad2)"
                    strokeWidth="1.5"
                    strokeDasharray="4 10"
                  />
                  <defs>
                    <linearGradient
                      id="grad2"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#f97316" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Center Card */}
              <div
                className="absolute inset-16 rounded-3xl flex flex-col items-center justify-center shadow-xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(0,151,178,0.12), rgba(139,92,246,0.08))",
                  border: "1px solid rgba(0,151,178,0.2)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <svg viewBox="0 0 120 90" className="w-32 h-24 mb-3">
                  {[0, 1, 2, 3].map((i) => (
                    <line
                      key={i}
                      x1="10"
                      y1={10 + i * 18}
                      x2="115"
                      y2={10 + i * 18}
                      stroke="rgba(0,0,0,0.06)"
                      strokeWidth="0.5"
                    />
                  ))}
                  {[
                    { x: 18, h: 45, color: "#0097b2" },
                    { x: 34, h: 60, color: "#8b5cf6" },
                    { x: 50, h: 35, color: "#f97316" },
                    { x: 66, h: 70, color: "#ec4899" },
                    { x: 82, h: 50, color: "#10b981" },
                    { x: 98, h: 55, color: "#f59e0b" },
                  ].map((bar, i) => (
                    <rect
                      key={i}
                      x={bar.x}
                      y={80 - bar.h}
                      width="10"
                      height={bar.h}
                      rx="3"
                      fill={bar.color}
                      opacity="0.9"
                    />
                  ))}
                  <line
                    x1="10"
                    y1="80"
                    x2="115"
                    y2="80"
                    stroke="rgba(0,0,0,0.1)"
                    strokeWidth="1"
                  />
                </svg>
                <p
                  className="text-xs font-bold tracking-widest uppercase"
                  style={{ color: "#0097b2" }}
                >
                  MPS Tracker
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Performance Analytics
                </p>
              </div>

              {/* Floating Dots */}
              {[
                {
                  top: "5%",
                  left: "50%",
                  size: 12,
                  color: "#0097b2",
                  delay: "0s",
                },
                {
                  top: "20%",
                  left: "95%",
                  size: 8,
                  color: "#8b5cf6",
                  delay: "0.5s",
                },
                {
                  top: "75%",
                  left: "90%",
                  size: 10,
                  color: "#f97316",
                  delay: "1s",
                },
                {
                  top: "90%",
                  left: "45%",
                  size: 7,
                  color: "#ec4899",
                  delay: "1.5s",
                },
                {
                  top: "70%",
                  left: "2%",
                  size: 9,
                  color: "#10b981",
                  delay: "2s",
                },
                {
                  top: "25%",
                  left: "5%",
                  size: 6,
                  color: "#f59e0b",
                  delay: "0.8s",
                },
              ].map((dot, i) => (
                <div
                  key={i}
                  className="float absolute rounded-full"
                  style={{
                    top: dot.top,
                    left: dot.left,
                    width: dot.size,
                    height: dot.size,
                    background: dot.color,
                    opacity: 0.7,
                    animationDelay: dot.delay,
                    boxShadow: `0 0 10px ${dot.color}`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, transparent, rgba(248,248,255,0.9))",
          }}
        />
      </section>

      {/* ── SECTION DIVIDER ── */}
      <div className="section-divider h-1 w-full max-w-5xl mx-auto rounded-full my-2 opacity-50" />

      {/* ── ANNOUNCEMENTS SECTION ── */}
      <section className="relative w-full px-6 md:px-16 lg:px-24 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Section Title */}
          <div className="fade-up text-center mb-12">
            <div className="badge-pill inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4">
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
              <span className="text-pink-600 text-xs font-semibold tracking-widest uppercase">
                Latest Updates
              </span>
            </div>
            <h2 className="announce-title text-3xl md:text-4xl font-black">
              Announcements
            </h2>
            <p className="text-gray-400 text-sm mt-2">
              Stay updated with the latest news from SDO Tayabas City
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* Facebook Page */}
            <div
              className="fade-up-d1 info-card shadow-lg"
              style={{ border: "2px solid rgba(0,151,178,0.2)" }}
            >
              <div
                className="px-4 pt-4 pb-3"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(0,151,178,0.1), rgba(0,180,216,0.05))",
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #0097b2, #00b4d8)",
                    }}
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="white">
                      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Facebook Page
                  </h3>
                </div>
              </div>
              <img
                src={SDOFbPage}
                alt="SDO FB Page"
                className="w-full h-52 object-cover"
              />
              <div className="px-4 py-3 bg-gradient-to-r from-cyan-50 to-white">
                <p className="text-xs text-gray-500">
                  Follow us for the latest updates and announcements.
                </p>
              </div>
            </div>

            {/* Division Memorandum */}
            <div
              className="fade-up-d2 info-card shadow-lg p-5"
              style={{ border: "2px solid rgba(139,92,246,0.2)" }}
            >
              <div
                className="flex items-center gap-3 mb-4 pb-3"
                style={{ borderBottom: "2px dashed rgba(139,92,246,0.15)" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                  >
                    <path d="M9 12h6M9 16h6M9 8h6M5 4h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Division Memorandum
                  </h3>
                  <p className="text-xs text-purple-400 font-medium">S. 2025</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {[
                  {
                    no: "DM 708",
                    title: "2025 Division Science and Technology Fair Winners",
                  },
                  {
                    no: "DM 707",
                    title:
                      "Schools Complying to DepEd Partnership Database System",
                  },
                  {
                    no: "DM 706",
                    title: "Workshop on Emergency Mental Health Kit Creation",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex gap-3 p-2.5 rounded-xl hover:bg-purple-50 transition cursor-pointer group"
                  >
                    <span
                      className="text-xs font-bold shrink-0 px-2 py-1 rounded-lg text-white"
                      style={{
                        background: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
                      }}
                    >
                      {item.no}
                    </span>
                    <p className="text-xs text-gray-500 group-hover:text-gray-700 transition leading-relaxed">
                      {item.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Division Advisory */}
            <div
              className="fade-up-d3 info-card shadow-lg p-5"
              style={{ border: "2px solid rgba(249,115,22,0.2)" }}
            >
              <div
                className="flex items-center gap-3 mb-4 pb-3"
                style={{ borderBottom: "2px dashed rgba(249,115,22,0.15)" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #f97316, #fb923c)",
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                  >
                    <path d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 110 20A10 10 0 0112 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Division Advisory
                  </h3>
                  <p className="text-xs text-orange-400 font-medium">S. 2025</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {[
                  {
                    no: "DA 297",
                    title:
                      "May Rizz Pa Si Rizal: One-Act, Contemporary, Stage Play",
                  },
                  {
                    no: "DA 296",
                    title:
                      "Final List of Participants — Division Training on HOTS",
                  },
                  {
                    no: "DA 295",
                    title:
                      "Reminder on Submission of School Reports for Q1 SY 2025-2026",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex gap-3 p-2.5 rounded-xl hover:bg-orange-50 transition cursor-pointer group"
                  >
                    <span
                      className="text-xs font-bold shrink-0 px-2 py-1 rounded-lg text-white"
                      style={{
                        background: "linear-gradient(135deg, #f97316, #fb923c)",
                      }}
                    >
                      {item.no}
                    </span>
                    <p className="text-xs text-gray-500 group-hover:text-gray-700 transition leading-relaxed">
                      {item.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Feedback */}
            <div
              className="fade-up-d4 info-card shadow-lg"
              style={{ border: "2px solid rgba(236,72,153,0.2)" }}
            >
              <div
                className="px-4 pt-4 pb-3"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(236,72,153,0.08), rgba(244,114,182,0.05))",
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #ec4899, #f472b6)",
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-4 h-4"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                    >
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Feedback
                  </h3>
                </div>
              </div>
              <img
                src={SDOFbPage}
                alt="Feedback"
                className="w-full h-52 object-cover"
              />
              <div className="px-4 py-3 bg-gradient-to-r from-pink-50 to-white">
                <p className="text-xs text-gray-500">
                  Share your thoughts and help us improve our services.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default MainDashboard;
