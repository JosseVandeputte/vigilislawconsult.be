'use client';

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./header.module.css";

export default function Header() {
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
        <header className={styles.header}>
            <nav>
                <ul className={styles.navList}>
                    <li>
                        <Link href="/#wie-ben-ik" onClick={(e) => scrollToSection(e, 'wie-ben-ik')}>Wie ben ik?</Link>
                    </li>
                    <li>
                        <Link href="/#ons-aanbod" onClick={(e) => scrollToSection(e, 'ons-aanbod')}>Ons Aanbod</Link>
                    </li>
                    <li className={styles.logo}>
                        <Link href="/">
                            <Image 
                            src="/Vigilis-Law-Consult_Logo.png" 
                            alt={"logo"} 
                            width={80} 
                            height={80}
                            />
                        </Link>
                    </li>
                    <li>
                        <Link href="/#wat-kost-het" onClick={(e) => scrollToSection(e, 'wat-kost-het')}>Wat kost het?</Link>
                    </li>
                    <li>
                        <Link href="/#nuttige-links" onClick={(e) => scrollToSection(e, 'nuttige-links')}>Nuttige Links & Info</Link>
                    </li>
                </ul>
            </nav>
        </header>
    );
}