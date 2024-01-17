import {LoaderFunctionArgs, json} from '@remix-run/node'
import {SessionUser} from '../login/user.schema'
import {getUser} from '../login/auth.server'

type UserArg = {user: SessionUser | null}
type LoaderFunctionWithUserArgs = LoaderFunctionArgs &
	UserArg

export function withUser<
	TResponse extends Record<keyof unknown, unknown>,
>(
	loader: (
		args: LoaderFunctionWithUserArgs,
	) => Promise<TResponse>,
) {
	return async function loaderWrapper(
		args: LoaderFunctionArgs,
	) {
		const user = await getUser(args.request)
		const data = await loader({...args, user})
		return json({...data, user})
	}
}
