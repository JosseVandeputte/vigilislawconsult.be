'use client';

import Footer from '../components/footer';
import Header from '../components/header';
import styles from './reservatie.module.css';
import Link from 'next/link';
import { useState } from 'react';


export default function Reservatie() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const monthNames = [
        'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
        'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
    ];

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        // Convert Sunday (0) to 7, and shift to make Monday = 1
        return firstDay === 0 ? 6 : firstDay - 1;
    };

    const generateCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days: (number | null)[] = [];

        // Add empty cells for days before the month starts
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }

        // Add all days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }

        // Fill remaining cells to complete the last row
        const remainingCells = 7 - (days.length % 7);
        if (remainingCells < 7) {
            for (let i = 0; i < remainingCells; i++) {
                days.push(null);
            }
        }

        return days;
    };

    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const handleDateClick = (day: number) => {
        const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setSelectedDate(selected);
    };

    const isToday = (day: number) => {
        const today = new Date();
        return day === today.getDate() &&
               currentDate.getMonth() === today.getMonth() &&
               currentDate.getFullYear() === today.getFullYear();
    };

    const isSelected = (day: number) => {
        if (!selectedDate) return false;
        return day === selectedDate.getDate() &&
               currentDate.getMonth() === selectedDate.getMonth() &&
               currentDate.getFullYear() === selectedDate.getFullYear();
    };

    const calendarDays = generateCalendarDays();

    return (
        <div>
            <Header />
            <section className={styles.reservatie}>
                <h2>Reservatie</h2>
                <p>Voor het maken van een reservatie of afspraak kan via onderstaande agenda. <em>Zijn er problemen kan u mij contacteren via via email: <Link href="mailto:&#105;&#110;&#102;&#111;&#64;&#118;&#105;&#103;&#105;&#108;&#105;&#115;&#108;&#97;&#119;&#99;&#111;&#110;&#115;&#117;&#108;&#116;&#46;&#98;&#101;?subject=Probleem met afspraak te maken via website">&#105;&#110;&#102;&#111;&#64;&#118;&#105;&#103;&#105;&#108;&#105;&#115;&#108;&#97;&#119;&#99;&#111;&#110;&#115;&#117;&#108;&#116;.&#98;&#101;</Link></em></p>
            
                <div className={styles.calendarContainer}>
                    <div className={styles.calendarHeader}>
                        <button onClick={previousMonth} className={styles.navButton}>&lt;</button>
                        <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                        <button onClick={nextMonth} className={styles.navButton}>&gt;</button>
                    </div>
                    
                    <div className={styles["grid-container"]}>
                        <div className={styles["grid-header"]}>
                            <div className={styles["grid-item"]}>Maandag</div>
                            <div className={styles["grid-item"]}>Dinsdag</div>
                            <div className={styles["grid-item"]}>Woensdag</div>
                            <div className={styles["grid-item"]}>Donderdag</div>
                            <div className={styles["grid-item"]}>Vrijdag</div>
                            <div className={styles["grid-item"]}>Zaterdag</div>
                            <div className={styles["grid-item"]}>Zondag</div>
                        </div>
                        <div className={styles.calendarGrid}>
                            {calendarDays.map((day, index) => (
                                <div 
                                    key={index} 
                                    className={`${styles["grid-item"]} ${styles.dayCell} ${
                                        day === null ? styles.emptyDay : ''
                                    } ${
                                        day && isToday(day) ? styles.today : ''
                                    } ${
                                        day && isSelected(day) ? styles.selected : ''
                                    }`}
                                    onClick={() => day && handleDateClick(day)}
                                >
                                    {day}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            
            </section>
            <Footer />
        </div>
    );
}