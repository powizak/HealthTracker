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

    if (loading) return <div className="p-4 text-center">Načítám...</div>;

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex items-center space-x-3">
                    <h1 className="text-2xl font-bold text-slate-800">Přehled</h1>
                    <Link to="/stats" className="bg-white p-2 rounded-full border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition" title="Statistiky">
                        <BarChart2 className="w-5 h-5" />
                    </Link>
                </div>

                <div className="flex space-x-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Hledat..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                    </div>

                    <div className="relative">
                        <select
                            value={memberFilter}
                            onChange={e => setMemberFilter(e.target.value)}
                            className="appearance-none pl-9 pr-8 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 bg-white"
                        >
                            <option value="">Všichni</option>
                            {members.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>

                    <Link to="/add" className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shrink-0">
                        <Plus className="w-5 h-5" />
                        <span className="hidden md:inline">Nový</span>
                    </Link>
                </div>
            </div>

            {filteredRecords.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
                    <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 mb-4">Žádné záznamy nenalezeny</p>
                    {records.length === 0 && <Link to="/add" className="text-indigo-600 font-semibold hover:underline">Přidat první záznam</Link>}
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredRecords.map(r => (
                        <Link key={r.id} to={`/record/${r.id}`} className="block bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-indigo-200 transition">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center space-x-2 mb-1">
                                        {r.member_name && (
                                            <span className="text-xs font-bold text-white px-2 py-0.5 rounded-full" style={{ backgroundColor: r.member_color }}>
                                                {r.member_name}
                                            </span>
                                        )}
                                        <h3 className="font-semibold text-lg text-slate-800">{r.title}</h3>
                                    </div>
                                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{r.description}</p>
                                    <div className="mt-3 flex items-center space-x-2 text-xs text-slate-400">
                                        <span className="bg-slate-100 px-2 py-1 rounded">{r.start_date}</span>
                                        {r.end_date && <span> - </span>}
                                        {r.end_date && <span className="bg-slate-100 px-2 py-1 rounded">{r.end_date}</span>}
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-300" />
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
