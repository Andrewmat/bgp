import {
	Form,
	LinkProps,
	useNavigation,
} from '@remix-run/react'
import {ShellIcon, Trash2Icon} from 'lucide-react'
import {
	ComponentPropsWithoutRef,
	useId,
	useState,
} from 'react'
import {Button} from '~/components/ui/button'
import {Checkbox} from '~/components/ui/checkbox'
import {Label} from '~/components/ui/label'
import SLink from './ui/SLink'

interface FormTableManagerProps {
	user: {
		id: string
		name: string
	}
	group: {
		id: string
		name: string
		username: string
	}[]
	table: {id: string}[]
}

export function TableManager({
	group,
	table,
	user,
}: FormTableManagerProps) {
	const nav = useNavigation()
	const isCreating =
		nav.state !== 'idle' &&
		nav.formAction === '/table' &&
		nav.formMethod === 'POST'
	const isDeleting =
		nav.state !== 'idle' &&
		nav.formAction === '/table' &&
		nav.formMethod === 'DELETE'

	const [isCreatingDisabled, setIsCreatingDisabled] =
		useState(false)

	return (
		<>
			<Form
				method='POST'
				action='/table'
				className='flex flex-col gap-2 items-start'
				onChange={(e) => {
					if (
						new FormData(e.currentTarget).getAll('user-id')
							.length === 0
					) {
						setIsCreatingDisabled(true)
					} else {
						setIsCreatingDisabled(false)
					}
				}}
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

					{group.map((gu) => (
						<CheckboxUser
							key={gu.id}
							to={`/user/${gu.username}`}
							defaultChecked={table?.some(
								(t) => t.id === gu.id,
							)}
							value={gu.id}
						>
							{gu.name}
						</CheckboxUser>
					))}
				</div>
				<Button
					type='submit'
					disabled={isCreating || isCreatingDisabled}
				>
					{isCreating ? (
						<ShellIcon className='animate-spin' />
					) : (
						'Criar mesa'
					)}
				</Button>
			</Form>
			{table.length > 0 && (
				<Form method='DELETE'>
					<input
						type='hidden'
						name='intent'
						value='delete'
					/>
					<Button
						type='submit'
						variant='destructive'
						className='flex items-center gap-2'
						disabled={isDeleting}
					>
						<Trash2Icon size='1em' />{' '}
						{isDeleting ? (
							<ShellIcon className='animate-spin' />
						) : (
							'Deletar mesa'
						)}
					</Button>
				</Form>
			)}
		</>
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
