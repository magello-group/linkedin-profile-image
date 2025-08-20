import { useRef, useState, useEffect } from 'react'

const CANVAS_SIZE = 1080

export default function ProfileImage() {
    const [image, setImage] = useState<string | null>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [scale, setScale] = useState(1)



    // Draw everything (endast gråskala, behåll proportioner)
    useEffect(() => {
        if (!canvasRef.current) return
        const ctx = canvasRef.current.getContext('2d')
        if (!ctx) return
        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

        if (image) {
            const img = new Image()
            img.onload = () => {
                // Skala bilden proportionerligt för att passa canvasen (skala=1 motsvarar "fit")
                const scaleToFit = Math.min(CANVAS_SIZE / img.width, CANVAS_SIZE / img.height)
                const effectiveScale = scaleToFit * scale
                const drawWidth = Math.round(img.width * effectiveScale)
                const drawHeight = Math.round(img.height * effectiveScale)
                const offsetX = Math.round((CANVAS_SIZE - drawWidth) / 2)
                const offsetY = Math.round((CANVAS_SIZE - drawHeight) / 2)

                // Använd högkvalitativ bildinterpolering vid nedskalning
                ctx.imageSmoothingEnabled = true
                ctx.imageSmoothingQuality = 'high'

                ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
                const imageData = ctx.getImageData(offsetX, offsetY, drawWidth, drawHeight)
                const data = imageData.data
                for (let i = 0; i < data.length; i += 4) {
                    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
                    data[i] = data[i + 1] = data[i + 2] = gray
                }
                ctx.putImageData(imageData, offsetX, offsetY)
            }
            img.src = image
        }
    }, [image, scale])

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
            link.download = 'linkedin-post.png'
            link.href = canvasRef.current.toDataURL('image/png')
            link.click()
        }
    }

    return (
        <div className="app">
            <img src="https://magello.se/assets/images/magello-logo-w.svg" alt="Magello logotyp" className="magello-logo" style={{ display: 'block', margin: '2rem auto 1rem auto', maxWidth: 180 }} />
            <h1>Magello profilbild</h1>
            <p className="description">Ladda upp en bild så omvandlas den till gråskala. Bilden laddas ner i 1080x1080px.</p>
            <div className="controls">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="file-input" />
            </div>
            <div className="preview" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '2rem', overflow: 'auto', minWidth: 0, flexWrap: 'nowrap' }}>
                <canvas
                    ref={canvasRef}
                    width={CANVAS_SIZE}
                    height={CANVAS_SIZE}
                    className="canvas"
                    style={{ border: '1px solid #ccc', background: '#fff', maxWidth: 540, minWidth: 0, flex: '1 1 0', width: '100%', boxSizing: 'border-box' }}
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