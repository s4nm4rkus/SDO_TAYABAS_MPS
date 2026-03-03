import { X } from "lucide-react";

const AssignDrawer = ({
  drawer,
  selected,
  assignForm,
  setAssignForm,
  schools,
  clusters,
  confirm,
  setConfirm,
  onClose,
  onSave,
}) => {
  return (
    <div
      className={`fixed top-0 right-0 h-full bg-white shadow-xl z-40 flex flex-col overflow-hidden transition-all duration-500 ${
        drawer && selected ? "w-80" : "w-0"
      }`}
    >
      <div className="w-80 p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-base font-semibold text-gray-700">Assign User</h2>
          <button onClick={onClose} className="hover:text-red-500 transition">
            <X size={18} />
          </button>
        </div>

        {selected && (
          <>
            {/* User Info */}
            <div className="mb-6 p-3 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-800">{selected.fullname}</p>
              <p className="text-xs text-gray-400">{selected.username}</p>
            </div>

            {/* Role */}
            <div className="mb-4">
              <label className="text-xs text-gray-500 mb-1 block">Role</label>
              <select
                value={assignForm.role}
                onChange={(e) =>
                  setAssignForm({
                    role: e.target.value,
                    school_id: "",
                    cluster_id: "",
                  })
                }
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="school_head">School Head</option>
                <option value="teacher">Teacher</option>
                <option value="supervisor">Supervisor</option>
              </select>
            </div>

            {/* School */}
            {(assignForm.role === "teacher" ||
              assignForm.role === "school_head") && (
              <div className="mb-4">
                <label className="text-xs text-gray-500 mb-1 block">
                  Assign to School
                </label>
                <select
                  value={assignForm.school_id}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, school_id: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Select School</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.school_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Cluster */}
            {assignForm.role === "supervisor" && (
              <div className="mb-4">
                <label className="text-xs text-gray-500 mb-1 block">
                  Assign to Cluster
                </label>
                <select
                  value={assignForm.cluster_id}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, cluster_id: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Select Cluster</option>
                  {clusters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.cluster_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex-1" />

            {/* Save */}
            {!confirm ? (
              <button
                onClick={() => setConfirm(true)}
                className="w-full px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition"
              >
                Save Assignment
              </button>
            ) : (
              <div className="p-3 bg-yellow-50 border border-yellow-300 rounded text-sm text-yellow-800">
                <p className="mb-2 font-medium">Are you sure?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirm(false)}
                    className="flex-1 px-3 py-1.5 rounded border text-gray-600 hover:bg-gray-50"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={onSave}
                    className="flex-1 px-3 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    Yes, Save
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AssignDrawer;
