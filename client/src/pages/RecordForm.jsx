import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';

const RecordForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [members, setMembers] = useState([]);
    const [suggestions, setSuggestions] = useState({ titles: [], descriptions: [] });
    // const [calendars, setCalendars] = useState([]); // Removed
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        member_id: '',
        addToCalendar: false,
        // calendarId: '' // Removed
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [memRes, suggRes, userRes] = await Promise.all([
                    axios.get('/api/members', { withCredentials: true }),
                    axios.get('/api/stats/suggestions', { withCredentials: true }),
                    axios.get('/api/me', { withCredentials: true })
                ]);

                setMembers(memRes.data);
                setSuggestions(suggRes.data);

                // Initialize sync preference
                if (!id) {
                    setFormData(prev => ({ ...prev, addToCalendar: !!userRes.data.sync_enabled }));
                }

                // Only set default if NOT editing (otherwise wait for record load)
                if (memRes.data.length > 0 && !id) {
                    setFormData(prev => ({ ...prev, member_id: memRes.data[0].id }));
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, [id]);

    useEffect(() => {
        if (id) {
            const fetchRecord = async () => {
                try {
                    const res = await axios.get('/api/records', { withCredentials: true });
                    const rec = res.data.find(r => r.id === parseInt(id));
                    if (rec) {
                        setFormData({
                            title: rec.title,
                            description: rec.description,
                            start_date: rec.start_date,
                            end_date: rec.end_date || '',
                            member_id: rec.member_id || '',
                            addToCalendar: !!rec.google_event_id
                        });
                    }
                } catch (err) {
                    console.error(err);
                }
            }
            fetchRecord();
        }
    }, [id]);

    // Removed useEffect for fetching calendars

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation: End Date >= Start Date
        if (formData.end_date && new Date(formData.end_date) < new Date(formData.start_date)) {
            alert('Datum konce nemůže být dřívější než datum začátku.');
            return;
        }

        try {
            if (id) {
                await axios.put(`/api/records/${id}`, formData, { withCredentials: true });
            } else {
                await axios.post('/api/records', formData, { withCredentials: true });
            }
            navigate('/');
        } catch (error) {
            console.error(error);
            alert('Chyba při ukládání');
        }
    };

    return (
        <div>
            <div className="flex items-center space-x-4 mb-6">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold text-slate-800">Nový záznam</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Kdo je nemocný?</label>
                    <select
                        name="member_id"
                        value={formData.member_id}
                        onChange={handleChange}
                        className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border bg-white"
                    >
                        <option value="">Vyberte člena rodiny...</option>
                        {members.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Název nemoci / úrazu</label>
                    <input
                        type="text"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        list="title-suggestions"
                        className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                        placeholder="Např. Chřipka, Angína..."
                    />
                    <datalist id="title-suggestions">
                        {suggestions.titles.map((t, i) => <option key={i} value={t} />)}
                    </datalist>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Popis příznaků</label>
                    <textarea
                        name="description"
                        rows="3"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                        placeholder="Horečka nad 38, kašel..."
                    />
                    {suggestions.descriptions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {suggestions.descriptions.slice(0, 5).map((desc, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, description: desc })}
                                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded transition"
                                >
                                    {desc.substring(0, 30)}{desc.length > 30 ? '...' : ''}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Začátek</label>
                        <input
                            type="date"
                            name="start_date"
                            required
                            value={formData.start_date}
                            onChange={handleChange}
                            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Konec (volitelné)</label>
                        <input
                            type="date"
                            name="end_date"
                            value={formData.end_date}
                            onChange={handleChange}
                            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                        />
                    </div>
                </div>

                <div>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            name="addToCalendar"
                            checked={formData.addToCalendar}
                            onChange={handleChange}
                            className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-slate-700 font-medium">Přidat do Google Kalendáře</span>
                    </label>
                </div>

                <button type="submit" className="w-full flex justify-center items-center space-x-2 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-medium shadow-md hover:shadow-lg">
                    <Save className="w-5 h-5" />
                    <span>Uložit záznam</span>
                </button>
            </form>
        </div>
    );
};

export default RecordForm;
