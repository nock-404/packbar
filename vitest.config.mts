import path from 'node:path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
	plugins: [tsconfigPaths(), react()],
	test: {
		projects: [
			{
				extends: true,
				resolve: {
					alias: {
						'server-only': path.resolve(__dirname, './test/server-only-stub.ts'),
						'next-intl/server': path.resolve(__dirname, './test/next-intl-server-stub.ts'),
					},
				},
				test: {
					name: 'unit',
					environment: 'node',
					include: ['lib/**/*.test.ts', 'components/**/*.test.ts'],
					setupFiles: ['dotenv/config'],
				},
			},
			{
				extends: true,
				test: {
					name: 'components',
					environment: 'jsdom',
					include: ['components/**/*.test.tsx'],
					setupFiles: ['./vitest.setup.ts'],
				},
			},
		],
	},
})
