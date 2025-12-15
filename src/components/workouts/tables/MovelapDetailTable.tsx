import React from 'react';

interface MovelapDetailTableProps {
  moveframe: any;
  onEditMovelap?: (movelap: any) => void;
  onDeleteMovelap?: (movelap: any) => void;
  onAddMovelap?: () => void;
}

export default function MovelapDetailTable({ 
  moveframe, 
  onEditMovelap, 
  onDeleteMovelap, 
  onAddMovelap 
}: MovelapDetailTableProps) {
  const movelaps = moveframe.movelaps || [];
  const moveframeLetter = moveframe.letter || 'A'; // Parent moveframe letter
  
  return (
    <div className="bg-gray-50 p-2">
      <table className="w-full border-collapse text-xs">
        <thead className="bg-gray-200">
          <tr>
            <th className="border border-gray-300 px-2 py-1 text-[10px]">Rep</th>
            <th className="border border-gray-300 px-2 py-1 text-[10px]">Distance</th>
            <th className="border border-gray-300 px-2 py-1 text-[10px]">Speed</th>
            <th className="border border-gray-300 px-2 py-1 text-[10px]">Style</th>
            <th className="border border-gray-300 px-2 py-1 text-[10px]">Pace</th>
            <th className="border border-gray-300 px-2 py-1 text-[10px]">Time</th>
            <th className="border border-gray-300 px-2 py-1 text-[10px]">Pause</th>
            <th className="border border-gray-300 px-2 py-1 text-[10px]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {movelaps.map((movelap: any) => (
            <tr key={movelap.id} className="hover:bg-gray-100">
              <td className="border border-gray-300 px-2 py-1 text-center font-bold text-xs">
                {moveframeLetter}{movelap.repetitionNumber}
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center text-xs">{movelap.distance || '—'}</td>
              <td className="border border-gray-300 px-2 py-1 text-center text-xs">{movelap.speed || '—'}</td>
              <td className="border border-gray-300 px-2 py-1 text-center text-xs">{movelap.style || '—'}</td>
              <td className="border border-gray-300 px-2 py-1 text-center text-xs">{movelap.pace || '—'}</td>
              <td className="border border-gray-300 px-2 py-1 text-center text-xs">{movelap.time || '—'}</td>
              <td className="border border-gray-300 px-2 py-1 text-center text-xs">{movelap.pause || '—'}</td>
              <td className="border border-gray-300 px-1 py-1 text-center">
                <div className="flex items-center justify-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onEditMovelap) onEditMovelap(movelap);
                    }}
                    className="px-1 py-0.5 text-[9px] bg-blue-500 text-white rounded hover:bg-blue-600"
                    title="Edit movelap"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onDeleteMovelap) {
                        if (confirm(`Delete ${moveframeLetter}${movelap.repetitionNumber}?`)) {
                          onDeleteMovelap(movelap);
                        }
                      }
                    }}
                    className="px-1 py-0.5 text-[9px] bg-red-500 text-white rounded hover:bg-red-600"
                    title="Delete movelap"
                  >
                    Del
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {onAddMovelap && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddMovelap();
          }}
          className="mt-2 px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
        >
          + Add Movelap
        </button>
      )}
    </div>
  );
}

