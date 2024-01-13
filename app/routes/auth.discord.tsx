import {ActionFunctionArgs, redirect} from '@remix-run/node'
import {authenticateDiscord} from '~/lib/login/auth.server'

export function loader() {
	return redirect('/login')
}

export async function action({
	request,
}: ActionFunctionArgs) {
	return authenticateDiscord(request)
}
