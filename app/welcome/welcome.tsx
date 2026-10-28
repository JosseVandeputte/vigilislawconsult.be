import Image from "next/image";
import Link from "next/link";
import styles from "./welcome.module.css";
import { scrollToSection } from "@/lib/scroll";

export default function Welcome() {
    return (
        <section id="home"  className={styles.welcome}>
            <div className={styles.titles}>
                <p className={styles.slogan}>Justitia et Vigilantia</p>
                <h1>Vigilis Law Consult</h1>
            </div>
            <div className={styles.buttons}>
                <button className={styles.infoButton} onClick={() => scrollToSection('wie-ben-ik')}>Over ons</button>
                {/* <Link href="/reservatie" className={styles.reservationButton}>Reservatie</Link> */}
                <Link href="/" className={styles.reservationButton}>Reservatie <br/> (binnenkort beschikbaar)</Link>
            </div>
            <div className={styles.arrows} aria-hidden="true">
                <Image src="/arrow.png" alt="" width={800} height={800}/>
                <Image src="/arrow.png" alt="" width={800} height={800}/>
            </div>
        </section>
    );
}
