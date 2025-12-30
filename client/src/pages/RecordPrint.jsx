import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Printer } from 'lucide-react';

const RecordPrint = () => {
    const { id } = useParams();
    const [record, setRecord] = useState(null);
    const [treatments, setTreatments] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const recRes = await axios.get('/api/records', { withCredentials: true });
                const treatRes = await axios.get(`/api/records/${id}/treatments`, { withCredentials: true });

                const rec = recRes.data.find(r => r.id === parseInt(id));
                setRecord(rec);
                setTreatments(treatRes.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, [id]);

    if (!record) return <div className="p-8">Načítám...</div>;

    return (
        <div className="bg-white min-h-screen p-8 max-w-3xl mx-auto print:max-w-none print:p-0">
            {/* Header - Hidden on Print */}
            <div className="flex justify-between items-center mb-8 print:hidden">
                <h1 className="text-xl text-slate-500">Náhled pro tisk</h1>
                <button
                    onClick={() => window.print()}
                    className="flex items-center space-x-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700"
                >
                    <Printer className="w-5 h-5" />
                    <span>Vytisknout</span>
                </button>
            </div>

            {/* Printable Content */}
            <div className="border print:border-0 rounded-xl p-8 print:p-0">
                <div className="border-b pb-4 mb-6">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">{record.title}</h1>
                    <div className="text-slate-500 flex gap-4 text-sm">
                        <span>Pacient: <strong>{record.member_name || 'Neuvedeno'}</strong></span>
                        <span>Datum: <strong>{record.start_date}</strong> {record.end_date && ` — ${record.end_date}`}</span>
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-slate-800 mb-2 border-l-4 border-indigo-500 pl-3">Popis a příznaky</h2>
                    <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                        {record.description}
                    </p>
                </div>

                {treatments.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold text-slate-800 mb-3 border-l-4 border-emerald-500 pl-3">Medikace a léčba</h2>
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 text-slate-500">
                                    <th className="py-2 font-medium">Název</th>
                                    <th className="py-2 font-medium">Dávkování</th>
                                    <th className="py-2 font-medium">Typ</th>
                                    <th className="py-2 font-medium">Poznámka</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {treatments.map(t => (
                                    <tr key={t.id}>
                                        <td className="py-3 font-semibold text-slate-800">{t.name}</td>
                                        <td className="py-3 text-slate-700">{t.dosage}</td>
                                        <td className="py-3 text-slate-500">{t.type}</td>
                                        <td className="py-3 text-slate-500 italic">{t.notes || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="mt-12 pt-4 border-t border-slate-200 text-xs text-slate-400 text-center print:block hidden">
                    Vygenerováno aplikací HealthTracker dne {new Date().toLocaleDateString()}
                </div>
            </div>
        </div>
    );
};

export default RecordPrint;
