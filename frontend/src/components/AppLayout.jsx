import Sidebar from './Sidebar';
import TopBar from './TopBar';

const AppLayout = ({ children }) => {
    return (
        <div className="app-layout">
            <Sidebar />
            <div className="app-main">
                {children}
            </div>
        </div>
    );
};

export default AppLayout;
