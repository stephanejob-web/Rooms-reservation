import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import api from '../../services/api';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        mot_de_passe: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Login to get token
            const response = await api.post('/auth/login', formData);
            const { access_token } = response.data;

            // Store token temporarily to fetch user profile
            localStorage.setItem('token', access_token);

            // Fetch user profile (assuming we have an endpoint, or we decode token if it has info)
            // For now, let's assume we can fetch user info or the login might return it if we modify backend.
            // But looking at backend code, login ONLY returns access_token.
            // We need to fetch user details.
            // In auth.service.ts: returns { access_token }
            // In users.controller.ts: @Get(':id') or @Get() (findAll)
            // We need a way to get "me". Often /users/me or check token payload.
            // Payload has sub (id) and email.
            // We can decode token on client or fetch user by ID if we extract it.

            // Let's decode the token properly or just fetch all users and find match (inefficient but works for small app)
            // OR better: use the ID from the decoded token to fetch /users/:id

            const payload = JSON.parse(atob(access_token.split('.')[1]));
            const userId = payload.sub;

            const userResponse = await api.get(`/users/${userId}`);

            login(access_token, userResponse.data);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Une erreur est survenue lors de la connexion');
            localStorage.removeItem('token'); // Cleanup if failed
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Connexion
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Ou{' '}
                    <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                        créer un nouveau compte
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <Input
                            id="email"
                            type="email"
                            label="Adresse email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />

                        <Input
                            id="password"
                            type="password"
                            label="Mot de passe"
                            required
                            value={formData.mot_de_passe}
                            onChange={(e) => setFormData({ ...formData, mot_de_passe: e.target.value })}
                        />

                        {error && (
                            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                                {error}
                            </div>
                        )}

                        <div>
                            <Button type="submit" className="w-full" isLoading={isLoading}>
                                Se connecter
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
