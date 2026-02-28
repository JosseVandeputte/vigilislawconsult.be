'use client';

import Footer from '../components/footer';
import Header from '../components/header';
import styles from './reservatie.module.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiUrl } from '@/lib/api-url';


export default function Reservatie() {
    const router = useRouter();
    const [sessionEmail, setSessionEmail] = useState<string | null>(null);
    const [sessionChecked, setSessionChecked] = useState(false);

    useEffect(() => {
        fetch(apiUrl('/api/reservations/me'), { credentials: 'include' })
            .then((res) => {
                if (!res.ok) {
                    router.replace('/reservatie/login');
                    return null;
                }
                return res.json();
            })
            .then((data) => {
                if (data?.email) {
                    setSessionEmail(data.email);
                    setSessionChecked(true);
                }
            })
            .catch(() => {
                router.replace('/reservatie/login');
            });
    }, [router]);

    const handleLogout = async () => {
        await fetch(apiUrl('/api/reservations/logout'), { method: 'POST', credentials: 'include' });
        router.replace('/reservatie/login');
    };

    // ── Reservation state ──────────────────────────────
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [formattedDate, setFormattedDate] = useState<string>('');
    const [startTime, setStartTime] = useState<string>('');
    const [endTime, setEndTime] = useState<string>('');
    const [submitMessage, setSubmitMessage] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const closeModal = () => setShowModal(false);
    const closeAndLogout = async () => {
        setShowModal(false);
        await fetch(apiUrl('/api/reservations/logout'), { method: 'POST', credentials: 'include' });
        router.replace('/reservatie/login');
    };
    const [busySlots, setBusySlots] = useState<Array<{ startTime: string; endTime: string }>>([]);
    const [blockedDays, setBlockedDays] = useState<Set<string>>(new Set());

    const monthNames = [
        'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
        'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
    ];

    const timeSlots = [
        '06:00', '06:30', '07:00', '07:30', '08:00', '08:30',
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
        '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
        '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
        '21:00', '21:30', '22:00', '22:30', '23:00'
    ];

    const timeToMinutes = (time: string) => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
    };

    type SlotRange = { startTime: string; endTime: string };
    type BlockedSlot = SlotRange & { date: string };

    const dateKey = (date: Date) =>
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    const isFullyBlockedDay = (day: number) => {
        const key = dateKey(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
        return blockedDays.has(key);
    };

    const isRangeAvailable = (start: string, end: string) => {
        const startMinutes = timeToMinutes(start);
        const endMinutes = timeToMinutes(end);
        return busySlots.every((slot) => {
            const busyStart = timeToMinutes(slot.startTime);
            const busyEnd = timeToMinutes(slot.endTime);
            return endMinutes <= busyStart || startMinutes >= busyEnd;
        });
    };

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

    const goToToday = () => {
        const today = new Date();
        setCurrentDate(today);
    };

    const handleDateClick = (day: number) => {
        if (isFullyBlockedDay(day)) {
            return;
        }
        const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setSelectedDate(selected);
    };

    const isToday = (day: number) => {
        const today = new Date();
        return day === today.getDate() &&
               currentDate.getMonth() === today.getMonth() &&
               currentDate.getFullYear() === today.getFullYear();
    };

    const isPastOrToday = (day: number) => {
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const compareDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        return compareDate.getTime() <= todayStart.getTime();
    };

    const isPastDay = (day: number) => {
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const compareDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        return compareDate.getTime() < todayStart.getTime();
    };

    const isSelected = (day: number) => {
        if (!selectedDate) return false;
        return day === selectedDate.getDate() &&
               currentDate.getMonth() === selectedDate.getMonth() &&
               currentDate.getFullYear() === selectedDate.getFullYear();
    };

    const goToForm = () => {
        if(selectedDate === null) {
            alert('Gelieve een datum te selecteren voordat u verder gaat.');
            return;
        }

        setFormattedDate(`${selectedDate.getDate().toString().padStart(2, '0')}/${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}/${selectedDate.getFullYear()}`);

        const calendarContainer = document.getElementById('calendarContainer');
        const formContainer = document.getElementById('formContainer');
        if (!calendarContainer || !formContainer) {
            alert('Er is een fout opgetreden. Probeer het opnieuw.');
            return;
        }
        calendarContainer.style.display = 'none';
        formContainer.style.display = 'block';
    }

    const goToCalendar = () => {
        const calendarContainer = document.getElementById('calendarContainer');
        const formContainer = document.getElementById('formContainer');
        if (!calendarContainer || !formContainer) return;
        formContainer.style.display = 'none';
        calendarContainer.style.display = 'block';
    };

    useEffect(() => {
        const fetchBusySlots = async () => {
            if (!selectedDate) {
                setBusySlots([]);
                return;
            }

            setStartTime('');
            setEndTime('');

            const response = await fetch(apiUrl(`/api/reservations?date=${selectedDate.toISOString()}`));
            if (!response.ok) {
                setBusySlots([]);
                return;
            }

            const data = await response.json();
            const reservations: SlotRange[] = data.reservations ?? [];
            const blockedSlots: SlotRange[] = data.blockedSlots ?? [];
            setBusySlots([
                ...reservations.map((item) => ({
                    startTime: item.startTime,
                    endTime: item.endTime
                })),
                ...blockedSlots.map((item) => ({
                    startTime: item.startTime,
                    endTime: item.endTime
                }))
            ]);
        };

        fetchBusySlots();
    }, [selectedDate]);

    useEffect(() => {
        const fetchBlockedDays = async () => {
            const month = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
            const response = await fetch(apiUrl(`/api/reservations?month=${month}`));
            if (!response.ok) {
                setBlockedDays(new Set());
                return;
            }
            const data = await response.json();
            const slots: BlockedSlot[] = data.blockedSlots ?? [];
            const fullDayKeys = new Set<string>();
            slots.forEach((slot) => {
                const startMinutes = timeToMinutes(slot.startTime);
                const endMinutes = timeToMinutes(slot.endTime);
                if (startMinutes <= 0 && endMinutes >= 23 * 60 + 59) {
                    const dateObj = new Date(slot.date);
                    fullDayKeys.add(dateKey(dateObj));
                }
            });
            setBlockedDays(fullDayKeys);
        };

        fetchBlockedDays();
    }, [currentDate]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        setSubmitMessage(null);
        setSubmitError(null);

        if (!selectedDate) {
            setSubmitError('Selecteer een datum voordat u het formulier indient.');
            setShowModal(true);
            return;
        }

        if (!startTime || !endTime) {
            setSubmitError('Selecteer een start- en einduur.');
            setShowModal(true);
            return;
        }

        const formData = new FormData(form);
        const payload = {
            name: String(formData.get('name') ?? ''),
            email: sessionEmail ?? '',
            description: String(formData.get('description') ?? ''),
            date: selectedDate.toISOString(),
            startTime,
            endTime
        };

        setIsSubmitting(true);
        try {
            const response = await fetch(apiUrl('/api/reservations'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const data = await response.json().catch(() => null);
                setSubmitError(data?.error ?? 'Er is iets misgelopen. Probeer opnieuw.');
                setShowModal(true);
                return;
            }

            form.reset();
            setStartTime('');
            setEndTime('');
            setSubmitMessage('Aanvraag ontvangen. U krijgt bericht na goedkeuring. In uw mail ontvangt u ook een overzicht van uw aanvraag.');
            setShowModal(true);
        } catch {
            setSubmitError('Netwerkfout. Controleer uw internetverbinding en probeer opnieuw.');
            setShowModal(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const calendarDays = generateCalendarDays();
    const selectedBlocked = selectedDate ? blockedDays.has(dateKey(selectedDate)) : false;
    const availableStartTimes = selectedBlocked
        ? []
        : timeSlots.filter((slot, index) =>
            timeSlots.slice(index + 1).some((end) => isRangeAvailable(slot, end))
        );
    const endTimeOptions = selectedBlocked
        ? []
        : startTime
            ? timeSlots
                .slice(timeSlots.indexOf(startTime) + 1)
                .filter((end) => isRangeAvailable(startTime, end))
            : timeSlots;

    if (!sessionChecked) return null;

    return (
        <div>
            <Header />
            <section className={styles.reservatie}>
                <h2>Reservatie</h2>
                <div className={styles.sessionBar}>
                    <span>Ingelogd als <strong>{sessionEmail}</strong></span>
                    <button type="button" onClick={handleLogout} className={styles.logoutButton}>Afmelden</button>
                </div>
                <p>Voor het maken van een reservatie of afspraak kan u gebruik maken van onderstaande kalender. <em>Zijn er problemen dan kunt u mij contacteren via email: <Link href="mailto:&#105;&#110;&#102;&#111;&#64;&#118;&#105;&#103;&#105;&#108;&#105;&#115;&#108;&#97;&#119;&#99;&#111;&#110;&#115;&#117;&#108;&#116;&#46;&#98;&#101;?subject=Probleem met afspraak te maken via website">&#105;&#110;&#102;&#111;&#64;&#118;&#105;&#103;&#105;&#108;&#105;&#115;&#108;&#97;&#119;&#99;&#111;&#110;&#115;&#117;&#108;&#116;.&#98;&#101;</Link></em></p>
            
                <div id='calendarContainer' className={styles.calendarContainer}>
                    <div className={styles.calendarHeader}>
                        <button onClick={previousMonth} className={styles.navButton}>&lt;</button>
                        <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                        <button onClick={nextMonth} className={styles.navButton}>&gt;</button>
                    </div>
                    <div className={styles.calendarActions}>
                        <button type="button" onClick={goToToday} className={styles.todayButton}>Vandaag</button>
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
                                    } ${
                                        day && isPastDay(day) ? styles.disabledDay : ''
                                    } ${
                                        day && isFullyBlockedDay(day) ? styles.fullyBlockedDay : ''
                                    }`}
                                    onClick={() => day && !isPastOrToday(day) && !isFullyBlockedDay(day) && handleDateClick(day)}
                                >
                                    {day}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={styles.goFormRow}>
                        <button type="button" onClick={goToForm} className={styles.goFormButton}>Volgende</button>
                    </div>
                </div>

                <div id="formContainer" className={styles.formContainer}>
                    <div className={styles.formBackRow}>
                        <button type="button" onClick={goToCalendar} className={styles.backButton}>&larr; Andere datum</button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <h3>Afspraak maken voor {formattedDate}</h3>
                        <label htmlFor="name">Naam:</label>
                        <input type="text" id="name" name="name" required />

                        <label htmlFor="email">Email:</label>
                        <input type="email" id="email" name="email" required defaultValue={sessionEmail ?? ''} disabled/>

                        <label htmlFor="startTime">Gewenst start uur:</label>
                        <select
                            id="startTime"
                            name="startTime"
                            required
                            value={startTime}
                            onChange={(e) => {
                                const value = e.target.value;
                                setStartTime(value);
                                if (!value) {
                                    setEndTime('');
                                    return;
                                }
                                if (!endTime || !isRangeAvailable(value, endTime)) {
                                    setEndTime('');
                                }
                            }}
                        >
                            <option value="">Selecteer een gewenst start uur</option>
                            {availableStartTimes.map((slot) => (
                                <option key={slot} value={slot}>{slot}</option>
                            ))}
                        </select>

                        <label htmlFor="endTime">Gewenst eind uur:</label>
                        <select
                            id="endTime"
                            name="endTime"
                            required
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                        >
                            <option value="">Selecteer een gewenst eind uur</option>
                            {endTimeOptions.map((slot) => (
                                <option key={slot} value={slot}>{slot}</option>
                            ))}
                        </select>

                        <label htmlFor="description">Beschrijving van de afspraak:</label>
                        <em>
                            Is de tijd die u wilt niet beschrikbaar in bovenstaande lijst? Gelieve dan in het beschrijvingsveld uw gewenste tijdstip te vermelden, en ik zal mijn best doen om hier rekening mee te houden bij het plannen van de afspraak.
                        </em>
                        <textarea id="description" name="description" rows={6} required></textarea>

                        <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                            {isSubmitting ? <><span className={styles.spinner} />Bezig met verzenden...</> : 'Afspraak bevestigen'}
                        </button>
                    </form>
                </div>
            </section>

            {showModal && (submitMessage || submitError) && (
                <div className={styles.modalOverlay} onClick={submitMessage ? closeAndLogout : closeModal}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.modalClose} onClick={submitMessage ? closeAndLogout : closeModal} aria-label="Sluiten">×</button>
                        {submitMessage && (
                            <>
                                <div className={styles.modalIconSuccess}>✓</div>
                                <h3 className={styles.modalTitle}>Aanvraag verzonden</h3>
                                <p className={styles.modalBody}>{submitMessage}</p>
                            </>
                        )}
                        {submitError && (
                            <>
                                <div className={styles.modalIconError}>!</div>
                                <h3 className={`${styles.modalTitle} ${styles.modalTitleError}`}>Er is een fout opgetreden</h3>
                                <p className={styles.modalBody}>{submitError}</p>
                            </>
                        )}
                        <button className={styles.modalActionButton} onClick={submitMessage ? closeAndLogout : closeModal}>Sluiten</button>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}