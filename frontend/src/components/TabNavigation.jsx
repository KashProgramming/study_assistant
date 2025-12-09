import { Link, useLocation } from 'react-router-dom';
import './TabNavigation.css';

function TabNavigation() {
    const location = useLocation();

    const tabs = [
        { path: '/notes', label: 'Notes' },
        { path: '/flashcards', label: 'Flashcards' },
        { path: '/quiz', label: 'Quiz' },
        { path: '/chatbot', label: 'Chatbot' }
    ];

    return (
        <nav className="tab-navigation">
            {tabs.map(tab => (
                <Link
                    key={tab.path}
                    to={tab.path}
                    className={`tab ${location.pathname === tab.path ? 'active' : ''}`}
                >
                    <span className="tab-icon">{tab.icon}</span>
                    <span className="tab-label">{tab.label}</span>
                </Link>
            ))}
        </nav>
    );
}

export default TabNavigation;
