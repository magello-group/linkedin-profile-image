import { useRef, useState, useEffect } from 'react'
import ToolLayout, { DownloadButton, RangeField, TextField, UploadZone, readAsDataUrl } from './ToolLayout'

const CANVAS_SIZE = 1080
// Texten som användaren skriver in ritas med Roboto Regular (samma typsnitt som
// laddas globalt via App.css). Vi väntar in document.fonts innan vi ritar på
// canvas, annars kan webbläsaren hinna rita texten med en fallback-font.
const TEXT_FONT_FAMILY = 'Roboto'
// Rubriken (h1) stylas globalt via index.css/App.css med Roboto Condensed Medium.

function NewEmployee() {
    const [image, setImage] = useState<string | null>(null)
    const [scale, setScale] = useState(1)
    const [text, setText] = useState('')
    const [fontLoaded, setFontLoaded] = useState(false)
    const [fontSize, setFontSize] = useState(78)
    const [svgOverlay, setSvgOverlay] = useState<HTMLImageElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // Textposition
    const [textX, setTextX] = useState(506)
    const [textY, setTextY] = useState(980)

    // Bilddrag-state
    const [draggingImage, setDraggingImage] = useState(false)
    const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 }) // Aktuell offset från canvasens mitt
    const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
    const [imageStartOffset, setImageStartOffset] = useState({ x: 0, y: 0 })

    // Centrera bild från början
    useEffect(() => {
        setImageOffset({ x: 0, y: 0 })
    }, [image, scale])

    // Ladda in Roboto Regular innan vi ritar text på canvas
    useEffect(() => {
        document.fonts.load(`400 16px ${TEXT_FONT_FAMILY}`)
            .catch(() => {
                // Om typsnittet inte kan laddas (t.ex. offline) ritar vi ändå,
                // webbläsaren faller då tillbaka på en standardfont.
            })
            .finally(() => setFontLoaded(true))
    }, [])

    // Load SVG overlay
    useEffect(() => {
        const img = new Image()
        img.onload = () => setSvgOverlay(img)
        img.src = '/linkedin-post-valkommen.svg'
    }, [])

    // Draw everything
    useEffect(() => {
        if (!canvasRef.current || !fontLoaded || !svgOverlay) return
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

                // Draw SVG overlay to cover the whole canvas
                ctx.drawImage(svgOverlay, 0, 0, CANVAS_SIZE, CANVAS_SIZE)

                // Draw text on top of SVG (styrd av x/y)
                if (text) {
                    ctx.save()
                    ctx.font = `${fontSize}px ${TEXT_FONT_FAMILY}`
                    ctx.fillStyle = '#000000'
                    ctx.textAlign = 'center'
                    ctx.textBaseline = 'middle'
                    ctx.translate(textX, textY)
                    ctx.fillText(text, 0, 0)
                    ctx.restore()
                }
            }
            img.src = image
        } else {
            // Draw SVG overlay to cover the whole canvas even if no image
            ctx.drawImage(svgOverlay, 0, 0, CANVAS_SIZE, CANVAS_SIZE)
            if (text) {
                ctx.save()
                ctx.font = `${fontSize}px ${TEXT_FONT_FAMILY}`
                ctx.fillStyle = '#000000'
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                ctx.translate(textX, textY)
                ctx.fillText(text, 0, 0)
                ctx.restore()
            }
        }
    }, [image, scale, imageOffset, text, fontLoaded, fontSize, svgOverlay, textX, textY])

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

    function handleImageUpload(file: File) {
        readAsDataUrl(file, setImage)
    }

    function handleDownload() {
        if (canvasRef.current) {
            const link = document.createElement('a')
            link.download = 'linkedin-post-valkommen.png'
            link.href = canvasRef.current.toDataURL('image/png')
            link.click()
        }
    }

    return (
        <ToolLayout
            kicker="LinkedIn"
            title="Linkedininlägg för nyanställd"
            intro="Ladda upp en bild och skriv ett namn. Du kan skala och flytta bakgrundsbilden. Bilden laddas ner i 1080x1080px som passar LinkedIn-postning. Du kan även finjustera textens position."
            controls={<>
                <UploadZone label="Bild" accept="image/*" hint="JPG, PNG eller WEBP" onFile={handleImageUpload} />
                <TextField label="Namn" value={text} onChange={setText} placeholder="Ditt förnamn Efternamn" />
                <RangeField label="Skala bild" valueLabel={`${Math.round(scale * 100)}%`} min={0.2} max={2} step={0.01} value={scale} onChange={setScale} />
                <RangeField label="Textstorlek" valueLabel={`${fontSize}px`} min={40} max={200} step={1} value={fontSize} onChange={setFontSize} />
                <RangeField label="Text X" valueLabel={`${textX}`} min={0} max={CANVAS_SIZE} step={1} value={textX} onChange={setTextX} />
                <RangeField label="Text Y" valueLabel={`${textY}`} min={0} max={CANVAS_SIZE} step={1} value={textY} onChange={setTextY} />
                <DownloadButton onClick={handleDownload} />
            </>}
        >
            <canvas
                ref={canvasRef}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                style={{ width: '100%', maxWidth: 540, cursor: draggingImage ? 'grabbing' : image ? 'grab' : 'default' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            />
        </ToolLayout>
    )
}

export default NewEmployee