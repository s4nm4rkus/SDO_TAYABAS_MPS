import SchoolYearCard from "../../../components/common/cards/admin/schoolYearCard";
import GradingPeriodCard from "../../../components/common/cards/admin/GradingPeriodCard";
import SubjectTable from "../../../components/common/tables/admin/SubjectTable";
import GradeLevelCard from "../../../components/common/cards/admin/GradeLevelCard";
import { BookOpen } from "lucide-react";

const AcademicSetup = () => {
  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#242424]">Academic Setup</h1>
          <p className="text-sm text-gray-400 mt-1">
            Configure school years, grading periods, subjects and grade levels
          </p>
        </div>

        {/* SchoolYearCard as stat card */}
        <SchoolYearCard />
      </div>

      {/* Divider */}
      <div
        className="h-px w-full rounded-full"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,151,178,0.3), transparent)",
        }}
      />

      {/* Content */}
      <GradingPeriodCard />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SubjectTable />
        <GradeLevelCard />
      </div>
    </div>
  );
};

export default AcademicSetup;
