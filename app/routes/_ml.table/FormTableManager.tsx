import {Form, Link} from '@remix-run/react'
import {useId} from 'react'
import {Button} from '~/components/ui/button'
import {Checkbox} from '~/components/ui/checkbox'
import {Label} from '~/components/ui/label'

export function FormTableManager({
	following,
	table,
}: {
	following: {
		id: string
		name: string
		username: string
	}[]
	table: {id: string}[]
}) {
	const id = useId()
	return (
		<Form method='POST'>
			<input type='hidden' name='intent' value='post' />
			{following.map((follow) => (
				<div key={follow.id}>
					<Checkbox
						name='user-id'
						value={follow.id}
						id={`${id}-follow-${follow.id}`}
						defaultChecked={table?.some(
							(tUser) => tUser.id === follow.id,
						)}
					/>
					<Label htmlFor={`${id}-follow-${follow.id}`}>
						<Link to={`/user/${follow.username}`}>
							{follow.name}
						</Link>
					</Label>
				</div>
			))}
			<Button type='submit'>Criar mesa</Button>
		</Form>
	)
}
