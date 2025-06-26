import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useParams, useNavigate } from 'react-router-dom';
import { useStores } from '../stores';

export const RoundPage = observer(() => {
	const { id } = useParams<{ id: string }>();
	const { roundsStore, authStore } = useStores();
	const navigate = useNavigate();

	useEffect(() => {
		if (!authStore.token) {
			navigate('/login');
			return;
		}

		if (id) {
			roundsStore.fetchRound(id, authStore.token);
		}

		return () => {
			roundsStore.clearCurrentRound();
		};
	}, [id, authStore.token, navigate]);

	const handleTap = async () => {
		if (!id || !authStore.token) return;
		await roundsStore.tapRound(id, authStore.token);
	};

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	};

	if (roundsStore.loading) {
		return (
			<div className='flex justify-center items-center h-screen'>
				<div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500' />
			</div>
		);
	}

	if (roundsStore.error || !roundsStore.currentRound) {
		return (
			<div className='container mx-auto p-4 text-center'>
				<div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
					{roundsStore.error || 'Round not found'}
				</div>
				<button
					onClick={() => navigate('/rounds')}
					className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
				>
					Back to Rounds
				</button>
			</div>
		);
	}

	const { currentRound: round } = roundsStore;
	const status = roundsStore.getRoundStatus();

	return (
		<div className='container mx-auto p-4 max-w-3xl'>
			<div className='flex justify-between items-center mb-6'>
				<h1 className='text-3xl font-bold text-gray-800'>Round #{id}</h1>
				<button
					onClick={() => navigate('/rounds')}
					className='text-blue-500 hover:text-blue-700'
				>
					&larr; Back to Rounds
				</button>
			</div>

			<div className='bg-white rounded-xl shadow-lg p-6 mb-8'>
				<div className='flex flex-wrap justify-between items-center gap-4'>
					<div>
						<p className='text-gray-600'>Start Time</p>
						<p className='text-lg font-semibold'>
							{new Date(round.startDate).toLocaleString()}
						</p>
					</div>

					<div className='flex items-center'>
						<span
							className={`px-3 py-1 rounded-full font-medium ${
								status === 'scheduled'
									? 'bg-yellow-100 text-yellow-800'
									: status === 'active'
										? 'bg-green-100 text-green-800'
										: 'bg-red-100 text-red-800'
							}`}
						>
							{status.charAt(0).toUpperCase() + status.slice(1)}
						</span>
					</div>

					<div>
						<p className='text-gray-600'>End Time</p>
						<p className='text-lg font-semibold'>
							{new Date(round.endDate).toLocaleString()}
						</p>
					</div>
				</div>

				{roundsStore.timeLeft !== null && (
					<div className='mt-4 text-center'>
						{status === 'scheduled' ? (
							<p className='text-xl'>
								Starts in:{' '}
								<span className='font-bold text-blue-600'>
									{formatTime(roundsStore.timeLeft)}
								</span>
							</p>
						) : status === 'active' ? (
							<p className='text-xl'>
								Time left:{' '}
								<span className='font-bold text-red-600'>
									{formatTime(roundsStore.timeLeft)}
								</span>
							</p>
						) : (
							<p className='text-xl font-bold text-gray-700'>Round Completed</p>
						)}
					</div>
				)}
			</div>

			{status === 'active' && (
				<div className='text-center mb-8'>
					<div className='relative'>
						<button
							onClick={handleTap}
							disabled={roundsStore.isTapping}
							className={`relative z-10 px-12 py-8 text-2xl font-bold rounded-full shadow-lg transform transition-all duration-150 ${
								roundsStore.isTapping
									? 'bg-yellow-400 scale-95'
									: 'bg-yellow-300 hover:bg-yellow-400 active:scale-95'
							}`}
						>
							🦆 TAP THE GOOSE! 🦆
						</button>
						<div className='absolute -inset-2 bg-yellow-500 rounded-full blur opacity-75 animate-pulse'></div>
					</div>
					<p className='mt-4 text-gray-600'>Tap as fast as you can!</p>
				</div>
			)}

			<div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
				<div className='bg-white rounded-xl shadow-lg p-6'>
					<h3 className='text-lg font-semibold text-gray-700 mb-2'>Your Stats</h3>
					<div className='space-y-3'>
						<div>
							<p className='text-gray-600'>Total Taps</p>
							<p className='text-3xl font-bold text-blue-600'>
								{roundsStore.userStats.tapCount}
							</p>
						</div>
						<div>
							<p className='text-gray-600'>Total Score</p>
							<p className='text-3xl font-bold text-green-600'>
								{roundsStore.userStats.totalScore}
							</p>
						</div>
					</div>
				</div>

				<div className='bg-white rounded-xl shadow-lg p-6 md:col-span-2'>
					<h3 className='text-lg font-semibold text-gray-700 mb-2'>Round Stats</h3>
					<div className='grid grid-cols-2 gap-4'>
						<div>
							<p className='text-gray-600'>Total Taps</p>
							<p className='text-3xl font-bold'>{round.totalTaps}</p>
						</div>
						<div>
							<p className='text-gray-600'>Total Score</p>
							<p className='text-3xl font-bold'>{round.totalScore}</p>
						</div>
						<div className='col-span-2'>
							<p className='text-gray-600'>Participants</p>
							<p className='text-3xl font-bold'>{round.userRounds?.length || 0}</p>
						</div>
					</div>
				</div>
			</div>

			{status === 'finished' && round.winner && (
				<div className='bg-gradient-to-r from-yellow-100 to-yellow-50 rounded-xl shadow-lg p-6 border border-yellow-200'>
					<h3 className='text-lg font-semibold text-gray-700 mb-4'>Winner</h3>
					<div className='flex items-center space-x-4'>
						<div className='bg-yellow-200 rounded-full p-3'>
							<span className='text-2xl'>🏆</span>
						</div>
						<div>
							<p className='text-xl font-bold'>{round.winner.username}</p>
							<p className='text-gray-600'>Score: {round.winner.totalScore}</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
});
