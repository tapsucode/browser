import { useState, useCallback } from 'react';

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export const useHistory = <T>(initialPresent: T) => {
  const [state, setState] = useState<HistoryState<T>>({
    past: [],
    present: initialPresent,
    future: [],
  });

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const set = useCallback((newPresent: T) => {
    // Chỉ set history mới nếu trạng thái thực sự thay đổi
    // Điều này tránh tạo ra các bản ghi lịch sử trùng lặp khi re-render
    if (JSON.stringify(newPresent) === JSON.stringify(state.present)) {
      return;
    }
    
    setState({
      past: [...state.past, state.present],
      present: newPresent,
      future: [],
    });
  }, [state.present]);

  const undo = useCallback(() => {
    if (!canUndo) return;
    
    const previous = state.past[state.past.length - 1];
    const newPast = state.past.slice(0, state.past.length - 1);
    
    setState({
      past: newPast,
      present: previous,
      future: [state.present, ...state.future],
    });
  }, [canUndo, state.present, state.past, state.future]);

  const redo = useCallback(() => {
    if (!canRedo) return;

    const next = state.future[0];
    const newFuture = state.future.slice(1);
    
    setState({
      past: [...state.past, state.present],
      present: next,
      future: newFuture,
    });
  }, [canRedo, state.present, state.past, state.future]);
  
  // Trả về cả `present` để component bên ngoài có thể lấy state đã undo/redo
  return { ...state, set, undo, redo, canUndo, canRedo };
};