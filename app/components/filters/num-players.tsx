import {ComponentPropsWithoutRef} from 'react'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../ui/select'
import {useSearchParams} from '@remix-run/react'

export default function NumPlayersSelect({
	name = 'np',
	...props
}: ComponentPropsWithoutRef<typeof Select>) {
	const [searchParams] = useSearchParams()
	const defaultValue = searchParams.get(name) ?? undefined
	return (
		<Select
			name={name}
			defaultValue={defaultValue}
			{...props}
		>
			<SelectTrigger>
				<SelectValue placeholder='N&ordm; de jogadores'></SelectValue>
			</SelectTrigger>
			<SelectContent>
				<SelectItem value='1'>Solo</SelectItem>
				<SelectItem value='2'>2 jogadores</SelectItem>
				<SelectItem value='3'>3 jogadores</SelectItem>
				<SelectItem value='4'>4 jogadores</SelectItem>
				<SelectItem value='5'>5 jogadores</SelectItem>
				<SelectItem value='6'>6 jogadores</SelectItem>
				<SelectItem value='7'>7 jogadores</SelectItem>
				<SelectItem value='8'>8 jogadores</SelectItem>
				<SelectItem value='9'>9 jogadores</SelectItem>
				<SelectItem value='10'>10+ jogadores</SelectItem>
			</SelectContent>
		</Select>
	)
}
