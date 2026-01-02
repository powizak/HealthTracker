import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Plus, Users, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const COLORS = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Pink', value: '#ec4899' },
];

const FamilySettings = () => {
    const [family, setFamily] = useState(null);
    const [users, setUsers] = useState([]);
    const [invites, setInvites] = useState([]);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteMessage, setInviteMessage] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);
    const [familyName, setFamilyName] = useState('');

    useEffect(() => {
        loadFamily();
    }, []);

    const loadFamily = async () => {
        try {
            const res = await axios.get('/api/family', { withCredentials: true });
            setFamily(res.data);
            setUsers(res.data.users);
            setInvites(res.data.invites);
            setFamilyName(res.data.name);
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateName = async () => {
        try {
            await axios.put('/api/family', { name: familyName }, { withCredentials: true });
            setIsEditingName(false);
            loadFamily();
        } catch (err) {
            console.error(err);
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/family/invite', { email: inviteEmail }, { withCredentials: true });
            setInviteEmail('');
            setInviteMessage('Pozvánka odeslána!');
            loadFamily();
            setTimeout(() => setInviteMessage(''), 3000);
        } catch (err) {
            setInviteMessage(err.response?.data?.error || 'Chyba při pozvání');
        }
    };

    if (!family) return <p className="text-sm text-slate-500">Načítám rodinu...</p>;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-indigo-600" />
                Správa Rodiny
            </h2>

            <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">Název rodiny</label>
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={familyName}
                        onChange={(e) => setFamilyName(e.target.value)}
                        disabled={!isEditingName}
                        className={`flex-grow p-2 border rounded-lg outline-none ${isEditingName ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-slate-300 bg-slate-50'}`}
                    />
                    {isEditingName ? (
                        <button onClick={handleUpdateName} className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700">Uložit</button>
                    ) : (
                        <button onClick={() => setIsEditingName(true)} className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-50">Upravit</button>
                    )}
                </div>
            </div>

            <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Členové s přístupem</h3>
                <ul className="space-y-2">
                    {users.map(u => (
                        <li key={u.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="flex items-center space-x-3">
                                {u.picture ? (
                                    <img src={u.picture} alt={u.name} className="w-8 h-8 rounded-full" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                        {u.name[0]}
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-medium text-slate-800">{u.name}</p>
                                    <p className="text-xs text-slate-500">{u.email}</p>
                                </div>
                            </div>
                            <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full capitalize">{u.role}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {invites.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">Odeslané pozvánky</h3>
                    <ul className="space-y-2">
                        {invites.map(inv => (
                            <li key={inv.id} className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg border border-yellow-100">
                                <span className="text-sm text-slate-700">{inv.email}</span>
                                <span className="text-xs text-yellow-700 font-medium">Čeká na přijetí</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="border-t border-slate-100 pt-4">
                <h3 className="text-sm font-medium text-slate-700 mb-2">Pozvat nového uživatele</h3>
                <form onSubmit={handleInvite} className="flex gap-2">
                    <input
                        type="email"
                        placeholder="email@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        required
                        className="flex-grow p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-full"
                    />
                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shrink-0">
                        Pozvat
                    </button>
                </form>
                {inviteMessage && <p className={`text-sm mt-2 ${inviteMessage.includes('Chyba') ? 'text-red-500' : 'text-green-600'}`}>{inviteMessage}</p>}
            </div>
        </div>
    );
};

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

            {/* Family Settings */}
            <FamilySettings />

            {/* Calendar Settings */}
            <CalendarSettings />

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Správa profilů (Děti/Osoby)</h2>

                <div className="space-y-3 mb-6">
                    {members.map(m => (
                        <div key={m.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: m.color }}>
                                    {m.name.substring(0, 2).toUpperCase()}
                                </div>
                                <span className="font-medium text-slate-700">{m.name}</span>
                            </div>
                        </div>
                    ))}
                    {members.length === 0 && <p className="text-slate-400 text-sm">Zatím žádné profily. Přidejte první.</p>}
                </div>

                <form onSubmit={handleAddMember} className="border-t border-slate-100 pt-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Přidat profil</label>
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
