import React, { useState, useRef } from 'react';
import { FloatingLabelInput } from '../../../../src/Inputs';
import moment from 'moment';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { isHoliday } from './helper';
import { useCallback } from 'react';
import { useAddHolidaysCalenderMutation, useDeleteHolidaysCalenderMutation, useUpdateHolidaysCalenderMutation } from '../../../../src/redux/services/HolidaysServices';
import { useEffect } from 'react';

const HolidayEntryModalForm = ({ holidays, selectedDate, onClose, setSelectedDate }) => {
  const [id, setId] = useState("")
  const [addData] = useAddHolidaysCalenderMutation();
  const [updateData] = useUpdateHolidaysCalenderMutation();
  const [removeData] = useDeleteHolidaysCalenderMutation();
  const holiday = isHoliday(selectedDate, holidays);
  const [holidayDescription, setHolidayDescription] = useState("");


  const syncFormWithDb = useCallback(() => {
    if (holiday) {
      setSelectedDate(holiday?.date ? holiday.date : "");
      setHolidayDescription(holiday?.description ? holiday.description : "")
      setId(holiday.id)
    }
  }, [id, holiday]);

  useEffect(syncFormWithDb, [id, holiday])

  const data = {
    date: selectedDate, description: holidayDescription, id
  };

  const handleSubmitCustom = async (callback, data, text) => {
    try {
      let returnData = await callback(data).unwrap();
      onClose();
      toast.success(text + "Successfully");

    } catch (error) {
      console.log("handle");
    }
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    if (id) {
      handleSubmitCustom(updateData, data, "Updated");
    } else {
      handleSubmitCustom(addData, data, "Added");
    }
  };

  const handleDelete = async () => {
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }
      try {
        await removeData(id)
        setId("");
        onClose();
        toast.success("Deleted Successfully");
      } catch (error) {
        toast.error("something went wrong");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className='m-4'>
      <FloatingLabelInput label={"Date"} type={"date"} value={moment.utc(selectedDate).format("YYYY-MM-DD")} disabled={true} />
      <FloatingLabelInput label={"Holiday Description"} autoFocus={true} value={holidayDescription} setValue={setHolidayDescription} />
      <div className='flex justify-evenly'>
        <button
          className="bg-red-600 hover:bg-red-700 text-white font-bold hover:rounded p-1 mx-20"
          type="button"
          onClick={onClose}
        >
          Close
        </button>{console.log(selectedDate, "selectedDate", holidayDescription, "holidayDescription")}
        <button
          disabled={!id}
          className="bg-red-600 hover:bg-red-700 text-white font-bold hover:rounded p-1 mx-20 disabled:bg-red-300"
          type="button"
          onClick={handleDelete}
        >
          Delete
        </button>
        <button
          className="bg-green-600 hover:bg-green-700 text-white font-bold hover:rounded p-1 mx-20"
          type="submit"
        >
          Save
        </button>
      </div>
    </form>
  )
}

export default HolidayEntryModalForm
