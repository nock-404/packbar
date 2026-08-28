import 'server-only'
import { getTranslations } from 'next-intl/server'

function emailShell(heading: string, body: string, url: string, cta: string) {
	return `
		<div style="background-color:#f4f4f5;padding:2.5rem 1rem;font-family:Arial,Helvetica,sans-serif;">
			<div style="max-width:32rem;margin:0 auto;background-color:#ffffff;border-radius:0.75rem;padding:2.5rem;">
				<p style="margin:0 0 1.5rem;font-size:1.25rem;font-weight:700;color:#111827;">packbar</p>
				<h1 style="margin:0 0 1rem;font-size:1.25rem;color:#111827;">${heading}</h1>
				<p style="margin:0 0 1.5rem;font-size:0.9375rem;line-height:1.5;color:#374151;">${body}</p>
				<p style="margin:0 0 1.5rem;">
					<a href="${url}" style="display:inline-block;background-color:#111827;color:#ffffff;text-decoration:none;padding:0.75rem 1.5rem;border-radius:0.5rem;font-size:0.9375rem;">${cta}</a>
				</p>
				<p style="margin:0;font-size:0.75rem;color:#9ca3af;">${url}</p>
			</div>
		</div>
	`
}

export async function verificationEmail(url: string) {
	const t = await getTranslations({ locale: 'de', namespace: 'emails' })
	return {
		subject: t('verify.subject'),
		text: t('verify.text', { url }),
		html: emailShell(t('verify.heading'), t('verify.body'), url, t('verify.cta')),
	}
}

export async function resetPasswordEmail(url: string) {
	const t = await getTranslations({ locale: 'de', namespace: 'emails' })
	return {
		subject: t('reset.subject'),
		text: t('reset.text', { url }),
		html: emailShell(t('reset.heading'), t('reset.body'), url, t('reset.cta')),
	}
}

export async function lastMinuteEmail(listName: string, items: string[]) {
	const t = await getTranslations({ locale: 'de', namespace: 'emails' })
	const url = process.env.BETTER_AUTH_URL ?? ''
	const itemsList = items.join(', ')
	return {
		subject: t('lastMinute.subject', { listName }),
		text: t('lastMinute.text', { listName, items: itemsList }),
		html: emailShell(t('lastMinute.heading'), t('lastMinute.body', { listName, items: itemsList }), url, t('lastMinute.cta')),
	}
}
