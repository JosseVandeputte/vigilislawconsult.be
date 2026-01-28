import Medal from "../components/medal";
import styles from "./wie-ben-ik.module.css";
import Link from "next/link";

export default function WieBenIk() {
    return (
        <section id="wie-ben-ik" className={styles['wie-ben-ik']}>
            <h2>Wie ben ik?</h2>
            <div className={styles.content}>
                <div className={styles.container}>
                    <div className={styles.politie}>
                        <h3>Politiecarrière</h3>
                        <p>
                            Na een loopbaan van ruim 38 jaar bij de politie, waarvan 6 jaar in de graad van inspecteur en 32 jaar in de graad van commissaris, werd ik op 1 juli 2023 met pensioen gesteld. 13 jaar lang vervulde ik een operationele opdracht in Brugge.
                        </p>
                    </div>
                    <div className={styles.advp}>
                        <h3>Expertise bij A.D.V.P.</h3>
                        <p>
                            De rest van mijn loopbaan was ik verbindingsofficier bij de Algemene Directie van de Algemene Rijkspolitie (A.R.P.), nu de Algemene Directie Veiligheid en Preventie (A.D.V.P.), een algemene directie binnen de F.O.D. Binnenlandse Zaken (<Link href={"https://www.besafe.be"}>www.besafe.be</Link>). 
                        </p>
                        <ul>
                            <li><Medal /><span>Politiehervorming</span></li>
                            <li><Medal /><span>Gemeenschapswachten</span></li>
                            <li><Medal /><span>Bijzondere veldwachters</span></li>
                            <li><Medal /><span>Private veiligheid</span></li>
                        </ul>
                    </div>
                    <div className={styles.onderwijs}>
                        <h3>Onderwijservaring</h3>
                        <ul>
                            <li>
                                <h4>Syntra-west</h4>
                                <p>Docent rechtsvakken voor diverse opleidingen sinds 2000</p>
                            </li>
                            <li>
                                <h4>SERIS Academy</h4>
                                <p>Docent rechtsvakken voor beveiligingsopleidingen sinds 2020</p>
                            </li>
                        </ul>
                    </div>
                    <div className={styles['meer-info']}>
                        <h3>Meer info</h3>
                        <p>Voor meer info kunt u altijd een kijkje nemen op mijn LinkedIn pagina.</p>
                        <Link target="blank" href={"https://www.linkedin.com/in/filip-s-55061a290/"}>Ga naar mijn LinkedIn</Link>
                    </div>
                </div>
                <aside>
                    <div>
                        <h3>Expertise Gebieden</h3>
                        <ul>
                            <li>Bewakingswetgeving</li>
                            <li>Privédetectives</li>
                            <li>Gemeenschapswachten</li>
                            <li>Politiecodexen</li>
                            <li>Bestuurlijke handhaving</li>
                        </ul>
                    </div>
                </aside>
            </div>
        </section>
    );
}