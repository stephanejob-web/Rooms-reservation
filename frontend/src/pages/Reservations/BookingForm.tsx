import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Loader2, Calendar, Clock, AlertCircle, CheckCircle2, Info, ArrowLeft, Users, MapPin } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Reservation {
    id: number;
    date_debut: string;
    date_fin: string;
    statut: string;
}

// ─── Visual Timeline Component ──────────────────────────────────────────
const AvailabilityTimeline = ({ reservations, selectedDate }: { reservations: Reservation[], selectedDate: string }) => {
    const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 8h to 22h
    const currentDayRes = reservations.filter(r =>
        r.statut === 'CONFIRMEE' &&
        new Date(r.date_debut).toDateString() === new Date(selectedDate || Date.now()).toDateString()
    );

    return (
        <div className="mt-6 bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-slate-400" />
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Disponibilités du jour</h4>
            </div>

            <div className="relative h-20 w-full bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                {/* Hour Grid */}
                <div className="absolute inset-0 flex">
                    {hours.map(h => (
                        <div key={h} className="flex-1 border-r border-slate-100 last:border-0 relative">
                            <span className="absolute -bottom-0.5 left-0.5 text-[8px] text-slate-300 font-mono">{h}h</span>
                        </div>
                    ))}
                </div>

                {/* Occupied Slots */}
                {currentDayRes.map(res => {
                    const start = new Date(res.date_debut);
                    const end = new Date(res.date_fin);
                    const startHour = start.getHours() + start.getMinutes() / 60;
                    const endHour = end.getHours() + end.getMinutes() / 60;

                    const left = ((startHour - 8) / 15) * 100;
                    const width = ((endHour - startHour) / 15) * 100;

                    if (left < 0 || left >= 100) return null;

                    return (
                        <div
                            key={res.id}
                            className="absolute top-0 bottom-0 bg-rose-500/10 border-x border-rose-500/20 group cursor-help transition-all hover:bg-rose-500/20"
                            style={{ left: `${left}%`, width: `${width}%` }}
                        >
                            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-20 pointer-events-none transition-opacity">
                                Occupé: {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    );
                })}
            </div>
            <p className="text-[10px] text-slate-400 mt-2 italic">Les zones rouges indiquent que la salle est déjà réservée.</p>
        </div>
    );
};

export default function BookingForm() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [room, setRoom] = useState<any>(null);
    const [existingReservations, setExistingReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        objet: '',
        date_debut: '',
        date_fin: '',
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const [roomRes, resResponse] = await Promise.all([
                    api.get(`/salles/${id}`),
                    api.get(`/reservations?salleId=${id}`)
                ]);
                setRoom(roomRes.data);
                setExistingReservations(resResponse.data);
            } catch (err) {
                setError('Impossible de charger les données');
            } finally {
                setLoading(false);
            }
        };
        if (id) loadData();
    }, [id]);

    const isOverlapping = useMemo(() => {
        if (!formData.date_debut || !formData.date_fin) return false;

        const start = new Date(formData.date_debut);
        const end = new Date(formData.date_fin);

        if (end <= start) return false;

        return existingReservations.some(res => {
            if (res.statut !== 'CONFIRMEE') return false;
            const resStart = new Date(res.date_debut);
            const resEnd = new Date(res.date_fin);
            return start < resEnd && end > resStart;
        });
    }, [formData.date_debut, formData.date_fin, existingReservations]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isOverlapping) {
            setError('Ce créneau chevauche une réservation existante.');
            return;
        }

        setSubmitting(true);
        setError('');

        if (!user) {
            setError('Vous devez être connecté pour réserver');
            setSubmitting(false);
            return;
        }

        try {
            await api.post('/reservations', {
                salle_id: Number(id),
                utilisateur_id: user.id,
                objet: formData.objet,
                date_debut: new Date(formData.date_debut).toISOString(),
                date_fin: new Date(formData.date_fin).toISOString(),
            });
            navigate('/my-reservations');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors de la réservation');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <Loader2 className="animate-spin h-10 w-10 text-indigo-500" />
            <span className="text-slate-400 font-medium animate-pulse">Initialisation du calendrier...</span>
        </div>
    );

    if (!room) return <div className="text-center p-20 text-slate-500">Oups ! Cette salle semble s'être volatilisée.</div>;

    const isValidRange = formData.date_debut && formData.date_fin && new Date(formData.date_fin) > new Date(formData.date_debut);

    return (
        <div className="max-w-4xl mx-auto px-4">
            <button
                onClick={() => navigate('/rooms')}
                className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-8 text-sm font-semibold"
            >
                <ArrowLeft className="w-4 h-4" />
                Retour au plan des salles
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left Column: Form */}
                <div className="lg:col-span-3 order-2 lg:order-1">
                    <div className="bg-white p-8 shadow-xl shadow-slate-200/50 border border-slate-100 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-500" />

                        <h1 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                            <Calendar className="w-6 h-6 text-indigo-500" />
                            Planifier votre séance
                        </h1>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Input
                                label="Objet de la rencontre"
                                placeholder="ex: Brainstorming projet Alpha"
                                value={formData.objet}
                                onChange={(e) => setFormData({ ...formData, objet: e.target.value })}
                                required
                                className="bg-slate-50/50"
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    type="datetime-local"
                                    label="Début"
                                    value={formData.date_debut}
                                    onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                                    required
                                    className={cn(isOverlapping && "border-rose-300 focus:ring-rose-200")}
                                />
                                <Input
                                    type="datetime-local"
                                    label="Fin"
                                    value={formData.date_fin}
                                    onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                                    required
                                    className={cn(isOverlapping && "border-rose-300 focus:ring-rose-200")}
                                />
                            </div>

                            <AvailabilityTimeline
                                reservations={existingReservations}
                                selectedDate={formData.date_debut}
                            />

                            {/* Status Feedbacks */}
                            <div className="space-y-3">
                                {isOverlapping && (
                                    <div className="bg-rose-50 text-rose-600 p-4 rounded-xl border border-rose-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold text-sm">Créneau indisponible</p>
                                            <p className="text-[11px] opacity-80">Cette période est déjà occupée par une autre réunion. Veuillez choisir un autre moment.</p>
                                        </div>
                                    </div>
                                )}

                                {isValidRange && !isOverlapping && (
                                    <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl border border-emerald-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold text-sm">Le créneau est libre !</p>
                                            <p className="text-[11px] opacity-80">Vous pouvez valider votre réservation en toute sérénité.</p>
                                        </div>
                                    </div>
                                )}

                                {error && !isOverlapping && (
                                    <div className="bg-amber-50 text-amber-600 p-4 rounded-xl border border-amber-100 flex items-start gap-3">
                                        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm font-medium">{error}</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end pt-4 border-t border-slate-50">
                                <Button
                                    type="submit"
                                    isLoading={submitting}
                                    disabled={isOverlapping || !isValidRange}
                                    className={cn(
                                        "w-full md:w-auto px-8 py-3 rounded-xl font-bold transition-all duration-300",
                                        isOverlapping || !isValidRange
                                            ? "bg-slate-200 text-slate-400"
                                            : "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 scale-100 active:scale-95"
                                    )}
                                >
                                    Confirmer la réservation
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Column: Room Details Card */}
                <div className="lg:col-span-2 order-1 lg:order-2">
                    <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
                        {/* Abstract background blobs */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-colors" />
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/30 transition-colors" />

                        <div className="relative">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">Récapitulatif de la salle</span>
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                                    <Info className="w-4 h-4 text-white/60" />
                                </div>
                            </div>

                            <h2 className="text-3xl font-black mb-2 tracking-tight">{room.nom}</h2>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-3 text-slate-300">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                                        <Users className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium">{room.capacite} Personnes max.</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-300">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium">{room.localisation || 'Bâtiment Principal, 1er Étage'}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-8">
                                <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center transition-colors hover:bg-white/10">
                                    <span className="block text-[8px] text-indigo-400 uppercase font-bold mb-1">Équipement</span>
                                    <span className="text-xs font-bold">Standard Pro</span>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center transition-colors hover:bg-white/10">
                                    <span className="block text-[8px] text-indigo-400 uppercase font-bold mb-1">Type</span>
                                    <span className="text-xs font-bold">Inspiration</span>
                                </div>
                            </div>

                            {/* Safety badge */}
                            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                                    <AlertCircle className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div className="text-[10px] text-slate-400 leading-relaxed font-medium">
                                    Cette salle est soumise aux normes de sécurité en vigueur. Veillez à ne pas dépasser la capacité prescrite.
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center gap-4 bg-amber-50 border border-amber-100 p-4 rounded-xl">
                        <div className="text-amber-500 text-lg">🛋️</div>
                        <p className="text-[11px] text-amber-800 font-medium leading-normal">
                            Besoin de rafraîchissements ou d'un matériel spécifique ? Contactez l'accueil après votre réservation.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
