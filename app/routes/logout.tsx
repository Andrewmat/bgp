import {ActionFunctionArgs, redirect} from '@remix-run/node'
import {logout} from '~/lib/login/auth.server'

export async function action({
	request,
}: ActionFunctionArgs) {
	return logout(request)
}

export async function loader() {
	return redirect('/')
}
