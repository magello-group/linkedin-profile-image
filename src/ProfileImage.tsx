import { useRef, useState, useEffect } from 'react'
import ToolLayout, { DownloadButton, RangeField, UploadZone, readAsDataUrl } from './ToolLayout'

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

    function handleImageUpload(file: File) {
        readAsDataUrl(file, setImage)
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
        <ToolLayout
            kicker="Profilbild"
            title="Magello profilbild"
            intro={<>
                Ta en bild med vit bakgrund, som ser ut som referensbilden nedan. Ladda upp bilden så omvandlas den till gråskala och får lite rosa skimmer.
                Du kan dra för att positionera bilden och zooma in upp till 300% med reglaget. Bilden laddas ner i 1080x1080px.
            </>}
            controls={<>
                <UploadZone label="Bild" accept="image/*" hint="JPG, PNG eller WEBP" onFile={handleImageUpload} />
                <RangeField label="Zooma bild" valueLabel={`${Math.round(scale * 100)}%`} min={1} max={3} step={0.01} value={scale} onChange={setScale} />
                <DownloadButton onClick={handleDownload} />
            </>}
        >
            <div className="mg-app-compare">
                <div>
                    <canvas
                        ref={canvasRef}
                        width={CANVAS_SIZE}
                        height={CANVAS_SIZE}
                        style={{ width: '100%', cursor: draggingImage ? 'grabbing' : image ? 'grab' : 'default' }}
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
                </div>
                <img
                    src="/profile-image-outlines.png"
                    alt="Referensbild som visar hur profilbilden ska vara beskuren"
                />
            </div>
        </ToolLayout>
    )
}