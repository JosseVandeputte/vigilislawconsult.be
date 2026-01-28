import Image from "next/image";
import Link from "next/link";
import styles from "./footer.module.css";

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerContainer}>
                <div className={styles.footerLinks}>
                    <ul>
                        <li>
                            <Link href="/#wie-ben-ik">Wie ben ik?</Link>
                        </li>
                        <li>
                            <Link href="/#ons-aanbod">Ons Aanbod</Link>
                        </li>
                        <li>
                            <Link href="/#wat-kost-het">Wat kost het?</Link>
                        </li>
                        <li>
                            <Link href="/#nuttige-links">Nuttige Links & Info</Link>
                        </li>
                        <li>
                            <Link href="/privacy">Privacybeleid / Gebruiksvoorwaarden / Cookiebeleid</Link>
                        </li>
                    </ul>
                </div>
                <div className={styles.footerContact}>
                    <h3>Contact</h3>
                    <p>Naam: Filip Scheemaker</p>
                    <p>Adres: 18-oktoberstraat 27 <br/> 8000 Brugge</p> 
                    <p>Telefoon: <a href="tel:+32 470 84 69 32">+32 470 84 69 32</a></p>
                    <p>Email: <a href="mailto:info@vigilislawconsult.be">info@vigilislawconsult.be</a></p>
                    <p>Ondernemingsnummer: BE0804.955.587</p>
                    <p>Rekeningnummer: BE51 7340 7260 9862</p>
                    <p className={styles.footerCopyright}>
                        &copy; {new Date().getFullYear()} Vigilis Law Consult CommV.
                    </p>
                </div>
                <div className={styles.footerLogo}>
                    <Link href="/">
                        <Image 
                        src="/K-Vigilis-Law-Consult_Logo.jpg" 
                        alt={"logo"} 
                        width={200} 
                        height={200}
                        />
                    </Link>                
                </div>
            </div>
        </footer>
    );
}