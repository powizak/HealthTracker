import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowLeft, BarChart2, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
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

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
                <div className="spinner mb-4"></div>
                <p className="text-slate-500 dark:text-slate-400">Načítám statistiky...</p>
            </div>
        </div>
    );

    const maxCount = Math.max(...Object.values(stats.perMember).map(x => x.count), 1);

    return (
        <div className="space-y-6 animate-slide-up">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-300"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-3xl font-bold text-gradient-primary">Statistiky</h1>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="stat-card bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800/30">
                    <div className="flex items-center justify-center mb-2">
                        <BarChart2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <p className="stat-value">{stats.totalRecords}</p>
                    <p className="stat-label">Celkem záznamů</p>
                </div>
                <div className="stat-card bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-100 dark:border-emerald-800/30">
                    <div className="flex items-center justify-center mb-2">
                        <CalendarIcon className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="stat-value bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{stats.totalSickDays}</p>
                    <p className="stat-label">Dnů nemoci celkem</p>
                </div>
            </div>

            {/* Illnesses per Member */}
            <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                    Četnost nemocí podle členů
                </h2>
                <div className="space-y-5">
                    {Object.entries(stats.perMember).map(([name, data], index) => (
                        <div key={name} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="font-medium text-slate-700 dark:text-slate-300">{name}</span>
                                <span className="text-slate-500 dark:text-slate-400">{data.count} záznamů</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-1000 ease-out"
                                    style={{
                                        width: `${(data.count / maxCount) * 100}%`,
                                        backgroundColor: data.color,
                                        transitionDelay: `${index * 100}ms`
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sick Days per Member */}
            <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-rose-500 dark:text-rose-400" />
                    Dny nemoci podle členů (roční statistika)
                </h2>
                <div className="space-y-6">
                    {Object.entries(stats.perMember).map(([name, data], index) => {
                        const yearPercentage = ((data.sickDays / 365) * 100).toFixed(1);
                        return (
                            <div key={name} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                                <div className="flex justify-between items-end mb-2">
                                    <div>
                                        <span className="font-bold text-slate-700 dark:text-slate-200 block">{name}</span>
                                        <span className="text-xs text-slate-400 dark:text-slate-500">
                                            Průměrná délka nemoci: {data.avgDuration} dní
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="block font-bold text-rose-600 dark:text-rose-400">{data.sickDays} dní</span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">{yearPercentage}% roku</span>
                                    </div>
                                </div>

                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4 overflow-hidden relative">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end px-2"
                                        style={{
                                            width: `${Math.min((data.sickDays / 365) * 100, 100)}%`,
                                            backgroundColor: data.color,
                                            transitionDelay: `${index * 100}ms`
                                        }}
                                    >
                                    </div>
                                </div>
                                <div className="mt-1 flex justify-between text-[10px] text-slate-300 dark:text-slate-600">
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
            <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Nejčastější nemoci</h2>
                <div className="flex flex-wrap gap-2">
                    {stats.topIllnesses.map(([name, count], i) => (
                        <div
                            key={i}
                            className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-full hover:scale-105 transition-transform duration-300 animate-scale-in"
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            <span className="font-medium text-slate-700 dark:text-slate-300">{name}</span>
                            <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold px-2.5 py-1 rounded-full">
                                {count}x
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Stats;
