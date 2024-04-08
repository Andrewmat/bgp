import {useFetcher} from '@remix-run/react'
import {
	ReactElement,
	cloneElement,
	useEffect,
	useState,
} from 'react'
import {ScoreGame} from '~/lib/db/score.type'
import {Button} from './ui/button'
import {ShellIcon} from 'lucide-react'

export function InfiniteGamelist({
	games,
	action,
	hasMore,
	page,
	pageSize,
	children,
}: {
	games: ScoreGame[]
	action?: string
	hasMore: boolean
	page: number
	pageSize: number
	children: ReactElement<{games: ScoreGame[]}>
}) {
	const [allGames, setAllGames] = useState(games)
	const moreFetcher = useFetcher<{
		page: number
		hasMore: boolean
		games: ScoreGame[]
	}>()

	const lastPage = moreFetcher.data?.page ?? page
	const lastHasMore = moreFetcher.data?.hasMore ?? hasMore

	useEffect(() => {
		if (moreFetcher.data) {
			const data = moreFetcher.data
			setAllGames((prev) => [
				...prev,
				...(data.games as ScoreGame[]),
			])
		}
	}, [moreFetcher.data])

	return (
		<>
			{cloneElement(children, {games: allGames})}
			{lastHasMore && (
				<moreFetcher.Form
					method='GET'
					action={action}
					className='flex'
				>
					<input
						type='hidden'
						name='page'
						value={lastPage + 1}
					/>
					<input
						type='hidden'
						name='pageSize'
						value={pageSize}
					/>
					<Button
						type='submit'
						className='flex-1 flex gap-2 items-center text-lg'
						variant='ghost'
						disabled={moreFetcher.state === 'loading'}
					>
						{moreFetcher.state === 'loading' && (
							<ShellIcon className='animate-spin' />
						)}
						Ver mais
					</Button>
				</moreFetcher.Form>
			)}
		</>
	)
}
