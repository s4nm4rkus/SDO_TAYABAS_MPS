import UserTable from "../../../components/common/tables/admin/UserTable";
const UserManagement = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold">User Management</h1>
      <p>Create, edit, and manage system users.</p>
      <div className="mt-6">
        <UserTable />
      </div>
    </div>
  );
};

export default UserManagement;
