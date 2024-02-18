import {LoaderFunctionArgs, json} from '@remix-run/node'
import {useLoaderData, useLocation} from '@remix-run/react'
import {ArrowLeftIcon, ArrowRightIcon} from 'lucide-react'
import {ScoreGame, Scores} from '~/components/Scores'
import SLink from '~/components/ui/SLink'
import {Button} from '~/components/ui/button'
import {getGameId} from '~/lib/bgg'
import {getScoresByUser} from '~/lib/db/score.server'
import {assertAuthenticated} from '~/lib/login/auth.server'

export async function loader({
	request,
}: LoaderFunctionArgs) {
	const user = await assertAuthenticated(request)
	const searchParams = new URL(request.url).searchParams

	const scorePage =
		Number(searchParams.get('score_page')) || 1
	const scorePageSize = 12
	const rawScores = await getScoresByUser({
		userId: user.id,
		skip: (scorePage - 1) * scorePageSize,
		take: scorePageSize,
	})
	const games = await Promise.all(
		rawScores.map((score) => getGameId(score.gameId)),
	)
	return json({
		scorePage,
		scores: rawScores.map((s) => ({
			score: s.value,
			game: games.find((g) => g.id === s.gameId)!,
		})),
	})
}

export default function HomePage() {
	const {scores, scorePage} = useLoaderData<typeof loader>()
	const {pathname, search} = useLocation()
	const prevParams = new URLSearchParams(search)
	prevParams.set('score_page', String(scorePage - 1))
	const nextParams = new URLSearchParams(search)
	nextParams.set('score_page', String(scorePage + 1))
	return (
		<div className='flex flex-col gap-3'>
			<h2 className='text-xl'>Notas</h2>
			<Scores
				scorePage={scorePage}
				scores={scores as ScoreGame[]}
			/>
		</div>
	)
}
