import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Plus, Trash2, Ruler, Pencil, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Growth = () => {
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        height: '',
        weight: '',
        head_circumference: '',
        notes: ''
    });

    useEffect(() => {
        const fetchMembers = async () => {
            const res = await axios.get('/api/members', { withCredentials: true });
            setMembers(res.data);
            if (res.data.length > 0) setSelectedMember(res.data[0]);
        };
        fetchMembers();
    }, []);

    useEffect(() => {
        if (selectedMember) {
            loadRecords(selectedMember.id);
        }
    }, [selectedMember]);

    const loadRecords = async (memberId) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/members/${memberId}/growth`, { withCredentials: true });
            setRecords(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (r) => {
        setFormData({
            date: r.date,
            height: r.height || '',
            weight: r.weight || '',
            head_circumference: r.head_circumference || '',
            notes: r.notes || ''
        });
        setEditingId(r.id);
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            date: new Date().toISOString().split('T')[0],
            height: '',
            weight: '',
            head_circumference: '',
            notes: ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                // UPDATE
                await axios.put(`/api/growth/${editingId}`, formData, { withCredentials: true });
            } else {
                // CREATE
                await axios.post('/api/growth', {
                    ...formData,
                    member_id: selectedMember.id
                }, { withCredentials: true });
            }

            handleCancel();
            loadRecords(selectedMember.id);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Opravdu smazat?')) {
            await axios.delete(`/api/growth/${id}`, { withCredentials: true });
            loadRecords(selectedMember.id);
        }
    };

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
                <h1 className="text-3xl font-bold text-gradient-primary flex items-center gap-2">
                    <Ruler className="w-8 h-8" />
                    Růstový graf
                </h1>
            </div>

            {/* Member Tabs */}
            <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                {members.map(m => (
                    <button
                        key={m.id}
                        onClick={() => setSelectedMember(m)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${selectedMember?.id === m.id
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 scale-105'
                                : 'glass-card hover:scale-105 text-slate-700 dark:text-slate-300'
                            }`}
                    >
                        {m.name}
                    </button>
                ))}
            </div>

            {!selectedMember ? (
                <div className="glass-card text-center py-16">
                    <Ruler className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Vyberte člena rodiny</p>
                </div>
            ) : (
                <>
                    {/* Measurements Card */}
                    <div className="glass-card overflow-hidden">
                        <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800/30 flex justify-between items-center">
                            <h2 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                <Ruler className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                Měření
                            </h2>
                            <button
                                onClick={showForm ? handleCancel : () => setShowForm(true)}
                                className={`text-sm px-4 py-2 rounded-lg font-medium transition-all duration-300 ${showForm
                                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                                        : 'btn-primary px-4 py-2 text-sm flex items-center gap-2'
                                    }`}
                            >
                                {showForm ? (
                                    <>
                                        <X className="w-4 h-4" />
                                        Zavřít
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4" />
                                        Nové měření
                                    </>
                                )}
                            </button>
                        </div>

                        {showForm && (
                            <form onSubmit={handleSubmit} className="p-5 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10 border-b border-indigo-100 dark:border-indigo-800/30 space-y-4 animate-slide-down">
                                <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-3">
                                    {editingId ? 'Upravit měření' : 'Nové měření'}
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">Datum</label>
                                        <input
                                            type="date"
                                            required
                                            className="input-field py-2 text-sm"
                                            value={formData.date}
                                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">Výška (cm)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="input-field py-2 text-sm"
                                            value={formData.height}
                                            onChange={e => setFormData({ ...formData, height: e.target.value })}
                                            placeholder="cm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">Váha (kg)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="input-field py-2 text-sm"
                                            value={formData.weight}
                                            onChange={e => setFormData({ ...formData, weight: e.target.value })}
                                            placeholder="kg"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1">Obvod hlavy (cm)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="input-field py-2 text-sm"
                                            value={formData.head_circumference}
                                            onChange={e => setFormData({ ...formData, head_circumference: e.target.value })}
                                            placeholder="cm"
                                        />
                                    </div>
                                </div>
                                <div className="flex space-x-2 pt-2">
                                    <button type="submit" className="btn-primary flex-1 py-2.5 text-sm">
                                        {editingId ? 'Aktualizovat' : 'Uložit'}
                                    </button>
                                    {editingId && (
                                        <button type="button" onClick={handleCancel} className="btn-secondary py-2.5 px-6 text-sm">
                                            Zrušit
                                        </button>
                                    )}
                                </div>
                            </form>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="p-4">Datum</th>
                                        <th className="p-4">Výška</th>
                                        <th className="p-4">Váha</th>
                                        <th className="p-4">Hlava</th>
                                        <th className="p-4 w-20"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="p-8 text-center">
                                                <div className="spinner mx-auto mb-2"></div>
                                                <p className="text-slate-500 dark:text-slate-400">Načítám...</p>
                                            </td>
                                        </tr>
                                    ) : records.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="p-8 text-center text-slate-400 dark:text-slate-500">
                                                Žádná měření
                                            </td>
                                        </tr>
                                    ) : (
                                        records.map((r, index) => (
                                            <tr
                                                key={r.id}
                                                className="hover:bg-slate-50 dark:hover:bg-slate-800/30 group transition-colors animate-slide-up"
                                                style={{ animationDelay: `${index * 50}ms` }}
                                            >
                                                <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                                                    {new Date(r.date).toLocaleDateString('cs-CZ')}
                                                </td>
                                                <td className="p-4 font-semibold text-slate-900 dark:text-slate-100">
                                                    {r.height ? `${r.height} cm` : '-'}
                                                </td>
                                                <td className="p-4 font-semibold text-slate-900 dark:text-slate-100">
                                                    {r.weight ? `${r.weight} kg` : '-'}
                                                </td>
                                                <td className="p-4 text-slate-600 dark:text-slate-400">
                                                    {r.head_circumference ? `${r.head_circumference} cm` : '-'}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                        <button
                                                            onClick={() => handleEdit(r)}
                                                            className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all duration-200"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(r.id)}
                                                            className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Growth;
