import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Plus, ChevronRight, Activity, Search, BarChart2, Filter } from 'lucide-react';

const Dashboard = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filteredRecords, setFilteredRecords] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [memberFilter, setMemberFilter] = useState('');
    const [members, setMembers] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [recRes, memRes] = await Promise.all([
                    axios.get('/api/records', { withCredentials: true }),
                    axios.get('/api/members', { withCredentials: true })
                ]);
                setRecords(recRes.data);
                setFilteredRecords(recRes.data);
                setMembers(memRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        let res = records;
        if (searchTerm) {
            res = res.filter(r => r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.description?.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (memberFilter) {
            res = res.filter(r => r.member_id === parseInt(memberFilter));
        }
        setFilteredRecords(res);
    }, [searchTerm, memberFilter, records]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
                <div className="spinner mb-4"></div>
                <p className="text-slate-500 dark:text-slate-400">Načítám...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-slide-up">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center space-x-3">
                    <h1 className="text-3xl font-bold text-gradient-primary">Přehled</h1>
                    <Link
                        to="/stats"
                        className="glass-card p-2.5 hover:scale-110 transition-all duration-300 group"
                        title="Statistiky"
                    >
                        <BarChart2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 group-hover:rotate-12 transition-transform duration-300" />
                    </Link>
                </div>

                {/* Search & Filter Section */}
                <div className="flex space-x-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                        <input
                            type="text"
                            placeholder="Hledat..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="input-field pl-10 pr-4 py-2.5 text-sm"
                        />
                    </div>

                    <div className="relative">
                        <select
                            value={memberFilter}
                            onChange={e => setMemberFilter(e.target.value)}
                            className="input-field appearance-none pl-10 pr-8 py-2.5 text-sm cursor-pointer"
                        >
                            <option value="">Všichni</option>
                            {members.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                    </div>

                    <Link to="/add" className="btn-primary px-4 py-2.5 text-sm shrink-0 flex items-center space-x-2">
                        <Plus className="w-5 h-5" />
                        <span className="hidden md:inline">Nový</span>
                    </Link>
                </div>
            </div>

            {/* Records List */}
            {filteredRecords.length === 0 ? (
                <div className="glass-card text-center py-16 border-dashed">
                    <Activity className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4 animate-pulse-slow" />
                    <p className="text-slate-500 dark:text-slate-400 mb-4 text-lg">Žádné záznamy nenalezeny</p>
                    {records.length === 0 && (
                        <Link to="/add" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline inline-flex items-center space-x-2">
                            <Plus className="w-4 h-4" />
                            <span>Přidat první záznam</span>
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredRecords.map((r, index) => (
                        <Link
                            key={r.id}
                            to={`/record/${r.id}`}
                            className="glass-card-hover block p-5 group animate-slide-up"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                        {r.member_name && (
                                            <span
                                                className="text-xs font-bold text-white px-3 py-1 rounded-full shadow-sm"
                                                style={{ backgroundColor: r.member_color }}
                                            >
                                                {r.member_name}
                                            </span>
                                        )}
                                        <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {r.title}
                                        </h3>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                                        {r.description}
                                    </p>
                                    <div className="mt-3 flex items-center space-x-2 text-xs">
                                        <span className="badge-primary">
                                            {r.start_date}
                                        </span>
                                        {r.end_date && (
                                            <>
                                                <span className="text-slate-400 dark:text-slate-500">→</span>
                                                <span className="badge-primary">
                                                    {r.end_date}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all duration-300" />
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
