
import React, { useState, useEffect, ReactElement } from 'react';
import { cn } from '@/lib/utils';
import { ComponentConfig } from '@/types/api';

interface GridLayoutProps {
  components: ComponentConfig[];
  onComponentsChange: (components: ComponentConfig[]) => void;
  editable?: boolean;
  children: React.ReactNode;
}

interface ExtendedElementProps {
  draggable?: boolean;
  onDragStart?: () => void;
  style?: React.CSSProperties;
  className?: string;
  id?: string;
}

export function GridLayout({
  components,
  onComponentsChange,
  editable = false,
  children
}: GridLayoutProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [positions, setPositions] = useState<Record<string, { x: number, y: number }>>({});
  
  useEffect(() => {
    // Initialize positions from components
    const newPositions: Record<string, { x: number, y: number }> = {};
    components.forEach(comp => {
      newPositions[comp.id] = { x: comp.x, y: comp.y };
    });
    setPositions(newPositions);
  }, [components]);

  const handleDragStart = (id: string) => {
    if (!editable) return;
    setDraggingId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!draggingId || !editable) return;
    
    const gridRect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor((e.clientX - gridRect.left) / 100) * 100;
    const y = Math.floor((e.clientY - gridRect.top) / 100) * 100;
    
    // Update positions
    setPositions(prev => ({
      ...prev,
      [draggingId]: { x, y }
    }));
    
    // Update components positions
    const updatedComponents = components.map(comp => {
      if (comp.id === draggingId) {
        return { ...comp, x, y };
      }
      return comp;
    });
    
    onComponentsChange(updatedComponents);
    setDraggingId(null);
  };

  return (
    <div 
      className="relative min-h-screen w-full bg-background/50"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Grid background pattern */}
      {editable && (
        <div className="absolute inset-0 grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] grid-rows-[repeat(auto-fill,minmax(100px,1fr))] opacity-10 pointer-events-none">
          {Array.from({ length: 100 }).map((_, i) => (
            <div key={i} className="border border-primary/20"></div>
          ))}
        </div>
      )}
      
      {/* Actual components */}
      <div className="relative w-full h-full">
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return null;
          
          const id = child.props.id || child.props.config?.id;
          if (!id || !positions[id]) return null;
          
          return React.cloneElement(child as ReactElement<ExtendedElementProps>, {
            draggable: editable,
            onDragStart: () => handleDragStart(id),
            style: {
              position: 'absolute',
              left: `${positions[id].x}px`,
              top: `${positions[id].y}px`,
              cursor: editable ? 'grab' : 'default',
              zIndex: draggingId === id ? 10 : 1,
            },
            className: cn(
              child.props.className,
              editable && "transition-shadow hover:shadow-lg"
            )
          });
        })}
      </div>
    </div>
  );
}
