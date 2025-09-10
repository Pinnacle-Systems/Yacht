import { Bar, Doughnut, Line } from "react-chartjs-2";
import './Dashboard.css'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from "chart.js";
import { useState } from "react";
import { IndianRupee, PieChart, TrendingUp, UserCheck, UsersRound } from "lucide-react";
import secureLocalStorage from "react-secure-storage";

import { Login } from "../../pages";
export default function Form() {


    ChartJS.register(
        CategoryScale,
        LinearScale,
        BarElement,
        LineElement,
        PointElement,
        Title,
        Tooltip,
        Legend, ArcElement
    );



    const userId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userId"
    )


    const barData = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
            {
                label: "Revenue ($)",
                data: [12000, 19000, 3000, 5000, 2000, 3000],
                backgroundColor: "#5CB338",
            },
        ],
    };

    const lineData = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
            {
                label: "Users",
                data: [50, 70, 80, 60, 90, 100],
                fill: false,
                borderColor: "#5CB338",
            },
        ],
    };

    // Dummy data for the table (e.g., top products)
    const dummyProducts = [
        { id: 1, name: "Product A", sales: 120 },
        { id: 2, name: "Product B", sales: 80 },
        { id: 3, name: "Product C", sales: 150 },
    ];


    //doughnut chart
    const [chatData] = useState({
        labels: ['Messages', 'Users', 'Active Chats', 'Archived', 'Pending'],
        datasets: [
            {
                data: [700, 150, 100, 300, 150],
                backgroundColor: ['#6366F1', '#22C55E', '#F97316', '#EC4899', '#8B5CF6'],
                borderColor: ['#6366F1', '#22C55E', '#F97316', '#EC4899', '#8B5CF6'],
                borderWidth: 1,
            },
        ],
    });

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                display: true,
                labels: {
                    boxWidth: 10,
                    boxHeight: 5,
                    padding: 12,
                    font: {
                        size: 10
                    },

                }
            },
            tooltip: {
                padding: 10,
                bodyFont: {
                    size: 12,
                },
                titleFont: {
                    size: 14,
                },
            },
        },
        cutout: '65%',
    };

    const data2 = {
        labels: ["Jan", "Feb", "Mar", "April", "May"],
        datasets: [
            {
                label: "Sales",
                data: [65, 59, 80, 81, 56],
                // backgroundColor: "#48BD16",
                backgroundColor: "#5DADE2",


                border: 'none',

            },
        ],
    };

    const options2 = {
        indexAxis: "y",
        responsive: true,

        plugins: {
            legend: { display: true },

        },
        scales: {
            y: {
                categoryPercentage: 0.6,
                barPercentage: 0.8,
            },
        },
    };



    const cardsData = [
        { label: 'Revenue', value: '$2500', logo: <IndianRupee size={50} color={'#30b5fc '} />, increase: true, percentage: '5%' },
        { label: 'Increase', value: '15%', logo: <TrendingUp size={50} color={'#399918'} />, increase: true, percentage: '15%' },
        { label: 'Users', value: 150, logo: <UsersRound size={50} color={'#FF885B '} />, increase: true, percentage: '10%' },
        { label: 'Manufacturers ', value: 50, logo: <UserCheck size={50} color={'#BE5985'} />, increase: true, percentage: '10%' },
        { label: 'Vendors', value: 100, logo: <UserCheck size={50} color={'grey'} />, increase: true, percentage: '10%' }
    ];

    return (

        <>

            {
                userId ?
                    <>
                        <div className="m-5 mt-2 overflow-auto "  >


                            <header className="mb-6">
                                <h4 className="text-2xl font-bold   text-gray-800">Organization Dashboard</h4>
                            </header>

                            {/* Cards Section */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                                {cardsData.map((card, index) => (
                                    <div
                                        key={index}
                                        className="p-4 bg-white rounded-lg shadow transition-transform transform hover:scale-105 cursor-pointer"
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-sm text-gray-600">{card.label}</p>
                                                <h4 className="text-lg font-semibold">{card.value}</h4>
                                                <p className="mb-0 text-[10px] text-gray-500 flex items-center">{card.label === 'Inactive Users' ? <span className=" mt-0.5">Inactive Users</span> : <div className="d-flex flex-wrap"><span className={`${card.increase ? 'text-green-600' : 'text-red-600'} fw-semibold text-xs `}>{card.increase ? '+' : '-'}{card.percentage} &nbsp;</span><span> since last month</span></div>}</p>

                                            </div>
                                            <div>{card.logo}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>


                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
                                {/* Bar Chart - Monthly Revenue */}
                                <div className="bg-white p-4 rounded-lg shadow">
                                    <h6 className="text-lg font-semibold mb-2">Monthly Revenue</h6>
                                    <Bar data={barData} className="mt-4" />
                                </div>

                                {/* Line Chart - User Growth */}
                                <div className="bg-white p-4 rounded-lg shadow">
                                    <h6 className="text-lg font-semibold mb-2">Business Growth</h6>
                                    <Line data={lineData} className="mt-4" />
                                </div>

                                {/* Doughnut Chart - Chat Analytics */}
                                <div className="bg-white p-4 rounded-lg shadow">
                                    <div className="flex items-center">
                                        <PieChart className="w-6 h-6 text-indigo-600 mr-2" />
                                        <h6 className="text-xl font-bold text-gray-800">Chat Analytics</h6>
                                    </div>
                                    <div className="mt-3">
                                        <Doughnut data={chatData} options={options} />
                                    </div>
                                </div>

                                {/* Bar Chart - Monthly Sales */}
                                <div className="bg-white p-4 rounded-lg shadow">
                                    <h6 className="text-lg font-semibold mb-2">Monthly Sales</h6>
                                    <Bar data={data2} options={options2} className="h-full mt-4" />
                                </div>
                            </div>

                            {/* Table Section */}
                            <div className="mt-6 bg-white p-4 rounded-lg shadow">
                                <h5 className="text-lg font-semibold mb-2">Dashboard Overview</h5>
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="text-left p-2 border-b">Orders Placed</th>
                                            <th className="text-left p-2 border-b">Pending Quotes</th>
                                            <th className="text-left p-2 border-b">Deliveries Expected</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <th className="text-left p-2 border-b">38 this month</th>
                                            <th className="text-left p-2 border-b">5</th>
                                            <th className="text-left p-2 border-b">8</th>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                    :
                    <>

                        <Login />


                    </>
            }

        </>
    )
};
