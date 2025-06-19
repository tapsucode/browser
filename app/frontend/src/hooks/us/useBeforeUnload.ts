// File: src/hooks/us/useBeforeUnload.ts

import { useEffect, useRef } from 'react';

/**
 * Một custom hook để thực thi một hành động ngay trước khi trang
 * được tải lại hoặc đóng lại (reload, close tab/window).
 * @param handler - Hàm sẽ được gọi khi sự kiện 'beforeunload' xảy ra.
 */
export const useBeforeUnload = (handler: (event: BeforeUnloadEvent) => void) => {
  // Dùng ref để lưu trữ handler, đảm bảo luôn gọi được phiên bản mới nhất
  // mà không cần đưa handler vào dependency array của useEffect chính.
  const eventListenerRef = useRef<(event: BeforeUnloadEvent) => void>();

  useEffect(() => {
    eventListenerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Gọi handler đã được lưu trong ref
      if (eventListenerRef.current) {
        eventListenerRef.current(event);
      }
    };

    // Thêm event listener khi component được mount
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Dọn dẹp listener khi component bị unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []); // Dependency array rỗng để chỉ chạy một lần khi mount và unmount
};