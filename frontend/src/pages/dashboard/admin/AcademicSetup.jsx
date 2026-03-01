import SchoolYearCard from "../../../components/common/cards/admin/schoolYearCard";
// import SetSchoolYearModal from "../../../components/common/modals/admin/setSchoolYearModal";
import GradingPeriodCard from "../../../components/common/cards/admin/GradingPeriodCard";

const AcademicSetup = () => {
  return (
    <>
      <SchoolYearCard />
      <div className="mt-6">
        <GradingPeriodCard />
      </div>
    </>
  );
};

export default AcademicSetup;
