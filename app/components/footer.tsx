import Image from "next/image";
import styles from "./footer.module.css";

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerContainer}>
                <div className={styles.footerLinks}>
                    <ul>
                        <li>
                            <a href="/#wie-ben-ik">Wie ben ik?</a>
                        </li>
                        <li>
                            <a href="/#ons-aanbod">Ons Aanbod</a>
                        </li>
                        <li>
                            <a href="/#wat-kost-het">Wat kost het?</a>
                        </li>
                        <li>
                            <a href="/#nuttige-links">Nuttige Links & Info</a>
                        </li>
                        <li>
                            <a href="/privacy">Privacybeleid / Gebruiksvoorwaarden / Cookiebeleid </a>
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
                </div>
                <div className={styles.footerLogo}>
                    <a href="">
                        <Image 
                        src="/K-Vigilis-Law-Consult_Logo.jpg" 
                        alt={"logo"} 
                        width={200} 
                        height={200}
                        />
                    </a>                
                </div>
            </div>
            <div className={styles.footerCopyright}>
                <p>
                    &copy; {new Date().getFullYear()} Vigilis Law Consult. All rights reserved.
                </p>
            </div>
        </footer>
    );
}