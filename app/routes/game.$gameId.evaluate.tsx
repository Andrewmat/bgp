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

export async function loader({params}: LoaderFunctionArgs) {
	return redirect(`/game/${params.gameId}`)
}

export async function action({
	request,
	params,
}: LoaderFunctionArgs) {
	const user = await getSessionUser(request)
	if (!user) {
		throw new Response('Unauthorized', {
			status: 401,
		})
	}
	const evaluationForm = await request.formData()
	const gameId = params.gameId

	switch (evaluationForm.get('method')) {
		case 'delete': {
			await methodDelete({userId: user.id, gameId})
			return json({success: true, intent: 'delete'})
		}
		default: {
			const score = evaluationForm.get('score')
			await methodPost({userId: user.id, gameId, score})
			return json({success: true, intent: 'post'})
		}
	}

	// TODO redirectTo after evaluation
	// const redirectTo =
	// 	typeof evaluationForm.get('location') === 'string'
	// 		? (evaluationForm.get('location') as string)
	// 		: `/game/${gameId}`
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
		Number(score) > 10 ||
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

	await upsertScore({
		userId: userId,
		gameId: gameId,
		value: Number(score),
	})
	return redirect(`/game/${gameId}`)
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

	return redirect(`/game/${gameId}`)
}
