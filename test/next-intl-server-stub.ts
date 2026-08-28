import deMessages from '../messages/de.json'

function resolveMessage(namespaceMessages: Record<string, unknown>, key: string): string {
	const value = key.split('.').reduce<unknown>((acc, part) => {
		if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) return (acc as Record<string, unknown>)[part]
		return undefined
	}, namespaceMessages)
	if (typeof value !== 'string') throw new Error(`Missing message for key: ${key}`)
	return value
}

function interpolate(template: string, values?: Record<string, unknown>): string {
	if (!values) return template
	return template.replace(/\{(\w+)\}/g, (_, name: string) => String(values[name] ?? ''))
}

export async function getTranslations({ namespace }: { locale?: string; namespace: string }) {
	const namespaceMessages = (deMessages as Record<string, unknown>)[namespace] as Record<string, unknown>
	return (key: string, values?: Record<string, unknown>) => interpolate(resolveMessage(namespaceMessages, key), values)
}
