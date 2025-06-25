import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const RoundPage = () => {
    const { id } = useParams<{ id: string }>();
    const { token, logout } = useAuth();
    const navigate = useNavigate();
    const [round, setRound] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userStats, setUserStats] = useState({ tapCount: 0, totalScore: 0 });
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [isTapping, setIsTapping] = useState(false);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchRound = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get(`/rounds/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setRound(response.data);

                if (response.data.userStats) {
                    setUserStats(response.data.userStats);
                }
            } catch (err: any) {
                if (err.response?.status === 401) logout();
                setError('Failed to load round details');
            } finally {
                setLoading(false);
            }
        };

        fetchRound();
    }, [id, token, logout, navigate]);

    useEffect(() => {
        if (!round) return;

        const timer = setInterval(() => {
            const now = new Date();
            const startDate = new Date(round.startDate);
            const endDate = new Date(round.endDate);

            if (now < startDate) {
                setTimeLeft(Math.floor((startDate.getTime() - now.getTime()) / 1000));
            } else if (now < endDate) {
                setTimeLeft(Math.floor((endDate.getTime() - now.getTime()) / 1000));
            } else {
                setTimeLeft(0);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [round]);

    const handleTap = async () => {
        if (!round || isTapping) return;

        try {
            setIsTapping(true);
            const response = await apiClient.post(
                `/taps/${id}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setUserStats({
                tapCount: response.data.tapCount,
                totalScore: response.data.totalScore,
            });

            // Обновляем общую статистику раунда
            setRound((prev: { totalTaps: number; totalScore: number; }) => ({
                ...prev,
                totalTaps: prev.totalTaps + 1,
                totalScore: prev.totalScore + (response.data.totalScore - userStats.totalScore)
            }));
        } catch (err: any) {
            if (err.response?.status === 401) logout();
            setError('Failed to register tap');
        } finally {
            setIsTapping(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !round) {
        return (
            <div className="container mx-auto p-4 text-center">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error || 'Round not found'}
                </div>
                <button
                    onClick={() => navigate('/rounds')}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Back to Rounds
                </button>
            </div>
        );
    }

    const now = new Date();
    const startDate = new Date(round.startDate);
    const endDate = new Date(round.endDate);

    let status = 'scheduled';
    if (now >= startDate && now <= endDate) status = 'active';
    if (now > endDate) status = 'finished';

    return (
        <div className="container mx-auto p-4 max-w-3xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Round #{id}</h1>
                <button
                    onClick={() => navigate('/rounds')}
                    className="text-blue-500 hover:text-blue-700"
                >
                    &larr; Back to Rounds
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <p className="text-gray-600">Start Time</p>
                        <p className="text-lg font-semibold">
                            {new Date(round.startDate).toLocaleString()}
                        </p>
                    </div>

                    <div className="flex items-center">
            <span className={`px-3 py-1 rounded-full font-medium ${
                status === 'scheduled'
                    ? 'bg-yellow-100 text-yellow-800'
                    : status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
            }`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
                    </div>

                    <div>
                        <p className="text-gray-600">End Time</p>
                        <p className="text-lg font-semibold">
                            {new Date(round.endDate).toLocaleString()}
                        </p>
                    </div>
                </div>

                {timeLeft !== null && (
                    <div className="mt-4 text-center">
                        {status === 'scheduled' ? (
                            <p className="text-xl">
                                Starts in: <span className="font-bold text-blue-600">{formatTime(timeLeft)}</span>
                            </p>
                        ) : status === 'active' ? (
                            <p className="text-xl">
                                Time left: <span className="font-bold text-red-600">{formatTime(timeLeft)}</span>
                            </p>
                        ) : (
                            <p className="text-xl font-bold text-gray-700">Round Completed</p>
                        )}
                    </div>
                )}
            </div>

            {status === 'active' && (
                <div className="text-center mb-8">
                    <div className="relative">
                        <button
                            onClick={handleTap}
                            disabled={isTapping}
                            className={`relative z-10 px-12 py-8 text-2xl font-bold rounded-full shadow-lg transform transition-all duration-150 ${
                                isTapping
                                    ? 'bg-yellow-400 scale-95'
                                    : 'bg-yellow-300 hover:bg-yellow-400 active:scale-95'
                            }`}
                        >
                            🦆 TAP THE GOOSE! 🦆
                        </button>
                        <div className="absolute -inset-2 bg-yellow-500 rounded-full blur opacity-75 animate-pulse"></div>
                    </div>
                    <p className="mt-4 text-gray-600">Tap as fast as you can!</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Your Stats</h3>
                    <div className="space-y-3">
                        <div>
                            <p className="text-gray-600">Total Taps</p>
                            <p className="text-3xl font-bold text-blue-600">{userStats.tapCount}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Total Score</p>
                            <p className="text-3xl font-bold text-green-600">{userStats.totalScore}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Round Stats</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-600">Total Taps</p>
                            <p className="text-3xl font-bold">{round.totalTaps}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Total Score</p>
                            <p className="text-3xl font-bold">{round.totalScore}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-gray-600">Participants</p>
                            <p className="text-3xl font-bold">
                                {round.userRounds?.length || 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {status === 'finished' && round.winner && (
                <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 rounded-xl shadow-lg p-6 border border-yellow-200">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Winner</h3>
                    <div className="flex items-center space-x-4">
                        <div className="bg-yellow-200 rounded-full p-3">
                            <span className="text-2xl">🏆</span>
                        </div>
                        <div>
                            <p className="text-xl font-bold">{round.winner.username}</p>
                            <p className="text-gray-600">Score: {round.winner.totalScore}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};