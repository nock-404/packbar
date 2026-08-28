import 'server-only'
import nodemailer from 'nodemailer'

interface AppEmail {
	to: string
	subject: string
	text: string
	html: string
}

const transporter = process.env.SMTP_HOST
	? nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		port: Number(process.env.SMTP_PORT),
		secure: process.env.SMTP_PORT === '465',
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASS,
		},
	})
	: null

export async function sendAppEmail(mail: AppEmail) {
	if (!transporter) {
		console.info('[mail:dev]', mail.to, mail.subject, mail.text)
		return
	}
	try {
		await transporter.sendMail({ from: process.env.SMTP_FROM, ...mail })
	} catch (error) {
		console.error('[mail:error]', mail.to, mail.subject, error)
	}
}
