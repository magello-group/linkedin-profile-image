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
          // Calculate text size as 20% of image height
          const fontSize = Math.round(img.height * 0.20)
          ctx.font = `${fontSize}px KattuxAbc`
          const textMetrics = ctx.measureText(text)

          // Calculate background dimensions
          const padding = Math.round(fontSize * 0.1) // Padding reduced to 10% of font size
          const minWidth = Math.round(fontSize * 4) // Minimum width relative to font size
          const bgWidth = Math.max(textMetrics.width + padding * 2, minWidth)
          const bgHeight = (bgWidth * 51) / 196 // Maintain aspect ratio of background SVG

          // Calculate position to center the text in the background
          const bgX = canvas.width / 2 - bgWidth / 2 + position.x
          const bgY = canvas.height / 2 - bgHeight / 2 + position.y

          // Draw the background SVG
          ctx.drawImage(bgImage, bgX, bgY, bgWidth, bgHeight)

          // Draw text
          ctx.font = '32px KattuxAbc'
          ctx.fillStyle = 'white'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.save()
          ctx.translate(canvas.width / 2 + position.x, canvas.height / 2 + position.y)
          ctx.rotate(-2 * Math.PI / 180) // -2 degrees in radians
          ctx.fillText(text, 0, 0)
          ctx.restore()
        }
      }
      img.src = image
    }
  }, [image, text, position, bgImage, fontLoaded])

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
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="file-input"
        />
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ange text här..."
          className="text-input"
        />
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
              Ladda ner bild
            </button>
          </>
        ) : (
          <p className="placeholder">Välj en bild för att se förhandsvisning</p>
        )}
      </div>
    </div>
  )
}

export default App
