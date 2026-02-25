import { notifications } from '../data/mockData';
import './Notifications.css';

const typeConfig = {
    mamma: { label: 'Mamma', className: 'notif--mamma' },
    papa: { label: 'Papà', className: 'notif--papa' },
    partner: { label: 'Partner', className: 'notif--partner' },
    medical: { label: 'Medico', className: 'notif--medical' },
};

export default function Notifications() {
    const today = notifications.filter((n) => n.date === 'Oggi');
    const yesterday = notifications.filter((n) => n.date === 'Ieri');

    const renderNotification = (notif) => {
        const config = typeConfig[notif.type];
        return (
            <article
                key={notif.id}
                className={`notif ${config.className} ${notif.read ? 'notif--read' : ''}`}
            >
                <div className="notif__indicator" />
                <div className="notif__icon">{notif.icon}</div>
                <div className="notif__content">
                    <div className="notif__top">
                        <h4 className="notif__title">{notif.title}</h4>
                        <span className="notif__time">{notif.time}</span>
                    </div>
                    <p className="notif__message">{notif.message}</p>
                    <span className={`notif__tag notif__tag--${notif.type}`}>{config.label}</span>
                </div>
            </article>
        );
    };

    return (
        <div className="page notif-page page-enter">
            <header className="notif-header">
                <h1 className="notif-header__title">Notifiche</h1>
                <span className="notif-header__badge">
                    {notifications.filter((n) => !n.read).length}
                </span>
            </header>

            {/* Legend */}
            <div className="notif-legend">
                <span className="notif-legend__item notif-legend__item--mamma">Mamma</span>
                <span className="notif-legend__item notif-legend__item--papa">Papà</span>
                <span className="notif-legend__item notif-legend__item--partner">Partner</span>
                <span className="notif-legend__item notif-legend__item--medical">Medico</span>
            </div>

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
