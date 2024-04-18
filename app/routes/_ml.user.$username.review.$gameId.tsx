import {LoaderFunctionArgs, json} from '@remix-run/node'
import {
	Link,
	isRouteErrorResponse,
	useLoaderData,
	useRouteError,
} from '@remix-run/react'
import invariant from 'tiny-invariant'
import {ScoreDisplay} from '~/components/DiceScore'
import {GameLink} from '~/components/GameLink'
import {Alert} from '~/components/ui/alert'
import {Button} from '~/components/ui/button'
import {TooltipProvider} from '~/components/ui/tooltip'
import {type BggBoardgame, getGameId} from '~/lib/bgg'
import {getReviewByUserGame} from '~/lib/db/score.server'
import {getUserByUsername} from '~/lib/db/user.server'

export async function loader({params}: LoaderFunctionArgs) {
	invariant(params.username, 'Expected username')
	invariant(params.gameId, 'Expected gameId')

	const pageUser = await getUserByUsername(params.username)

	if (pageUser == null) {
		throw new Response('Usuário não encontrado', {
			status: 404,
		})
	}

	const [score, game] = await Promise.all([
		getReviewByUserGame({
			userId: pageUser.id,
			gameId: params.gameId,
		}),
		getGameId(params.gameId),
	])

	if (!score) {
		throw new Response('Nota não encontrada', {status: 404})
	}

	return json({
		score: score.value,
		review: score.review,
		game,
		pageUser,
	})
}

export default function UserGameReviewPage() {
	const {game, score, review, pageUser} =
		useLoaderData<typeof loader>()
	return (
		<>
			<div className='mx-auto mt-6 min-w-[300px] max-w-[60ch] flex flex-col gap-6'>
				<div className='flex gap-2 justify-between'>
					<GameLink game={game as BggBoardgame} />
					<TooltipProvider>
						<ScoreDisplay score={score} />
					</TooltipProvider>
				</div>
				{review && (
					<figure>
						<blockquote className='italic text-lg'>
							&ldquo;{review}&rdquo;
						</blockquote>
						<figcaption className='text-end font-bold'>
							{pageUser.name}
						</figcaption>
					</figure>
				)}
			</div>
			<Button
				asChild
				variant='link'
				className='mx-auto h-auto whitespace-break-spaces text-center'
			>
				<Link to={`/game/${game.id}/review`}>
					Faça sua análise de {game.name} também
				</Link>
			</Button>
		</>
	)
}

export function ErrorBoundary() {
	const error = useRouteError()
	console.log(error)

	if (isRouteErrorResponse(error)) {
		return <Alert variant='destructive'>{error.data}</Alert>
	}

	return (
		<Alert>Ops! Houve um erro ao carregar a página!</Alert>
	)
}
