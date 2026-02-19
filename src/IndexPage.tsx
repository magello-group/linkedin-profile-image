import { Link } from 'react-router-dom'

export default function IndexPage() {
    return (
        <>
            <img src="https://magello.se/assets/images/magello-logo-w.svg" alt="Magello logotyp" className="magello-logo" style={{ display: 'block', margin: '2rem auto 1rem auto', maxWidth: 180 }} />
            <div style={{ maxWidth: 600, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
                <h1>Magello bildhantering</h1>
                <p>Välj en av tjänsterna nedan för att skapa eller redigera bilder, resultatet blir Magello riktiga bilder:</p>
                <ul style={{ listStyle: 'none', padding: 0, fontSize: '1.1rem' }}>
                    <li style={{ marginBottom: '1.5rem' }}>
                        <strong><Link to="/profile">Ny profilbild</Link></strong><br />
                        Ger dig en Magello profilbild, svartvit och med rosa ton.
                    </li>
                    <li style={{ marginBottom: '1.5rem' }}>
                        <strong><Link to="/linkedin-banner">Linkedin - Personlig top banner</Link></strong><br />
                        Ladda upp en miljöbild och få en banner med Magelloformgivning som du kan använda på din LinkedIn-profil.
                    </li>

                    <li style={{ marginBottom: '1.5rem' }}>
                        <strong><Link to="/badge">Linkedin - Text på profilbild</Link></strong><br />
                        Lägg til en text på din Linkedin-profilbild. Ladda upp din profilbild, lägg till text och ladda ner resultatet.
                    </li>
                    <li style={{ marginBottom: '1.5rem' }}>
                        <strong><Link to="/new-employee">LinkedIn - Bild för nyheter om anställd </Link></strong><br />
                        Generera en bild för LinkedIn-inlägg med valfri text, färg, rotation och överlägg. Anpassa bild och text fritt.
                    </li>
                    <li style={{ marginBottom: '1.5rem' }}>
                        <strong><Link to="/powerpoint">Powerpoint - Skapa milöbilder</Link></strong><br />
                        Generera en bilder till t ex Powerpoint eller genrellella bilder som ska se Magelloiga ut.
                        Ladda upp en färgild bild. Du kan flytta och skala bakgrundsbilden för att få det att se bra ut. Bilden laddas ner i 1080x1080px som passar LinkedIn-postning.
                    </li>
                </ul>
                <p style={{ color: '#888', fontSize: '0.95rem', marginTop: '2rem' }}>
                    Alla tjänster körs lokalt i din webbläsare – ingen bilddata laddas upp till någon server.
                </p>
            </div>
        </>
    )
}