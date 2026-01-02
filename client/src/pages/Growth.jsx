import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Plus, Trash2, Ruler } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Growth = () => {
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form
    const [showForm, setShowForm] = useState(false);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/growth', {
                ...formData,
                member_id: selectedMember.id
            }, { withCredentials: true });
            setShowForm(false);
            setFormData({
                date: new Date().toISOString().split('T')[0],
                height: '',
                weight: '',
                head_circumference: '',
                notes: ''
            });
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
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold text-slate-800">Růstový graf</h1>
            </div>

            {/* Member Tabs */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
                {members.map(m => (
                    <button
                        key={m.id}
                        onClick={() => setSelectedMember(m)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${selectedMember?.id === m.id
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            }`}
                    >
                        {m.name}
                    </button>
                ))}
            </div>

            {!selectedMember ? (
                <p className="text-center text-slate-500 mt-10">Vyberte člena rodiny</p>
            ) : (
                <>
                    {/* Add Button */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h2 className="font-semibold text-slate-800">Měření</h2>
                            <button
                                onClick={() => setShowForm(!showForm)}
                                className="text-sm bg-white border border-slate-300 px-3 py-1 rounded-lg hover:bg-slate-50 text-indigo-600 font-medium"
                            >
                                {showForm ? 'Zavřít' : '+ Nové měření'}
                            </button>
                        </div>

                        {showForm && (
                            <form onSubmit={handleSubmit} className="p-4 bg-indigo-50 border-b border-blue-100 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Datum</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full p-2 rounded border border-slate-200 mt-1"
                                            value={formData.date}
                                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Výška (cm)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="w-full p-2 rounded border border-slate-200 mt-1"
                                            value={formData.height}
                                            onChange={e => setFormData({ ...formData, height: e.target.value })}
                                            placeholder="cm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Váha (kg)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full p-2 rounded border border-slate-200 mt-1"
                                            value={formData.weight}
                                            onChange={e => setFormData({ ...formData, weight: e.target.value })}
                                            placeholder="kg"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Obvod hlavy (cm)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="w-full p-2 rounded border border-slate-200 mt-1"
                                            value={formData.head_circumference}
                                            onChange={e => setFormData({ ...formData, head_circumference: e.target.value })}
                                            placeholder="cm"
                                        />
                                    </div>
                                </div>
                                <button className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium shadow-sm hover:bg-indigo-700">Uložit</button>
                            </form>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                                    <tr>
                                        <th className="p-3">Datum</th>
                                        <th className="p-3">Výška</th>
                                        <th className="p-3">Váha</th>
                                        <th className="p-3">Hlava</th>
                                        <th className="p-3 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {records.map(r => (
                                        <tr key={r.id} className="hover:bg-slate-50 group">
                                            <td className="p-3 text-slate-700">{new Date(r.date).toLocaleDateString('cs-CZ')}</td>
                                            <td className="p-3 font-medium text-slate-900">{r.height ? `${r.height} cm` : '-'}</td>
                                            <td className="p-3 font-medium text-slate-900">{r.weight ? `${r.weight} kg` : '-'}</td>
                                            <td className="p-3 text-slate-600">{r.head_circumference ? `${r.head_circumference} cm` : '-'}</td>
                                            <td className="p-3">
                                                <button onClick={() => handleDelete(r.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {records.length === 0 && !loading && (
                                        <tr>
                                            <td colSpan="5" className="p-8 text-center text-slate-400">Žádná měření</td>
                                        </tr>
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
