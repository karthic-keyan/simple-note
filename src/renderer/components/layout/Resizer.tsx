import React, { useCallback, useEffect, useRef, useState } from 'react';

interface ResizerProps {
  onResize: (newWidth: number) => void;
  onResizeEnd: (finalWidth: number) => void;
  currentWidth: number;
  minWidth?: number;
  maxWidth?: number;
  defaultWidth?: number;
  direction?: 'left' | 'right';
}

export const Resizer: React.FC<ResizerProps> = ({
  onResize,
  onResizeEnd,
  currentWidth,
  minWidth = 180,
  maxWidth = 500,
  defaultWidth,
  direction = 'right',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragInfoRef = useRef<{ startX: number; startWidth: number; latestWidth: number }>({
    startX: 0,
    startWidth: currentWidth,
    latestWidth: currentWidth,
  });

  const onResizeRef = useRef(onResize);
  const onResizeEndRef = useRef(onResizeEnd);

  useEffect(() => {
    onResizeRef.current = onResize;
    onResizeEndRef.current = onResizeEnd;
  });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    dragInfoRef.current = {
      startX: e.clientX,
      startWidth: currentWidth,
      latestWidth: currentWidth,
    };

    setIsDragging(true);
  }, [currentWidth]);

  const handleDoubleClick = useCallback(() => {
    if (defaultWidth !== undefined) {
      onResizeRef.current(defaultWidth);
      onResizeEndRef.current(defaultWidth);
    }
  }, [defaultWidth]);

  useEffect(() => {
    if (!isDragging) return;

    // Apply global drag styles to prevent text selection and keep col-resize cursor
    const originalCursor = document.body.style.cursor;
    const originalUserSelect = document.body.style.userSelect;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (e: MouseEvent) => {
      const { startX, startWidth } = dragInfoRef.current;
      const delta = direction === 'right' ? (e.clientX - startX) : (startX - e.clientX);
      const targetWidth = Math.round(startWidth + delta);
      const clampedWidth = Math.max(minWidth, Math.min(maxWidth, targetWidth));

      dragInfoRef.current.latestWidth = clampedWidth;
      onResizeRef.current(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      onResizeEndRef.current(dragInfoRef.current.latestWidth);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.body.style.cursor = originalCursor;
      document.body.style.userSelect = originalUserSelect;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, minWidth, maxWidth, direction]);

  return (
    <>
      <div
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        title="Drag to resize, double-click to reset"
        className={`w-1 hover:w-1.5 cursor-col-resize z-20 flex-shrink-0 transition-all duration-75 relative group select-none ${
          isDragging ? 'bg-blue-500 w-1.5' : 'bg-transparent hover:bg-blue-500/50'
        }`}
      >
        <div className="absolute inset-y-0 -left-1.5 -right-1.5 cursor-col-resize" />
      </div>
      {isDragging && (
        <div className="fixed inset-0 z-50 cursor-col-resize select-none pointer-events-auto" />
      )}
    </>
  );
};
