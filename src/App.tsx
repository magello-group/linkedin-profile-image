import { useState, useRef, useEffect } from 'react'
import ToolLayout, { DownloadButton, RangeField, TextField, UploadZone, readAsDataUrl } from './ToolLayout'

// Define the font face
const fontFace = new FontFace('KattuxAbc', 'url(/KattuxAbc-Regular.otf)')

function App() {
  const [image, setImage] = useState<string | null>(null)
  const [text, setText] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null)
  const [fontLoaded, setFontLoaded] = useState(false)
  const [fontSizeScale, setFontSizeScale] = useState(1) // 1 = 100%

  // Load font
  useEffect(() => {
    fontFace.load().then((loadedFont) => {
      document.fonts.add(loadedFont)
      setFontLoaded(true)
    }).catch(error => {
      console.error('Error loading font:', error)
    })
  }, [])

  // Load background image once
  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setBgImage(img)
    }
    img.src = '/label-background.svg'
  }, [])

  useEffect(() => {
    if (image && canvasRef.current && bgImage && fontLoaded) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const img = new Image()
      img.onload = () => {
        // Set canvas size to match the background image
        canvas.width = 800
        canvas.height = 800

        // Draw background
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        if (text) {
          // Set a fixed initial font size, scaled by fontSizeScale
          const baseFontSize = Math.round(img.height * 0.20)
          const fontSize = Math.round(baseFontSize * fontSizeScale)
          ctx.font = `${fontSize}px KattuxAbc`
          const textMetrics = ctx.measureText(text)

          // Calculate background dimensions with fixed minimum size
          const horizontalPadding = Math.round(fontSize * 0.6) // Approximately one character width
          const minWidth = Math.round(fontSize * 4)
          const bgWidth = Math.max(textMetrics.width + horizontalPadding * 2, minWidth)
          const bgHeight = (bgWidth * 51) / 196

          // Calculate position to center the text in the background
          const bgX = canvas.width / 2 - bgWidth / 2 + position.x
          const bgY = canvas.height / 2 - bgHeight / 2 + position.y

          // Draw the background SVG
          ctx.drawImage(bgImage, bgX, bgY, bgWidth, bgHeight)

          // Draw text
          ctx.font = `${fontSize}px KattuxAbc`
          ctx.fillStyle = 'white'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.save()
          ctx.translate(canvas.width / 2 + position.x, canvas.height / 2 + position.y)
          ctx.rotate(-2 * Math.PI / 180) // -2 degrees in radians
          // Add shadow
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
          ctx.shadowBlur = 2
          ctx.shadowOffsetX = 1
          ctx.shadowOffsetY = 1
          ctx.fillText(text, 0, 0)
          ctx.restore()
        }
      }
      img.src = image
    }
  }, [image, text, position, bgImage, fontLoaded, fontSizeScale])

  const handleImageUpload = (file: File) => readAsDataUrl(file, setImage)

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleDownload = () => {
    if (canvasRef.current) {
      const link = document.createElement('a')
      link.download = 'linkedin-profile.png'
      link.href = canvasRef.current.toDataURL('image/png')
      link.click()
    }
  }

  const presets = ['Anställer!', 'Tillgänglig!', 'Fullstack', 'Konsult']

  return (
    <ToolLayout
      kicker="LinkedIn"
      title="LinkedIn - Text på profilbild"
      intro={<>
        Ladda upp din profilbild och lägg till text som kommer att visas överlagrad på bilden.
        Du kan dra texten för att positionera den precis där du vill ha den.
      </>}
      controls={<>
        <UploadZone label="Profilbild" accept="image/*" hint="JPG, PNG eller WEBP" onFile={handleImageUpload} />
        <TextField label="Text" value={text} onChange={setText} placeholder="Ange text här..." />
        <div className="mg-field">
          <span className="mg-field__label">Standardtexter (förslag)</span>
          <div className="mg-app-chips">
            {presets.map(preset => (
              <button key={preset} type="button" className="mg-btn mg-btn--secondary" onClick={() => setText(preset)}>{preset}</button>
            ))}
          </div>
        </div>
        <RangeField
          label="Textstorlek"
          valueLabel={`${Math.round(fontSizeScale * 100)}%`}
          min={0.3}
          max={1.5}
          step={0.01}
          value={fontSizeScale}
          onChange={setFontSizeScale}
        />
        <DownloadButton onClick={handleDownload} disabled={!image || !text} />
      </>}
    >
      {image ? (
        <canvas
          ref={canvasRef}
          style={{ width: '100%', maxWidth: 560, cursor: 'move' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      ) : (
        <p className="mg-app-placeholder">Ladda upp en bild för att se förhandsvisning</p>
      )}
    </ToolLayout>
  )
}

export default App
