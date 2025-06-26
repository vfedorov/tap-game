import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores';

export const RoundListPage = observer(() => {
  const { roundsStore, authStore } = useStores();
  const { token } = authStore;

  useEffect(() => {
    if (token) {
      roundsStore.fetchRounds(token);
    }
  }, [token]);

  const handleCreate = async () => {
    if (!token) return;
    const newRound = await roundsStore.createRound(token);
    window.location.href = `/rounds/${newRound.id}`;
  };

  if (roundsStore.loading) return <div>Loading...</div>;

  return (
    <div className='container mx-auto p-4'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>Game Rounds</h1>
        {authStore.isAdmin && (
          <button
            onClick={handleCreate}
            className='bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600'
          >
            Create New Round
          </button>
        )}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {roundsStore.rounds.map((round) => (
          <Link
            to={`/rounds/${round.id}`}
            key={round.id}
            className='bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition'
          >
            <h2 className='text-xl font-bold mb-2'>Round #{round.id}</h2>
            <p>Start: {new Date(round.startDate).toLocaleString()}</p>
            <p>End: {new Date(round.endDate).toLocaleString()}</p>
            <div className='mt-4'>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  new Date() < new Date(round.startDate)
                    ? 'bg-yellow-200 text-yellow-800'
                    : new Date() > new Date(round.endDate)
                      ? 'bg-red-200 text-red-800'
                      : 'bg-green-200 text-green-800'
                }`}
              >
                {new Date() < new Date(round.startDate)
                  ? 'Scheduled'
                  : new Date() > new Date(round.endDate)
                    ? 'Finished'
                    : 'Active'}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
});
