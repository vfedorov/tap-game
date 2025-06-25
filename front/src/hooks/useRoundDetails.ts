import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

export const useRoundDetails = (id: string) => {
    const [round, setRound] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRound = async () => {
            try {
                const response = await apiClient.get(`/rounds/${id}`);
                setRound(response.data);
            } catch (error) {
                console.error('Error fetching round:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchRound();
    }, [id]);

    return { round, loading };
};