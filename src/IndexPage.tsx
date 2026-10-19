import { Link } from 'react-router-dom'
import { AppIntro, AppTopbar } from './ToolLayout'

type Service = {
    to: string
    label: string
    title: string
    description: string
    previewImages: { src: string; alt: string }[]
}

const services: Service[] = [
    {
        to: '/profile',
        label: 'Profilbild',
        title: 'Ny profilbild',
        description: 'Ger dig en Magello profilbild, svartvit och med rosa ton.',
        previewImages: [{ src: '/profile-preview.png', alt: 'Exempel på profilbild' }],
    },
    {
        to: '/linkedin-banner',
        label: 'LinkedIn',
        title: 'Linkedin - Personlig top banner',
        description: 'Ladda upp en miljöbild och få en banner med Magelloformgivning som du kan använda på din LinkedIn-profil.',
        previewImages: [{ src: '/linkedin-banner-preview.png', alt: 'Exempel på linkedin banner' }],
    },
    {
        to: '/badge',
        label: 'LinkedIn',
        title: 'Linkedin - Text på profilbild',
        description: 'Lägg till en text på din Linkedin-profilbild. Ladda upp din profilbild, lägg till text och ladda ner resultatet.',
        previewImages: [{ src: '/badge-preview.png', alt: 'Exempel på badgebild' }],
    },
    {
        to: '/new-employee',
        label: 'LinkedIn',
        title: 'Linkedininlägg för nyanställd',
        description: 'Generera en bild för LinkedIn-inlägg med valfri text, färg, rotation och överlägg. Anpassa bild och text fritt.',
        previewImages: [{ src: '/new-employee-preview.png', alt: 'Exempel på bild för nyanställd' }],
    },
    {
        to: '/powerpoint',
        label: 'PowerPoint',
        title: 'Powerpoint - Skapa svart-vita miljöbilder',
        description: 'Generera bilder till t ex Powerpoint eller generella bilder som ska se Magelloiga ut. Ladda upp en färgbild. Du kan flytta och skala bakgrundsbilden för att få det att se bra ut. Bilden laddas ner i 1080x1080px som passar LinkedIn-postning.',
        previewImages: [{ src: '/powerpoint-preview.png', alt: 'Exempel på powerpointbild' }],
    },
    {
        to: '/svg-crop',
        label: 'CV',
        title: 'Skapa ikoner för uppdrag i CV',
        description: 'Ladda upp en logotyp som SVG, flytta och skala den i förhandsgranskningen och ladda ner en ny ikon beskuren till exakt 200x200 px, redo att användas för ett uppdrag i CV:t.',
        previewImages: [
            { src: '/valmyndigheten-preview.svg', alt: 'Exempel på ikon: Valmyndigheten' },
            { src: '/kth-preview.svg', alt: 'Exempel på ikon: KTH' },
            { src: '/ica-preview.svg', alt: 'Exempel på ikon: ICA' },
            { src: '/arbetsformedlingen-preview.svg', alt: 'Exempel på ikon: Arbetsförmedlingen' },
        ],
    },
]

export default function IndexPage() {
    return (
        <>
            <AppTopbar />
            <main>
                <AppIntro kicker="Bildverktyg" title="Magello bildhantering">
                    Välj en av tjänsterna nedan för att skapa eller redigera bilder, resultatet blir Magello riktiga bilder.
                </AppIntro>

                <div className="mg-wrap mg-app-tools">
                    <div className="mg-card-grid">
                        {services.map(service => (
                            <Link key={service.to} to={service.to} className="mg-card mg-app-tool">
                                <div className={`mg-app-tool__media${service.previewImages.length > 1 ? ' mg-app-tool__media--thumbs' : ''}`}>
                                    {service.previewImages.map(preview => (
                                        <img key={preview.src} src={preview.src} alt={preview.alt} />
                                    ))}
                                </div>
                                <div className="mg-app-tool__body">
                                    <span className="mg-card__label">{service.label}</span>
                                    <h2 className="mg-app-tool__title">{service.title}</h2>
                                    <p>{service.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                <p className="mg-wrap mg-app-note">
                    Alla tjänster körs lokalt i din webbläsare – ingen bilddata laddas upp till någon server.
                </p>
            </main>
        </>
    )
}
