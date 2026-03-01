const SetSchoolYearModal = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Set School Year</h2>
        <input
          type="text"
          placeholder="Enter school year"
          className="w-full p-2 border border-gray-300 rounded mb-4"
        />
        <div className="flex justify-end space-x-2">
          <button className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
            Cancel
          </button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetSchoolYearModal;
