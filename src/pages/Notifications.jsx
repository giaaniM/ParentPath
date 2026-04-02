import { useUser } from '../context/UserContext';
import { notifications as mockNotifications } from '../data/mockData';
import StickyBackButton from '../components/StickyBackButton';
import './Notifications.css';

const typeConfig = {
    mamma: { label: 'Mamma', className: 'notif--mamma' },
    papa: { label: 'Papà', className: 'notif--papa' },
    partner: { label: 'Partner', className: 'notif--partner' },
    medical: { label: 'Medico', className: 'notif--medical' },
    system: { label: 'Sistema', className: 'notif--mamma' }, // Fallback color
};

export default function Notifications() {
    const { realtimeNotifications, partnerId, isDevUser } = useUser();

    // Costruzione dinamica dell'array notifiche
    let displayNotifs = [];

    if (isDevUser) {
        // Se è utente dev/mock, mostriamo tutto il mockData
        displayNotifs = mockNotifications;
    } else {
        // Altrimenti usiamo i dati reali dal database
        displayNotifs = [...(realtimeNotifications || [])];

        // Se l'utente non ha notifiche, dà un benvenuto default
        if (displayNotifs.length === 0) {
            displayNotifs.push({
                id: 'welcome-1',
                type: 'system',
                icon: '👋',
                title: 'Benvenuto in ParentPath!',
                message: 'Qui riceverai gli aggiornamenti settimanali e i segnali dal tuo partner.',
                time: 'Oggi',
                read: false,
                date: 'Oggi'
            });
        }

        // Se l'utente non ha partner accoppiato
        if (!partnerId) {
            displayNotifs.unshift({
                id: 'invite-partner',
                type: 'partner',
                icon: '💌',
                title: 'Invita il tuo partner',
                message: 'Usa il codice dalla rotellina Impostazioni per condividere questa esperienza!',
                time: 'Azione richiesta',
                read: false,
                date: 'In Evidenza'
            });
        }
    }

    const inEvidenza = displayNotifs.filter((n) => n.date === 'In Evidenza');
    const today = displayNotifs.filter((n) => n.date === 'Oggi' || !n.date);
    const yesterday = displayNotifs.filter((n) => n.date === 'Ieri');

    const renderNotification = (notif) => {
        const config = typeConfig[notif.type] || typeConfig.system;
        return (
            <article
                key={notif.id}
                className={`notif glass ${config.className} ${notif.read ? 'notif--read' : ''}`}
            >
                <div className="notif__indicator" />
                <div className="notif__icon">{notif.icon}</div>
                <div className="notif__content">
                    <div className="notif__top">
                        <h4 className="notif__title">{notif.title}</h4>
                        <span className="notif__time">{notif.time || ''}</span>
                    </div>
                    <p className="notif__message">{notif.message}</p>
                    <span className={`notif__tag notif__tag--${notif.type}`}>{config.label}</span>
                </div>
            </article>
        );
    };

    return (
        <div className="page notif-page page-enter">
            <StickyBackButton />
            <header className="notif-header">
                <h1 className="notif-header__title">Notifiche</h1>
                <span className="notif-header__badge">
                    {displayNotifs.filter((n) => !n.read).length}
                </span>
            </header>

            {/* Legend */}
            <div className="notif-legend">
                <span className="notif-legend__item notif-legend__item--mamma">Mamma</span>
                <span className="notif-legend__item notif-legend__item--papa">Papà</span>
                <span className="notif-legend__item notif-legend__item--partner">Partner</span>
                <span className="notif-legend__item notif-legend__item--medical">Medico</span>
            </div>

            {/* In evidenza */}
            {inEvidenza.length > 0 && (
                <section className="notif-group">
                    <h3 className="notif-group__title">Azioni Richieste</h3>
                    <div className="notif-group__list">
                        {inEvidenza.map(renderNotification)}
                    </div>
                </section>
            )}

            {/* Today */}
            {today.length > 0 && (
                <section className="notif-group">
                    <h3 className="notif-group__title">Oggi</h3>
                    <div className="notif-group__list">
                        {today.map(renderNotification)}
                    </div>
                </section>
            )}

            {/* Yesterday */}
            {yesterday.length > 0 && (
                <section className="notif-group">
                    <h3 className="notif-group__title">Ieri</h3>
                    <div className="notif-group__list">
                        {yesterday.map(renderNotification)}
                    </div>
                </section>
            )}
        </div>
    );
}
