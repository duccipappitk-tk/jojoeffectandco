import React, { useState } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { SiteSettings } from '../../types';

interface AnnouncementBarProps {
  settings: SiteSettings;
  onNavigate: (route: string) => void;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ settings, onNavigate }) => {
  const [dismissed, setDismissed] = useState(false);

  if (!settings.announcement_bar?.enabled || !settings.announcement_bar?.text || dismissed) {
    return null;
  }

  const handleClick = () => {
    if (settings.announcement_bar.link_url) {
      onNavigate(settings.announcement_bar.link_url);
    }
  };

  return (
    <div className="bg-[#111111] text-white text-xs font-medium tracking-wide py-2 px-4 transition-all border-b border-[#222222]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1 text-center">
          <button
            onClick={handleClick}
            className="inline-flex items-center gap-1.5 hover:text-[#D4AF62] transition-colors cursor-pointer text-center"
          >
            <span>{settings.announcement_bar.text}</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#D4AF62]" />
          </button>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-neutral-400 hover:text-white p-1 rounded transition-colors shrink-0"
          aria-label="Dismiss announcement"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
