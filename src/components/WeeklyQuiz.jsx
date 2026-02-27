import { useState } from 'react';
import { Brain } from 'lucide-react';
import { weeklyQuizzes } from '../data/discoveryData';
import './WeeklyQuiz.css';

export default function WeeklyQuiz({ week = 24 }) {
    // Find the closest quiz for the current week
    const quizWeeks = Object.keys(weeklyQuizzes).map(Number).sort((a, b) => a - b);
    const closestWeek = quizWeeks.reduce((prev, curr) =>
        Math.abs(curr - week) < Math.abs(prev - week) ? curr : prev
    );
    const quiz = weeklyQuizzes[closestWeek];

    const [selected, setSelected] = useState(null);
    const [revealed, setRevealed] = useState(false);

    if (!quiz) return null;

    const handleSelect = (index) => {
        if (revealed) return;
        setSelected(index);
        setTimeout(() => setRevealed(true), 400);
    };

    const isCorrect = selected === quiz.correct;

    return (
        <div className="wquiz">
            <div className="wquiz__header">
                <span className="wquiz__badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Brain size={14} /> Quiz settimanale
                </span>
            </div>

            <div className={`wquiz__card ${revealed ? (isCorrect ? 'wquiz__card--correct' : 'wquiz__card--wrong') : ''}`}>
                <span className="wquiz__emoji">{quiz.emoji}</span>
                <p className="wquiz__question">{quiz.question}</p>

                <div className="wquiz__options">
                    {quiz.options.map((option, i) => {
                        let stateClass = '';
                        if (revealed && i === quiz.correct) stateClass = 'wquiz__option--correct';
                        else if (revealed && i === selected && i !== quiz.correct) stateClass = 'wquiz__option--wrong';
                        else if (i === selected && !revealed) stateClass = 'wquiz__option--selected';

                        return (
                            <button
                                key={i}
                                className={`wquiz__option ${stateClass}`}
                                onClick={() => handleSelect(i)}
                                disabled={revealed}
                            >
                                <span className="wquiz__option-letter">
                                    {String.fromCharCode(65 + i)}
                                </span>
                                <span className="wquiz__option-text">{option}</span>
                                {revealed && i === quiz.correct && (
                                    <span className="wquiz__option-icon">✓</span>
                                )}
                                {revealed && i === selected && i !== quiz.correct && (
                                    <span className="wquiz__option-icon">✗</span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {revealed && (
                    <div className={`wquiz__result ${isCorrect ? 'wquiz__result--correct' : 'wquiz__result--wrong'}`}>
                        <span className="wquiz__result-emoji">
                            {isCorrect ? '🎉' : '💡'}
                        </span>
                        <div>
                            <p className="wquiz__result-title">
                                {isCorrect ? 'Esatto!' : 'Quasi!'}
                            </p>
                            <p className="wquiz__result-text">{quiz.explanation}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
