import { useState, useRef, useEffect } from 'react'
import './App.css'

// Define the font face
const fontFace = new FontFace('KattuxAbc', 'url(/KattuxAbc-Regular.otf)')

function App() {
  const [image, setImage] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [textPosition, setTextPosition] = useState({ x: 50, y: 50 })
  const [textMetrics, setTextMetrics] = useState({ width: 0, height: 0 })
  const canvasRef = useRef<HTMLCanvasElement>(null)
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
      console.log('Background image loaded successfully')
      setBgImage(img)
    }
    img.onerror = (error) => {
      console.error('Error loading background image:', error)
    }
    img.src = '/label-background.svg'
  }, [])

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

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value)
  }

  const handleDrag = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (event.buttons === 1) { // Left mouse button
      const canvas = canvasRef.current
      if (canvas) {
        const rect = canvas.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        setTextPosition({ x, y })
      }
    }
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Create a temporary link element
    const link = document.createElement('a')
    link.download = 'linkedin-profilbild.png'
    link.href = canvas.toDataURL('image/png')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const measureText = (ctx: CanvasRenderingContext2D, text: string) => {
    const metrics = ctx.measureText(text)
    // Use a fixed height for the text since getting the actual height is tricky
    const height = 40 // This matches our font size
    return {
      width: metrics.width,
      height: height
    }
  }

  const drawImage = () => {
    const canvas = canvasRef.current
    if (!canvas || !image || !bgImage || !fontLoaded) {
      console.log('Missing required elements:', {
        canvas: !!canvas,
        image: !!image,
        bgImage: !!bgImage,
        fontLoaded
      })
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width
      canvas.height = img.height

      // Draw image
      ctx.drawImage(img, 0, 0)

      if (text) {
        // Set up text style with KattuxAbc font
        ctx.font = '32px KattuxAbc'
        const metrics = measureText(ctx, text)
        setTextMetrics(metrics)

        // Calculate background dimensions with padding
        const padding = 20
        const bgWidth = metrics.width + padding * 2
        // Calculate height based on SVG's aspect ratio (196:51)
        const bgHeight = (bgWidth * 51) / 196

        // Calculate position to center the text in the background
        const bgX = textPosition.x - padding
        const bgY = textPosition.y - metrics.height - (bgHeight - metrics.height) / 2

        console.log('Drawing background at:', { bgX, bgY, bgWidth, bgHeight })

        // Draw the background SVG
        ctx.drawImage(
          bgImage,
          bgX,
          bgY,
          bgWidth,
          bgHeight
        )

        // Save the current context state
        ctx.save()

        // Translate to the text position, adjusted 10% higher
        const adjustedY = textPosition.y - (bgHeight * 0.1)
        ctx.translate(textPosition.x, adjustedY)

        // Rotate -2 degrees (converted to radians)
        ctx.rotate(-2 * Math.PI / 180)

        // Draw text at the origin (since we translated)
        ctx.fillStyle = 'white'
        ctx.fillText(text, 0, 0)

        // Restore the context state
        ctx.restore()
      }
    }
    img.src = image
  }

  // Redraw when image, text, position, background image, or font changes
  useEffect(() => {
    drawImage()
  }, [image, text, textPosition, bgImage, fontLoaded])

  return (
    <div className="app">
      <h1>Linkedinprofil generator</h1>
      <p className="description">
        Vill du ha en text på din linkedin profilbild? Ladda upp en bild på dig och skriv text.
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
          onChange={handleTextChange}
          placeholder="Skriv din text här..."
          className="text-input"
        />
      </div>
      <div className="preview">
        {image ? (
          <>
            <canvas
              ref={canvasRef}
              onMouseMove={handleDrag}
              className="canvas"
            />
            <button
              onClick={handleDownload}
              className="download-button"
              disabled={!text}
            >
              Ladda ner bild
            </button>
          </>
        ) : (
          <div className="placeholder">
            Ladda upp en bild för att börja
          </div>
        )}
      </div>
    </div>
  )
}

export default App
