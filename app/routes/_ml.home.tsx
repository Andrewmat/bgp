import {LoaderFunctionArgs, json} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {ScoreGame, Scores} from '~/components/Scores'
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
	const scorePageSize =
		Number(searchParams.get('score_page_size')) || 10
	const rawScores = await getScoresByUser({
		userId: user.id,
		skip: (scorePage - 1) * scorePageSize,
		take: scorePageSize,
	})
	const games = await Promise.all(
		rawScores.map((score) => getGameId(score.gameId)),
	)
	return json({
		scores: rawScores.map((s) => ({
			score: s.value,
			game: games.find((g) => g.id === s.gameId)!,
		})),
	})
}

export default function HomePage() {
	const {scores} = useLoaderData<typeof loader>()
	return (
		<div className='px-2'>
			<h1 className='text-xl'>Notas</h1>
			{scores.length > 0 ? (
				<Scores scores={scores as ScoreGame[]} />
			) : (
				<div>
					Parece que você não deu nota para nenhum jogo
				</div>
			)}
		</div>
	)
}
