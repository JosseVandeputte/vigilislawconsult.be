import Link from 'next/link';
import Header from './components/header';
import Footer from './components/footer';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <div>
      <Header />
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.errorCode}>404</div>
          <h1 className={styles.title}>Pagina niet gevonden</h1>
          <p className={styles.description}>
            Sorry, de pagina die u zoekt bestaat niet of is verplaatst.
          </p>
          <div className={styles.suggestions}>
            <h2>Wat kunt u doen?</h2>
            <ul>
              <li>Controleer of u de juiste URL heeft ingevoerd</li>
              <li>Ga terug naar de vorige pagina</li>
              <li>Bezoek onze homepage</li>
              <li>Neem contact met ons op als u denkt dat dit een fout is</li>
            </ul>
          </div>
          <div className={styles.actions}>
            <Link href="/" className={styles.primaryButton}>
              Terug naar Homepage
            </Link>
            <Link href="#contact" className={styles.secondaryButton}>
              Contact Opnemen
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
