import { Outlet } from "react-router-dom";
import MainHeader from "../headers/main-header/Header";
import MainFooter from "../footers/main-footer/Footer";

const MainLayout = () => {
  return (
    <>
      <style>{`
        @keyframes dotFade {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.5); }
        }

        @keyframes slideRight {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(100vw); opacity: 0; }
        }

        @keyframes blobFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.97); }
        }

        .dot-grid {
          background-image: radial-gradient(circle, rgba(0,151,178,0.15) 1px, transparent 1px);
          background-size: 28px 28px;
        }

        .glow-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }

        .blob-1 {
          width: 700px;
          height: 700px;
          top: -15%;
          left: -15%;
          background: radial-gradient(circle, rgba(0,151,178,0.1), transparent 70%);
          animation: blobFloat 14s ease-in-out infinite;
        }

        .blob-2 {
          width: 600px;
          height: 600px;
          bottom: -10%;
          right: -10%;
          background: radial-gradient(circle, rgba(0,67,133,0.08), transparent 70%);
          animation: blobFloat 16s ease-in-out 2s infinite;
        }

        .blob-3 {
          width: 400px;
          height: 400px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, rgba(0,180,216,0.07), transparent 70%);
          animation: blobFloat 10s ease-in-out 4s infinite;
        }

        .dot {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: rgba(0, 151, 178, 0.35);
          animation: dotFade ease-in-out infinite;
          pointer-events: none;
        }

        .dot:nth-child(1)  { top: 8%;  left: 5%;  animation-duration: 3s;   animation-delay: 0s;   }
        .dot:nth-child(2)  { top: 18%; left: 88%; animation-duration: 4s;   animation-delay: 0.5s; }
        .dot:nth-child(3)  { top: 32%; left: 12%; animation-duration: 5s;   animation-delay: 1s;   }
        .dot:nth-child(4)  { top: 48%; left: 78%; animation-duration: 3.5s; animation-delay: 1.5s; }
        .dot:nth-child(5)  { top: 63%; left: 22%; animation-duration: 4.5s; animation-delay: 2s;   }
        .dot:nth-child(6)  { top: 74%; left: 68%; animation-duration: 3s;   animation-delay: 0.8s; }
        .dot:nth-child(7)  { top: 83%; left: 38%; animation-duration: 5s;   animation-delay: 1.2s; }
        .dot:nth-child(8)  { top: 12%; left: 52%; animation-duration: 4s;   animation-delay: 2.5s; }
        .dot:nth-child(9)  { top: 42%; left: 42%; animation-duration: 3.5s; animation-delay: 0.3s; }
        .dot:nth-child(10) { top: 88%; left: 82%; animation-duration: 4.5s; animation-delay: 1.8s; }
        .dot:nth-child(11) { top: 28%; left: 62%; animation-duration: 3s;   animation-delay: 3s;   }
        .dot:nth-child(12) { top: 58%; left: 8%;  animation-duration: 5s;   animation-delay: 0.6s; }

        .line-accent {
          position: absolute;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,151,178,0.2), transparent);
          pointer-events: none;
          animation: slideRight ease-in-out infinite;
        }

        .line-accent:nth-child(1) { top: 20%; width: 350px; animation-duration: 9s;  animation-delay: 0s;   }
        .line-accent:nth-child(2) { top: 48%; width: 220px; animation-duration: 11s; animation-delay: 3.5s; }
        .line-accent:nth-child(3) { top: 72%; width: 280px; animation-duration: 8s;  animation-delay: 6s;   }
        .line-accent:nth-child(4) { top: 35%; width: 180px; animation-duration: 13s; animation-delay: 1.5s; }
      `}</style>

      <div
        className="min-h-screen flex flex-col relative overflow-hidden"
        style={{ backgroundColor: "#f8f8ff" }}
      >
        {/* Dot Grid */}
        <div className="dot-grid absolute inset-0 pointer-events-none" />

        {/* Static Floating Blobs */}
        <div className="glow-blob blob-1" />
        <div className="glow-blob blob-2" />
        <div className="glow-blob blob-3" />

        {/* Pulsing Dots */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="dot" />
          ))}
        </div>

        {/* Sliding Line Accents */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="line-accent" />
          <div className="line-accent" />
          <div className="line-accent" />
          <div className="line-accent" />
        </div>

        {/* Corner Glows */}
        <div
          className="absolute top-0 left-0 w-96 h-96 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at top left, rgba(0,151,178,0.08), transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-96 h-96 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at bottom right, rgba(0,67,133,0.06), transparent 70%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col min-h-screen">
          <MainHeader />
          <main className="flex-1">
            <Outlet />
          </main>
          <MainFooter />
        </div>
      </div>
    </>
  );
};

export default MainLayout;
