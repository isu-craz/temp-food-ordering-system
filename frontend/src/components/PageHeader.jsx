import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Standardized Page Header Banner Component
 * Ensures uniform 200px min-height, padding, dark theme, and container alignment across all dashboard portals.
 */
export default function PageHeader({
  badgeIcon: BadgeIcon,
  badgeText,
  badgeColor = 'bg-orange-600/90',
  title,
  description,
  switcherTabs = [],
  children,
}) {
  return (
    <div className="bg-stone-900 text-white p-6 sm:px-8 sm:py-6 rounded-3xl shadow-xl mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:min-h-[200px]">
      {/* Left Column: Badge, Title & Subtitle */}
      <div>
        {badgeText && (
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-wider mb-3 ${badgeColor}`}
          >
            {BadgeIcon && <BadgeIcon className="w-4 h-4" />}
            <span>{badgeText}</span>
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{title}</h1>
        {description && <p className="text-xs sm:text-sm text-stone-400 mt-1">{description}</p>}
      </div>

      {/* Right Column: Role Switcher Tabs & Additional Header Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        {switcherTabs && switcherTabs.length > 0 && (
          <div className="flex items-center gap-1.5 bg-stone-800 border border-stone-700 p-1.5 rounded-2xl">
            {switcherTabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <Link
                  key={tab.to || tab.label}
                  to={tab.to}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    tab.active
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
                  }`}
                >
                  {TabIcon && <TabIcon className={`w-4 h-4 ${tab.active ? 'text-white' : 'text-orange-400'}`} />}
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
