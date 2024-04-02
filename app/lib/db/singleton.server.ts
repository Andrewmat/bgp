/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment */
import {PrismaClient} from '@prisma/client'

const singleton = <Value>(
	name: string,
	valueFactory: () => Value,
): Value => {
	const g = global as any
	g.__singletons ??= {}
	g.__singletons[name] ??= valueFactory()
	return g.__singletons[name]
}

export const db = singleton(
	'prisma',
	() => new PrismaClient(),
)
