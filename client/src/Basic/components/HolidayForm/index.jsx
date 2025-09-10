import React, { useEffect, useState, useCallback } from 'react'
import moment from 'moment/moment';
import Calendar from './Calendar';
import HolidayEntryModalForm from './HolidayEntryModalForm';
import { Modal } from "../../../Inputs"
import toasterTrigger from "../../../Utils/toastTrigger";
import 'react-toastify/dist/ReactToastify.css';
import HolidayReport from './HolidayReport';
import { filterByMonth } from './helper';
import { useNavigate } from 'react-router-dom';
import { useGetHolidaysCalenderQuery } from '../../../redux/services/HolidaysServices';


const HolidayCalendar = () => {
  const [month, setMonth] = useState(new Date());
  const [openModal, setOpenModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [holidays, setHolidays] = useState([]);

  const { data: allData, isLoading, isFetching } = useGetHolidaysCalenderQuery({});

  useEffect(() => {
    if (!allData?.data) return
    setHolidays(allData.data)
  }, [allData, isLoading, isFetching]);

  useEffect(() => {
    const selectedMonth = sessionStorage.getItem("selectedMonth")
    if (selectedMonth) {
      setMonth(selectedMonth);
      sessionStorage.removeItem("selectedMonth")
    }
  }, []);
  useEffect(toasterTrigger, []);
  const navigate = useNavigate()
  function handleDateClick(date) {

    setMonth(date)
    setSelectedDate(date);
    setOpenModal(true);
  }

  return (
    <div className='w-screen h-screen'>
      <Modal isOpen={openModal} onClose={() => setOpenModal(false)}>
        <HolidayEntryModalForm holidays={holidays} selectedDate={selectedDate} onClose={() => { setOpenModal(false) }} setSelectedDate={setSelectedDate} />
      </Modal>
      <header className='font-bold  bg-blue-400  flex items-center justify-between' style={{ height: "10%" }}>
        <button className='bg-red-500 hover:bg-red-700 text-white font-bold mx-5 p-1 rounded'
          onClick={() => navigate(0)}>
          Back
        </button>
        <span className='justify-end flex text-white text-xl mx-20'>National Holiday Form</span>
        <div className='flex gap-2 px-2'>
          <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold px-1 rounded' onClick={() => setMonth(moment.utc(month).subtract(1, "M"))}>
            {"< Prev"}
          </button>
          <input style={{ colorScheme: "dark" }} type="month" name="" id="" className='rounded border select-none text-center bg-blue-500 hover:bg-blue-700 text-white font-bold' value={moment.utc(month).format("YYYY-MM")} onChange={(e) => setMonth(e.target.value)} />
          <button className='rounded bg-blue-500 hover:bg-blue-700 text-white font-bold  px-4' onClick={() => setMonth(moment.utc(month).add(1, "M"))}>
            {"Next >"}
          </button>
        </div>
      </header>
      <div className='w-full' style={{ height: "90%" }}>
        <div className='w-1/6 float-left h-full py-15 overflow-y-auto'>
          <HolidayReport holidays={holidays} onClick={(date) => setMonth(date)} />
        </div>
        <div className='w-5/6 float-right pt-11 h-full' >
          <Calendar holidays={filterByMonth(holidays, month)} handleDateClick={handleDateClick} month={month} setOpenModal={setOpenModal} setSelectedDate={setSelectedDate} />
        </div>
      </div>
    </div>
  )
}

export default HolidayCalendar
