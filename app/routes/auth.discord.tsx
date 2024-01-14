import {
	ActionFunctionArgs,
	json,
	redirect,
} from '@remix-run/node'
import {authenticateDiscord} from '~/lib/login/auth.server'
import {setToSession} from '~/lib/login/session.server'

export function loader() {
	return redirect('/login')
}

export async function action({
	request,
}: ActionFunctionArgs) {
	const formData = await request.formData()
	const redirectTo = formData.get('redirectTo')
	await setToSession(request, 'redirectTo', redirectTo)

	return authenticateDiscord(request)
}
