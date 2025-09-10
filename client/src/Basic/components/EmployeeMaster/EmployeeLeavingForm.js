import React from 'react';

const EmployeeLeavingForm = ({ leavingReason,setLeavingReason, 
    leavingDate,setLeavingDate, 
    canRejoin,setCanRejoin, 
    rejoinReason,setRejoinReason,
    onSubmit, onClose
}) => {
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("called")
    onSubmit();
  };

  const handleCanRejoinChange = (e) => {
    setCanRejoin(e.target.checked);
    if (!e.target.checked) {
      setRejoinReason('');
    }
  };

  const handleRejoinReasonChange = (e) => {
    setRejoinReason(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label
          className="block text-gray-700 font-bold mb-2"
          htmlFor="reason"
        >
          Reason for leaving
        </label>
        <textarea
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="reason"
          value={leavingReason}
          onChange={(e) => setLeavingReason(e.target.value)}
        ></textarea>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2" htmlFor="date">
          Last day of work
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="date"
          type="date"
          value={leavingDate}
          onChange={(e) => setLeavingDate(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <div className="flex items-center">
          <input
            id="canRejoin"
            type="checkbox"
            className="form-checkbox h-5 w-5 text-blue-600"
            checked={canRejoin}
            onChange={handleCanRejoinChange}
          />
          <label
            htmlFor="canRejoin"
            className="ml-2 block text-gray-700 font-bold"
          >
            Can the employee rejoin the company?
          </label>
        </div>
      </div>
      {!canRejoin && (
        <div className="mb-4">
          <label
            className="block text-gray-700 font-bold mb-2"
            htmlFor="rejoinReason"
          >
            Reason why the employee cannot rejoin
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="rejoinReason"
            value={rejoinReason}
            onChange={handleRejoinReasonChange}
          ></textarea>
        </div>
      )}
      <div className="flex justify-between">
        <button
          type="button"
          className="mr-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={() => { onClose() }}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="mr-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

export default EmployeeLeavingForm;