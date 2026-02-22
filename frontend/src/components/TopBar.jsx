import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';
import NotificationPanel from './NotificationPanel';
import { Bell, UserCircle, ChevronDown, LogOut } from 'lucide-react';
import api from '../services/api';

const TopBar = ({ title }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const profileRef = useRef(null);

    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const response = await api.get('/notifications/');
                if (response.data.success) {
                    const notifications = response.data.data || [];
                    setUnreadCount(notifications.filter(n => !n.is_read).length);
                }
            } catch (err) {
                // silent fail
            }
        };
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClick = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setIsProfileOpen(false);
            }
        };
        if (isProfileOpen) document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [isProfileOpen]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            <header className="h-12 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-6 shrink-0">
                {/* Left: Title */}
                <h1 className="text-lg font-semibold text-[#111827] truncate md:ml-0 ml-10">
                    {title}
                </h1>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    {/* Notification bell */}
                    <button
                        onClick={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
                        className="relative p-2 text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB] rounded-md transition-colors"
                    >
                        <Bell className="w-[18px] h-[18px]" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 bg-[#DC2626] text-white text-[10px] font-medium rounded-full h-4 w-4 flex items-center justify-center">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Profile dropdown */}
                    <div ref={profileRef} className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-1.5 px-2 py-1.5 text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB] rounded-md transition-colors"
                        >
                            <UserCircle className="w-[18px] h-[18px]" />
                            <span className="text-sm hidden sm:inline">{user?.name?.split(' ')[0] || 'User'}</span>
                            <ChevronDown className="w-3.5 h-3.5" />
                        </button>

                        {isProfileOpen && (
                            <div className="absolute right-0 mt-1 w-44 bg-white border border-[#E5E7EB] rounded-lg py-1 z-50">
                                <button
                                    onClick={() => { navigate('/profile'); setIsProfileOpen(false); }}
                                    className="w-full text-left px-3 py-2 text-sm text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]"
                                >
                                    Edit Profile
                                </button>
                                <div className="border-t border-[#E5E7EB] my-1" />
                                <button
                                    onClick={() => { handleLogout(); setIsProfileOpen(false); }}
                                    className="w-full text-left px-3 py-2 text-sm text-[#DC2626] hover:bg-[#FEF2F2] flex items-center gap-2"
                                >
                                    <LogOut className="w-3.5 h-3.5" />
                                    Sign out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <NotificationPanel
                isOpen={isNotificationPanelOpen}
                onClose={() => setIsNotificationPanelOpen(false)}
                onNotificationUpdate={() => {
                    const fetchCount = async () => {
                        try {
                            const response = await api.get('/notifications/');
                            if (response.data.success) {
                                const notifications = response.data.data || [];
                                setUnreadCount(notifications.filter(n => !n.is_read).length);
                            }
                        } catch (err) { /* silent */ }
                    };
                    fetchCount();
                }}
            />
        </>
    );
};

export default TopBar;
