import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Plus, Trash2, Syringe, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Vaccinations = () => {
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [vaccinations, setVaccinations] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        vaccine_name: '',
        date_given: new Date().toISOString().split('T')[0],
        next_dose_date: '',
        batch_number: '',
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
            loadVaccinations(selectedMember.id);
        }
    }, [selectedMember]);

    const loadVaccinations = async (memberId) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/members/${memberId}/vaccinations`, { withCredentials: true });
            setVaccinations(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm("Opravdu smazat?")) {
            await axios.delete(`/api/vaccinations/${id}`, { withCredentials: true });
            loadVaccinations(selectedMember.id);
        }
    }

    const handleEdit = (v) => {
        setFormData({
            vaccine_name: v.vaccine_name,
            date_given: v.date_given,
            next_dose_date: v.next_dose_date || '',
            batch_number: v.batch_number || '',
            notes: v.notes || ''
        });
        setEditingId(v.id);
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            vaccine_name: '',
            date_given: new Date().toISOString().split('T')[0],
            next_dose_date: '',
            batch_number: '',
            notes: ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                // UPDATE
                await axios.put(`/api/vaccinations/${editingId}`, formData, { withCredentials: true });
            } else {
                // CREATE
                await axios.post('/api/vaccinations', {
                    ...formData,
                    member_id: selectedMember.id
                }, { withCredentials: true });
            }

            handleCancel(); // Reset form
            loadVaccinations(selectedMember.id);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold text-slate-800">Očkování</h1>
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
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h2 className="font-semibold text-slate-800">Seznam vakcín</h2>
                            <button
                                onClick={showForm ? handleCancel : () => setShowForm(true)}
                                className="text-sm bg-white border border-slate-300 px-3 py-1 rounded-lg hover:bg-slate-50 text-indigo-600 font-medium"
                            >
                                {showForm ? 'Zavřít' : '+ Přidat'}
                            </button>
                        </div>

                        {showForm && (
                            <form onSubmit={handleSubmit} className="p-4 bg-indigo-50 border-b border-blue-100 space-y-3">
                                <h3 className="text-sm font-bold text-indigo-900 mb-2">{editingId ? 'Upravit záznam' : 'Nový záznam'}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Název vakcíny</label>
                                        <input
                                            required
                                            className="w-full p-2 rounded border border-slate-200 mt-1"
                                            value={formData.vaccine_name}
                                            onChange={e => setFormData({ ...formData, vaccine_name: e.target.value })}
                                            placeholder="Např. Hexacima"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Datum podání</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full p-2 rounded border border-slate-200 mt-1"
                                            value={formData.date_given}
                                            onChange={e => setFormData({ ...formData, date_given: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Další dávka (volitelné)</label>
                                        <input
                                            type="date"
                                            className="w-full p-2 rounded border border-slate-200 mt-1"
                                            value={formData.next_dose_date}
                                            onChange={e => setFormData({ ...formData, next_dose_date: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Šarže (volitelné)</label>
                                        <input
                                            className="w-full p-2 rounded border border-slate-200 mt-1"
                                            value={formData.batch_number}
                                            onChange={e => setFormData({ ...formData, batch_number: e.target.value })}
                                            placeholder="A123BC"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Poznámka</label>
                                    <textarea
                                        className="w-full p-2 rounded border border-slate-200 mt-1"
                                        rows="2"
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    ></textarea>
                                </div>
                                <div className="flex space-x-2">
                                    <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-medium shadow-sm hover:bg-indigo-700">
                                        {editingId ? 'Aktualizovat' : 'Uložit záznam'}
                                    </button>
                                    {editingId && (
                                        <button type="button" onClick={handleCancel} className="bg-white border border-slate-300 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-50">
                                            Zrušit
                                        </button>
                                    )}
                                </div>
                            </form>
                        )}

                        <div className="divide-y divide-slate-100">
                            {loading ? (
                                <div className="p-8 text-center text-slate-400">Načítám...</div>
                            ) : vaccinations.length === 0 ? (
                                <div className="p-8 text-center text-slate-400">Zatím žádná očkování.</div>
                            ) : (
                                vaccinations.map(v => (
                                    <div key={v.id} className="p-4 hover:bg-slate-50 flex justify-between items-start group">
                                        <div className="flex items-start space-x-3">
                                            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 mt-1">
                                                <Syringe className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-800">{v.vaccine_name}</h3>
                                                <p className="text-sm text-slate-500">Podáno: {new Date(v.date_given).toLocaleDateString('cs-CZ')}</p>
                                                {v.next_dose_date && (
                                                    <p className="text-sm text-amber-600 font-medium mt-1">
                                                        Další dávka: {new Date(v.next_dose_date).toLocaleDateString('cs-CZ')}
                                                    </p>
                                                )}
                                                {v.notes && <p className="text-sm text-slate-600 mt-1 italic">{v.notes}</p>}
                                                {v.batch_number && <span className="text-xs text-slate-400 uppercase tracking-widest mt-1 block">Šarže: {v.batch_number}</span>}
                                            </div>
                                        </div>
                                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition">
                                            <button onClick={() => handleEdit(v)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full">
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(v.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Vaccinations;
