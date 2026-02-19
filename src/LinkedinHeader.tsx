import { useRef, useState, useEffect } from 'react'

const fontFace = new FontFace('KattuxAbc', 'url(/KattuxAbc-Regular.otf)')

const CANVAS_SIZE_WIDTH = 1584
const CANVAS_SIZE_HEIGHT = 396

function LinkedinHeader() {
    const [image, setImage] = useState<string | null>(null)
    const [scale, setScale] = useState(1)
    const [tintStrength] = useState(0.28) // 0–1 (0–100%)
    const [text, setText] = useState('')
    const [fontLoaded, setFontLoaded] = useState(false)
    const [fontSize, setFontSize] = useState(78)
    const [svgOverlay, setSvgOverlay] = useState<HTMLImageElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // Textposition
    const [textX, setTextX] = useState(CANVAS_SIZE_WIDTH)
    const [textY, setTextY] = useState(CANVAS_SIZE_HEIGHT)

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
        img.src = '/linkedin-banner.svg'
    }, [])

    // Draw everything
    useEffect(() => {
        if (!canvasRef.current || !fontLoaded || !svgOverlay) return
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

                // Draw SVG overlay to cover the whole canvas plus 2 px and -1px to avoid edge artifacts from scaling
                ctx.drawImage(svgOverlay, -1, 0, CANVAS_SIZE_WIDTH + 2, CANVAS_SIZE_HEIGHT)

                console.log('Image drawn with scale', scale, 'and offset', imageOffset)
                console.log('Image size:', img.width, 'x', img.height, 'scaled to', w, 'x', h)
                // Draw text on top of SVG (styrd av x/y)
                if (text) {
                    ctx.save()
                    ctx.font = `${fontSize}px KattuxAbc`
                    ctx.fillStyle = '#009EE3'
                    ctx.textAlign = 'center'
                    ctx.textBaseline = 'middle'
                    ctx.shadowColor = 'rgba(0,0,0,0.5)'
                    ctx.shadowBlur = 1
                    ctx.shadowOffsetX = 1
                    ctx.shadowOffsetY = 1
                    // Rotera -2 grader kring textens mittpunkt
                    ctx.translate(textX, textY)
                    ctx.rotate(-2 * Math.PI / 180)
                    ctx.fillText(text, 0, 0)
                    ctx.restore()
                }
            }
            img.src = image
        } else {
            // Draw SVG overlay to cover the whole canvas even if no image
            ctx.drawImage(svgOverlay, 0, 0, CANVAS_SIZE_WIDTH, CANVAS_SIZE_HEIGHT)
            if (text) {
                ctx.save()
                ctx.font = `${fontSize}px KattuxAbc`
                ctx.fillStyle = '#009EE3'
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                ctx.shadowColor = 'rgba(0,0,0,0.5)'
                ctx.shadowBlur = 2
                ctx.shadowOffsetX = 1
                ctx.shadowOffsetY = 1
                // Rotera -2 grader kring textens mittpunkt
                ctx.translate(textX, textY)
                ctx.rotate(-2 * Math.PI / 180)
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
            link.download = 'linkedin-banner.png'
            link.href = canvasRef.current.toDataURL('image/png')
            link.click()
        }
    }

    return (
        <div className="app">
            <img src="https://magello.se/assets/images/magello-logo-w.svg" alt="Magello logotyp" className="magello-logo" style={{ display: 'block', margin: '2rem auto 1rem auto', maxWidth: 180 }} />
            <h1>LinkedIn - Toppbanner</h1>
            <p className="description">Ladda upp en bild (och skriv en text). Du kan skala och flytta (bakgrundsbilden. Bilden laddas ner i 1584x396px som passar LinkedIn. Du kan även finjustera eventuell texts position.
                <br />
                <br />Färdig bilder finns på <a href="https://magellogroup.sharepoint.com/:f:/g/IgDzVgcRItgKQprzP6PIuMklAbGZs7nc8SNUWIAell4DoqY?e=ONkCgx">intranätet / Dokument / Bildbank / linkedin-banner</a>.

            </p>


            <div className="controls">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="file-input" />
                <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="Ditt förnamn Efternamn" className="text-input" style={{ width: 220, marginLeft: 16 }} />
            </div>
            <div className="preview">
                <canvas
                    ref={canvasRef}
                    width={CANVAS_SIZE_WIDTH}
                    height={CANVAS_SIZE_HEIGHT}
                    className="canvas"
                    style={{ border: '0px solid #fff', background: '#fff', maxWidth: 1584, width: '100%', maxHeight: 396, cursor: draggingImage ? 'grabbing' : image ? 'grab' : 'default' }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center', marginTop: '1.5rem', alignItems: 'center' }}>
                <label>
                    Skala bild
                    <input type="range" min={0.2} max={2} step={0.01} value={scale} onChange={e => setScale(Number(e.target.value))} style={{ width: 120, marginLeft: 8 }} />
                    <span style={{ marginLeft: 8 }}>{Math.round(scale * 100)}%</span>
                </label>
                <label>
                    Textstorlek
                    <input type="range" min={40} max={200} step={1} value={fontSize} onChange={e => setFontSize(Number(e.target.value))} style={{ width: 120, marginLeft: 8 }} />
                    <span style={{ marginLeft: 8 }}>{fontSize}px</span>
                </label>
                <label>
                    Text X
                    <input type="range" min={0} max={CANVAS_SIZE_WIDTH} step={1} value={textX} onChange={e => setTextX(Number(e.target.value))} style={{ width: 120, marginLeft: 8 }} />
                    <span style={{ marginLeft: 8 }}>{textX}</span>
                </label>
                <label>
                    Text Y
                    <input type="range" min={0} max={CANVAS_SIZE_WIDTH} step={1} value={textY} onChange={e => setTextY(Number(e.target.value))} style={{ width: 120, marginLeft: 8 }} />
                    <span style={{ marginLeft: 8 }}>{textY}</span>
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

export default LinkedinHeader