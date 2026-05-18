import { Archive, BarChart2, Calendar, Home, Menu, Sliders, Star, Sun, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Sidebar({ activeFilter, onSelectFilter }) {
    const [collapsed, setCollapsed] = useState(false);
    const [appVersion, setAppVersion] = useState('');

    useEffect(() => {
        window.electronAPI?.getVersion().then(setAppVersion).catch(() => {});
    }, []);

    const navItems = [
        { id: 'my-day', label: 'My Day', icon: Sun, color: '#ca8a04' },      // text-yellow-600
        { id: 'important', label: 'Important', icon: Star, color: '#e11d48' }, // text-rose-600
        { id: 'urgent', label: 'Urgent', icon: Zap, color: '#f59e0b' }, // text-amber-500
        { id: 'planned', label: 'Planned', icon: Calendar, color: '#0891b2' }, // text-cyan-600
        { id: 'all', label: 'Tasks', icon: Home, color: '#2563eb' },           // text-blue-600
        { id: 'archive', label: 'Archive', icon: Archive, color: '#6b7280' }, // text-gray-500
        { id: 'analytics', label: 'Analytics', icon: BarChart2, color: '#059669' }, // text-emerald-600
    ];

    return (
        <div className={`sidebar ${collapsed ? 'collapsed' : ''}`} style={{ width: collapsed ? '60px' : 'var(--sidebar-width)', transition: 'width 0.2s' }}>
            <div style={{ height: '52px', display: 'flex', alignItems: 'center', padding: collapsed ? '0 0.5rem' : '0 1.5rem', justifyContent: collapsed ? 'center' : 'flex-start' }}>
                <Menu
                    style={{ color: '#6b7280', cursor: 'pointer', padding: '0.25rem', borderRadius: '0.25rem', transition: 'background-color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    size={28}
                    onClick={() => setCollapsed(!collapsed)}
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', padding: '0.5rem 0', flex: 1, gap: '0.25rem' }}>
                {navItems.map(item => (
                    <div
                        key={item.id}
                        className={`nav-item ${activeFilter === item.id ? 'active' : ''}`}
                        style={{ justifyContent: collapsed ? 'center' : 'flex-start', padding: '12px 16px' }}
                        onClick={() => onSelectFilter(item.id)}
                        title={collapsed ? item.label : ''}
                    >
                        <item.icon size={20} style={{ color: item.color }} />
                        {!collapsed && <span>{item.label}</span>}
                    </div>
                ))}
            </div>

            <div style={{ padding: '0.5rem 0', borderTop: '1px solid var(--border-light)', marginTop: 'auto' }}>
                <div
                    className={`nav-item ${activeFilter === 'settings' ? 'active' : ''}`}
                    style={{ justifyContent: collapsed ? 'center' : 'flex-start', padding: '12px 16px' }}
                    onClick={() => onSelectFilter('settings')}
                    title={collapsed ? 'Settings' : ''}
                >
                    <Sliders size={20} style={{ color: '#6b7280' }} />
                    {!collapsed && <span>Settings</span>}
                </div>
                {!collapsed && appVersion && (
                    <div style={{ padding: '6px 16px', fontSize: '11px', color: '#9ca3af', userSelect: 'none' }}>
                        v{appVersion}
                    </div>
                )}
            </div>
        </div>
    );
}
