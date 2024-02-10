import {db} from './singleton.server'
import {generateSlug} from 'random-word-slugs'

export async function getUser(id: string) {
	return db.user.findUnique({where: {id}})
}

export async function getUserByUsername(username: string) {
	return db.user.findUnique({
		where: {username},
	})
}

export async function upsertMockUser({
	email,
}: {
	email: string
}) {
	const name = generateSlug(2, {format: 'title'})
	const username = generateSlug(2, {format: 'kebab'})
	return db.user.upsert({
		create: {
			email,
			name,
			username,
		},
		update: {name, username},
		where: {email},
		select: selectSession,
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
			select: selectSession,
		})
	}
}

const selectSession = {
	id: true,
	name: true,
	username: true,
	email: true,
	discordId: true,
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
