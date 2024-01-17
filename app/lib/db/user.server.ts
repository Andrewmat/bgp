import {db} from './singleton.server'

export async function getUser(id: string) {
	return db.user.findUnique({where: {id}})
}

export async function getUserByUsername(username: string) {
	return db.user.findUnique({
		where: {username},
	})
}

export async function upsertDiscordUser({
	email,
	name,
	discordId,
}: {
	email: string
	name: string
	discordId: string
}) {
	const user = await db.user.findUnique({
		where: {email},
	})

	if (!user) {
		return db.user.create({
			data: {email, name, discordId},
			select: {
				id: true,
				name: true,
				username: true,
				email: true,
				discordId: true,
			},
		})
	} else {
		return db.user.update({
			data: {discordId},
			where: {id: user.id},
			select: {
				id: true,
				name: true,
				username: true,
				email: true,
				discordId: true,
			},
		})
	}
}

export async function updateUsername({
	username,
	name,
	id,
}: {
	username: string
	name: string
	id: string
}) {
	return db.user.update({
		data: {
			username,
			name,
		},
		where: {id},
	})
}
