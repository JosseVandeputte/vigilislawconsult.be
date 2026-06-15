import Image from "next/image";
import Link from "next/link";
import styles from "./welcome.module.css";

export default function Welcome() {
    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section id="home"  className={styles.welcome}>
            <div className={styles.titles}>
                <h2>Justitia et Vigilantia</h2>
                <h1>Vigilis Law Consult</h1>
            </div>
            <div className={styles.buttons}>
                <button className={styles.infoButton} onClick={() => scrollToSection('wie-ben-ik')}>Over ons</button>
                <Link href="/reservatie" className={styles.reservationButton}>Reservatie</Link>
            </div>
            <div className={styles.arrows}>
                <Image src="/arrow.png" alt="arrow for design" width={800} height={800}/>
                <Image src="/arrow.png" alt="arrow for design" width={800} height={800}/>
            </div>
        </section>
    );
}