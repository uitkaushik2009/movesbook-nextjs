import { Eye, EyeOff } from 'lucide-react';

interface DisplayOptionsToolbarProps {
  showAdBanner: boolean;
  showPersonalBanner: boolean;
  showLeftSidebar: boolean;
  showRightSidebar: boolean;
  showToolbar: boolean;
  onToggleAdBanner: (value: boolean) => void;
  onTogglePersonalBanner: (value: boolean) => void;
  onToggleLeftSidebar: (value: boolean) => void;
  onToggleRightSidebar: (value: boolean) => void;
  onToggleToolbar: (value: boolean) => void;
}

export default function DisplayOptionsToolbar({
  showAdBanner,
  showPersonalBanner,
  showLeftSidebar,
  showRightSidebar,
  showToolbar,
  onToggleAdBanner,
  onTogglePersonalBanner,
  onToggleLeftSidebar,
  onToggleRightSidebar,
  onToggleToolbar
}: DisplayOptionsToolbarProps) {
  return (
    <div className={`bg-white border-b px-4 py-2 transition-all duration-300 ${showToolbar ? '' : 'overflow-hidden'}`}>
      <div className={`flex items-center justify-between flex-wrap gap-2 transition-all duration-300 ${showToolbar ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="flex items-center gap-4 flex-wrap">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showAdBanner}
              onChange={(e) => onToggleAdBanner(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="flex items-center gap-1">
              {showAdBanner ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              Advertising Banner
            </span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showPersonalBanner}
              onChange={(e) => onTogglePersonalBanner(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="flex items-center gap-1">
              {showPersonalBanner ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              Personal Banner & Picture
            </span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showLeftSidebar}
              onChange={(e) => onToggleLeftSidebar(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="flex items-center gap-1">
              {showLeftSidebar ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              Left Sidebar
            </span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showRightSidebar}
              onChange={(e) => onToggleRightSidebar(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="flex items-center gap-1">
              {showRightSidebar ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              Right Sidebar
            </span>
          </label>
        </div>
      </div>
      {/* Toggle button - always visible */}
      <div className="flex items-center justify-end py-1">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={showToolbar}
            onChange={(e) => onToggleToolbar(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="flex items-center gap-1 text-gray-600">
            {showToolbar ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span className="font-medium">Display Options</span>
          </span>
        </label>
      </div>
    </div>
  );
}

