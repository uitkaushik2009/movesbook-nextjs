import { LucideIcon, ChevronRight } from 'lucide-react';

interface Entity {
  id: string;
  name: string;
  description?: string | null;
  [key: string]: any;
}

interface EntityGridProps {
  entities: Entity[];
  onEntitySelect: (id: string) => void;
  emptyState: {
    icon: LucideIcon;
    title: string;
    description: string;
    buttonLabel: string;
    onButtonClick: () => void;
  };
  renderEntityCard: (entity: Entity) => React.ReactNode;
  createButtonLabel?: string;
  onCreateClick?: () => void;
}

export default function EntityGrid({
  entities,
  onEntitySelect,
  emptyState,
  renderEntityCard,
  createButtonLabel,
  onCreateClick
}: EntityGridProps) {
  const EmptyIcon = emptyState.icon;

  if (entities.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <EmptyIcon className="w-20 h-20 mx-auto mb-6 opacity-60" />
          <p className="text-2xl font-bold mb-2">{emptyState.title}</p>
          <p className="text-lg mb-4">{emptyState.description}</p>
          <button 
            onClick={emptyState.onButtonClick}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
          >
            {emptyState.buttonLabel}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Management Dashboard</h2>
        {onCreateClick && createButtonLabel && (
          <button 
            onClick={onCreateClick}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200"
          >
            {createButtonLabel}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entities.map((entity) => (
          <div
            key={entity.id}
            onClick={() => onEntitySelect(entity.id)}
            className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 cursor-pointer"
          >
            {renderEntityCard(entity)}
          </div>
        ))}
      </div>
    </div>
  );
}

