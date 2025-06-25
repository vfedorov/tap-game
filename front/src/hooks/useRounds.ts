import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

export const useRounds = () => {
    const [rounds, setRounds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRounds = async () => {
            try {
                const response = await apiClient.get('/rounds');
                setRounds(response.data);
            } catch (error) {
                console.error('Error fetching rounds:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRounds();
    }, []);

    return { rounds, loading };
};

export const useCreateRound = () => {
    const createRound = async () => {
        try {
            const response = await apiClient.post('/rounds');
            return response.data;
        } catch (error) {
            console.error('Error creating round:', error);
            throw error;
        }
    };

    return { createRound };
};