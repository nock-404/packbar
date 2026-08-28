import { betterAuth } from 'better-auth'
import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { nextCookies } from 'better-auth/next-js'
import { db } from '@/lib/db'
import { sendAppEmail } from '@/lib/mailer'
import { verificationEmail, resetPasswordEmail } from '@/lib/emails'

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'pg',
	}),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		minPasswordLength: 10,
		sendResetPassword: async ({ user, url }) => {
			const mail = await resetPasswordEmail(url)
			void sendAppEmail({ to: user.email, ...mail })
		},
	},
	emailVerification: {
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user, url }) => {
			const mail = await verificationEmail(url)
			void sendAppEmail({ to: user.email, ...mail })
		},
	},
	plugins: [nextCookies()],
})
