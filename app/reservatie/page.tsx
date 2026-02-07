import Footer from '../components/footer';
import Header from '../components/header';
import styles from './reservatie.module.css';
import Link from 'next/link';


export default function Reservatie() {
    return (
        <div>
            <Header />
            <section className={styles.reservatie}>
                <h2>Reservatie</h2>
                <p>Voor het maken van een reservatie of afspraak, gelieve contact met mij op te nemen via email: <Link href="mailto:&#105;&#110;&#102;&#111;&#64;&#118;&#105;&#103;&#105;&#108;&#105;&#115;&#108;&#97;&#119;&#99;&#111;&#110;&#115;&#117;&#108;&#116;&#46;&#98;&#101;?subject=Reservatie">&#105;&#110;&#102;&#111;&#64;&#118;&#105;&#103;&#105;&#108;&#105;&#115;&#108;&#97;&#119;&#99;&#111;&#110;&#115;&#117;&#108;&#116;.&#98;&#101;</Link></p>
            </section>
            <Footer />
        </div>
    );
}