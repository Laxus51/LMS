import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, USER_ROLES } from '../contexts/AuthContext';
import {
    LayoutDashboard,
    BookOpen,
    MessageSquare,
    ClipboardList,
    FileText,
    Award,
    Users,
    UserCircle,
    LogOut,
    Crown,
    Menu,
    X,
    FolderPlus
} from 'lucide-react';
import { useState } from 'react';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, userRole, canAccessPremium, canAccessAdmin } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (path) => {
        if (path === '/dashboard') {
            return location.pathname === '/' || location.pathname === '/dashboard';
        }
        if (path === '/mentor/dashboard') {
            return location.pathname.startsWith('/mentor');
        }
        if (path === '/admin/users') {
            return location.pathname.startsWith('/admin');
        }
        return location.pathname.startsWith(path);
    };

    const handleNav = (path) => {
        navigate(path);
        setMobileOpen(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const studentNavItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/courses', label: 'Courses', icon: BookOpen },
        { path: '/tutor-chat', label: 'AI Tutor', icon: MessageSquare },
        { path: '/study-plan', label: 'Study Plan', icon: ClipboardList },
        { path: '/quiz/create', label: 'Quizzes', icon: FileText, activePath: '/quiz' },
    ];

    const mentorNavItems = [
        { path: '/mentor/dashboard', label: 'Mentor Dashboard', icon: LayoutDashboard },
    ];

    const navItems = userRole === USER_ROLES.MENTOR ? mentorNavItems : studentNavItems;

    const NavContent = () => (
        <div className="flex flex-col h-full">
            {/* Brand */}
            <div className="px-4 h-12 flex items-center border-b border-[#E5E7EB] shrink-0">
                <span className="text-base font-semibold text-[#111827]">LMS Platform</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-3 px-2 overflow-y-auto">
                <div className="space-y-0.5">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.activePath || item.path);
                        return (
                            <button
                                key={item.path}
                                onClick={() => handleNav(item.path)}
                                className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors duration-100 ${active
                                        ? 'bg-[#EFF6FF] text-[#2563EB] font-medium border-l-[3px] border-[#2563EB] pl-[9px]'
                                        : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]'
                                    }`}
                            >
                                <Icon className="w-[18px] h-[18px] shrink-0" />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}

                    {/* Premium-only: Mock Exam */}
                    {userRole !== USER_ROLES.MENTOR && canAccessPremium() && (
                        <button
                            onClick={() => handleNav('/mock-exam/create')}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors duration-100 ${isActive('/mock-exam')
                                    ? 'bg-[#EFF6FF] text-[#2563EB] font-medium border-l-[3px] border-[#2563EB] pl-[9px]'
                                    : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]'
                                }`}
                        >
                            <Award className="w-[18px] h-[18px] shrink-0" />
                            <span>Mock Exams</span>
                        </button>
                    )}

                    {/* Mentor Booking / Browse */}
                    {userRole !== USER_ROLES.MENTOR && (
                        <button
                            onClick={() => handleNav('/mentor-booking')}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors duration-100 ${isActive('/mentor-booking') || isActive('/mentor-sessions')
                                    ? 'bg-[#EFF6FF] text-[#2563EB] font-medium border-l-[3px] border-[#2563EB] pl-[9px]'
                                    : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]'
                                }`}
                        >
                            <Users className="w-[18px] h-[18px] shrink-0" />
                            <span>{canAccessPremium() ? 'Find Mentors' : 'Browse Mentors'}</span>
                            {!canAccessPremium() && <Crown className="w-3.5 h-3.5 text-[#D97706] ml-auto" />}
                        </button>
                    )}

                    {/* Mock Exam badge for free users */}
                    {userRole === USER_ROLES.FREE && (
                        <button
                            onClick={() => handleNav('/mock-exam/create')}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827] transition-colors duration-100"
                        >
                            <Award className="w-[18px] h-[18px] shrink-0" />
                            <span>Mock Exams</span>
                            <Crown className="w-3.5 h-3.5 text-[#D97706] ml-auto" />
                        </button>
                    )}
                </div>

                {/* Admin section */}
                {canAccessAdmin() && (
                    <>
                        <div className="mt-5 mb-2 px-3">
                            <span className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider">Admin</span>
                        </div>
                        <div className="space-y-0.5">
                            <button
                                onClick={() => handleNav('/admin/users')}
                                className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors duration-100 ${isActive('/admin/users')
                                        ? 'bg-[#EFF6FF] text-[#2563EB] font-medium border-l-[3px] border-[#2563EB] pl-[9px]'
                                        : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]'
                                    }`}
                            >
                                <Users className="w-[18px] h-[18px] shrink-0" />
                                <span>Manage Users</span>
                            </button>
                            <button
                                onClick={() => handleNav('/admin/courses/create')}
                                className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors duration-100 ${isActive('/admin/courses/create')
                                        ? 'bg-[#EFF6FF] text-[#2563EB] font-medium border-l-[3px] border-[#2563EB] pl-[9px]'
                                        : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]'
                                    }`}
                            >
                                <FolderPlus className="w-[18px] h-[18px] shrink-0" />
                                <span>Create Course</span>
                            </button>
                        </div>
                    </>
                )}

                {/* Pricing for free users */}
                {userRole === USER_ROLES.FREE && (
                    <>
                        <div className="mt-5 mb-2 px-3">
                            <span className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider">Account</span>
                        </div>
                        <button
                            onClick={() => handleNav('/pricing')}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors duration-100 ${isActive('/pricing')
                                    ? 'bg-[#EFF6FF] text-[#2563EB] font-medium border-l-[3px] border-[#2563EB] pl-[9px]'
                                    : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]'
                                }`}
                        >
                            <Crown className="w-[18px] h-[18px] shrink-0" />
                            <span>Upgrade to Premium</span>
                        </button>
                    </>
                )}
            </nav>

            {/* User footer */}
            <div className="border-t border-[#E5E7EB] p-3 shrink-0">
                <button
                    onClick={() => handleNav('/profile')}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827] rounded-md transition-colors duration-100"
                >
                    <UserCircle className="w-[18px] h-[18px] shrink-0" />
                    <div className="flex-1 text-left min-w-0">
                        <div className="text-sm font-medium text-[#111827] truncate">{user?.name || 'User'}</div>
                        <div className="text-xs text-[#9CA3AF] truncate">{user?.email}</div>
                    </div>
                </button>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[#6B7280] hover:bg-[#FEF2F2] hover:text-[#DC2626] rounded-md transition-colors duration-100 mt-0.5"
                >
                    <LogOut className="w-[18px] h-[18px] shrink-0" />
                    <span>Sign out</span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile hamburger */}
            <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden fixed top-3 left-3 z-50 p-2 bg-white border border-[#E5E7EB] rounded-md text-[#6B7280] hover:text-[#111827]"
                aria-label="Open menu"
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/30 z-50"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile sidebar */}
            <aside
                className={`md:hidden fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-[#E5E7EB] transform transition-transform duration-200 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <button
                    onClick={() => setMobileOpen(false)}
                    className="absolute top-3 right-3 p-1 text-[#6B7280] hover:text-[#111827]"
                    aria-label="Close menu"
                >
                    <X className="w-5 h-5" />
                </button>
                <NavContent />
            </aside>

            {/* Desktop sidebar */}
            <aside className="hidden md:flex md:flex-col md:w-60 bg-white border-r border-[#E5E7EB] shrink-0">
                <NavContent />
            </aside>
        </>
    );
};

export default Sidebar;
