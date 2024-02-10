import {ActionFunctionArgs, redirect} from '@remix-run/node'
import {authenticateMock} from '~/lib/login/auth.server'

export function loader() {
	return redirect('/login')
}

export async function action({
	request,
}: ActionFunctionArgs) {
	if (process.env.NODE_ENV !== 'development') {
		throw new Response('Method not allowed', {status: 405})
	}
	return await authenticateMock(request)
}
