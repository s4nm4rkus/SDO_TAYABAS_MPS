import LoginButton from "../../common/buttons/LoginButton";

import LogoSDO from "../../../assets/images/header logo/logo_sdo_tayabas.png";
import LogoDeped from "../../../assets/images/header logo/logo_deped.png";
import LogoBagongPil from "../../../assets/images/header logo/logo_bagong_pil.png";

function Header() {
  return (
    <header className="w-full bg-transparent">
      {/* Header Title Section */}
      <div className="text-center py-4">
        <h1
          className="text-textHeader-color text-4xl md:text-7xl font-black m-0 p-0 text-shadow"
          style={{ WebkitTextStroke: "1px white" }}
        >
          SDOTAYABASMPS
        </h1>
        <p
          className="text-textHeader-color text-lg md:text-3xl tracking-widest font-bold m-0 p-0 text-shadow"
          style={{ WebkitTextStroke: ".5px white" }}
        >
          Learning Outcomes Assessment
        </p>
      </div>

      {/* Inner Header Wrapper */}
      <div className="flex flex-col md:flex-col lg:flex-row items-center justify-between bg-innerHeader-bg w-full">
        {/* Logos */}
        <div className="flex p-4 md:p-6 space-x-4">
          <div className="lg:w-logo-md lg:h-logo-md md:w-logo-sm md:h-logo-sm h-logo-sm w-logo-sm mt-.5 flex items-center justify-center rounded">
            <img src={LogoSDO} alt="SDO Tayabas Logo" className="mt-3" />
          </div>
          <div className="lg:w-logo-mlg lg:h-logo-mlg md:w-logo-md md:h-logo-md w-logo-md h-logo-md flex items-center justify-center rounded">
            <img
              src={LogoBagongPil}
              alt="SDO Tayabas Logo"
              className="logo-sdo"
            />
          </div>

          <div className="lg:w-logo-xl lg:h-logo-lg md:w-logo-lg md:h-logo-mlg w-logo-mlg h-logo-mlg flex items-center justify-center rounded text-shadow">
            <img src={LogoDeped} alt="SDO Tayabas Logo" className="logo-sdo" />
          </div>
        </div>

        {/* Main Header Text */}
        <div className="text-center flex-1 py-2 md:py-4 lg:mr-12 md:mr-0 mr-0">
          <p className="text-white text-lg md:text-xl  font-light leading-tight">
            Republic of the Philippines
          </p>
          <p className="text-white text-xl md:text-[1.8rem] font-semibold leading-tight">
            DEPARTMENT OF EDUCATION
          </p>
          <p className="text-white text-lg md:text-xl font-light leading-tight">
            City Schools Division of the City of Tayabas
          </p>
        </div>

        {/* Button */}
        <div className="p-4 md:p-8 lg:mr-24 md:mr-0 mr-0 ">
          <LoginButton>Login</LoginButton>
        </div>
      </div>
    </header>
  );
}

export default Header;
