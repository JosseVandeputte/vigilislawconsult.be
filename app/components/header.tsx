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
                    <li>
                        <Link href="/">
                            <Image 
                            src="/K-Vigilis-Law-Consult_Logo.jpg" 
                            alt={"logo"} 
                            width={100} 
                            height={100}
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