// import "../../styles/page styles/main.dashboard.style.css";

import SDOFbPage from "../../assets/images/sdo_fbpage.png";

function Landing() {
  return (
    <div className="flex-1 m-0 md:m-12 w-full md:w-10/12 h-full mx-0 md:mx-auto">
      <div className="w-full max-w-8xl lg:h-72 md:h-52 h-44 bg-white md:rounded-2xl flex flex-col justify-center items-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl  lg:text-6xl font-semibold text-dark-bg uppercase text-center">
          Announcements!
        </h1>
      </div>
      <div className="flex flex-wrap mt-2 w-full max-w-8xl mx-auto">
        <div className="p-4 text-left w-full h-full md:w-1/2 lg:w-1/2 xl:w-1/4 ">
          <h2 className="text-white font-bold text-2xl md:text-3xl lg:text-3xl text-shadow-lg">
            Facebook Page
          </h2>
          <img
            src={SDOFbPage}
            alt="SDO Tayabas City - FB Page"
            className="w-full h-72 mt-4 shadow-2xl object-cover rounded"
          />
        </div>
        <div className=" p-4 text-left w-full h-full md:w-1/2 lg:w-1/2 xl:w-1/4">
          <div className="py-2 px-4 bg-white mt-2 md:mt-12 lg:mt-[3.25rem] w-full h-full shadow-2xl rounded">
            <h4 className="text-dark-bg font-semibold text-xl md:text-1xl">
              Recent Division Memorandum
            </h4>
            <ul className="list-disc ml-5">
              <li className="my-2">
                DM NO. 708, S. 2025 - 2025 DIVISION SCIENCE AND TECHNOLOGY FAIR
                WINNERS
              </li>
              <li className="my-2">
                DM NO. 707, S. 2025 - LIST OF SCHOOLS COMPLYING TO THE DEPED
                PARTNERSHIP DATABASE SYSTEM (DPDS) UPLOADING FOR THE MONTH OF
                SEPTEMBER, FISCAL YEAR 2025
              </li>
              <li className="my-2">
                DM NO. 706, S. 2025 - WORKSHOP ON EMERGENCY MENTAL HEALTH KIT
                CREATION FOR LEARNERS
              </li>
            </ul>
          </div>
        </div>
        <div className="p-4 text-left w-full h-full md:w-1/2 lg:w-1/2 xl:w-1/4">
          <div className="py-2 px-4 bg-white  mt-2 md:mt-[3.25rem] lg:mt-[3.25rem] w-full h-full shadow-2xl rounded">
            <h4 className="text-dark-bg font-bold text-xl md:text-1xl">
              Recent Division Advisory
            </h4>
            <ul className="list-disc ml-5">
              <li className="my-2">
                DA NO. 297, S. 2025 - MAY RIZZ PA SI RIZAL: ONE-ACT,
                CONTEMPORARY, STAGE PLAY
              </li>
              <li className="my-2">
                DA NO. 296, S. 2025 - FINAL LIST OF PARTICIPANTS OF DIVISION
                TRAINING ON HIGHER ORDER THINKING SKILLS PROFESSIONAL LEARNING
                PACKAGES FOR MATHEMATICS, SCIENCE, AND ENGLISH TEACHERS (SY
                2025-2026)
              </li>
            </ul>
          </div>
        </div>
        <div className="p-4 text-left w-full md:w-1/2 lg:w-1/3 xl:w-1/4">
          <h2 className="text-white font-bold text-2xl md:text-3xl lg:text-3xl text-shadow-lg">
            Feedback
          </h2>
          <img
            src={SDOFbPage}
            alt="SDO Tayabas City - FB Page"
            className="w-full h-72 mt-4 shadow-2xl object-cover rounded"
          />
        </div>
      </div>
    </div>
  );
}

export default Landing;
