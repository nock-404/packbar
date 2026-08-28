export type WeatherCondition = 'sun' | 'cloud' | 'rain' | 'snow' | 'storm'

const stormCodes = new Set([95, 96, 99])
const snowCodes = new Set([71, 73, 75, 77, 85, 86])
const rainCodes = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82])
const cloudCodes = new Set([1, 2, 3, 45, 48])

export function codeToCondition(code: number): WeatherCondition {
	if (code === 0) return 'sun'
	if (stormCodes.has(code)) return 'storm'
	if (snowCodes.has(code)) return 'snow'
	if (rainCodes.has(code)) return 'rain'
	if (cloudCodes.has(code)) return 'cloud'
	return 'cloud'
}
