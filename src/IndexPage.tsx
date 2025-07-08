import { Link } from 'react-router-dom'

export default function IndexPage() {
    return (
        <>
            <img src="https://magello.se/assets/images/magello-logo-w.svg" alt="Magello logotyp" className="magello-logo" style={{ display: 'block', margin: '2rem auto 1rem auto', maxWidth: 180 }} />
            <div style={{ maxWidth: 600, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
                <h1>Magello bildhantering</h1>
                <p>Välj en av tjänsterna nedan för att skapa eller redigera bilder för LinkedIn:</p>
                <ul style={{ listStyle: 'none', padding: 0, fontSize: '1.1rem' }}>
                    <li style={{ marginBottom: '1.5rem' }}>
                        <strong><Link to="/profile">Profilbild</Link></strong><br />
                        Ladda upp och skapa din svartvita profilbild med ett rosa skimmer.
                    </li>
                    <li style={{ marginBottom: '1.5rem' }}>
                        <strong><Link to="/badge">Badge på din profilbild</Link></strong><br />
                        Skapa en LinkedIn-profilbild med överlagrad text och bakgrundsbadge. Ladda upp din profilbild, lägg till text och ladda ner resultatet.
                    </li>
                    <li style={{ marginBottom: '1.5rem' }}>
                        <strong><Link to="/linkedin-new-work">LinkedIn - Nyanställd nyhetsbild</Link></strong><br />
                        Generera en bild för LinkedIn-inlägg med valfri text, färg, rotation och överlägg. Anpassa bild och text fritt.
                    </li>
                </ul>
                <p style={{ color: '#888', fontSize: '0.95rem', marginTop: '2rem' }}>
                    Alla tjänster körs lokalt i din webbläsare – ingen bilddata laddas upp till någon server.
                </p>
            </div>
        </>
    )
}