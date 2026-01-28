'use client';

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./footer.module.css";

export default function Footer() {
    const pathname = usePathname();

    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
        // Only prevent default and scroll if we're on the home page
        if (pathname === '/') {
            e.preventDefault();
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <footer className={styles.footer}>
            <div className={styles.footerContainer}>
                <div className={styles.footerLinks}>
                    <ul>
                        <li>
                            <Link href="/#wie-ben-ik" onClick={(e) => scrollToSection(e, 'wie-ben-ik')}>Wie ben ik?</Link>
                        </li>
                        <li>
                            <Link href="/#ons-aanbod" onClick={(e) => scrollToSection(e, 'ons-aanbod')}>Ons Aanbod</Link>
                        </li>
                        <li>
                            <Link href="/#wat-kost-het" onClick={(e) => scrollToSection(e, 'wat-kost-het')}>Wat kost het?</Link>
                        </li>
                        <li>
                            <Link href="/#nuttige-links" onClick={(e) => scrollToSection(e, 'nuttige-links')}>Nuttige Links & Info</Link>
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
                    <p>Email: <a href="mailto:&#105;&#110;&#102;&#111;&#64;&#118;&#105;&#103;&#105;&#108;&#105;&#115;&#108;&#97;&#119;&#99;&#111;&#110;&#115;&#117;&#108;&#116;&#46;&#98;&#101;">&#105;&#110;&#102;&#111;&#64;&#118;&#105;&#103;&#105;&#108;&#105;&#115;&#108;&#97;&#119;&#99;&#111;&#110;&#115;&#117;&#108;&#116;&#46;&#98;&#101;</a></p>
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