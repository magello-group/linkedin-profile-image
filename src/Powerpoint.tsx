import { useRef, useState, useEffect } from 'react'
import ToolLayout, { DownloadButton, RangeField, UploadZone, readAsDataUrl } from './ToolLayout'


const CANVAS_SIZE_WIDTH = 1920
const CANVAS_SIZE_HEIGHT = 1080

function Powerpoint() {
    const [image, setImage] = useState<string | null>(null)
    const [scale, setScale] = useState(1)
    const [tintStrength] = useState(0.28) // 0–1 (0–100%)
    const [svgOverlay, setSvgOverlay] = useState<HTMLImageElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // Bilddrag-state
    const [draggingImage, setDraggingImage] = useState(false)
    const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 }) // Aktuell offset från canvasens mitt
    const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
    const [imageStartOffset, setImageStartOffset] = useState({ x: 0, y: 0 })

    // Centrera bild från början
    useEffect(() => {
        setImageOffset({ x: 0, y: 0 })
    }, [image, scale])

    // Load SVG overlay
    useEffect(() => {
        const img = new Image()
        img.onload = () => setSvgOverlay(img)
        img.src = '/powerpoint.svg'
    }, [])

    // Draw everything
    useEffect(() => {
        if (!canvasRef.current || !svgOverlay) return
        const ctx = canvasRef.current.getContext('2d')
        if (!ctx) return
        ctx.clearRect(0, 0, CANVAS_SIZE_WIDTH, CANVAS_SIZE_HEIGHT)

        // Draw uploaded image, scaled and positioned
        if (image) {
            const img = new Image()
            img.onload = () => {

                // Calculate scaled size
                const scaleFactor = scale
                const w = img.width * scaleFactor
                const h = img.height * scaleFactor
                // Center + offset
                const x = (CANVAS_SIZE_WIDTH - w) / 2 + imageOffset.x
                const y = (CANVAS_SIZE_HEIGHT - h) / 2 + imageOffset.y
                ctx.drawImage(img, x, y, w, h)

                // Använd högkvalitativ bildinterpolering
                ctx.imageSmoothingEnabled = true
                ctx.imageSmoothingQuality = 'low'

                // Rita bilden och konvertera sedan till gråskala via pixeldata (mest kompatibelt)
                ctx.drawImage(img, x, y, w, h)
                const imageData = ctx.getImageData(x, y, w, h)
                const data = imageData.data
                for (let i = 0; i < data.length; i += 4) {
                    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
                    data[i] = data[i + 1] = data[i + 2] = gray
                }
                ctx.putImageData(imageData, x, y)

                // Färgblanda med #ffe8e8 (hårdkodat blend-läge: 'color') + justerbar intensitet
                const previousOp = ctx.globalCompositeOperation
                const previousAlpha = ctx.globalAlpha
                ctx.globalCompositeOperation = 'color'
                ctx.fillStyle = '#ffe8e8'
                ctx.globalAlpha = Math.max(0, Math.min(1, tintStrength))
                ctx.fillRect(0, 0, CANVAS_SIZE_WIDTH, CANVAS_SIZE_HEIGHT)
                ctx.globalCompositeOperation = previousOp
                ctx.globalAlpha = previousAlpha

                // Draw SVG overlay to cover the whole canvas
                ctx.drawImage(svgOverlay, 0, 1, CANVAS_SIZE_WIDTH, CANVAS_SIZE_HEIGHT)
            }
            img.src = image
        } else {
            // Draw SVG overlay to cover the whole canvas even if no image
            ctx.drawImage(svgOverlay, 0, 0, CANVAS_SIZE_WIDTH, CANVAS_SIZE_HEIGHT)
        }
    }, [image, scale, imageOffset, svgOverlay])

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
        const imgX = (CANVAS_SIZE_WIDTH - w) / 2 + imageOffset.x
        const imgY = (CANVAS_SIZE_HEIGHT - h) / 2 + imageOffset.y
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

    function handleImageUpload(file: File) {
        readAsDataUrl(file, setImage)
    }

    function handleDownload() {
        if (canvasRef.current) {
            const link = document.createElement('a')
            link.download = 'powerpoint.png'
            link.href = canvasRef.current.toDataURL('image/png')
            link.click()
        }
    }

    return (
        <ToolLayout
            kicker="PowerPoint"
            title="Powerpoint"
            intro="Ladda upp en bild. Du kan skala och flytta bakgrundsbilden."
            controls={<>
                <UploadZone label="Bild" accept="image/*" hint="JPG, PNG eller WEBP" onFile={handleImageUpload} />
                <RangeField label="Skala bild" valueLabel={`${Math.round(scale * 100)}%`} min={0.2} max={2} step={0.01} value={scale} onChange={setScale} />
                <DownloadButton onClick={handleDownload} />
            </>}
        >
            <canvas
                ref={canvasRef}
                width={CANVAS_SIZE_WIDTH}
                height={CANVAS_SIZE_HEIGHT}
                style={{ width: '100%', maxWidth: CANVAS_SIZE_WIDTH, cursor: draggingImage ? 'grabbing' : image ? 'grab' : 'default' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            />
        </ToolLayout>
    )
}

export default Powerpoint