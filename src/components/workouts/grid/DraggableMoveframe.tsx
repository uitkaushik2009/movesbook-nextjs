'use client';

import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { ChevronRight, ChevronDown, GripVertical } from 'lucide-react';

interface DraggableMoveframeProps {
  moveframe: any;
  workout: any;
  day: any;
  isExpanded: boolean;
  colors: any;
  onToggle: () => void;
  children: React.ReactNode;
  moveframeContent: React.ReactNode;
}

export function DraggableMoveframe({
  moveframe,
  workout,
  day,
  isExpanded,
  colors,
  onToggle,
  children,
  moveframeContent
}: DraggableMoveframeProps) {
  const { attributes, listeners, setNodeRef: setDragRef, isDragging, transform } = useDraggable({
    id: `moveframe-grid-${moveframe.id}`,
    data: {
      type: 'moveframe',
      moveframe,
      workout,
      day,
    },
  });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `moveframe-grid-drop-${moveframe.id}`,
    data: {
      type: 'moveframe',
      moveframe,
      workout,
      day,
    },
  });

  return (
    <div 
      ref={setDropRef}
      className={`border rounded-lg relative ${
        isDragging ? 'opacity-50' : ''
      } ${
        isOver ? 'ring-2 ring-yellow-400 bg-yellow-50' : ''
      }`}
      style={{
        borderColor: colors.moveframeHeaderText,
        overflow: 'visible',
        transform: CSS.Transform.toString(transform)
      }}
    >
      {/* Moveframe Row */}
      <div 
        ref={setDragRef}
        className="p-2 bg-white hover:bg-yellow-50 cursor-pointer flex items-center gap-2"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      >
        {/* Drag Handle */}
        <span
          {...attributes}
          {...listeners}
          className="cursor-move text-gray-600 hover:text-gray-800 transition-colors"
          onClick={(e) => e.stopPropagation()}
          title="Drag to move moveframe"
        >
          <GripVertical size={14} />
        </span>
        
        {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        
        {moveframeContent}
        
        {isOver && <span className="ml-auto text-yellow-600 text-xs font-semibold">📥 Drop Here</span>}
      </div>

      {/* Expanded Content */}
      {children}
    </div>
  );
}

