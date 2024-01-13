declare global {
	namespace NodeJS {
		interface ProcessEnv {
			HOST_URL: string | undefined
			DISCORD_CLIENT_SECRET: string | undefined
			DISCORD_CLIENT_ID: string | undefined
		}
	}
}
export {}
