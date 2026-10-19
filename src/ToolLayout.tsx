import { useId, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function AppTopbar({ title }: { title?: string }) {
    return (
        <header className="mg-app-topbar">
            <div className="mg-wrap mg-app-topbar__inner">
                <Link to="/" className="mg-app-topbar__logo" aria-label="Magello bildhantering, startsida">
                    <img src="/logos/magello-magenta.svg" alt="Magello" />
                </Link>
                {title && <span className="mg-app-topbar__title">{title}</span>}
                {title && <Link to="/" className="mg-app-topbar__back">Alla verktyg</Link>}
            </div>
        </header>
    )
}

export function AppIntro({ kicker, title, children }: { kicker: string; title: string; children: ReactNode }) {
    return (
        <section className="mg-app-intro">
            <div className="mg-wrap">
                <span className="mg-kicker">{kicker}</span>
                <h1 className="mg-app-intro__title">{title}</h1>
                <p className="mg-ingang-sub">{children}</p>
            </div>
        </section>
    )
}

type ToolLayoutProps = {
    kicker: string
    title: string
    intro: ReactNode
    controls: ReactNode
    children: ReactNode
}

export default function ToolLayout({ kicker, title, intro, controls, children }: ToolLayoutProps) {
    return (
        <>
            <AppTopbar title={title} />
            <main>
                <AppIntro kicker={kicker} title={title}>{intro}</AppIntro>
                <div className="mg-wrap mg-app-body">
                    <aside className="mg-app-sidebar" aria-label="Inställningar">{controls}</aside>
                    <div className="mg-app-canvas">{children}</div>
                </div>
            </main>
        </>
    )
}

type UploadZoneProps = {
    label: string
    accept: string
    hint: string
    onFile: (file: File) => void
}

export function UploadZone({ label, accept, hint, onFile }: UploadZoneProps) {
    const id = useId()
    const [dragOver, setDragOver] = useState(false)
    const [fileName, setFileName] = useState<string | null>(null)

    function pick(file: File | undefined) {
        if (!file) return
        setFileName(file.name)
        onFile(file)
    }

    return (
        <div className="mg-field">
            <span className="mg-field__label">{label}</span>
            <label
                htmlFor={id}
                className={`mg-upload-zone${dragOver ? ' is-drag-over' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); pick(e.dataTransfer.files[0]) }}
            >
                <div className="mg-upload-zone__text">{fileName ?? 'Välj fil eller dra och släpp den här'}</div>
                <div className="mg-upload-zone__sub">{fileName ? 'Klicka för att byta fil' : hint}</div>
                <input
                    id={id}
                    type="file"
                    accept={accept}
                    className="mg-app-visually-hidden"
                    onChange={e => pick(e.target.files?.[0])}
                />
            </label>
        </div>
    )
}

export function TextField({ label, value, onChange, placeholder }: {
    label: string
    value: string
    onChange: (value: string) => void
    placeholder?: string
}) {
    const id = useId()
    return (
        <div className="mg-field">
            <label className="mg-field__label" htmlFor={id}>{label}</label>
            <input id={id} className="mg-input" type="text" value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
        </div>
    )
}

type RangeFieldProps = {
    label: string
    valueLabel: string
    value: number
    min: number
    max: number
    step: number
    onChange: (value: number) => void
    before?: ReactNode
    after?: ReactNode
}

export function RangeField({ label, valueLabel, value, min, max, step, onChange, before, after }: RangeFieldProps) {
    const id = useId()
    return (
        <div className="mg-field">
            <label className="mg-field__label" htmlFor={id}>
                {label}<span className="mg-field__hint">{valueLabel}</span>
            </label>
            <div className="mg-app-range-row">
                {before}
                <input
                    id={id}
                    className="mg-app-range"
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={e => onChange(Number(e.target.value))}
                />
                {after}
            </div>
        </div>
    )
}

export function DownloadButton({ onClick, disabled, children = 'Ladda ner bild' }: {
    onClick: () => void
    disabled?: boolean
    children?: ReactNode
}) {
    return (
        <button type="button" onClick={onClick} disabled={disabled} className="mg-btn mg-btn--primary mg-btn--icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M10 2v10m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 17h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            {children}
        </button>
    )
}

export function readAsDataUrl(file: File, onLoad: (dataUrl: string) => void) {
    const reader = new FileReader()
    reader.onload = ev => onLoad(ev.target?.result as string)
    reader.readAsDataURL(file)
}
