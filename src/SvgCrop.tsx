import { useRef, useState, useEffect, useCallback } from 'react'

// Storleken (i px) på den slutgiltiga beskurna SVG-filen
const CROP_SIZE = 200
// Visningsstorlek i förhandsgranskningen (rent kosmetiskt, gör det lättare att dra/zooma)
const DISPLAY_SIZE = 320
const DISPLAY_SCALE = DISPLAY_SIZE / CROP_SIZE

// Gränser och steg för skal-reglaget
const SCALE_MIN = 0.2
const SCALE_MAX = 20
const SCALE_STEP = 0.05
// Mindre justering för +/- knapparna
const SCALE_NUDGE = 0.01

function clampScale(value: number) {
    return Math.min(SCALE_MAX, Math.max(SCALE_MIN, Math.round(value * 100) / 100))
}

function toBase64Utf8(str: string) {
    return btoa(unescape(encodeURIComponent(str)))
}

function parseSvgSize(svgText: string): { width: number; height: number } {
    try {
        const parser = new DOMParser()
        const doc = parser.parseFromString(svgText, 'image/svg+xml')
        const svgEl = doc.documentElement
        if (!svgEl || svgEl.nodeName !== 'svg') throw new Error('Ingen <svg>-rot hittades')

        let width = parseFloat(svgEl.getAttribute('width') || '')
        let height = parseFloat(svgEl.getAttribute('height') || '')

        if (!width || !height) {
            const viewBox = svgEl.getAttribute('viewBox')
            if (viewBox) {
                const parts = viewBox.trim().split(/[\s,]+/).map(Number)
                if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
                    width = parts[2]
                    height = parts[3]
                }
            }
        }

        if (!width || !height) {
            width = 300
            height = 300
        }

        return { width, height }
    } catch {
        return { width: 300, height: 300 }
    }
}

// Ser till att SVG:n har rätt namespace så att den kan bäddas in fristående
function normalizeSvg(svgText: string): string {
    if (!svgText.includes('xmlns=')) {
        return svgText.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
    }
    return svgText
}

