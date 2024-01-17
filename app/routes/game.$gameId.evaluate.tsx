import {
	LoaderFunctionArgs,
	json,
	redirect,
} from '@remix-run/node'
import {
	deleteScore,
	getScoreByUserGame,
	upsertScore,
} from '~/lib/db/score.server'
import {getSessionUser} from '~/lib/login/auth.server'

export async function loader() {
	return redirect('/home')
}

export async function action({
	request,
	params,
}: LoaderFunctionArgs) {
	const user = await getSessionUser(request)
	if (!user || typeof user.email !== 'string') {
		throw new Response('Unauthorized', {
			status: 401,
		})
	}
	const evaluationForm = await request.formData()
	const gameId = params.gameId

	switch (evaluationForm.get('method')) {
		case 'delete': {
			await methodDelete({userId: user.id, gameId})
			return null
		}
		default: {
			const score = evaluationForm.get('score')
			return json(
				await methodPost({userId: user.id, gameId, score}),
			)
		}
	}
}

async function methodPost({
	userId,
	gameId,
	score,
}: {
	userId: string
	gameId: unknown
	score: unknown
}) {
	if (
		typeof gameId !== 'string' ||
		typeof score !== 'string' ||
		isNaN(Number(score)) ||
		Number(score) > 6 ||
		Number(score) < 1
	) {
		throw new Response(
			JSON.stringify({
				message: 'Unprocessable Entity',
				gameId: typeof gameId,
				score: score,
			}),
			{
				status: 422,
				headers: {'Content-Type': 'application/json'},
			},
		)
	}

	const newScore = await upsertScore({
		userId: userId,
		gameId: gameId,
		value: Number(score),
	})
	return newScore
}

async function methodDelete({
	userId,
	gameId,
}: {
	userId: string
	gameId: unknown
}) {
	if (typeof gameId !== 'string') {
		throw new Response(
			JSON.stringify({
				message: 'Unprocessable Entity',
				gameId: typeof gameId,
			}),
			{
				status: 422,
				headers: {'Content-Type': 'application/json'},
			},
		)
	}
	const score = await getScoreByUserGame({
		userId,
		gameId,
	})
	if (score == null) {
		throw new Response('Not Found', {status: 404})
	}

	await deleteScore({id: score.id})
}
