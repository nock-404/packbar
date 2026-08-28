'use client'

import { useState, type ReactNode } from 'react'
import {
	TbDots,
	TbLuggage,
	TbPencil,
	TbPlus,
	TbShare2,
	TbTrash,
} from 'react-icons/tb'
import { cx } from '@/lib/cx'
import { Logo } from '@/components/brand/Logo'
import { ThemeSwitch } from '@/components/theme/ThemeSwitch'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { DestinationCode } from '@/components/ui/DestinationCode'
import { Dialog } from '@/components/ui/Dialog'
import { Dropdown } from '@/components/ui/Dropdown'
import { EmptyState } from '@/components/ui/EmptyState'
import { IconButton } from '@/components/ui/IconButton'
import { Input } from '@/components/ui/Input'
import { Progress } from '@/components/ui/Progress'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { Select } from '@/components/ui/Select'
import { Spinner } from '@/components/ui/Spinner'
import { TextArea } from '@/components/ui/TextArea'

const swatches = [
	{ name: 'surface', cls: 'bg-surface' },
	{ name: 'surface-raised', cls: 'bg-surface-raised' },
	{ name: 'surface-sunken', cls: 'bg-surface-sunken' },
	{ name: 'ink', cls: 'bg-ink' },
	{ name: 'ink-muted', cls: 'bg-ink-muted' },
	{ name: 'ink-faint', cls: 'bg-ink-faint' },
	{ name: 'line', cls: 'bg-line' },
	{ name: 'line-strong', cls: 'bg-line-strong' },
	{ name: 'primary', cls: 'bg-primary' },
	{ name: 'primary-strong', cls: 'bg-primary-strong' },
	{ name: 'primary-soft', cls: 'bg-primary-soft' },
	{ name: 'on-primary', cls: 'bg-on-primary' },
	{ name: 'accent', cls: 'bg-accent' },
	{ name: 'accent-strong', cls: 'bg-accent-strong' },
	{ name: 'accent-soft', cls: 'bg-accent-soft' },
	{ name: 'accent-ink', cls: 'bg-accent-ink' },
	{ name: 'danger', cls: 'bg-danger' },
	{ name: 'danger-strong', cls: 'bg-danger-strong' },
	{ name: 'danger-soft', cls: 'bg-danger-soft' },
	{ name: 'success', cls: 'bg-success' },
	{ name: 'success-soft', cls: 'bg-success-soft' },
	{ name: 'success-ink', cls: 'bg-success-ink' },
]

function Section({ title, children }: { title: string; children: ReactNode }) {
	return (
		<section className="space-y-4">
			<h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
			{children}
		</section>
	)
}

function Caption({ children }: { children: ReactNode }) {
	return <p className="font-mono text-xs text-ink-faint tabular-nums">{children}</p>
}

