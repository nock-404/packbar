export type ImportEntry = { name: string; quantity: number | null }

const BULLET_RE = /^(?:[-*•]|\d+[.)])?\s*(?:\[[ xX]\]\s*)?/
const QUANTITY_X_RE = /^(\d+)\s*x(?![a-zA-ZäöüßÄÖÜ])\s*(.+)$/
const QUANTITY_PLAIN_RE = /^(\d+)\s+(.+)$/
const HAS_CONTENT_RE = /[\p{L}\p{N}]/u

function parseLine(rawLine: string): ImportEntry | null {
	const trimmed = rawLine.trim()
	if (trimmed.length === 0 || !HAS_CONTENT_RE.test(trimmed)) return null

	const stripped = trimmed.replace(BULLET_RE, '').trim()
	if (stripped.length === 0 || !HAS_CONTENT_RE.test(stripped)) return null

	const xMatch = stripped.match(QUANTITY_X_RE)
	if (xMatch) {
		const name = xMatch[2].trim()
		if (name.length > 0) return { name, quantity: Number(xMatch[1]) }
	}

	const plainMatch = stripped.match(QUANTITY_PLAIN_RE)
	if (plainMatch) {
		const name = plainMatch[2].trim()
		if (name.length > 0) return { name, quantity: Number(plainMatch[1]) }
	}

	return { name: stripped, quantity: null }
}

export function parseImportText(text: string): ImportEntry[] {
	return text
		.split(/\r\n|\r|\n/)
		.map(parseLine)
		.filter((entry): entry is ImportEntry => entry !== null)
}
