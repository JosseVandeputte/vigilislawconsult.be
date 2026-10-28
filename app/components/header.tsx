'use client';

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styles from "./header.module.css";
import { scrollToSection as scrollTo } from "@/lib/scroll";

export default function Header() {
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);
    const burgerRef = useRef<HTMLButtonElement>(null);

    // Bij een paginawissel het mobiele menu altijd sluiten.
    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    // Escape sluit het menu en zet de focus terug op de menuknop.
    useEffect(() => {
        if (!menuOpen) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setMenuOpen(false);
                burgerRef.current?.focus();
            }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [menuOpen]);

    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
        setMenuOpen(false);
        // Only prevent default and scroll if we're on the home page
        if (pathname === '/') {
            e.preventDefault();
            // Pas scrollen nadat het mobiele menu is dichtgeklapt; anders
            // verschuift de doelpositie met de hoogte van het menu.
            requestAnimationFrame(() => scrollTo(sectionId));
        }
    };

    return (
        <header className={styles.header}>
            <div className={styles.bar}>
                <Link href="/" className={styles.barLogo} onClick={() => setMenuOpen(false)}>
                    <Image
                        src="/Vigilis-Law-Consult_Logo.png"
                        alt="Vigilis Law Consult – naar de startpagina"
                        width={48}
                        height={48}
                    />
                </Link>
                <button
                    ref={burgerRef}
                    type="button"
                    className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ''}`}
                    aria-label={menuOpen ? "Menu sluiten" : "Menu openen"}
                    aria-expanded={menuOpen}
                    aria-controls="hoofdnavigatie"
                    onClick={() => setMenuOpen((open) => !open)}
                >
                    <span className={styles.burgerLine} />
                    <span className={styles.burgerLine} />
                    <span className={styles.burgerLine} />
                </button>
            </div>
            <nav id="hoofdnavigatie" aria-label="Hoofdnavigatie">
                <ul className={`${styles.navList} ${menuOpen ? styles.navListOpen : ''}`}>
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
                            alt="Vigilis Law Consult – naar de startpagina" 
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
