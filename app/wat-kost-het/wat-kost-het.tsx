import styles from './wat-kost-het.module.css';
import Link from 'next/link';

export default function WatKostHet() {
    return (
        <section id="wat-kost-het" className={styles.watKostHet}>
            <h2>Wat kost het?</h2>
            <div className={styles.content}>
                <div className={styles.telefonischeConsultatie}>
                    <h3>Telefonische Consultatie</h3>
                    <p>Voor korte vragen of advies via telefoon.</p>
                    <span className={styles.prijs}>
                        Eerste 15 minuten gratis
                    </span>
                </div>
                <div className={styles.desktopAdviezen}>
                    <h3>Desktop Adviezen</h3>
                    <p>Voor studie dossier en uitschrijven van het advies.</p>
                    <span className={styles.prijs}>
                        150 € / uur
                    </span>
                </div>
                <div className={styles.groteProjecten}>
                    <h3>Grote Projecten</h3>
                    <p>Voor meer informatie gelieve mij te contacteren via mail: <Link href="mailto:info@vigilislawconsult.be?subject=Aanvraag groot project">info@vigilislawconsult.be</Link></p>
                    <span className={styles.prijs}>
                        Prijs in overleg besproken
                    </span>
                </div>
            </div>
        </section>
    );
}