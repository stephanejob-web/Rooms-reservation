import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import roomBg from '../../assets/room_background.png';
import roomBg2 from '../../assets/room_variation_1.png';
import roomBg3 from '../../assets/room_variation_2.png';
import roomPhoto1 from '../../assets/room_photo_1.png';
import roomPhoto2 from '../../assets/room_photo_2.png';

interface Room {
    id: number;
    nom: string;
    capacite: number;
    localisation?: string;
    image?: string;
}

interface RoomStatus {
    type: 'available' | 'reserved';
    time?: Date;
    label?: string;
}

interface FloorPlanProps {
    rooms: Room[];
    reservations?: any[];
}

const planImageMap: Record<string, string> = {
    'room_background.png': roomBg,
    'room_variation_1.png': roomBg2,
    'room_variation_2.png': roomBg3,
};

const galleryPhotos = [roomPhoto1, roomPhoto2];

function getGalleryForRoom(room: Room, index: number): string[] {
    const plan = room.image ? (planImageMap[room.image] || roomBg) : roomBg;
    const photo1 = galleryPhotos[index % galleryPhotos.length];
    const photo2 = galleryPhotos[(index + 1) % galleryPhotos.length];
    return [photo1, photo2, plan];
}

// ─── Mini Timeline Component (Airbnb-style) ─────────────────────────────
const MiniTimeline = ({ reservations }: { reservations: any[] }) => {
    const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 8h to 22h
    const now = new Date();
    const currentDayRes = reservations.filter(r =>
        r.statut === 'CONFIRMEE' &&
        new Date(r.date_debut).toDateString() === now.toDateString()
    );

    return (
        <div className="mt-3 px-1">
            <div className="flex items-center justify-between mb-1.5">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Disponibilité du jour</span>
                <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500/30 border border-rose-500/50" />
                    <span className="text-[7px] text-slate-400 font-medium">Occupé</span>
                </div>
            </div>

            <div className="relative h-4 w-full bg-slate-100 rounded-sm overflow-hidden border border-slate-200/50">
                {/* Hour ticks */}
                <div className="absolute inset-0 flex justify-between px-[1px]">
                    {hours.map(h => (
                        <div key={h} className="w-[1px] h-full bg-slate-200/50 group/tick relative">
                            {h % 2 === 0 && (
                                <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[6px] text-slate-300 font-mono opacity-0 group-hover/tick:opacity-100 transition-opacity">
                                    {h}h
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Occupied Slots */}
                {currentDayRes.map(res => {
                    const start = new Date(res.date_debut);
                    const end = new Date(res.date_fin);
                    const startHour = Math.max(8, start.getHours() + start.getMinutes() / 60);
                    const endHour = Math.min(23, end.getHours() + end.getMinutes() / 60);

                    const left = ((startHour - 8) / 15) * 100;
                    const width = ((endHour - startHour) / 15) * 100;

                    if (width <= 0) return null;

                    return (
                        <div
                            key={res.id}
                            className="absolute top-0 bottom-0 bg-rose-500/40 border-x border-rose-600/20"
                            style={{ left: `${left}%`, width: `${width}%` }}
                        />
                    );
                })}

                {/* Current time indicator */}
                {now.getHours() >= 8 && now.getHours() < 23 && (
                    <div
                        className="absolute top-0 bottom-0 w-[1.5px] bg-indigo-500 z-10 shadow-[0_0_4px_rgba(99,102,241,0.5)]"
                        style={{ left: `${((now.getHours() + now.getMinutes() / 60 - 8) / 15) * 100}%` }}
                    />
                )}
            </div>
            <div className="flex justify-between mt-1 text-[6px] text-slate-300 font-mono px-0.5">
                <span>8h</span>
                <span>15h</span>
                <span>22h</span>
            </div>
        </div>
    );
};

// ─── Popover Gallery Component ───────────────────────────────────────────
function RoomPopover({ room, gallery, status, position, reservations }: {
    room: Room;
    gallery: string[];
    status: RoomStatus;
    position: 'top' | 'bottom';
    reservations: any[];
}) {
    const [activeSlide, setActiveSlide] = useState(0);
    const isAvailable = status.type === 'available';
    const labels = ['Photo 1', 'Photo 2', 'Plan'];

    return (
        <div
            className={cn(
                "absolute left-1/2 -translate-x-1/2 z-50 w-72 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pointer-events-none group-hover:pointer-events-auto",
                position === 'top' ? "top-full mt-2" : "bottom-full mb-2"
            )}
        >
            {/* Arrow */}
            <div className={cn(
                "absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-slate-200 rotate-45",
                position === 'top' ? "-top-1.5 border-l border-t" : "-bottom-1.5 border-r border-b"
            )} />

            {/* Card */}
            <div className="bg-white rounded-xl shadow-2xl border border-slate-200/80 overflow-hidden">
                {/* Image carousel */}
                <div className="relative h-40 bg-slate-100 overflow-hidden">
                    {gallery.map((img, i) => (
                        <img
                            key={i}
                            src={img}
                            alt={`${room.nom} - ${labels[i]}`}
                            className={cn(
                                "absolute inset-0 w-full h-full object-cover transition-all duration-500",
                                i === activeSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"
                            )}
                        />
                    ))}

                    {/* Slide indicators */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {gallery.map((_, i) => (
                            <button
                                key={i}
                                onMouseEnter={() => setActiveSlide(i)}
                                className={cn(
                                    "w-2 h-2 rounded-full transition-all duration-200 border border-white/50",
                                    i === activeSlide
                                        ? "bg-white w-5 shadow-md"
                                        : "bg-white/50 hover:bg-white/80"
                                )}
                            />
                        ))}
                    </div>

                    {/* Label overlay */}
                    <div className="absolute top-2 left-2">
                        <span className="text-[9px] font-semibold text-white bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full">
                            {labels[activeSlide]}
                        </span>
                    </div>

                    {/* Status badge */}
                    <div className="absolute top-2 right-2">
                        <span className={cn(
                            "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-md",
                            isAvailable
                                ? "bg-emerald-500/80 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                : "bg-rose-500/80 text-white shadow-[0_0_10px_rgba(244,63,94,0.3)]"
                        )}>
                            {status.label || (isAvailable ? 'Disponible' : 'Réservée')}
                        </span>
                    </div>
                </div>

                {/* Info section */}
                <div className="p-3">
                    <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-sm text-slate-800">{room.nom}</h4>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
                            </svg>
                            {room.capacite} pers.
                        </div>
                    </div>

                    <MiniTimeline reservations={reservations} />

                    <div className="mt-3 flex gap-1.5 mb-2">
                        <span className="text-[8px] font-medium text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded-full border border-sky-100">❄️ Clim.</span>
                        <span className="text-[8px] font-medium text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded-full border border-violet-100">📺 Écran</span>
                        <span className="text-[8px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-100">📶 WiFi</span>
                    </div>

                    {isAvailable && (
                        <div className="text-[10px] text-center text-emerald-600 font-semibold bg-emerald-50 rounded-md py-1.5 border border-emerald-100 cursor-pointer hover:bg-emerald-100 transition-colors">
                            Cliquer pour réserver →
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Room Tile Component ────────────────────────────────────────────────
function RoomTile({ room, position, globalIndex, status, onBook, reservations }: {
    room: Room;
    position: 'top' | 'bottom';
    globalIndex: number;
    status: RoomStatus;
    onBook: () => void;
    reservations: any[];
}) {
    const gallery = getGalleryForRoom(room, globalIndex);
    const planImage = gallery[2]; // The 2D plan is the 3rd element in getGalleryForRoom
    const isAvailable = status.type === 'available';

    return (
        <div
            className="group relative"
        >
            <div
                onClick={() => isAvailable && onBook()}
                className={cn(
                    "relative flex flex-col items-center justify-center rounded-md border-2 transition-all duration-300 overflow-hidden",
                    isAvailable
                        ? "border-emerald-400/60 cursor-pointer hover:border-emerald-500 hover:shadow-[0_0_24px_rgba(16,185,129,0.2)] hover:-translate-y-0.5"
                        : "border-rose-400/60 cursor-not-allowed"
                )}
                style={{ minHeight: '150px' }}
            >
                {/* Static 2D Plan Background */}
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-40 transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url(${planImage})` }}
                />

                {/* Gradient overlay */}
                <div className={cn(
                    "absolute inset-0 transition-colors duration-300",
                    isAvailable
                        ? "bg-gradient-to-b from-white/50 via-white/20 to-emerald-50/40"
                        : "bg-gradient-to-b from-white/50 via-rose-50/20 to-rose-100/40"
                )} />

                <div className="absolute inset-0 shadow-[inset_0_0_10px_rgba(0,0,0,0.06)] rounded-md" />

                {/* Animated Door */}
                <div className={cn(
                    "absolute left-1/2 -translate-x-1/2 z-20",
                    position === 'top' ? "bottom-0" : "top-0"
                )}>
                    <div className="relative w-10">
                        {/* Door arc (architectural) */}
                        <div className={cn(
                            "absolute w-10 h-10 border border-dashed border-amber-400/20 rounded-full transition-opacity duration-500 opacity-0 group-hover:opacity-100",
                            position === 'top' ? "bottom-full origin-bottom-left" : "top-full origin-top-left"
                        )} style={{
                            clipPath: position === 'top' ? 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' : 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
                            borderRight: 'none',
                            borderBottom: position === 'top' ? 'none' : 'dashed',
                            borderTop: position === 'top' ? 'dashed' : 'none'
                        }} />

                        {/* Hinge point */}
                        <div className="absolute left-0 top-0 w-1 h-1 bg-slate-400 rounded-full z-30" />

                        {/* Door leaf */}
                        <div className={cn(
                            "h-1.5 w-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 rounded-sm shadow-sm transition-transform duration-700 ease-in-out origin-left z-20",
                            position === 'top' ? "group-hover:-rotate-[100deg]" : "group-hover:rotate-[100deg]"
                        )} />
                    </div>
                </div>

                {/* Status indicator */}
                <div className="absolute top-2 right-2 z-10 flex flex-col items-end gap-1">
                    <div className="relative">
                        <div className={cn(
                            "w-3 h-3 rounded-full ring-2 ring-white/80 shadow-sm",
                            isAvailable ? "bg-emerald-500" : "bg-rose-500"
                        )} />
                        {isAvailable && (
                            <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-400 animate-ping opacity-40" />
                        )}
                    </div>
                </div>

                {/* Time status badge */}
                <div className="absolute top-8 right-2 z-10">
                    <span className={cn(
                        "text-[7px] font-bold px-1.5 py-0.5 rounded-full shadow-sm border whitespace-nowrap",
                        isAvailable
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                    )}>
                        {status.label}
                    </span>
                </div>

                {/* AC badge */}
                <div className="absolute top-2 left-2 z-10 flex items-center gap-0.5 bg-sky-50/90 backdrop-blur-sm border border-sky-200 rounded-full px-1.5 py-0.5 shadow-sm">
                    <svg className="w-2 h-2 text-sky-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" />
                    </svg>
                    <span className="text-[7px] font-semibold text-sky-600 tracking-wide">AC</span>
                </div>

                {/* Room info card */}
                <div className="relative z-10 flex flex-col items-center text-center px-2">
                    <div className={cn(
                        "bg-white/75 backdrop-blur-md rounded-lg px-3 py-2 shadow-sm border transition-all duration-300",
                        isAvailable
                            ? "border-emerald-200/50 group-hover:bg-white/90 group-hover:shadow-md"
                            : "border-rose-200/50"
                    )}>
                        <span className="font-bold text-slate-800 text-sm leading-tight block">{room.nom}</span>
                        <div className="flex items-center justify-center gap-1.5 mt-1">
                            <svg className="w-3 h-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
                            </svg>
                            <span className="text-[10px] text-slate-500 font-medium">{room.capacite} pers.</span>
                        </div>
                    </div>
                </div>

                {!isAvailable && (
                    <div className="relative z-10 mt-1.5">
                        <span className="text-[8px] font-bold text-rose-700 bg-rose-100/90 backdrop-blur-sm px-2 py-0.5 rounded-full border border-rose-200/50 tracking-wider uppercase shadow-sm">
                            Occupée
                        </span>
                    </div>
                )}
            </div>

            {/* Re-integrated Hover Popover Gallery */}
            <RoomPopover
                room={room}
                gallery={gallery}
                status={status}
                position={position}
                reservations={reservations}
            />
        </div>
    );
}

// ─── Main FloorPlan ──────────────────────────────────────────────────────
export default function FloorPlan({ rooms, reservations = [] }: FloorPlanProps) {
    const navigate = useNavigate();

    const getRoomReservations = (roomId: number) => {
        return reservations.filter(r => r.salle?.id === roomId);
    };

    const getRoomStatusExtended = (roomId: number): RoomStatus => {
        const now = new Date();
        const roomRes = getRoomReservations(roomId)
            .filter(r => r.statut === 'CONFIRMEE')
            .sort((a, b) => new Date(a.date_debut).getTime() - new Date(b.date_debut).getTime());

        const current = roomRes.find(r =>
            new Date(r.date_debut) <= now && new Date(r.date_fin) >= now
        );

        if (current) {
            const until = new Date(current.date_fin);
            const diffMs = until.getTime() - now.getTime();
            const diffMin = Math.round(diffMs / 60000);

            let label = `Libre à ${until.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            if (diffMin < 60) {
                label = `Libre dans ${diffMin} min`;
            }

            return { type: 'reserved', time: until, label };
        }

        const next = roomRes.find(r => new Date(r.date_debut) > now);
        if (next) {
            const start = new Date(next.date_debut);
            return {
                type: 'available',
                time: start,
                label: `Libre jusqu'à ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            };
        }

        return { type: 'available', label: 'Libre (Toute la journée)' };
    };

    const half = Math.ceil(rooms.length / 2);
    const topRooms = rooms.slice(0, half);
    const bottomRooms = rooms.slice(half);

    return (
        <div className="w-full max-w-6xl mx-auto">
            <div className="relative bg-gradient-to-b from-slate-50 to-slate-100 border-[3px] border-slate-400 rounded-xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">

                <div className="absolute inset-0 opacity-[0.03] rounded-xl" style={{
                    backgroundImage: 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }} />

                {/* Title */}
                <div className="relative flex items-center justify-center mb-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                    <div className="px-4 flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
                        </svg>
                        <span className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.35em]">
                            Plan de l'étage — Bâtiment A
                        </span>
                        <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
                        </svg>
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                </div>

                {/* Top rooms */}
                <div className="relative grid gap-2 overflow-visible" style={{ gridTemplateColumns: `repeat(${topRooms.length}, 1fr)` }}>
                    {topRooms.map((room, i) => (
                        <RoomTile
                            key={room.id}
                            room={room}
                            position="top"
                            globalIndex={i}
                            status={getRoomStatusExtended(room.id)}
                            onBook={() => navigate(`/rooms/${room.id}/book`)}
                            reservations={getRoomReservations(room.id)}
                        />
                    ))}
                </div>

                {/* Corridor */}
                <div className="relative my-0">
                    <div className="flex items-center justify-center h-16 bg-gradient-to-r from-slate-200/40 via-slate-200/70 to-slate-200/40 border-y-2 border-slate-300/60">
                        {/* Corridor pattern — floor tiles */}
                        <div className="absolute inset-0 opacity-[0.06]" style={{
                            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(0,0,0,0.15) 30px, rgba(0,0,0,0.15) 31px)',
                        }} />

                        {/* Highly Realistic Fire Extinguishers (Near Exits) */}
                        <div className="absolute left-8 flex flex-col items-center gap-0.5 group/ext">
                            <div className="relative w-4 h-6 transition-transform group-hover/ext:scale-110">
                                {/* The Tank */}
                                <div className="absolute inset-0 bg-gradient-to-r from-red-700 via-red-600 to-red-800 rounded-sm shadow-[0_2px_4px_rgba(0,0,0,0.2)] ring-1 ring-black/10 overflow-hidden">
                                    <div className="absolute top-1 left-0 right-0 h-0.5 bg-white/40" /> {/* Highlight */}
                                    <div className="absolute inset-0 bg-red-500 animate-pulse opacity-10" />
                                </div>
                                {/* Top Handle & Valve */}
                                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-2 flex flex-col items-center">
                                    <div className="w-2.5 h-0.5 bg-slate-700 rounded-full" /> {/* Handle */}
                                    <div className="w-1 h-2 bg-slate-800" /> {/* Valve body */}
                                </div>
                                {/* Gauge */}
                                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white border-[0.5px] border-slate-400 flex items-center justify-center">
                                    <div className="w-[0.5px] h-1 bg-red-500 rotate-45" />
                                </div>
                                {/* Hose */}
                                <div className="absolute top-1 -right-1 w-1.5 h-4 border-r-2 border-b-2 border-slate-800 rounded-br-lg opacity-80" />
                                <div className="absolute bottom-0 -right-1.5 w-1 h-1.5 bg-slate-900 rounded-sm" /> {/* Nozzle */}
                            </div>
                            <span className="text-[6px] font-bold text-red-700 opacity-0 group-hover/ext:opacity-100 transition-opacity">SÉCURITÉ</span>
                        </div>

                        <div className="absolute right-8 flex flex-col items-center gap-0.5 group/ext">
                            <div className="relative w-4 h-6 transition-transform group-hover/ext:scale-110">
                                <div className="absolute inset-0 bg-gradient-to-r from-red-700 via-red-600 to-red-800 rounded-sm shadow-[0_2px_4px_rgba(0,0,0,0.2)] ring-1 ring-black/10 overflow-hidden">
                                    <div className="absolute top-1 left-0 right-0 h-0.5 bg-white/40" />
                                    <div className="absolute inset-0 bg-red-500 animate-pulse opacity-10" />
                                </div>
                                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-2 flex flex-col items-center">
                                    <div className="w-2.5 h-0.5 bg-slate-700 rounded-full" />
                                    <div className="w-1 h-2 bg-slate-800" />
                                </div>
                                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white border-[0.5px] border-slate-400 flex items-center justify-center">
                                    <div className="w-[0.5px] h-1 bg-red-500 -rotate-45" />
                                </div>
                                <div className="absolute top-1 -left-1 w-1.5 h-4 border-l-2 border-b-2 border-slate-800 rounded-bl-lg opacity-80" />
                                <div className="absolute bottom-0 -left-1.5 w-1 h-1.5 bg-slate-900 rounded-sm" />
                            </div>
                            <span className="text-[6px] font-bold text-red-700 opacity-0 group-hover/ext:opacity-100 transition-opacity">SÉCURITÉ</span>
                        </div>

                        {/* Highly Realistic Plants (Decorative) */}
                        <div className="absolute left-1/4 flex flex-col items-center group/plant">
                            <div className="relative w-6 h-8 transition-transform group-hover/plant:scale-110 drop-shadow-md">
                                {/* The Pot */}
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-3 bg-gradient-to-b from-amber-700 to-amber-900 rounded-b-sm border-t border-amber-600">
                                    <div className="absolute -top-0.5 left-0 right-0 h-1 bg-amber-800 rounded-sm" /> {/* Rim */}
                                </div>
                                {/* The Plant (SVG for realism) */}
                                <svg className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 pointer-events-none" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 20C12 20 8 16 8 10C8 7 10 5 12 5C14 5 16 7 16 10C16 16 12 20 12 20Z" fill="#065f46" fillOpacity="0.8" />
                                    <path d="M12 20C12 20 5 18 4 12C3 9 5 6 8 6C10 6 12 10 12 10" stroke="#064e3b" strokeWidth="0.5" />
                                    <path d="M12 20C12 20 19 18 20 12C21 9 19 6 16 6C14 6 12 10 12 10" stroke="#064e3b" strokeWidth="0.5" />
                                    <path d="M12 12L12 6" stroke="#064e3b" strokeWidth="0.5" strokeLinecap="round" />
                                    <circle cx="9" cy="9" r="2" fill="#10b981" fillOpacity="0.4" filter="blur(1px)" />
                                    <circle cx="15" cy="11" r="2.5" fill="#059669" fillOpacity="0.4" filter="blur(1.5px)" />
                                </svg>
                            </div>
                        </div>

                        <div className="absolute right-1/4 flex flex-col items-center group/plant">
                            <div className="relative w-6 h-8 transition-transform group-hover/plant:scale-110 drop-shadow-md">
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-3 bg-gradient-to-b from-amber-700 to-amber-900 rounded-b-sm border-t border-amber-600">
                                    <div className="absolute -top-0.5 left-0 right-0 h-1 bg-amber-800 rounded-sm" />
                                </div>
                                <svg className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 pointer-events-none" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 20C12 20 8 16 8 10C8 7 10 5 12 5C14 5 16 7 16 10C16 16 12 20 12 20Z" fill="#065f46" fillOpacity="0.8" />
                                    <path d="M12 20C12 20 5 18 4 12C3 9 5 6 8 6C10 6 12 10 12 10" stroke="#064e3b" strokeWidth="0.5" />
                                    <path d="M12 20C12 20 19 18 20 12C21 9 19 6 16 6C14 6 12 10 12 10" stroke="#064e3b" strokeWidth="0.5" />
                                    <path d="M12 12L12 6" stroke="#064e3b" strokeWidth="0.5" strokeLinecap="round" />
                                    <circle cx="10" cy="10" r="2.2" fill="#10b981" fillOpacity="0.4" filter="blur(1px)" />
                                    <circle cx="14" cy="8" r="2" fill="#059669" fillOpacity="0.4" filter="blur(1.2px)" />
                                </svg>
                            </div>
                        </div>

                        <div className="relative flex items-center gap-3">
                            <div className="w-12 h-[1.5px] bg-gradient-to-r from-transparent to-slate-400" />
                            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-1.5 rounded-full border border-slate-200/80 shadow-sm">
                                <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M3 12h18M3 12l4-4M3 12l4 4M21 12l-4-4M21 12l-4 4" />
                                </svg>
                                <span className="text-slate-500 text-[10px] font-semibold tracking-[0.3em] uppercase">
                                    Couloir Principal
                                </span>
                                <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M3 12h18M3 12l4-4M3 12l4 4M21 12l-4-4M21 12l-4 4" />
                                </svg>
                            </div>
                            <div className="w-12 h-[1.5px] bg-gradient-to-l from-transparent to-slate-400" />
                        </div>
                    </div>
                    {/* Exits */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3">
                        <div className="w-6 h-10 bg-gradient-to-r from-amber-500 to-amber-400 rounded-l-md flex items-center justify-center shadow-md">
                            <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                        </div>
                    </div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3">
                        <div className="w-6 h-10 bg-gradient-to-l from-amber-500 to-amber-400 rounded-r-md flex items-center justify-center shadow-md">
                            <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Bottom rooms */}
                <div className="relative grid gap-2 overflow-visible" style={{ gridTemplateColumns: `repeat(${bottomRooms.length}, 1fr)` }}>
                    {bottomRooms.map((room, i) => (
                        <RoomTile
                            key={room.id}
                            room={room}
                            position="bottom"
                            globalIndex={half + i}
                            status={getRoomStatusExtended(room.id)}
                            onBook={() => navigate(`/rooms/${room.id}/book`)}
                            reservations={getRoomReservations(room.id)}
                        />
                    ))}
                </div>

                {/* Compass */}
                <div className="absolute bottom-3 right-3 opacity-30">
                    <svg className="w-8 h-8 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                        <text x="12" y="8" textAnchor="middle" fill="currentColor" fontSize="4" fontWeight="bold" stroke="none">N</text>
                    </svg>
                </div>
            </div>

            {/* Legend */}
            <div className="mt-5 flex flex-wrap justify-center gap-4 text-xs">
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                    <div className="relative">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 ring-1 ring-emerald-300" />
                    </div>
                    <span className="text-slate-600 font-medium">Disponible</span>
                </div>
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                    <div className="w-3 h-3 rounded-full bg-rose-500 ring-1 ring-rose-300" />
                    <span className="text-slate-600 font-medium">Réservée</span>
                </div>
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                    <div className="w-4 h-1.5 rounded-sm bg-gradient-to-r from-amber-500 to-amber-400" />
                    <span className="text-slate-600 font-medium">Porte</span>
                </div>
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                    <svg className="w-3 h-3 text-sky-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 2v20M2 12h20M4.93l14.14 14.14M19.07 4.93L4.93 19.07" />
                    </svg>
                    <span className="text-slate-600 font-medium">Climatisation</span>
                </div>
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                    <div className="w-2 h-3.5 bg-red-600 rounded-sm" />
                    <span className="text-slate-600 font-medium">Extincteur</span>
                </div>
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                    <div className="w-3 h-3 rounded-full bg-emerald-600" />
                    <span className="text-slate-600 font-medium">Plante</span>
                </div>
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                    <div className="bg-emerald-600 px-1 rounded-sm text-white text-[8px] font-bold">EXIT</div>
                    <span className="text-slate-600 font-medium">Sortie de Secours</span>
                </div>
            </div>
            <p className="text-center text-[10px] text-slate-400 mt-3 italic">Survolez une salle pour voir les détails et naviguer dans la galerie</p>
        </div>
    );
}
