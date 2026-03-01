import SchoolTable from "../../../components/common/tables/admin/SchoolTable";
import ClusterTable from "../../../components/common/tables/admin/ClusterTable";

const SchoolManagement = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold">School Management</h1>
      <p>Manage schools, departments, and related data.</p>
      <div className="mt-6">
        <ClusterTable />
      </div>
      <div className="mt-6">
        <SchoolTable />
      </div>
    </div>
  );
};

export default SchoolManagement;
