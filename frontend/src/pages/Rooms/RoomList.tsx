import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Loader2, Map as MapIcon, List, Users, MapPin, ArrowRight, Box } from 'lucide-react';
import FloorPlan from '../../components/rooms/FloorPlan';
import ThreeDFloorPlan from '../../components/rooms/ThreeDFloorPlan';

export default function RoomList() {
    const [rooms, setRooms] = useState<any[]>([]);
    const [reservations, setReservations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState<'list' | '2d' | '3d'>('3d');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [roomsRes, reservationsRes] = await Promise.all([
                api.get('/salles'),
                api.get('/reservations')
            ]);
            setRooms(roomsRes.data);
            setReservations(reservationsRes.data);
        } catch (err) {
            setError('Impossible de charger les données');
        } finally {
            setLoading(false);
        }
    };

    const getRoomStatus = (roomId: number) => {
        const now = new Date();
        return reservations.some(r =>
            r.salle?.id === roomId &&
            r.statut === 'CONFIRMEE' &&
            new Date(r.date_debut) <= now &&
            new Date(r.date_fin) >= now
        ) ? 'reserved' : 'available';
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-16 gap-3">
                <Loader2 className="animate-spin h-8 w-8 text-indigo-500" />
                <span className="text-sm text-slate-400 font-medium">Lancement du moteur 3D…</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-16 gap-3">
                <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
                    <span className="text-rose-500 text-xl">!</span>
                </div>
                <span className="text-sm text-rose-600 font-medium">{error}</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Espaces de travail</h1>
                    <p className="text-sm text-slate-400 mt-0.5">{rooms.length} salles synchronisées en temps réel</p>
                </div>

                {/* View toggle */}
                <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60 shadow-inner">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-tighter transition-all duration-300 ${viewMode === 'list'
                            ? 'bg-white text-slate-800 shadow-md transform scale-105'
                            : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        <List className="w-4 h-4" />
                        Liste
                    </button>
                    <button
                        onClick={() => setViewMode('2d')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-tighter transition-all duration-300 ${viewMode === '2d'
                            ? 'bg-white text-slate-800 shadow-md transform scale-105'
                            : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        <MapIcon className="w-4 h-4" />
                        Plan 2D
                    </button>
                    <button
                        onClick={() => setViewMode('3d')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-tighter transition-all duration-300 ${viewMode === '3d'
                            ? 'bg-indigo-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.3)] transform scale-105'
                            : 'text-slate-400 hover:text-indigo-500'
                            }`}
                    >
                        <Box className="w-4 h-4" />
                        Vue 3D
                    </button>
                </div>
            </div>

            {/* Content */}
            {viewMode === 'list' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rooms.map((room) => {
                        const status = getRoomStatus(room.id);
                        const isAvailable = status === 'available';

                        return (
                            <div
                                key={room.id}
                                className="group relative bg-white rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                            >
                                {/* Status stripe */}
                                <div className={`absolute top-0 left-0 right-0 h-0.5 ${isAvailable ? 'bg-emerald-400' : 'bg-rose-400'}`} />

                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="text-base font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{room.nom}</h3>
                                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${isAvailable
                                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                            : 'bg-rose-50 text-rose-600 border border-rose-100'
                                            }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                            {isAvailable ? 'Libre' : 'Occupée'}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                                        <div className="flex items-center gap-1">
                                            <Users className="w-3.5 h-3.5 text-slate-400" />
                                            <span>{room.capacite} pers.</span>
                                        </div>
                                        {room.localisation && (
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                <span>{room.localisation}</span>
                                            </div>
                                        )}
                                    </div>

                                    <Link
                                        to={`/rooms/${room.id}/book`}
                                        className={`flex items-center justify-center gap-2 w-full py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${isAvailable
                                            ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100'
                                            : 'bg-slate-50 text-slate-400 border border-slate-100 pointer-events-none'
                                            }`}
                                    >
                                        {isAvailable ? 'Réserver cette salle' : 'Actuellement occupée'}
                                        {isAvailable && <ArrowRight className="w-3 h-3" />}
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {viewMode === '2d' && (
                <FloorPlan rooms={rooms} reservations={reservations} />
            )}

            {viewMode === '3d' && (
                <div className="animate-in fade-in zoom-in-95 duration-700">
                    <ThreeDFloorPlan rooms={rooms} reservations={reservations} />
                </div>
            )}
        </div>
    );
}

