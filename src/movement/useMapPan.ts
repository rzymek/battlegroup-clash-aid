import { useState, useEffect, useCallback, useRef } from 'preact/hooks';
import type { RefObject } from 'preact';

type ViewBox = { x: number; y: number; w: number; h: number };

export function useMapPan(
  svgRef: RefObject<SVGSVGElement>,
  clickHandlerRef: RefObject<(e: MouseEvent) => void>,
  initialVb: ViewBox,
) {
  const [vb, setVb] = useState(initialVb);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ cx: number; cy: number; snap: ViewBox } | null>(null);
  const movedRef = useRef(false);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      const factor = e.deltaY > 0 ? 1.15 : 1 / 1.15;
      setVb(v => {
        const cx = v.x + (e.clientX - rect.left) / rect.width * v.w;
        const cy = v.y + (e.clientY - rect.top) / rect.height * v.h;
        return {
          x: cx + (v.x - cx) * factor,
          y: cy + (v.y - cy) * factor,
          w: v.w * factor,
          h: v.h * factor,
        };
      });
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.cx;
      const dy = e.clientY - dragRef.current.cy;
      if (!movedRef.current && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
        movedRef.current = true;
        setIsDragging(true);
      }
      if (movedRef.current) {
        const svg = svgRef.current;
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        const { snap } = dragRef.current;
        setVb({
          x: snap.x - dx * snap.w / rect.width,
          y: snap.y - dy * snap.h / rect.height,
          w: snap.w,
          h: snap.h,
        });
      }
    };
    const onMouseUp = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const wasMoved = movedRef.current;
      dragRef.current = null;
      movedRef.current = false;
      setIsDragging(false);
      if (!wasMoved) {
        clickHandlerRef.current?.(e);
      }
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (e.button !== 0) return;
    dragRef.current = { cx: e.clientX, cy: e.clientY, snap: vb };
    movedRef.current = false;
  }, [vb]);

  const resetPan = useCallback(() => {
    dragRef.current = null;
    movedRef.current = false;
    setIsDragging(false);
  }, []);

  return { vb, isDragging, handleMouseDown, resetPan };
}
