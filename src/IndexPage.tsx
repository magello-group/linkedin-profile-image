import { useEffect } from 'react'
import { Link } from 'react-router-dom'

// Rubriken använder Roboto Condensed Medium, laddas in separat eftersom den
// inte ingår i det globala Roboto-importet i App.css.
const TITLE_FONT_FAMILY = "'Roboto Condensed', sans-serif"
const GOOGLE_FONTS_TITLE_URL = 'https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@500&display=swap'

function loadTitleFontStylesheet() {
    if (document.querySelector(`link[href="${GOOGLE_FONTS_TITLE_URL}"]`)) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = GOOGLE_FONTS_TITLE_URL
    document.head.appendChild(link)
}

type Service = {
    to: string
    title: string
    description: string
    previewImages: { src: string; alt: string }[]
    accent: string
}

const services: Service[] = [
    {
        to: '/profile',
        title: 'Ny profilbild',
        description: 'Ger dig en Magello profilbild, svartvit och med rosa ton.',
        previewImages: [{ src: '/profile-preview.png', alt: 'Exempel på profilbild' }],
        accent: '#EC008C',
    },
    {
        to: '/linkedin-banner',
        title: 'Linkedin - Personlig top banner',
        description: 'Ladda upp en miljöbild och få en banner med Magelloformgivning som du kan använda på din LinkedIn-profil.',
        previewImages: [{ src: '/linkedin-banner-preview.png', alt: 'Exempel på linkedin banner' }],
        accent: '#009EE3',
    },
    {
        to: '/badge',
        title: 'Linkedin - Text på profilbild',
        description: 'Lägg til en text på din Linkedin-profilbild. Ladda upp din profilbild, lägg till text och ladda ner resultatet.',
        previewImages: [{ src: '/badge-preview.png', alt: 'Exempel på badgebild' }],
        accent: '#EC008C',
    },
    {
        to: '/new-employee',
        title: 'Linkedininlägg för nyanställd',
        description: 'Generera en bild för LinkedIn-inlägg med valfri text, färg, rotation och överlägg. Anpassa bild och text fritt.',
        previewImages: [{ src: '/new-employee-preview.png', alt: 'Exempel på bild för nyanställd' }],
        accent: '#009EE3',
    },
    {
        to: '/powerpoint',
        title: 'Powerpoint - Skapa svart-vita miljöbilder',
        description: 'Generera en bilder till t ex Powerpoint eller genrellella bilder som ska se Magelloiga ut. Ladda upp en färgild bild. Du kan flytta och skala bakgrundsbilden för att få det att se bra ut. Bilden laddas ner i 1080x1080px som passar LinkedIn-postning.',
        previewImages: [{ src: '/powerpoint-preview.png', alt: 'Exempel på powerpointbild' }],
        accent: '#EC008C',
    },
    {
        to: '/svg-crop',
        title: 'Skapa ikoner för uppdrag i CV',
        description: 'Ladda upp en logotyp som SVG, flytta och skala den i förhandsgranskningen och ladda ner en ny ikon beskuren till exakt 200x200 px, redo att användas för ett uppdrag i CV:t.',
        previewImages: [
            { src: '/valmyndigheten-preview.svg', alt: 'Exempel på ikon: Valmyndigheten' },
            { src: '/kth-preview.svg', alt: 'Exempel på ikon: KTH' },
            { src: '/ica-preview.svg', alt: 'Exempel på ikon: ICA' },
            { src: '/arbetsformedlingen-preview.svg', alt: 'Exempel på ikon: Arbetsförmedlingen' },
        ],
        accent: '#009EE3',
    },
]

export default function IndexPage() {
    useEffect(() => {
        loadTitleFontStylesheet()
    }, [])

    return (
        <>
            <img src="https://magello.se/assets/images/magello-logo-w.svg" alt="Magello logotyp" className="magello-logo" style={{ display: 'block', margin: '2rem auto 1rem auto', maxWidth: 180 }} />
            <div style={{ maxWidth: 1200, margin: '2rem auto', padding: '0 1.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h1 style={{ fontFamily: TITLE_FONT_FAMILY, fontWeight: 500 }}>Magello bildhantering</h1>
                    <p style={{ color: '#555', fontSize: '1.1rem' }}>Välj en av tjänsterna nedan för att skapa eller redigera bilder, resultatet blir Magello riktiga bilder:</p>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '1.5rem',
                        alignItems: 'stretch',
                    }}
                >
                    {services.map(service => (
                        <Link
                            key={service.to}
                            to={service.to}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                textDecoration: 'none',
                                color: 'inherit',
                                background: '#fff',
                                borderRadius: 14,
                                border: '1px solid #eee',
                                borderTop: `4px solid ${service.accent}`,
                                boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                                padding: '1.5rem',
                                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-3px)'
                                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)'
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.06)'
                            }}
                        >
                            <strong style={{ fontSize: '1.15rem', color: '#222', marginBottom: '0.6rem' }}>{service.title}</strong>
                            <p style={{ color: '#555', fontSize: '0.98rem', lineHeight: 1.5, margin: 0, flex: '1 0 auto' }}>{service.description}</p>

                            {service.previewImages.length === 1 ? (
                                <img
                                    src={service.previewImages[0].src}
                                    alt={service.previewImages[0].alt}
                                    style={{ display: 'block', margin: '1rem auto 0', maxWidth: '200px', width: '100%', borderRadius: 8 }}
                                />
                            ) : (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'center', margin: '1.25rem auto 0' }}>
                                    {service.previewImages.map(preview => (
                                        <img
                                            key={preview.src}
                                            src={preview.src}
                                            alt={preview.alt}
                                            style={{ width: 56, height: 56, borderRadius: 8, border: '1px solid #eee' }}
                                        />
                                    ))}
                                </div>
                            )}
                        </Link>
                    ))}
                </div>

                <p style={{ color: '#888', fontSize: '0.95rem', marginTop: '2.5rem', textAlign: 'center' }}>
                    Alla tjänster körs lokalt i din webbläsare – ingen bilddata laddas upp till någon server.
                </p>
            </div>
        </>
    )
}
