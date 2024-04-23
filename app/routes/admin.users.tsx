import {
	LoaderFunctionArgs,
	SerializeFrom,
} from '@remix-run/node'
import {json, useLoaderData} from '@remix-run/react'
import {searchAllUsers} from '~/lib/db/user.server'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '~/components/ui/table'
import {User} from '@prisma/client'
import {Alert} from '~/components/ui/alert'

export async function loader({
	request,
}: LoaderFunctionArgs) {
	const searchTerm = new URL(request.url).searchParams.get(
		'q',
	)
	const users = await searchAllUsers(
		searchTerm ?? undefined,
	)
	return json({users})
}

export default function AdminUsersPage() {
	const {users} = useLoaderData<typeof loader>()
	if (users.length <= 0) {
		return <Alert>Nenhum usuário encontrado</Alert>
	}
	const properties = Object.keys(
		users[0],
	) as (keyof (typeof users)[number])[]

	return (
		<div>
			<Table>
				<TableHeader>
					{properties.map((key) => (
						<TableHead key={key}>{key}</TableHead>
					))}
				</TableHeader>
				<TableBody>
					{users.map((user) => (
						<TableRow key={user.id}>
							{properties.map((property) => (
								<TableCell key={property}>
									<FormatValue
										user={user}
										property={property}
									/>
								</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	)
}

function FormatValue({
	user,
	property,
}: {
	user: SerializeFrom<User>
	property: keyof typeof user
}) {
	switch (property) {
		case 'createdAt':
		case 'updatedAt': {
			return new Date(user[property]).toISOString()
		}
		default:
			return user[property]
	}
}