export default function UiGalleryPage() {
	const [dialogOpen, setDialogOpen] = useState(false)
	const [confirmOpen, setConfirmOpen] = useState(false)
	const [checkA, setCheckA] = useState(false)
	const [checkB, setCheckB] = useState(true)
	const [checkC, setCheckC] = useState(true)

	return (
		<main className="mx-auto max-w-5xl space-y-14 px-6 py-12">
			<header className="flex items-center justify-between gap-4 border-b border-line pb-6">
				<div className="space-y-1">
					<Logo />
					<p className="text-sm text-ink-muted">UI-Galerie: alle Komponenten, Tokens und Schriften</p>
				</div>
				<ThemeSwitch />
			</header>

			<Section title="Farb-Tokens">
				<div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
					{swatches.map((swatch) => (
						<div key={swatch.name} className="space-y-1.5">
							<div className={`h-14 rounded-md border border-line ${swatch.cls}`} />
							<p className="text-xs text-ink-muted">{swatch.name}</p>
						</div>
					))}
				</div>
			</Section>

			<Section title="Typografie">
				<div className="space-y-3">
					<h1 className="font-display text-5xl leading-[1.05] font-bold tracking-tight text-ink">
						Koffer packen, entspannt reisen
					</h1>
					<h2 className="font-display text-3xl leading-tight font-semibold text-ink">
						Alles dabei für den Städtetrip
					</h2>
					<h3 className="font-display text-xl leading-tight font-semibold text-ink">Kleidung und Schuhe</h3>
					<p className="max-w-2xl text-base text-ink">
						Instrument Sans für Fließtext und UI. Die Liste zeigt auf einen Blick, was schon im Koffer liegt
						und was noch fehlt.
					</p>
					<p className="text-sm text-ink-muted">Sekundärtext für Beschreibungen und Metadaten.</p>
					<p className="text-xs text-ink-faint">Kleingedrucktes, Captions, Platzhalter.</p>
					<p className="font-mono text-sm text-ink-muted tabular-nums">
						Space Mono für Meta: 23 / 31 · 14.08.2026 · KRO
					</p>
				</div>
			</Section>

			<Section title="Signature">
				<div className="space-y-10">
					<div className="space-y-2">
						<p className="font-mono text-xs tracking-[0.2em] text-ink-faint uppercase tabular-nums">
							01 / Kleidung
						</p>
						<p className="font-mono text-xs tracking-[0.2em] text-ink-faint uppercase tabular-nums">
							02 / Strand &amp; Pool
						</p>
						<Caption>Sektions-Eyebrow: Mono, Nummer / Label</Caption>
					</div>
					<div className="space-y-2">
						<div className="flex items-center gap-3">
							<DestinationCode code="KRO" />
							<DestinationCode code="LIS" />
							<DestinationCode code="NYC" />
						</div>
						<Caption>DestinationCode: Ziel als Ticket-Code</Caption>
					</div>
					<div className="space-y-2">
						<Badge tone="priority">Last-Minute</Badge>
						<Caption>Priority-Tag: Badge tone priority</Caption>
					</div>
					<div className="max-w-md space-y-2">
						<div className="perforation" />
						<Caption>Perforation: Utility-Klasse perforation, Abrisskante statt Hairline</Caption>
					</div>
					<div className="space-y-2">
						<div className="relative max-w-sm overflow-hidden rounded-lg border border-line bg-surface-raised shadow-sm shadow-black/10">
							<div className="flex h-24 items-end justify-between bg-gradient-to-br from-primary to-primary-strong p-4">
								<Logo variant="mark" className="size-6 text-on-primary/80" />
								<p className="font-mono text-[0.625rem] tracking-[0.2em] text-on-primary/80 uppercase">
									Packliste
								</p>
							</div>
							<div className="space-y-3 p-5">
								<div className="flex items-start justify-between gap-4">
									<h3 className="font-display text-2xl leading-tight font-bold tracking-tight text-ink">
										Kroatien Roadtrip
									</h3>
									<DestinationCode code="KRO" className="mt-1" />
								</div>
								<div className="flex items-center gap-3">
									<p className="font-mono text-xs text-ink-muted tabular-nums">14.08. - 28.08.2026</p>
									<Badge tone="priority">3 Last-Minute</Badge>
								</div>
							</div>
							<div className="relative">
								<div className="perforation" />
								<span className="absolute top-1/2 -left-2 size-4 -translate-y-1/2 rounded-full border border-line bg-surface" />
								<span className="absolute top-1/2 -right-2 size-4 -translate-y-1/2 rounded-full border border-line bg-surface" />
							</div>
							<div className="flex items-center gap-4 p-5 pt-4">
								<Progress value={23} max={31} size="sm" className="flex-1" />
								<p className="font-mono text-xs text-ink-muted tabular-nums">23 / 31</p>
							</div>
						</div>
						<Caption>Boarding-Pass-Card: Basis für die ListCard</Caption>
					</div>
				</div>
			</Section>

			<Section title="Logo">
				<div className="flex flex-wrap items-end gap-8">
					<div className="space-y-1.5">
						<Logo />
						<Caption>full</Caption>
					</div>
					<div className="space-y-1.5">
						<span className="inline-flex items-end gap-4 text-primary">
							<Logo variant="mark" className="size-12" />
							<Logo variant="mark" className="size-8" />
							<Logo variant="mark" className="size-6" />
							<Logo variant="mark" className="size-4" />
						</span>
						<Caption>mark: 3rem / 2rem / 1.5rem / 1rem (Favicon-Größe)</Caption>
					</div>
					<div className="space-y-1.5">
						<span className="inline-flex items-center rounded-md bg-primary p-2 text-on-primary">
							<Logo variant="mark" className="size-6" />
						</span>
						<Caption>auf Primärfläche</Caption>
					</div>
				</div>
			</Section>

			<Section title="Button">
				<div className="space-y-4">
					<div className="flex flex-wrap items-center gap-3">
						<Button>Liste anlegen</Button>
						<Button variant="secondary">Duplizieren</Button>
						<Button variant="ghost">Überspringen</Button>
						<Button variant="danger">Löschen</Button>
					</div>
					<div className="flex flex-wrap items-center gap-3">
						<Button size="sm">Liste anlegen</Button>
						<Button size="sm" variant="secondary">Duplizieren</Button>
						<Button size="sm" variant="ghost">Überspringen</Button>
						<Button size="sm" variant="danger">Löschen</Button>
					</div>
					<div className="flex flex-wrap items-center gap-3">
						<Button loading>Speichern</Button>
						<Button variant="secondary" loading>Speichern</Button>
						<Button disabled>Deaktiviert</Button>
						<Button variant="secondary" disabled>Deaktiviert</Button>
						<Button>
							<TbPlus />
							Mit Icon
						</Button>
					</div>
				</div>
			</Section>

			<Section title="IconButton">
				<div className="flex items-center gap-2">
					<IconButton label="Bearbeiten">
						<TbPencil />
					</IconButton>
					<IconButton label="Teilen">
						<TbShare2 />
					</IconButton>
					<IconButton label="Löschen">
						<TbTrash />
					</IconButton>
					<IconButton label="Deaktiviert" disabled>
						<TbDots />
					</IconButton>
				</div>
			</Section>

			<Section title="Input">
				<div className="grid max-w-xl gap-4">
					<div className="space-y-1.5">
						<Input placeholder="Name der Liste" />
						<Caption>normal</Caption>
					</div>
					<div className="space-y-1.5">
						<Input defaultValue="Sommerurlaub 2026" invalid />
						<Caption>invalid</Caption>
					</div>
					<div className="space-y-1.5">
						<Input defaultValue="Nicht änderbar" disabled />
						<Caption>disabled</Caption>
					</div>
				</div>
			</Section>

			<Section title="TextArea">
				<div className="max-w-xl">
					<TextArea placeholder="Notiz zum Eintrag, z. B. Ladekabel nicht vergessen" />
				</div>
			</Section>

			<Section title="Select">
				<div className="max-w-xs">
					<Select
						options={[
							{ value: 'beach', label: 'Strandurlaub' },
							{ value: 'city', label: 'Städtetrip' },
							{ value: 'hiking', label: 'Wandern' },
						]}
					/>
				</div>
			</Section>

			<Section title="Checkbox">
				<div className="flex flex-wrap items-center gap-8">
					<div className="flex items-center gap-2.5">
						<Checkbox checked={checkA} onCheckedChange={setCheckA} />
						<span
							className={cx(
								'text-sm transition-colors',
								checkA
									? 'text-ink-faint line-through decoration-primary/50 decoration-2'
									: 'text-ink',
							)}
						>
							Sonnencreme
						</span>
					</div>
					<div className="flex items-center gap-2.5">
						<Checkbox checked={checkB} onCheckedChange={setCheckB} />
						<span
							className={cx(
								'text-sm transition-colors',
								checkB
									? 'text-ink-faint line-through decoration-primary/50 decoration-2'
									: 'text-ink',
							)}
						>
							Reisepass
						</span>
					</div>
					<div className="flex items-center gap-2.5">
						<Checkbox checked={checkC} onCheckedChange={setCheckC} size="lg" />
						<span
							className={cx(
								'text-sm transition-colors',
								checkC
									? 'text-ink-faint line-through decoration-primary/50 decoration-2'
									: 'text-ink',
							)}
						>
							Koffer (lg)
						</span>
					</div>
					<div className="flex items-center gap-2.5">
						<Checkbox checked disabled onCheckedChange={() => {}} />
						<span className="text-sm text-ink-faint">Deaktiviert</span>
					</div>
				</div>
			</Section>

			<Section title="Dialog + ConfirmDialog">
				<div className="flex flex-wrap gap-3">
					<Button variant="secondary" onClick={() => setDialogOpen(true)}>
						Dialog öffnen
					</Button>
					<Button variant="secondary" onClick={() => setConfirmOpen(true)}>
						ConfirmDialog öffnen
					</Button>
				</div>
				<Dialog
					open={dialogOpen}
					onClose={() => setDialogOpen(false)}
					title="Liste umbenennen"
					footer={
						<>
							<Button variant="secondary" onClick={() => setDialogOpen(false)}>
								Abbrechen
							</Button>
							<Button onClick={() => setDialogOpen(false)}>Speichern</Button>
						</>
					}
				>
					<div className="space-y-3">
						<p className="text-sm text-ink-muted">
							Escape und Klick auf das Overlay schließen den Dialog, der Fokus bleibt gefangen.
						</p>
						<Input placeholder="Neuer Name" />
					</div>
				</Dialog>
				<ConfirmDialog
					open={confirmOpen}
					onClose={() => setConfirmOpen(false)}
					onConfirm={() => setConfirmOpen(false)}
					title="Liste löschen"
					message="Die Liste Sommerurlaub 2026 wird mit allen Kategorien und Einträgen gelöscht."
					confirmLabel="Löschen"
					destructive
				/>
			</Section>

			<Section title="Dropdown">
				<Dropdown
					trigger={<Button variant="secondary">Aktionen</Button>}
					items={[
						{ icon: <TbPencil />, label: 'Umbenennen', onSelect: () => {} },
						{ icon: <TbShare2 />, label: 'Teilen', onSelect: () => {} },
						{ icon: <TbTrash />, label: 'Löschen', onSelect: () => {}, destructive: true },
					]}
				/>
			</Section>

			<Section title="Progress">
				<div className="grid max-w-xl gap-5">
					<div className="space-y-1.5">
						<Progress value={0} max={10} />
						<Caption>0 / 10</Caption>
					</div>
					<div className="space-y-1.5">
						<Progress value={4} max={10} />
						<Caption>4 / 10</Caption>
					</div>
					<div className="space-y-1.5">
						<Progress value={10} max={10} />
						<Caption>10 / 10 (komplett)</Caption>
					</div>
					<div className="space-y-1.5">
						<Progress value={4} max={10} size="sm" />
						<Caption>sm</Caption>
					</div>
					<div className="space-y-1.5">
						<Progress value={3} max={0} />
						<Caption>max 0 (leer)</Caption>
					</div>
				</div>
			</Section>

			<Section title="Badge">
				<div className="flex flex-wrap items-center gap-3">
					<Badge>12 Einträge</Badge>
					<Badge tone="accent">Last-Minute</Badge>
					<Badge tone="success">Alles gepackt</Badge>
					<Badge tone="priority">Priority</Badge>
				</div>
			</Section>

			<Section title="Spinner">
				<div className="flex items-center gap-6 text-ink-muted">
					<div className="space-y-1.5">
						<Spinner size="sm" />
						<Caption>sm</Caption>
					</div>
					<div className="space-y-1.5">
						<Spinner />
						<Caption>md</Caption>
					</div>
					<div className="space-y-1.5 text-primary">
						<Spinner />
						<Caption>in Primärfarbe</Caption>
					</div>
				</div>
			</Section>

			<Section title="EmptyState">
				<div className="rounded-lg border border-line bg-surface-raised">
					<EmptyState
						icon={<TbLuggage />}
						title="Noch keine Listen"
						description="Leg deine erste Packliste an oder starte mit der Standard-Vorlage."
						action={
							<Button>
								<TbPlus />
								Liste anlegen
							</Button>
						}
					/>
				</div>
			</Section>

			<Section title="ScrollArea">
				<ScrollArea className="h-40 max-w-xl rounded-md border border-line bg-surface-raised">
					<div className="space-y-2 p-4">
						{Array.from({ length: 24 }, (_, index) => (
							<p key={index} className="text-sm text-ink-muted">
								Eintrag {index + 1}: T-Shirt, Sonnenbrille, Ladekabel, Zahnbürste
							</p>
						))}
					</div>
				</ScrollArea>
			</Section>
		</main>
	)
}
