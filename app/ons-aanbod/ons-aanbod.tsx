import styles from './ons-aanbod.module.css';

interface AanbodItem {
    title: string;
    description: string;
    list: string[];
}

const aanbod: AanbodItem[] = [
    {
        title: "Docent bewakingswetgeving",
        description: "Expertise in bewakingswetgeving en wetgeving privédetective",
        list: ["Rechtsvakken", "Bijscholing", "Praktijkgericht"],
    },
    {
        title: "SELOR coaching",
        description: "Professionele begeleiding voor SELOR examens",
        list: ["Persoonlijke aanpak", "Examenvoorbereiding", "Praktische tips"],
    },
    {
        title: "Vergunningsaanvragen",
        description: "Begeleiding bij vergunningsaanvragen voor bewaking en detective",
        list: ["Complete begeleiding", "Dossieropvolging", "Expertise"],
    },
    {
        title: "Juridisch advies",
        description: "Specialistisch juridisch advies aan de advocatuur",
        list: ["Bewakingssector", "Privédetectives", "Rechtszaken"],
    },
    {
        title: "Overheidsadvies",
        description: "Advies aan lokale overheden over veiligheidsbeleid",
        list: ["Gemeenschapswachten", "Politiecoden", "Bestuurlijke handhaving"],
    },
    {
        title: "Politieorganisatie",
        description: "Advies over politiezones en fusies",
        list: ["Zonering", "Fusies", "Optimalisatie"],
    },
    {
        title: "Veldwachters",
        description: "Advies over bijzondere veldwachters",
        list: ["Aanstelling", "Bevoegdheden", "Werkzaamheden"],
    },
    {
        title: "Studiemateriaal",
        description: "Ontwikkeling van lesmateriaal en publicaties",
        list: ["Cursussen", "Vakartikelen", "Studieboeken"],
    },
    {
        title: "Kennisdeling",
        description: "Lezingen en studiedagen over veiligheid",
        list: ["Workshops", "Conferenties", "Seminars"],
    },
];

export default function OnsAanbod() {
    return (
        <section id='ons-aanbod' className={styles.onsAanbod}>
            <h2>Ons Aanbod</h2>
            <div className={styles.content}>
                {aanbod.map((item) => (
                    <div key={item.title} className={styles.gridItem}>
                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                        <ul>
                            {item.list.map((listItem) => (
                                <li key={listItem}>{listItem}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    );
}