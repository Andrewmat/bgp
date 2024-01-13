import {LoaderFunctionArgs, json} from '@remix-run/node'
import {searchGames} from '~/lib/bgg'

export async function loader({
	request,
}: LoaderFunctionArgs) {
	const term = new URL(request.url).searchParams.get('q')
	if (!term) {
		return new Response(
			JSON.stringify({
				status: 422,
				message: `Query param 'q' is required`,
			}),
			{status: 422},
		)
	}
	const results = await searchGames(term)
	return json({term, results})
}
