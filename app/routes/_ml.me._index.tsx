import {LoaderFunctionArgs, json} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {getGamesListId} from '~/lib/bgg'
import {getScores} from '~/lib/db/score.server'
import {assertAuthenticated} from '~/lib/login/auth.server'

export async function loader({
	request,
}: LoaderFunctionArgs) {
	const user = await assertAuthenticated(request)

	const rawScores = await getScores({userEmail: user.email})
	const gameScores = (
		await getGamesListId(rawScores.map((s) => s.gameId))
	).map((game) => ({
		...game,
		userScore: rawScores.find((s) => s.gameId === game.id)!
			.value,
	}))

	return json({gameScores})
}

export default function MyActivities() {
	const {gameScores} = useLoaderData<typeof loader>()
	return (
		<div>
			{gameScores.map((game) => (
				<div key={game.id}>
					<div>{game.name}</div>
					<div>{game.userScore}</div>
				</div>
			))}
		</div>
	)
}
