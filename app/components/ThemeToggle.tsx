import {MoonIcon, SunIcon} from 'lucide-react'
import {Theme, useTheme} from 'remix-themes'
import {Switch} from './ui/switch'

export function ThemeToggle() {
	const [theme, setTheme] = useTheme()
	return (
		<Switch
			checked={theme !== Theme.DARK}
			onCheckedChange={() => {
				setTheme(
					theme === Theme.DARK ? Theme.LIGHT : Theme.DARK,
				)
			}}
		>
			{theme === Theme.DARK ? (
				<MoonIcon className='h-3 w-3 mx-auto self-center mt-1 hover:bg-opacity-100' />
			) : (
				<SunIcon className='h-3 w-3 mx-auto self-center mt-1 hover:bg-opacity-100' />
			)}
		</Switch>
	)
}
