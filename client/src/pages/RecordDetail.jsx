import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Pill, Plus, Paperclip, FileText, Edit, Printer } from 'lucide-react';

const RecordDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [record, setRecord] = useState(null);
    const [treatments, setTreatments] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [showTreatmentForm, setShowTreatmentForm] = useState(false);
    const [newTreatment, setNewTreatment] = useState({ name: '', dosage: '', type: 'medication' });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const recRes = await axios.get('/api/records', { withCredentials: true });
                const treatRes = await axios.get(`/api/records/${id}/treatments`, { withCredentials: true });
                const attachRes = await axios.get(`/api/records/${id}/attachments`, { withCredentials: true });

                const rec = recRes.data.find(r => r.id === parseInt(id));
                setRecord(rec);
                setTreatments(treatRes.data);
                setAttachments(attachRes.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, [id]);

    const handleDelete = async () => {
        if (!confirm('Opravdu smazat tento záznam?')) return;
        try {
            await axios.delete(`/api/records/${id}`, { withCredentials: true });
            navigate('/');
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddTreatment = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`/api/records/${id}/treatments`, newTreatment, { withCredentials: true });
            setTreatments([...treatments, res.data]);
            setShowTreatmentForm(false);
            setNewTreatment({ name: '', dosage: '', type: 'medication' });
        } catch (error) {
            console.error(error);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const res = await axios.post(`/api/records/${id}/attachments`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            setAttachments([...attachments, { ...res.data, url: res.data.path }]);
        } catch (error) {
            console.error('Upload failed', error);
            alert('Chyba při nahrávání souboru');
        } finally {
            setUploading(false);
        }
    };

    if (!record) return <div>Načítám...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-bold text-slate-800">{record.title}</h1>
                </div>
                <div className="flex space-x-2">
                    <button onClick={() => navigate(`/record/${id}/print`)} className="text-slate-500 p-2 hover:bg-slate-50 rounded-full" title="Tisk">
                        <Printer className="w-5 h-5" />
                    </button>
                    <button onClick={() => navigate(`/edit/${id}`)} className="text-slate-500 p-2 hover:bg-slate-50 rounded-full">
                        <Edit className="w-5 h-5" />
                    </button>
                    <button onClick={handleDelete} className="text-red-500 p-2 hover:bg-red-50 rounded-full">
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <p className="text-slate-600 whitespace-pre-line">{record.description}</p>
                <div className="mt-4 flex items-center space-x-4 text-sm text-slate-500">
                    <div className="flex flex-col">
                        <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Začátek</span>
                        <span>{record.start_date}</span>
                    </div>
                    {record.end_date && (
                        <div className="flex flex-col">
                            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Konec</span>
                            <span>{record.end_date}</span>
                        </div>
                    )}
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-3 px-1">
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                        <Pill className="w-5 h-5 text-indigo-500" />
                        Léčba a poznámky
                    </h2>
                </div>

                <div className="space-y-3">
                    {treatments.map(t => (
                        <div key={t.id} className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm flex justify-between items-center">
                            <div>
                                <p className="font-medium text-slate-800">{t.name}</p>
                                <p className="text-sm text-slate-500">{t.dosage}</p>
                            </div>
                            <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">{t.type}</span>
                        </div>
                    ))}

                    {showTreatmentForm ? (
                        <form onSubmit={handleAddTreatment} className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-2">
                            <div className="grid grid-cols-1 gap-3 mb-3">
                                <input
                                    placeholder="Název léku / terapie"
                                    className="p-2 rounded border border-slate-300 w-full"
                                    value={newTreatment.name}
                                    onChange={e => setNewTreatment({ ...newTreatment, name: e.target.value })}
                                    required
                                />
                                <input
                                    placeholder="Dávkování (např. 1-0-1)"
                                    className="p-2 rounded border border-slate-300 w-full"
                                    value={newTreatment.dosage}
                                    onChange={e => setNewTreatment({ ...newTreatment, dosage: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button type="button" onClick={() => setShowTreatmentForm(false)} className="text-slate-500 px-3 py-1">Zrušit</button>
                                <button type="submit" className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">Uložit</button>
                            </div>
                        </form>
                    ) : (
                        <button onClick={() => setShowTreatmentForm(true)} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-lg text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition flex justify-center items-center gap-2 font-medium">
                            <Plus className="w-5 h-5" />
                            Přidat léčbu
                        </button>
                    )}
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-3 px-1">
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                        <Paperclip className="w-5 h-5 text-indigo-500" />
                        Přílohy
                    </h2>
                    <label className="text-sm text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full cursor-pointer hover:bg-indigo-100 transition">
                        {uploading ? 'Nahrávám...' : '+ Nahrát soubor'}
                        <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                    </label>
                </div>

                {attachments.length === 0 ? (
                    <p className="text-slate-400 text-sm italic px-1">Žádné přílohy</p>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {attachments.map(a => (
                            <a key={a.id} href={a.path} target="_blank" rel="noopener noreferrer" className="block bg-white p-3 rounded-lg border border-slate-200 hover:border-indigo-300 transition group">
                                <div className="flex items-center space-x-2">
                                    <FileText className="w-8 h-8 text-slate-300 group-hover:text-indigo-500" />
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-medium text-slate-700 truncate">{a.filename}</p>
                                        <p className="text-xs text-slate-400">Příloha</p>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecordDetail;
