import { useState, useRef, useEffect } from 'react'
import './App.css'

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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

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

  return (
    <div className="app">
      <h1>LinkedIn Profilbildsgenerator</h1>
      <p className="description">
        Ladda upp din profilbild och lägg till text som kommer att visas överlagrad på bilden.
        Du kan dra texten för att positionera den precis där du vill ha den.
      </p>
      <div className="controls">
        <div className="control">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="file-input"
          />
        </div>
        <div className="control">

          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ange text här..."
            className="text-input"
            style={{ height: '2.5rem', minHeight: 'unset', maxHeight: 'unset', resize: 'none' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.95rem', color: '#666', marginBottom: 2 }}>Standardtexter (förslag):</span>
            <button type="button" style={{ marginBottom: 2 }} onClick={() => setText('Anställer!')}>Anställer!</button>
            <button type="button" style={{ marginBottom: 2 }} onClick={() => setText('Tillgänglig!')}>Tillgänglig!</button>
            <button type="button" onClick={() => setText('Konsult')}>Konsult</button>
          </div>
        </div>
        <div className="control">

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label htmlFor="fontSizeRange">Textstorlek</label>
            <input
              id="fontSizeRange"
              type="range"
              min={0.3}
              max={1.5}
              step={0.01}
              value={fontSizeScale}
              onChange={e => setFontSizeScale(Number(e.target.value))}
              style={{ width: 100 }}
            />
            <span style={{ minWidth: 32, textAlign: 'right' }}>{Math.round(fontSizeScale * 100)}%</span>
          </div>
        </div>
      </div>
      <div className="preview">
        {image ? (
          <>
            <canvas
              ref={canvasRef}
              className="canvas"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
            <button
              onClick={handleDownload}
              className="download-button"
              disabled={!image || !text}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ verticalAlign: 'middle', marginRight: 8 }}>
                <path d="M10 2v10m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="4" y="16" width="12" height="2" rx="1" fill="currentColor" />
              </svg>
              Ladda ner bild
            </button>
          </>
        ) : (
          <p className="placeholder">Ladda upp en bild för att se förhandsvisning</p>
        )}
      </div>
    </div>

  )
}

export default App
