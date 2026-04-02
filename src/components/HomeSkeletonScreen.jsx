import './HomeSkeletonScreen.css';

// Primitivi skeleton
const Sk = {
    Box: ({ w, h, r = 12, className = '' }) => (
        <div className={`sk-box ${className}`} style={{ width: w, height: h, borderRadius: r }} />
    ),
    Text: ({ w = '100%', h = 14, className = '' }) => (
        <div className={`sk-box ${className}`} style={{ width: w, height: h, borderRadius: 6 }} />
    ),
    Circle: ({ size = 40 }) => (
        <div className="sk-box" style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0 }} />
    ),
};

export default function HomeSkeletonScreen() {
    return (
        <div className="hsk">
            {/* Header */}
            <div className="hsk__header">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <Sk.Text w={100} h={12} />
                    <Sk.Text w={160} h={22} />
                </div>
                <Sk.Circle size={40} />
            </div>

            {/* Timeframe pill */}
            <div className="hsk__section">
                <Sk.Box w={140} h={32} r={20} />
            </div>

            {/* Mood strip */}
            <div className="hsk__mood-strip">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="hsk__mood-item">
                        <Sk.Circle size={48} />
                        <Sk.Text w={36} h={10} />
                    </div>
                ))}
            </div>

            {/* Due tracker cards */}
            <div className="hsk__cards-row">
                <div className="hsk__card hsk__card--tall">
                    <Sk.Text w={80} h={12} />
                    <Sk.Text w={40} h={32} className="sk-mt-8" />
                    <div className="hsk__dots-row">
                        {[...Array(8)].map((_, i) => <div key={i} className="sk-box sk-dot" />)}
                    </div>
                </div>
                <div className="hsk__card hsk__card--tall">
                    <Sk.Text w={80} h={12} />
                    <Sk.Text w={40} h={32} className="sk-mt-8" />
                    <div className="hsk__dots-row">
                        {[...Array(10)].map((_, i) => <div key={i} className="sk-box sk-dot" />)}
                    </div>
                </div>
            </div>

            {/* Task progress card */}
            <div className="hsk__card hsk__card--wide">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                        <Sk.Text w={80} h={12} />
                        <Sk.Text w={140} h={18} />
                    </div>
                    <Sk.Circle size={44} />
                </div>
                <div className="hsk__progress-bar">
                    <div className="sk-box hsk__progress-fill" style={{ width: '40%' }} />
                </div>
            </div>

            {/* Partner card */}
            <div className="hsk__card hsk__card--wide">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Sk.Circle size={48} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <Sk.Text w={100} h={14} />
                        <Sk.Text w={160} h={12} />
                    </div>
                </div>
            </div>

            {/* Tip card */}
            <div className="hsk__card hsk__card--wide hsk__card--short">
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <Sk.Box w={44} h={44} r={12} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <Sk.Text w="90%" h={13} />
                        <Sk.Text w="70%" h={13} />
                    </div>
                </div>
            </div>
        </div>
    );
}
