import Image from "next/image";
import Link from "next/link";
import styles from "./header.module.css";

export default function Header() {
    return (
        <header className={styles.header}>
            <nav>
                <ul className={styles.navList}>
                    <li>
                        <Link href="/#wie-ben-ik">Wie ben ik?</Link>
                    </li>
                    <li>
                        <Link href="/#ons-aanbod">Ons Aanbod</Link>
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
                        <Link href="/#wat-kost-het">Wat kost het?</Link>
                    </li>
                    <li>
                        <Link href="/#nuttige-links">Nuttige Links & Info</Link>
                    </li>
                </ul>
            </nav>
        </header>
    );
}