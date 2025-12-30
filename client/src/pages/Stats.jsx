import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowLeft, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Stats = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('/api/records', { withCredentials: true });
                const records = res.data;
                const membersRes = await axios.get('/api/members', { withCredentials: true });
                const members = membersRes.data;

                // 1. Illnesses per Member
                const perMember = {};
                members.forEach(m => perMember[m.name] = { count: 0, color: m.color, sickDays: 0, avgDuration: 0, totalDuration: 0 });

                // 2. Breakdown by Type (Title)
                const byType = {};

                let totalSickDays = 0;

                records.forEach(r => {
                    const name = r.member_name || 'Neurčeno';
                    if (!perMember[name]) perMember[name] = { count: 0, color: '#94a3b8', sickDays: 0, avgDuration: 0, totalDuration: 0 };

                    // Count
                    perMember[name].count++;

                    // By Type
                    const title = r.title || 'Neurčeno';
                    byType[title] = (byType[title] || 0) + 1;

                    // Sick Days
                    if (r.start_date) {
                        const start = new Date(r.start_date);
                        const end = r.end_date ? new Date(r.end_date) : new Date(r.start_date); // Default 1 day if no end
                        const diffTime = Math.abs(end - start);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

                        perMember[name].sickDays += diffDays;
                        perMember[name].totalDuration += diffDays;
                        totalSickDays += diffDays;
                    }
                });

                // Calculate Averages
                Object.keys(perMember).forEach(key => {
                    if (perMember[key].count > 0) {
                        perMember[key].avgDuration = (perMember[key].totalDuration / perMember[key].count).toFixed(1);
                    }
                });

                // Top 5 Illnesses
                const topIllnesses = Object.entries(byType)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5);

                setStats({
                    totalRecords: records.length,
                    totalSickDays,
                    perMember,
                    topIllnesses
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div>Načítám statistiky...</div>;

    const maxCount = Math.max(...Object.values(stats.perMember).map(x => x.count), 1);
    const maxSickDays = Math.max(...Object.values(stats.perMember).map(x => x.sickDays), 1);

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold text-slate-800">Statistiky</h1>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 text-center">
                    <p className="text-3xl font-bold text-indigo-600">{stats.totalRecords}</p>
                    <p className="text-sm text-indigo-800 mt-1">Celkem záznamů</p>
                </div>
                <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100 text-center">
                    <p className="text-3xl font-bold text-emerald-600">{stats.totalSickDays}</p>
                    <p className="text-sm text-emerald-800 mt-1">Dnů nemoci celkem</p>
                </div>
            </div>

            {/* Illnesses per Member */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-indigo-500" />
                    Četnost nemocí podle členů
                </h2>
                <div className="space-y-4">
                    {Object.entries(stats.perMember).map(([name, data]) => (
                        <div key={name}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-slate-700">{name}</span>
                                <span className="text-slate-500">{data.count} záznamů</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(data.count / maxCount) * 100}%`, backgroundColor: data.color }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sick Days per Member */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-rose-500" />
                    Dny nemoci podle členů (roční statistika)
                </h2>
                <div className="space-y-6">
                    {Object.entries(stats.perMember).map(([name, data]) => {
                        const yearPercentage = ((data.sickDays / 365) * 100).toFixed(1);
                        return (
                            <div key={name}>
                                <div className="flex justify-between items-end mb-2">
                                    <div>
                                        <span className="font-bold text-slate-700 block">{name}</span>
                                        <span className="text-xs text-slate-400">Průměrná délka nemoci: {data.avgDuration} dní</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="block font-bold text-rose-600">{data.sickDays} dní</span>
                                        <span className="text-xs text-slate-500">{yearPercentage}% roku</span>
                                    </div>
                                </div>

                                <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden relative">
                                    <div
                                        className="h-full rounded-full transition-all duration-500 flex items-center justify-end px-2"
                                        style={{ width: `${Math.min((data.sickDays / 365) * 100, 100)}%`, backgroundColor: data.color }} // Scale based on year (max 100%) or relative to max? User asked for % of year. 
                                    >
                                    </div>
                                    {/* Visual helper marks maybe? No, let's keep clean */}
                                </div>
                                <div className="mt-1 flex justify-between text-[10px] text-slate-300">
                                    <span>0%</span>
                                    <span>50%</span>
                                    <span>100%</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Top Illnesses */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Nejčastější nemoci</h2>
                <div className="flex flex-wrap gap-2">
                    {stats.topIllnesses.map(([name, count], i) => (
                        <div key={i} className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
                            <span className="font-medium text-slate-700">{name}</span>
                            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">{count}x</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Stats;
