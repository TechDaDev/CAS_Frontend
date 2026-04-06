'use client';

import { useState } from 'react';
import { UnitTreeNode } from '@/types';

interface OrganizationTreeProps {
  nodes: UnitTreeNode[];
  onSelect?: (node: UnitTreeNode) => void;
  selectedId?: string;
}

function TreeNode({
  node,
  level,
  onSelect,
  selectedId,
}: {
  node: UnitTreeNode;
  level: number;
  onSelect?: (node: UnitTreeNode) => void;
  selectedId?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = node.id === selectedId;

  return (
    <div>
      <div
        className={`flex items-center py-2 px-2 rounded-md cursor-pointer transition-colors ${
          isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-slate-50'
        }`}
        style={{ paddingLeft: `${level * 24 + 8}px` }}
        onClick={() => onSelect?.(node)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="mr-2 h-5 w-5 flex items-center justify-center rounded hover:bg-slate-200"
          >
            <svg
              className={`h-3 w-3 text-slate-500 transition-transform ${
                isExpanded ? '' : '-rotate-90'
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        ) : (
          <span className="mr-2 h-5 w-5" />
        )}
        
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <div>
            <span className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
              {node.name}
            </span>
            <span className="ml-2 text-xs text-slate-500">({node.code})</span>
            <div className="text-xs text-slate-400">{node.unit_type_name}</div>
          </div>
        </div>
      </div>
      
      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function OrganizationTree({ nodes, onSelect, selectedId }: OrganizationTreeProps) {
  if (nodes.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
        <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p className="mt-2 text-sm text-slate-500">No units found</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      {nodes.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          level={0}
          onSelect={onSelect}
          selectedId={selectedId}
        />
      ))}
    </div>
  );
}
