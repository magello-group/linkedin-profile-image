import { useRef, useState, useEffect } from 'react'

const fontFace = new FontFace('KattuxAbc', 'url(/KattuxAbc-Regular.otf)')

const CANVAS_SIZE = 1080

export default function NewLinkedinPost() {
    const [image, setImage] = useState<string | null>(null)
    const [scale, setScale] = useState(1)
    const [text, setText] = useState('')
    const [fontLoaded, setFontLoaded] = useState(false)
    const [fontSize, setFontSize] = useState(120)
    const [svgOverlay, setSvgOverlay] = useState<HTMLImageElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // Textposition
    const [textX, setTextX] = useState(506)
    const [textY, setTextY] = useState(968)

    // Bilddrag-state
    const [draggingImage, setDraggingImage] = useState(false)
    const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 }) // Aktuell offset från canvasens mitt
    const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
    const [imageStartOffset, setImageStartOffset] = useState({ x: 0, y: 0 })

    // Centrera bild från början
    useEffect(() => {
        setImageOffset({ x: 0, y: 0 })
    }, [image, scale])

    // Load font
    useEffect(() => {
        fontFace.load().then((loadedFont) => {
            document.fonts.add(loadedFont)
            setFontLoaded(true)
        })
    }, [])

    // Load SVG overlay
    useEffect(() => {
        const img = new Image()
        img.onload = () => setSvgOverlay(img)
        img.src = '/linkedin-post.svg'
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
                    ctx.font = `${fontSize}px KattuxAbc`
                    ctx.fillStyle = 'white'
                    ctx.textAlign = 'center'
                    ctx.textBaseline = 'middle'
                    ctx.shadowColor = 'rgba(0,0,0,0.5)'
                    ctx.shadowBlur = 2
                    ctx.shadowOffsetX = 1
                    ctx.shadowOffsetY = 1
                    ctx.fillText(text, textX, textY)
                    ctx.restore()
                }
            }
            img.src = image
        } else {
            // Draw SVG overlay to cover the whole canvas even if no image
            ctx.drawImage(svgOverlay, 0, 0, CANVAS_SIZE, CANVAS_SIZE)
            if (text) {
                ctx.save()
                ctx.font = `${fontSize}px KattuxAbc`
                ctx.fillStyle = 'white'
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                ctx.shadowColor = 'rgba(0,0,0,0.5)'
                ctx.shadowBlur = 2
                ctx.shadowOffsetX = 1
                ctx.shadowOffsetY = 1
                ctx.fillText(text, textX, textY)
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
            <h1>LinkedIn Post Generator</h1>
            <p className="description">Ladda upp en bild, skala och flytta bakgrundsbilden. Texten kan placeras med sliders. Bilden laddas ner i 1080x1080px.</p>
            <div className="controls">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="file-input" />
                <label style={{ marginLeft: 16 }}>
                    Skala bild
                    <input type="range" min={0.2} max={2} step={0.01} value={scale} onChange={e => setScale(Number(e.target.value))} style={{ width: 120, marginLeft: 8 }} />
                    <span style={{ marginLeft: 8 }}>{Math.round(scale * 100)}%</span>
                </label>
                <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="Skriv text..." className="text-input" style={{ width: 220, marginLeft: 16 }} />
                <label style={{ marginLeft: 16 }}>
                    Textstorlek
                    <input type="range" min={40} max={200} step={1} value={fontSize} onChange={e => setFontSize(Number(e.target.value))} style={{ width: 120, marginLeft: 8 }} />
                    <span style={{ marginLeft: 8 }}>{fontSize}px</span>
                </label>
                <label style={{ marginLeft: 16 }}>
                    Text X
                    <input type="range" min={0} max={CANVAS_SIZE} step={1} value={textX} onChange={e => setTextX(Number(e.target.value))} style={{ width: 120, marginLeft: 8 }} />
                    <span style={{ marginLeft: 8 }}>{textX}</span>
                </label>
                <label style={{ marginLeft: 16 }}>
                    Text Y
                    <input type="range" min={0} max={CANVAS_SIZE} step={1} value={textY} onChange={e => setTextY(Number(e.target.value))} style={{ width: 120, marginLeft: 8 }} />
                    <span style={{ marginLeft: 8 }}>{textY}</span>
                </label>
                <button onClick={handleDownload} className="download-button" style={{ marginLeft: 16 }}>Ladda ner bild</button>
            </div>
            <div className="preview">
                <canvas
                    ref={canvasRef}
                    width={CANVAS_SIZE}
                    height={CANVAS_SIZE}
                    className="canvas"
                    style={{ border: '1px solid #ccc', background: '#fff', maxWidth: 540, width: '100%', cursor: draggingImage ? 'grabbing' : image ? 'grab' : 'default' }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                />
            </div>
        </div>
    )
}