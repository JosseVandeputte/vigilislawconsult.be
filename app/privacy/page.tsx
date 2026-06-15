import styles from './privacy.module.css';
import Header from '../components/header';
import Footer from '../components/footer';

export default function Privacy() {
  return (
    <div>
      <Header />
      <div className={styles.container}>
        <div className={styles.content}>
        <h1>Privacy- en Cookieverklaring</h1>
        
        <section className={styles.section}>
          <p>
            Deze website maakt uitsluitend gebruik van functionele cookies. Dit zijn cookies die noodzakelijk zijn voor het correct functioneren van de website. Ze slaan bijvoorbeeld uw taalvoorkeur of andere technische gegevens op, zodat u de website optimaal kunt gebruiken.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Wat zijn functionele cookies?</h2>
          <p>
            Functionele cookies zijn essentieel voor het technisch functioneren van de website. Ze zorgen ervoor dat de website correct werkt en dat u de gewenste pagina&apos;s kunt bereiken. Deze cookies slaan geen persoonlijke gegevens op en zijn niet bedoeld voor tracking of profilering van gebruikers.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Geen toestemming vereist</h2>
          <p>
            Aangezien deze website enkel functionele cookies gebruikt, is het niet nodig om uw toestemming te vragen voor het plaatsen ervan. De wetgeving vereist enkel een informatieplicht, die wij via deze verklaring nakomen.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Hoe kunt u de website raadplegen zonder cookies?</h2>
          <p>
            U kunt de cookies in uw browserinstellingen beheren of uitschakelen. Houd er rekening mee dat het uitschakelen van functionele cookies de werking van de website kan beïnvloeden.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Contact</h2>
          <p>
            Voor vragen over deze privacy- en cookieverklaring kunt u contact opnemen met:
          </p>
          <p><strong>Vigilis Law Consult</strong></p>
          <p>Filip Scheemaker</p>
          <p>18-oktoberstraat 27, 8000 Brugge</p>
          <p>Telefoon: +32 470 84 69 32</p>
          <p>E-mail: &#105;&#110;&#102;&#111;&#64;&#118;&#105;&#103;&#105;&#108;&#105;&#115;&#108;&#97;&#119;&#99;&#111;&#110;&#115;&#117;&#108;&#116;&#46;&#98;&#101;</p>
          <p>Ondernemingsnummer: BE0804.955.587</p>
        </section>
      </div>
    </div>
    <Footer />
  </div>
  );
}
