import { useRef, useState, useEffect } from 'react'

const CANVAS_SIZE = 1080

export default function ProfileImage() {
    const [image, setImage] = useState<string | null>(null)
    const [scale, setScale] = useState(1)
    const [overlay, setOverlay] = useState<HTMLImageElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // Bilddrag-state
    const [draggingImage, setDraggingImage] = useState(false)
    const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 }) // Aktuell offset från canvasens mitt
    const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
    const [imageStartOffset, setImageStartOffset] = useState({ x: 0, y: 0 })

    // Ladda overlay-bilden
    useEffect(() => {
        const img = new window.Image()
        img.onload = () => setOverlay(img)
        img.src = '/profile-image-overlay.png'
    }, [])

    // Centrera bild från början
    useEffect(() => {
        setImageOffset({ x: 0, y: 0 })
    }, [image, scale])

    // Draw everything
    useEffect(() => {
        if (!canvasRef.current) return
        const ctx = canvasRef.current.getContext('2d')
        if (!ctx) return
        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

        // Draw uploaded image, scaled and positioned
        if (image) {
            const img = new Image()
            img.onload = () => {
                // Calculate scaled size
                const scaleFactor = scale
                const w = img.width * scaleFactor
                const h = img.height * scaleFactor
                // Center + offset
                const x = (CANVAS_SIZE - w) / 2 + imageOffset.x
                const y = (CANVAS_SIZE - h) / 2 + imageOffset.y
                ctx.drawImage(img, x, y, w, h)
                // Gör bilden svartvit (gråskala)
                const imageData = ctx.getImageData(x, y, w, h)
                const data = imageData.data
                for (let i = 0; i < data.length; i += 4) {
                    let gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
                    gray = Math.max(0, Math.min(255, gray * 1.2))
                    // Lägg till lite mer kontrast
                    gray = (gray - 128) * 1.15 + 128
                    gray = Math.max(0, Math.min(255, gray))
                    data[i] = data[i + 1] = data[i + 2] = gray
                }
                ctx.putImageData(imageData, x, y)
                // Rita overlay ovanpå allt
                if (overlay) {
                    ctx.drawImage(overlay, 0, 0, CANVAS_SIZE, CANVAS_SIZE)
                }
            }
            img.src = image
        } else if (overlay) {
            ctx.drawImage(overlay, 0, 0, CANVAS_SIZE, CANVAS_SIZE)
        }
    }, [image, scale, imageOffset, overlay])

    // Bilddrag: mouse events
    function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
        if (!image) return
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        // Kolla om klick är inom bilden
        const img = new window.Image()
        img.src = image
        const scaleFactor = scale
        const w = img.width * scaleFactor
        const h = img.height * scaleFactor
        const imgX = (CANVAS_SIZE - w) / 2 + imageOffset.x
        const imgY = (CANVAS_SIZE - h) / 2 + imageOffset.y
        if (x >= imgX && x <= imgX + w && y >= imgY && y <= imgY + h) {
            setDraggingImage(true)
            setDragStart({ x, y })
            setImageStartOffset({ ...imageOffset })
        }
    }
    function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
        if (!draggingImage) return
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        if (dragStart) {
            setImageOffset({
                x: imageStartOffset.x + (x - dragStart.x),
                y: imageStartOffset.y + (y - dragStart.y),
            })
        }
    }
    function handleMouseUp() {
        setDraggingImage(false)
        setDragStart(null)
    }

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
            link.download = 'linkedin-post.png'
            link.href = canvasRef.current.toDataURL('image/png')
            link.click()
        }
    }

    return (
        <div className="app">
            <img src="https://magello.se/assets/images/magello-logo-w.svg" alt="Magello logotyp" className="magello-logo" style={{ display: 'block', margin: '2rem auto 1rem auto', maxWidth: 180 }} />
            <h1>LinkedIn Profilbild</h1>
            <p className="description">Ta en bild i liggande läge. Ladda upp bilden, skala och flytta bakgrundsbilden. Bilden laddas ner i 1080x1080px. Positionera bilden så den liknar referensbilden till höger.</p>
            <div className="controls">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="file-input" />
            </div>
            <div className="preview" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', gap: '2rem', overflow: 'auto', minWidth: 0, flexWrap: 'nowrap' }}>
                <canvas
                    ref={canvasRef}
                    width={CANVAS_SIZE}
                    height={CANVAS_SIZE}
                    className="canvas"
                    style={{ border: '1px solid #ccc', background: '#fff', maxWidth: 540, minWidth: 0, flex: '1 1 0', width: '100%', cursor: draggingImage ? 'grabbing' : image ? 'grab' : 'default', boxSizing: 'border-box' }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                />
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
                    Skala bild
                    <input type="range" min={0.2} max={2} step={0.01} value={scale} onChange={e => setScale(Number(e.target.value))} style={{ width: 120, marginLeft: 8 }} />
                    <span style={{ marginLeft: 8 }}>{Math.round(scale * 100)}%</span>
                </label>
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