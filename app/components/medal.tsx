import styles from './medal.module.css';

export default function Medal() {
    return (
    <svg className={styles.medal}>
        <circle cx="12" cy="8" r="6"></circle>
        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>
    </svg>
    );
}