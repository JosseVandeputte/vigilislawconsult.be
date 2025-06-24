import Image from "next/image";
import styles from "./header.module.css";

export default function Header() {
    return (
        <header className={styles.header}>
            <nav>
                <ul className={styles.navList}>
                    <li>
                        <a href="/#wie-ben-ik">Wie ben ik?</a>
                    </li>
                    <li>
                        <a href="/#ons-aanbod">Ons Aanbod</a>
                    </li>
                    <li>
                        <a href="/">
                            <Image 
                            src="/K-Vigilis-Law-Consult_Logo.jpg" 
                            alt={"logo"} 
                            width={100} 
                            height={100}
                            />
                        </a>
                    </li>
                    <li>
                        <a href="/#wat-kost-het">Wat kost het?</a>
                    </li>
                    <li>
                        <a href="/#nuttige-links">Nuttige Links & Info</a>
                    </li>
                </ul>
            </nav>
        </header>
    );
}