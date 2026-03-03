import SchoolYearCard from "../../../components/common/cards/admin/schoolYearCard";
import GradingPeriodCard from "../../../components/common/cards/admin/GradingPeriodCard";
import SubjectTable from "../../../components/common/tables/admin/SubjectTable";
import GradeLevelCard from "../../../components/common/cards/admin/GradeLevelCard";

const AcademicSetup = () => {
  return (
    <div className="flex flex-col gap-6">
      <SchoolYearCard />
      <GradingPeriodCard />

      {/* Two columns side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SubjectTable />
        <GradeLevelCard />
      </div>
    </div>
  );
};

export default AcademicSetup;
