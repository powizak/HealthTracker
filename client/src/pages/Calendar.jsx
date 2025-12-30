import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarPage = () => {
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [records, setRecords] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [memRes, recRes] = await Promise.all([
                    axios.get('/api/members', { withCredentials: true }),
                    axios.get('/api/records', { withCredentials: true })
                ]);
                setMembers(memRes.data);
                setRecords(recRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => {
        // 0 = Sunday, 1 = Monday... we want 0 = Monday, so shift
        const day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1;
    };

    const changeMonth = (offset) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentDate(newDate);
    };

    const monthName = currentDate.toLocaleString('cs-CZ', { month: 'long', year: 'numeric' });
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const today = new Date();

    const getEventsForDay = (day) => {
        const dateStr = new Date(year, month, day + 1).toISOString().split('T')[0]; // +1 because dateStr calc might be off with timezone? 
        // Safer:
        const checkDate = new Date(year, month, day);
        const checkTime = checkDate.getTime();

        return records.filter(r => {
            const start = new Date(r.start_date);
            start.setHours(0, 0, 0, 0);

            let end;
            if (r.end_date) {
                end = new Date(r.end_date);
            } else {
                end = new Date(r.start_date);
            }
            end.setHours(23, 59, 59, 999);

            return checkTime >= start.getTime() && checkTime <= end.getTime();
        });
    };

    if (loading) return <div>Načítám kalendář...</div>;

    const renderCalendarDays = () => {
        const days = [];
        // Empty cells for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-24 bg-slate-50 border border-slate-100"></div>);
        }

        // Days
        for (let d = 1; d <= daysInMonth; d++) {
            const events = getEventsForDay(d);
            const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

            days.push(
                <div key={d} className={`h-24 border border-slate-100 p-1 relative ${isToday ? 'bg-indigo-50' : 'bg-white'}`}>
                    <div className={`text-sm font-medium mb-1 ${isToday ? 'text-indigo-600' : 'text-slate-700'}`}>{d}</div>
                    <div className="flex flex-col gap-1 overflow-y-auto max-h-[calc(100%-24px)] custom-scrollbar">
                        {events.map((ev, i) => (
                            <div
                                key={ev.id}
                                onClick={() => navigate(`/record/${ev.id}`)}
                                className="text-[10px] px-1.5 py-0.5 rounded cursor-pointer truncate text-white"
                                style={{ backgroundColor: ev.member_color || '#94a3b8' }}
                                title={`${ev.member_name}: ${ev.title}`}
                            >
                                {ev.member_name.substring(0, 1)}: {ev.title}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return days;
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full md:hidden">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-bold text-slate-800 capitalize">{monthName}</h1>
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={() => changeMonth(-1)} className="p-2 bg-white border border-slate-200 rounded-full hover:bg-slate-50">
                        <ChevronLeft className="w-5 h-5 text-slate-600" />
                    </button>
                    <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-sm bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
                        Dnes
                    </button>
                    <button onClick={() => changeMonth(1)} className="p-2 bg-white border border-slate-200 rounded-full hover:bg-slate-50">
                        <ChevronRight className="w-5 h-5 text-slate-600" />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Weekdays */}
                <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center py-2">
                    {['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'].map(day => (
                        <div key={day} className="text-sm font-semibold text-slate-500">{day}</div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7">
                    {renderCalendarDays()}
                </div>
            </div>
        </div >
    );
};

export default CalendarPage;
