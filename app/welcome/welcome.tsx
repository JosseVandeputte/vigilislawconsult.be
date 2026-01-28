import Image from "next/image";
import styles from "./welcome.module.css";

export default function Welcome() {
    return (
        <section id="home"  className={styles.welcome}>
            <div className={styles.titles}>
                <h2>Justitia et Vigilantia</h2>
                <h1>Vigilis Law Consult</h1>
            </div>
            <div className={styles.buttons}>
                <button className={styles.infoButton}>Over ons</button>
                <button className={styles.reservationButton}>Reservatie</button>
            </div>
            <div className={styles.arrows}>
                <Image src="/arrow.png" alt="arrow for design" width={800} height={800}/>
                <Image src="/arrow.png" alt="arrow for design" width={800} height={800}/>
            </div>
        </section>
    );
}