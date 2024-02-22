import {LoaderFunctionArgs, json} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {ScoreGame, Scores} from '~/components/Scores'
import {getGameId} from '~/lib/bgg'
import {getScoresByUser} from '~/lib/db/score.server'
import {assertAuthenticated} from '~/lib/login/auth.server'

const PAGE_SIZE = 12

export async function loader({
	request,
}: LoaderFunctionArgs) {
	const user = await assertAuthenticated(request)
	const searchParams = new URL(request.url).searchParams

	const scorePage =
		Number(searchParams.get('score_page')) || 1
	const rawScores = await getScoresByUser({
		userId: user.id,
		skip: (scorePage - 1) * PAGE_SIZE,
		take: PAGE_SIZE,
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
