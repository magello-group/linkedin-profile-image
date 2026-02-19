import { useRef, useState, useEffect } from 'react'

const CANVAS_SIZE = 1080

export default function ProfileImage() {
    const [image, setImage] = useState<string | null>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [scale, setScale] = useState(1)
    const [tintStrength] = useState(0.28) // 0–1 (0–100%)
    const [draggingImage, setDraggingImage] = useState(false)
    const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 })
    const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
    const [imageStartOffset, setImageStartOffset] = useState({ x: 0, y: 0 })



    // Centrera bild från början eller vid skalaändring
    useEffect(() => {
        setImageOffset({ x: 0, y: 0 })
    }, [image, scale])

    // Draw everything (gråskala + färgblandning med #F7F3F3 i "Photoshop-lik" stil)
    useEffect(() => {
        if (!canvasRef.current) return
        const ctx = canvasRef.current.getContext('2d')
        if (!ctx) return
        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

        if (image) {
            const img = new Image()
            img.onload = () => {
                // Bas-scaling: fit till canvas, därefter zoom (1x-3x) ovanpå
                const scaleToFit = Math.min(CANVAS_SIZE / img.width, CANVAS_SIZE / img.height)
                const effectiveScale = scaleToFit * scale
                const drawWidth = Math.round(img.width * effectiveScale)
                const drawHeight = Math.round(img.height * effectiveScale)
                const offsetX = Math.round((CANVAS_SIZE - drawWidth) / 2 + imageOffset.x)
                const offsetY = Math.round((CANVAS_SIZE - drawHeight) / 2 + imageOffset.y)

                // Använd högkvalitativ bildinterpolering
                ctx.imageSmoothingEnabled = true
                ctx.imageSmoothingQuality = 'high'

                // Rita bilden och konvertera sedan till gråskala via pixeldata (mest kompatibelt)
                ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
                const imageData = ctx.getImageData(offsetX, offsetY, drawWidth, drawHeight)
                const data = imageData.data
                for (let i = 0; i < data.length; i += 4) {
                    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
                    data[i] = data[i + 1] = data[i + 2] = gray
                }
                ctx.putImageData(imageData, offsetX, offsetY)

                // Färgblanda med #F7F3F3 (hårdkodat blend-läge: 'color') + justerbar intensitet
                const previousOp = ctx.globalCompositeOperation
                const previousAlpha = ctx.globalAlpha
                ctx.globalCompositeOperation = 'color'
                ctx.fillStyle = '#ffe8e8'
                ctx.globalAlpha = Math.max(0, Math.min(1, tintStrength))
                ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
                ctx.globalCompositeOperation = previousOp
                ctx.globalAlpha = previousAlpha
            }
            img.src = image
        }
    }, [image, scale, imageOffset, tintStrength])

    // Ingen drag/scale-hantering längre

    function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (ev) => setImage(ev.target?.result as string)
            reader.readAsDataURL(file)
        }
    }

    function handleDownload() {
        if (canvasRef.current) {
            const link = document.createElement('a')
            link.download = 'profile-image.png'
            link.href = canvasRef.current.toDataURL('image/png')
            link.click()
        }
    }

    return (
        <div className="app">
            <img src="https://magello.se/assets/images/magello-logo-w.svg" alt="Magello logotyp" className="magello-logo" style={{ display: 'block', margin: '2rem auto 1rem auto', maxWidth: 180 }} />
            <h1>Magello profilbild</h1>
            <p className="description">Ta en bild med vit bakgrund, som ser ut som referensbilden nedan. Ladda upp en bilden så omvandlas den till gråskala och får lite rosa skimmer.
                Du kan dra för att positionera bilden och zooma in upp till 300% med reglaget. Bilden laddas ner i 1080x1080px.</p>
            <div className="controls">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="file-input" />
            </div>
            <div className="preview" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '2rem', overflow: 'auto', minWidth: 0, flexWrap: 'nowrap' }}>
                <div style={{ position: 'relative', display: 'inline-block', maxWidth: 540, minWidth: 0, flex: '1 1 0', width: '100%' }}>
                    <canvas
                        ref={canvasRef}
                        width={CANVAS_SIZE}
                        height={CANVAS_SIZE}
                        className="canvas"
                        style={{ border: '1px solid #ccc', background: '#fff', width: '100%', boxSizing: 'border-box', cursor: draggingImage ? 'grabbing' : image ? 'grab' : 'default' }}
                        onMouseDown={(e) => {
                            if (!image) return
                            const rect = e.currentTarget.getBoundingClientRect()
                            const x = e.clientX - rect.left
                            const y = e.clientY - rect.top
                            const imgEl = new window.Image()
                            imgEl.src = image
                            const scaleToFit = Math.min(CANVAS_SIZE / imgEl.width, CANVAS_SIZE / imgEl.height)
                            const effectiveScale = scaleToFit * scale
                            const w = Math.round(imgEl.width * effectiveScale)
                            const h = Math.round(imgEl.height * effectiveScale)
                            const imgX = Math.round((CANVAS_SIZE - w) / 2 + imageOffset.x)
                            const imgY = Math.round((CANVAS_SIZE - h) / 2 + imageOffset.y)
                            if (x >= imgX && x <= imgX + w && y >= imgY && y <= imgY + h) {
                                setDraggingImage(true)
                                setDragStart({ x, y })
                                setImageStartOffset({ ...imageOffset })
                            }
                        }}
                        onMouseMove={(e) => {
                            if (!draggingImage || !dragStart) return
                            const rect = e.currentTarget.getBoundingClientRect()
                            const x = e.clientX - rect.left
                            const y = e.clientY - rect.top
                            setImageOffset({
                                x: imageStartOffset.x + (x - dragStart.x),
                                y: imageStartOffset.y + (y - dragStart.y),
                            })
                        }}
                        onMouseUp={() => {
                            setDraggingImage(false)
                            setDragStart(null)
                        }}
                        onMouseLeave={() => {
                            setDraggingImage(false)
                            setDragStart(null)
                        }}
                    />
                    {/* overlay-div borttagen, overlay ritas nu via canvas */}
                </div>
                <img
                    src="/profile-image-outlines.png"
                    alt="Profile image outlines"
                    style={{ maxWidth: 540, minWidth: 0, flex: '1 1 0', width: '100%', height: 'auto', display: 'block', background: '#fff', border: '1px solid #ccc', boxSizing: 'border-box' }}
                />
            </div>
            <style>{`
                @media (max-width: 1100px) {
                    .preview { flex-wrap: wrap !important; }
                }
            `}</style>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center', marginTop: '1.5rem', alignItems: 'center' }}>
                <label>
                    Zooma bild
                    <input type="range" min={1} max={3} step={0.01} value={scale} onChange={e => setScale(Number(e.target.value))} style={{ width: 160, marginLeft: 8 }} />
                    <span style={{ marginLeft: 8 }}>{Math.round(scale * 100)}%</span>
                </label>

                {/* Blend-läge hårdkodat till 'color' i renderingen */}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
                <button onClick={handleDownload} className="download-button" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ verticalAlign: 'middle', marginRight: 8 }}>
                        <path d="M10 2v10m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <rect x="4" y="16" width="12" height="2" rx="1" fill="currentColor" />
                    </svg>
                    Ladda ner bild
                </button>
            </div>
        </div>
    )
}