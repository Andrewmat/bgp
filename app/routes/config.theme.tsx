import {createThemeAction} from 'remix-themes'
import {themeSessionResolver} from '~/lib/login/session.server'

export const action = createThemeAction(
	themeSessionResolver,
)
