import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { LogIn } from "lucide-react";
import LogoSDO from "../../../assets/images/header logo/logo_sdo_tayabas.png";
import LogoDeped from "../../../assets/images/header logo/logo_deped.png";
import LogoBagongPil from "../../../assets/images/header logo/logo_bagong_pil.png";

function Header() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <style>{`
        .header-bar {
          transition: all 0.4s ease;
        }
        .header-scrolled {
          background: #0097b2;
          box-shadow: 0 4px 30px rgba(0,151,178,0.3);
        }
        .header-top {
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0,151,178,0.2);
        }
      `}</style>

      <header className="w-full fixed top-0 z-50">
        <div
          className={`header-bar flex flex-col lg:flex-row items-center justify-between w-full px-6 py-3 ${scrolled ? "header-scrolled" : "header-top"}`}
        >
          {/* Logos */}
          <div className="flex items-center gap-4 p-2 lg:w-80">
            <img
              src={LogoSDO}
              alt="SDO Tayabas"
              className="h-logo-sm w-logo-sm lg:h-logo-md lg:w-logo-md object-contain mt-1"
            />
            <img
              src={LogoBagongPil}
              alt="Bagong Pilipinas"
              className="h-logo-mlg w-logo-mlg object-contain"
            />
            <img
              src={LogoDeped}
              alt="DepEd"
              className="h-logo-mlg w-logo-xl lg:h-logo-lg lg:w-logo-xl object-contain"
            />
          </div>

          {/* Center Text */}
          <div className="text-center flex-1 py-2 lg:py-0">
            <p
              className={`text-base font-light leading-tight transition-all duration-300 ${scrolled ? "text-white/85" : "text-[#242424]"}`}
            >
              Republic of the Philippines
            </p>
            <p
              className={`text-xl md:text-2xl font-bold leading-tight tracking-wide transition-all duration-300 ${scrolled ? "text-white" : "text-[#242424]"}`}
            >
              DEPARTMENT OF EDUCATION
            </p>
            <p
              className={`text-base font-light leading-tight transition-all duration-300 ${scrolled ? "text-white/85" : "text-[#242424]"}`}
            >
              City Schools Division of the City of Tayabas
            </p>
          </div>

          {/* Login Button */}
          <div className="p-4 lg:p-6 lg:w-80 flex justify-end">
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
              style={
                scrolled
                  ? {
                      background: "white",
                      color: "#242424",
                      border: "2px solid transparent",
                    }
                  : {
                      background: "transparent",
                      color: "#242424",
                      border: "2px solid #242424",
                    }
              }
            >
              <LogIn size={16} />
              Login
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;
