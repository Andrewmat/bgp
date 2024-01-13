import {
	LoaderFunctionArgs,
	json,
	redirect,
} from '@remix-run/node'
import {upsertScore} from '~/lib/db/score.server'
import {isAuthenticated} from '~/lib/login/auth.server'

export async function loader() {
	return redirect('/home')
}

export async function action({
	request,
	params,
}: LoaderFunctionArgs) {
	const evaluationForm = await request.formData()

	const score = evaluationForm.get('score')
	const gameId = params.gameId

	const user = await isAuthenticated(request)
	if (!user || typeof user.email !== 'string') {
		throw new Response('Unauthorized', {
			status: 401,
		})
	}
	if (
		typeof gameId !== 'string' ||
		typeof score !== 'string' ||
		isNaN(Number(score))
	) {
		throw new Response('Unprocessable Entity', {
			status: 422,
		})
	}
	const newScore = await upsertScore({
		userEmail: user.email,
		gameId: gameId,
		value: Number(score),
	})
	return json(newScore)
}
