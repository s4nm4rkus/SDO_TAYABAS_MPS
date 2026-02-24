import LoginButton from "../../common/buttons/LoginButton";

import LogoSDO from "../../../assets/images/header logo/logo_sdo_tayabas.png";
import LogoDeped from "../../../assets/images/header logo/logo_deped.png";
import LogoBagongPil from "../../../assets/images/header logo/logo_bagong_pil.png";

function Footer() {
  return (
    <>
      {/* Inner Footer Wrapper */}
      <div className="flex flex-col md:flex-row items-center justify-around bg-white w-full">
        {/* Logos */}
        <div className="flex p-4 md:p-8 space-x-8">
          <div className="lg:w-logo-md lg:h-logo-md md:w-logo-sm md:h-logo-sm h-logo-sm w-logo-sm mt-.5 flex items-center justify-center rounded">
            <img src={LogoSDO} alt="SDO Tayabas Logo" className="mt-3" />
          </div>
          <div className="lg:w-logo-mlg lg:h-logo-mlg md:w-logo-md md:h-logo-md w-logo-md h-logo-md flex items-center justify-center rounded">
            <img
              src={LogoBagongPil}
              alt="Bagong Pilipinas Logo"
              className="logo-sdo"
            />
          </div>

          <div className="lg:w-logo-xl lg:h-logo-lg md:w-logo-lg md:h-logo-mlg w-logo-mlg h-logo-mlg flex items-center justify-center rounded text-shadow">
            <img src={LogoDeped} alt="DepEd Logo" className="logo-sdo" />
          </div>
        </div>
      </div>
    </>
  );
}

export default Footer;
