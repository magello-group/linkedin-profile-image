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
                        <img src="/profile-preview.png" alt="Exempel på profilbild"
                            style={{ display: 'block', margin: '1rem auto', maxWidth: '200px', borderRadius: 8 }} />
                    </li>
                    <li style={{ marginBottom: '1.5rem' }}>
                        <strong><Link to="/linkedin-banner">Linkedin - Personlig top banner</Link></strong><br />
                        Ladda upp en miljöbild och få en banner med Magelloformgivning som du kan använda på din LinkedIn-profil.
                        <img src="/linkedin-banner-preview.png" alt="Exempel på linkedin banner"
                            style={{ display: 'block', margin: '1rem auto', maxWidth: '200px', borderRadius: 8 }} />
                    </li>

                    <li style={{ marginBottom: '1.5rem' }}>
                        <strong><Link to="/badge">Linkedin - Text på profilbild</Link></strong><br />
                        Lägg til en text på din Linkedin-profilbild. Ladda upp din profilbild, lägg till text och ladda ner resultatet.
                        <img src="/badge-preview.png" alt="Exempel på badgebild"
                            style={{ display: 'block', margin: '1rem auto', maxWidth: '200px', borderRadius: 8 }} />
                    </li>
                    <li style={{ marginBottom: '1.5rem' }}>
                        <strong><Link to="/new-employee">LinkedIn - Bild för nyheter om anställd </Link></strong><br />
                        Generera en bild för LinkedIn-inlägg med valfri text, färg, rotation och överlägg. Anpassa bild och text fritt.
                        <img src="/new-employee-preview.png" alt="Exempel på bild för nyanställd"
                            style={{ display: 'block', margin: '1rem auto', maxWidth: '200px', borderRadius: 8 }} />

                    </li>
                    <li style={{ marginBottom: '1.5rem' }}>
                        <strong><Link to="/powerpoint">Powerpoint - Skapa svart-vita miljöbilder</Link></strong><br />
                        Generera en bilder till t ex Powerpoint eller genrellella bilder som ska se Magelloiga ut.
                        Ladda upp en färgild bild. Du kan flytta och skala bakgrundsbilden för att få det att se bra ut. Bilden laddas ner i 1080x1080px som passar LinkedIn-postning.
                        <img src="/powerpoint-preview.png" alt="Exempel på powerpointbild"
                            style={{ display: 'block', margin: '1rem auto', maxWidth: '200px', borderRadius: 8 }} />
                    </li>
                    <li style={{ marginBottom: '1.5rem' }}>
                        <strong><Link to="/svg-crop">Skapa ikoner för uppdrag i CV</Link></strong><br />
                        Ladda upp en logotyp som SVG, flytta och skala den i förhandsgranskningen och ladda ner en ny ikon beskuren till exakt 200x200 px, redo att användas för ett uppdrag i CV:t.
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', margin: '1rem auto 0' }}>
                            <img src="/valmyndigheten-preview.svg" alt="Exempel på ikon: Valmyndigheten"
                                style={{ width: 80, height: 80, borderRadius: 8, border: '1px solid #eee' }} />
                            <img src="/kth-preview.svg" alt="Exempel på ikon: KTH"
                                style={{ width: 80, height: 80, borderRadius: 8, border: '1px solid #eee' }} />
                            <img src="/ica-preview.svg" alt="Exempel på ikon: ICA"
                                style={{ width: 80, height: 80, borderRadius: 8, border: '1px solid #eee' }} />
                            <img src="/arbetsformedlingen-preview.svg" alt="Exempel på ikon: Arbetsförmedlingen"
                                style={{ width: 80, height: 80, borderRadius: 8, border: '1px solid #eee' }} />
                        </div>
                    </li>
                </ul>
                <p style={{ color: '#888', fontSize: '0.95rem', marginTop: '2rem' }}>
                    Alla tjänster körs lokalt i din webbläsare – ingen bilddata laddas upp till någon server.
                </p>
            </div>
        </>
    )
}