export default function SvgCrop() {
    const [svgText, setSvgText] = useState<string | null>(null)
    const [naturalSize, setNaturalSize] = useState({ width: 300, height: 300 })
    const [scale, setScale] = useState(1)
    const [offset, setOffset] = useState({ x: 0, y: 0 })
    const [dragging, setDragging] = useState(false)
    const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
    const [dragStartOffset, setDragStartOffset] = useState({ x: 0, y: 0 })
    const [fileName, setFileName] = useState<string | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    // Centrera bilden när en ny fil laddas
    useEffect(() => {
        setOffset({ x: 0, y: 0 })
        setScale(1)
    }, [svgText])

    const dataUrl = svgText ? `data:image/svg+xml;base64,${toBase64Utf8(normalizeSvg(svgText))}` : null

    // Beräkna hur bilden ska placeras/skalas inom det 200x200 stora beskärningsområdet
    const scaleToFit = Math.min(CROP_SIZE / naturalSize.width, CROP_SIZE / naturalSize.height)
    const effectiveScale = scaleToFit * scale
    const drawWidth = naturalSize.width * effectiveScale
    const drawHeight = naturalSize.height * effectiveScale
    const cropOffsetX = (CROP_SIZE - drawWidth) / 2 + offset.x
    const cropOffsetY = (CROP_SIZE - drawHeight) / 2 + offset.y

    function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        setFileName(file.name.replace(/\.svg$/i, ''))
        const reader = new FileReader()
        reader.onload = (ev) => {
            const text = ev.target?.result as string
            setSvgText(text)
            setNaturalSize(parseSvgSize(text))
        }
        reader.readAsText(file)
    }

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!svgText) return
        setDragging(true)
        setDragStart({ x: e.clientX, y: e.clientY })
        setDragStartOffset({ ...offset })
    }, [svgText, offset])

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!dragging || !dragStart) return
        const dx = (e.clientX - dragStart.x) / DISPLAY_SCALE
        const dy = (e.clientY - dragStart.y) / DISPLAY_SCALE
        setOffset({ x: dragStartOffset.x + dx, y: dragStartOffset.y + dy })
    }, [dragging, dragStart, dragStartOffset])

    const stopDragging = useCallback(() => {
        setDragging(false)
        setDragStart(null)
    }, [])

    function nudgeScale(delta: number) {
        setScale(s => clampScale(s + delta))
    }

    function handleDownload() {
        if (!svgText || !dataUrl) return

        const output = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${CROP_SIZE}" height="${CROP_SIZE}" viewBox="0 0 ${CROP_SIZE} ${CROP_SIZE}">
  <rect x="0" y="0" width="${CROP_SIZE}" height="${CROP_SIZE}" fill="none" />
  <image x="${cropOffsetX}" y="${cropOffsetY}" width="${drawWidth}" height="${drawHeight}" href="${dataUrl}" xlink:href="${dataUrl}" />
</svg>`

        const blob = new Blob([output], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.download = `${fileName || 'cropped-image'}-200x200.svg`
        link.href = url
        link.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="app">
            <img src="https://magello.se/assets/images/magello-logo-w.svg" alt="Magello logotyp" className="magello-logo" style={{ display: 'block', margin: '2rem auto 1rem auto', maxWidth: 180 }} />
            <h1>SVG - Beskär till 200x200</h1>
            <p className="description">
                Ladda upp en SVG-fil. Du kan dra i förhandsgranskningen för att flytta bilden och använda reglaget för att zooma/skala den.
                Resultatet laddas ner som en ny SVG-fil beskuren till exakt 200x200 px.
            </p>
            <div className="controls">
                <input type="file" accept=".svg,image/svg+xml" onChange={handleFileUpload} className="file-input" />
            </div>

            <div className="preview" style={{ minHeight: DISPLAY_SIZE + 60 }}>
                {svgText && dataUrl ? (
                    <>
                        <div
                            ref={containerRef}
                            style={{
                                position: 'relative',
                                width: DISPLAY_SIZE,
                                height: DISPLAY_SIZE,
                                overflow: 'hidden',
                                background: '#fff',
                                border: '1px solid #ccc',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                cursor: dragging ? 'grabbing' : 'grab',
                                backgroundImage:
                                    'linear-gradient(45deg, #eee 25%, transparent 25%), linear-gradient(-45deg, #eee 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #eee 75%), linear-gradient(-45deg, transparent 75%, #eee 75%)',
                                backgroundSize: '20px 20px',
                                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                            }}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={stopDragging}
                            onMouseLeave={stopDragging}
                        >
                            <img
                                src={dataUrl}
                                alt="Uppladdad SVG"
                                draggable={false}
                                style={{
                                    position: 'absolute',
                                    left: cropOffsetX * DISPLAY_SCALE,
                                    top: cropOffsetY * DISPLAY_SCALE,
                                    width: drawWidth * DISPLAY_SCALE,
                                    height: drawHeight * DISPLAY_SCALE,
                                    userSelect: 'none',
                                    pointerEvents: 'none',
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center', marginTop: '1rem', alignItems: 'center' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                Skala bild
                                <button
                                    type="button"
                                    onClick={() => nudgeScale(-SCALE_NUDGE)}
                                    aria-label="Minska skala"
                                    style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #ccc', background: '#fafafa', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1, padding: 0 }}
                                >
                                    −
                                </button>
                                <input
                                    type="range"
                                    min={SCALE_MIN}
                                    max={SCALE_MAX}
                                    step={SCALE_STEP}
                                    value={scale}
                                    onChange={e => setScale(Number(e.target.value))}
                                    style={{ width: 160 }}
                                />
                                <button
                                    type="button"
                                    onClick={() => nudgeScale(SCALE_NUDGE)}
                                    aria-label="Öka skala"
                                    style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #ccc', background: '#fafafa', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1, padding: 0 }}
                                >
                                    +
                                </button>
                                <span>{Math.round(scale * 100)}%</span>
                            </label>
                        </div>

                        <button onClick={handleDownload} className="download-button" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ verticalAlign: 'middle', marginRight: 8 }}>
                                <path d="M10 2v10m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <rect x="4" y="16" width="12" height="2" rx="1" fill="currentColor" />
                            </svg>
                            Ladda ner SVG (200x200)
                        </button>
                    </>
                ) : (
                    <p className="placeholder">Ladda upp en SVG-fil för att se förhandsvisning</p>
                )}
            </div>
        </div>
    )
}
