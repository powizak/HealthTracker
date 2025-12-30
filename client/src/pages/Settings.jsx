import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const COLORS = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Pink', value: '#ec4899' },
];

const CalendarSettings = () => {
    const [calendars, setCalendars] = useState([]);
    const [selectedCalendar, setSelectedCalendar] = useState('');
    const [syncEnabled, setSyncEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                const [calRes, userRes] = await Promise.all([
                    axios.get('/api/calendars', { withCredentials: true }),
                    axios.get('/api/me', { withCredentials: true })
                ]);
                setCalendars(calRes.data);
                setSelectedCalendar(userRes.data.calendar_id || (calRes.data.find(c => c.primary)?.id) || '');
                setSyncEnabled(!!userRes.data.sync_enabled);
            } catch (err) {
                console.error(err);
            }
        };
        loadData();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            await axios.put('/api/settings', {
                calendar_id: selectedCalendar,
                sync_enabled: syncEnabled
            }, { withCredentials: true });
            setMessage('Uloženo!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error(err);
            setMessage('Chyba při ukládání.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Google Kalendář</h2>
            <div className="space-y-4">
                <div>
                    <label className="flex items-center space-x-2 cursor-pointer mb-4">
                        <input
                            type="checkbox"
                            checked={syncEnabled}
                            onChange={e => setSyncEnabled(e.target.checked)}
                            className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-slate-700 font-medium">Automaticky přidávat záznamy do kalendáře</span>
                    </label>

                    <label className="block text-sm font-medium text-slate-700 mb-1">Výchozí kalendář pro synchronizaci</label>
                    <select
                        value={selectedCalendar}
                        onChange={e => setSelectedCalendar(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        <option value="">-- Vyberte kalendář --</option>
                        {calendars.map(c => (
                            <option key={c.id} value={c.id}>{c.summary} {c.primary ? '(Hlavní)' : ''}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Ukládám...' : 'Uložit nastavení'}
                    </button>
                    {message && <span className="text-sm text-green-600 font-medium">{message}</span>}
                </div>
            </div>
        </div>
    );
};

const Settings = () => {
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [newName, setNewName] = useState('');
    const [selectedColor, setSelectedColor] = useState(COLORS[0].value);

    // Fetch members
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await axios.get('/api/members', { withCredentials: true });
                setMembers(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchMembers();
    }, []);

    const handleAddMember = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/members', {
                name: newName,
                color: selectedColor
            }, { withCredentials: true });
            setMembers([...members, res.data]);
            setNewName('');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold text-slate-800">Nastavení</h1>
            </div>

            {/* Calendar Settings */}
            <CalendarSettings />

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Členové rodiny</h2>

                <div className="space-y-3 mb-6">
                    {members.map(m => (
                        <div key={m.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: m.color }}>
                                    {m.name.substring(0, 2).toUpperCase()}
                                </div>
                                <span className="font-medium text-slate-700">{m.name}</span>
                            </div>
                            {/* Deletion not implemented in backend yet, just placeholder */}
                            {/* <Trash2 className="w-4 h-4 text-slate-400 cursor-not-allowed" /> */}
                        </div>
                    ))}
                    {members.length === 0 && <p className="text-slate-400 text-sm">Zatím žádní členové. Přidejte prvního.</p>}
                </div>

                <form onSubmit={handleAddMember} className="border-t border-slate-100 pt-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Přidat člena</label>
                    <div className="flex flex-col space-y-3">
                        <input
                            type="text"
                            placeholder="Jméno (např. Petr)"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            required
                            className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <div className="flex space-x-2">
                            {COLORS.map(c => (
                                <button
                                    key={c.value}
                                    type="button"
                                    onClick={() => setSelectedColor(c.value)}
                                    className={`w-8 h-8 rounded-full border-2 ${selectedColor === c.value ? 'border-slate-800' : 'border-transparent'}`}
                                    style={{ backgroundColor: c.value }}
                                    title={c.name}
                                />
                            ))}
                        </div>
                        <button type="submit" className="flex items-center justify-center space-x-2 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition">
                            <Plus className="w-4 h-4" />
                            <span>Přidat</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;
