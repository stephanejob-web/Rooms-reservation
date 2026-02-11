import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function MyReservations() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [reservations, setReservations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            fetchReservations();
        }
    }, [user]);

    const fetchReservations = async () => {
        try {
            const response = await api.get('/reservations');
            // Client-side filtering as backend returns all
            // Assuming reservation has utilisateur.id or utilisateur_id
            const myRes = response.data.filter((r: any) => r.utilisateur?.id === user?.id || r.utilisateur_id === user?.id);
            setReservations(myRes);
        } catch (err) {
            setError('Impossible de charger les réservations');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id: number) => {
        if (!window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) return;
        try {
            await api.patch(`/reservations/${id}/annuler`);
            fetchReservations();
        } catch (err) {
            alert('Erreur lors de l\'annulation');
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /></div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Mes Réservations</h1>
            {error && <div className="text-red-600">{error}</div>}

            {reservations.length === 0 ? (
                <p className="text-gray-500">Vous n'avez aucune réservation.</p>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {reservations.map((res) => (
                            <li key={res.id} className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-medium text-indigo-600 truncate">
                                        {res.objet} - {res.salle?.nom}
                                    </div>
                                    <div className="ml-2 flex-shrink-0 flex">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${res.statut === 'CONFIRMEE' ? 'bg-green-100 text-green-800' :
                                            res.statut === 'ANNULEE' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {res.statut}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                    <div className="sm:flex">
                                        <p className="flex items-center text-sm text-gray-500">
                                            Du {new Date(res.date_debut).toLocaleString()} au {new Date(res.date_fin).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-500 sm:mt-0">
                                        {res.statut !== 'ANNULEE' && (
                                            <>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => navigate(`/reservations/${res.id}/edit`)}
                                                >
                                                    Éditer
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => handleCancel(res.id)}
                                                >
                                                    Annuler
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
