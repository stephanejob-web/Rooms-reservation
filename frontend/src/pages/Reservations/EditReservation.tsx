import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function EditReservation() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [reservation, setReservation] = useState<any>(null);

    const [formData, setFormData] = useState({
        objet: '',
        date_debut: '',
        date_fin: '',
    });

    useEffect(() => {
        const fetchReservation = async () => {
            try {
                const response = await api.get(`/reservations/${id}`);
                const res = response.data;

                // Security check: only the owner can edit
                if (user && res.utilisateur?.id !== user.id && res.utilisateur_id !== user.id) {
                    setError('Vous n\'êtes pas autorisé à modifier cette réservation');
                    setLoading(false);
                    return;
                }

                setReservation(res);

                // Format dates for datetime-local input
                const formatDate = (dateStr: string) => {
                    const date = new Date(dateStr);
                    const pad = (num: number) => num.toString().padStart(2, '0');
                    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
                };

                setFormData({
                    objet: res.objet,
                    date_debut: formatDate(res.date_debut),
                    date_fin: formatDate(res.date_fin),
                });
            } catch (err) {
                setError('Impossible de charger les détails de la réservation');
            } finally {
                setLoading(false);
            }
        };
        if (id && user) fetchReservation();
    }, [id, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            await api.patch(`/reservations/${id}`, {
                objet: formData.objet,
                date_debut: new Date(formData.date_debut).toISOString(),
                date_fin: new Date(formData.date_fin).toISOString(),
            });
            navigate('/my-reservations');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors de la modification');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-16 gap-3">
            <Loader2 className="animate-spin h-8 w-8 text-indigo-500" />
            <span className="text-sm text-slate-400 font-medium">Chargement de la réservation...</span>
        </div>
    );

    if (error && !reservation) return (
        <div className="max-w-2xl mx-auto p-8 text-center">
            <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100 mb-4">
                {error}
            </div>
            <Button onClick={() => navigate('/my-reservations')}>Retour à mes réservations</Button>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto">
            <button
                onClick={() => navigate('/my-reservations')}
                className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-6 text-sm font-medium"
            >
                <ArrowLeft className="w-4 h-4" />
                Retour à mes réservations
            </button>

            <div className="bg-white p-8 shadow-xl border border-slate-200 rounded-2xl overflow-hidden relative">
                {/* Decorative top bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                <h1 className="text-2xl font-bold text-slate-800 mb-2">Modifier la réservation</h1>
                <p className="text-slate-400 text-sm mb-8">
                    Salle: <span className="font-semibold text-slate-600">{reservation.salle?.nom}</span>
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Objet de la réunion"
                        value={formData.objet}
                        onChange={(e) => setFormData({ ...formData, objet: e.target.value })}
                        required
                        className="focus:ring-indigo-500"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            type="datetime-local"
                            label="Nouvelle date de début"
                            value={formData.date_debut}
                            onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                            required
                        />
                        <Input
                            type="datetime-local"
                            label="Nouvelle date de fin"
                            value={formData.date_fin}
                            onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                            required
                        />
                    </div>

                    {error && (
                        <div className="text-red-600 text-sm bg-red-50 p-4 rounded-xl border border-red-100 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">!</span>
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end pt-4 border-t border-slate-100 gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => navigate('/my-reservations')}
                            className="text-slate-400"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            isLoading={submitting}
                            className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                        >
                            Enregistrer les modifications
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
