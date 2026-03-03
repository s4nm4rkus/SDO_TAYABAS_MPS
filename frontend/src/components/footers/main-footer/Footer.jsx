import LogoSDO from "../../../assets/images/header logo/logo_sdo_tayabas.png";
import LogoDeped from "../../../assets/images/header logo/logo_deped.png";
import LogoBagongPil from "../../../assets/images/header logo/logo_bagong_pil.png";

function Footer() {
  return (
    <footer className="w-full bg-dark-bg mt-auto">
      <div className="flex flex-col md:flex-row items-center justify-between px-8 py-4">
        {/* Logos - fixed width */}
        <div className="flex items-center gap-4 md:w-80">
          <img
            src={LogoSDO}
            alt="SDO Tayabas"
            className="h-logo-sm w-logo-sm object-contain mt-1"
          />
          <img
            src={LogoBagongPil}
            alt="Bagong Pilipinas"
            className="h-logo-mlg w-logo-mlg object-contain"
          />
          <img
            src={LogoDeped}
            alt="DepEd"
            className="h-logo-mlg w-logo-xl object-contain"
          />
        </div>

        {/* Center Text - truly centered */}
        <div className="text-center flex-1 py-3 md:py-0">
          <p className="text-white text-sm font-semibold">
            City Schools Division of the City of Tayabas
          </p>
          <p className="text-white/70 text-xs mt-1">
            Department of Education — Republic of the Philippines
          </p>
        </div>

        {/* Copyright - same fixed width as logos */}
        <div className="text-right md:w-80">
          <p className="text-white/60 text-xs">
            © {new Date().getFullYear()} SDO Tayabas
          </p>
          <p className="text-white/60 text-xs">All rights reserved</p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-black/20 text-center py-2">
        <p className="text-white/50 text-xs">
          SDOTAYABASMPS — Learning Outcomes Assessment System
        </p>
      </div>
    </footer>
  );
}

export default Footer;
