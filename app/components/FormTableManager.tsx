import {
	Form,
	LinkProps,
	useNavigation,
} from '@remix-run/react'
import {ShellIcon} from 'lucide-react'
import {ComponentPropsWithoutRef, useId} from 'react'
import {Button} from '~/components/ui/button'
import {Checkbox} from '~/components/ui/checkbox'
import {Label} from '~/components/ui/label'
import SLink from './ui/SLink'

interface FormTableManagerProps {
	user: {
		id: string
		name: string
	}
	following: {
		id: string
		name: string
		username: string
	}[]
	table: {id: string}[]
}

export function FormTableManager({
	following,
	table,
	user,
}: FormTableManagerProps) {
	const nav = useNavigation()
	const isLoading =
		nav.state !== 'idle' && nav.formAction === '/table'
	return (
		<Form
			method='POST'
			action='/table'
			className='flex flex-col gap-2 items-start'
		>
			<input type='hidden' name='intent' value='post' />
			<div className='flex gap-2 flex-col'>
				<CheckboxUser
					defaultChecked={
						table.length > 0
							? table.some((t) => t.id === user.id)
							: true
					}
					to='/me'
					value={user.id}
				>
					{user.name}
				</CheckboxUser>

				{following.map((follow) => (
					<CheckboxUser
						key={follow.id}
						to={`/user/${follow.username}`}
						defaultChecked={table?.some(
							(t) => t.id === follow.id,
						)}
						value={follow.id}
					>
						{follow.name}
					</CheckboxUser>
				))}
			</div>
			<Button type='submit'>
				{isLoading ? (
					<ShellIcon className='animate-spin' />
				) : (
					'Criar mesa'
				)}
			</Button>
		</Form>
	)
}

function CheckboxUser({
	children,
	to,
	defaultChecked,
	value,
}: React.PropsWithChildren<{
	to: LinkProps['to']
	value: ComponentPropsWithoutRef<typeof Checkbox>['value']
	defaultChecked: ComponentPropsWithoutRef<
		typeof Checkbox
	>['defaultChecked']
}>) {
	const id = useId()
	return (
		<div className='flex items-center gap-2'>
			<Checkbox
				name='user-id'
				value={value}
				id={`${id}follow`}
				defaultChecked={defaultChecked}
			/>
			<Label htmlFor={`${id}follow`}>
				<SLink to={to} className='p-0 h-auto'>
					{children}
				</SLink>
			</Label>
		</div>
	)
}
