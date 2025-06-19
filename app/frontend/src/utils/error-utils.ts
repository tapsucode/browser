/**
 * Hàm hỗ trợ xử lý lỗi trong các service API
 * Cung cấp cách xử lý lỗi thống nhất trên toàn bộ ứng dụng
 */

/**
 * Ghi log lỗi với định dạng nhất quán
 * @param serviceName Tên của service gặp lỗi
 * @param methodName Tên của phương thức gặp lỗi
 * @param error Đối tượng lỗi được bắt
 */
export function logServiceError(serviceName: string, methodName: string, error: unknown): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`[${serviceName}] Lỗi trong ${methodName}: ${errorMessage}`);
  
  // Ghi thêm stack trace trong môi trường phát triển
  if (process.env.NODE_ENV !== 'production' && error instanceof Error && error.stack) {
    console.debug(`Stack trace: ${error.stack}`);
  }
}
/**
 * Wrapper nâng cao để xử lý các phản hồi API được mong đợi là một mảng.
 * 1. Kiểm tra xem yêu cầu API có thành công về mặt HTTP không (status 2xx).
 * 2. Nếu thất bại, ném ra một lỗi rõ ràng với thông điệp từ server.
 * 3. Nếu thành công, tìm và trả về dữ liệu mảng, kể cả khi nó được lồng trong một object.
 * 4. Nếu phản hồi thành công nhưng không tìm thấy mảng, sẽ log cảnh báo và trả về mảng rỗng.
 *
 * @param promise Promise của API call, nên là một Promise<Response> từ fetch.
 * @param serviceName Tên của service để ghi log.
 * @param methodName Tên của phương thức để ghi log.
 * @returns Promise chứa mảng kết quả.
 * @throws {Error} Ném lỗi nếu phản hồi từ API là lỗi (vd: status 401, 500).
 */
export async function handleArrayResponse<T>(
  promise: Promise<Response>, // Nên dùng kiểu Response rõ ràng hơn là any
  serviceName: string,
  methodName: string
): Promise<T[]> {
  const response = await promise;

  // BƯỚC 1: KIỂM TRA PHẢN HỒI HTTP
  // Đây là bước quan trọng nhất bị thiếu trong code gốc của bạn.
  if (!response.ok) {
    let errorData;
    try {
      // Cố gắng phân tích nội dung lỗi dưới dạng JSON (trường hợp phổ biến)
      errorData = await response.json();
    } catch (e) {
      // Nếu không phải JSON, lấy dưới dạng văn bản
      errorData = await response.text();
    }

    // Tạo và NÉM RA một lỗi rõ ràng. Việc này sẽ được bắt bởi khối `catch`
    // trong các hàm gọi nó (như getWorkflows).
    const errorMessage =
      errorData?.message || JSON.stringify(errorData) || response.statusText;
    throw new Error(
      `[${serviceName}] ${methodName}: Yêu cầu API thất bại với status ${response.status}. Lỗi: ${errorMessage}`
    );
  }

  // BƯỚC 2: XỬ LÝ KHI PHẢN HỒI THÀNH CÔNG
  try {
    const data = await response.json();

    // Logic cũ của bạn để tìm mảng - rất tốt và nên giữ lại
    if (Array.isArray(data)) {
      return data;
    }

    if (data && typeof data === 'object') {
      const possibleArrayProps = ['data', 'items', 'results', 'content', 'list','products', 'categories', 'tags'];
      for (const prop of possibleArrayProps) {
        if (Array.isArray(data[prop])) {
          return data[prop];
        }
      }
    }

    // Nếu phản hồi thành công nhưng định dạng không như mong đợi
    console.warn(
      `[${serviceName}] ${methodName}: Phản hồi thành công nhưng dữ liệu không chứa định dạng mảng mong muốn:`,
      data
    );
    return []; // Trả về mảng rỗng theo đúng ý định ban đầu
  } catch (error) {
    // Bắt lỗi nếu response.json() thất bại (vd: body rỗng hoặc không phải JSON)
    throw new Error(
      `[${serviceName}] ${methodName}: Không thể phân tích phản hồi JSON từ một yêu cầu thành công.`
    );
  }
}

/**
 * Wrapper để xử lý lỗi khi gọi API trả về single object
 * @param promise Promise của API call trả về object
 * @param serviceName Tên của service
 * @param methodName Tên của phương thức
 * @param defaultValue Giá trị mặc định nếu có lỗi (tùy chọn)
 * @returns Object kết quả hoặc defaultValue nếu có lỗi
 */
export async function handleObjectResponse<T>(
  promise: Promise<any>,
  serviceName: string,
  methodName: string,
  defaultValue: T
): Promise<T> {
  const response = await promise;

  // BƯỚC 1: KIỂM TRA PHẢN HỒI HTTP (tương tự handleArrayResponse)
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = await response.text();
    }

    const errorMessage =
      errorData?.message || JSON.stringify(errorData) || response.statusText;
    
    // Xử lý đặc biệt cho lỗi authentication
    if (response.status === 401) {
      throw new Error(
        `[${serviceName}] ${methodName}: Phiên đăng nhập đã hết hạn hoặc không hợp lệ. ${errorMessage}`
      );
    }
    
    if (response.status === 403) {
      throw new Error(
        `[${serviceName}] ${methodName}: Bạn không có quyền truy cập. ${errorMessage}`
      );
    }

    throw new Error(
      `[${serviceName}] ${methodName}: Yêu cầu API thất bại với status ${response.status}. Lỗi: ${errorMessage}`
    );
  }

  // BƯỚC 2: XỬ LÝ KHI PHẢN HỒI THÀNH CÔNG
  try {
    const data = await response.json();
    
    // Nhiều API có thể trả về dữ liệu trong cấu trúc khác nhau
    // Ví dụ: { data: {...} } hoặc { profile: {...} } hoặc trực tiếp là object
    
    if (data && typeof data === 'object') {
      if (!Array.isArray(data)) {
        // Trường hợp có các thuộc tính bao bọc
        const possibleObjProps = ['data', 'profile', 'result', 'content', 'item'];
        for (const prop of possibleObjProps) {
          if (data[prop] && typeof data[prop] === 'object' && !Array.isArray(data[prop])) {
            return data[prop] as T;
          }
        }
        
        // Nếu có id là dữ liệu hợp lệ (đối với các entity)
        if ('id' in data) {
          return data as T;
        }
        return data as T; 
      }
      
      console.warn(`[${serviceName}] ${methodName}: Dữ liệu không đúng định dạng object:`, data);
    }
    
    return defaultValue;
  } catch (error) {
    throw new Error(
      `[${serviceName}] ${methodName}: Không thể phân tích phản hồi JSON từ một yêu cầu thành công.`
    );
  }
}

/**
 * Xử lý lỗi cho các mutation methods (thêm, sửa, xóa)
 * @param promise Promise của API call
 * @param serviceName Tên của service
 * @param methodName Tên của phương thức
 * @param throwError Có nên throw lỗi hay không, mặc định là true
 * @returns Kết quả của API call hoặc null nếu có lỗi
 */
export async function handleMutationResponse<T>(
  promise: Promise<any>,
  serviceName: string,
  methodName: string,
  throwError: boolean = true
): Promise<T> {
  const response = await promise;

  // BƯỚC 1: KIỂM TRA PHẢN HỒI HTTP (tương tự handleArrayResponse)
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = await response.text();
    }

    const errorMessage =
      errorData?.message || JSON.stringify(errorData) || response.statusText;
    
    // Xử lý đặc biệt cho lỗi authentication
    if (response.status === 401) {
      const authError = new Error(
        `[${serviceName}] ${methodName}: Phiên đăng nhập đã hết hạn hoặc không hợp lệ. ${errorMessage}`
      );
      if (throwError) throw authError;
      logServiceError(serviceName, methodName, authError);
      return {} as T;
    }
    
    if (response.status === 403) {
      const permError = new Error(
        `[${serviceName}] ${methodName}: Bạn không có quyền thực hiện hành động này. ${errorMessage}`
      );
      if (throwError) throw permError;
      logServiceError(serviceName, methodName, permError);
      return {} as T;
    }

    const apiError = new Error(
      `[${serviceName}] ${methodName}: Yêu cầu API thất bại với status ${response.status}. Lỗi: ${errorMessage}`
    );
    if (throwError) throw apiError;
    logServiceError(serviceName, methodName, apiError);
    return {} as T;
  }

  // BƯỚC 2: XỬ LÝ KHI PHẢN HỒI THÀNH CÔNG
  try {
    const data = await response.json();
    
    // Mutation thường trả về object trực tiếp hoặc wrapped trong data
    if (data && typeof data === 'object') {
      // Kiểm tra các wrapper properties phổ biến
      const possibleProps = ['data', 'result', 'response', 'item'];
      for (const prop of possibleProps) {
        if (data[prop] !== undefined) {
          return data[prop] as T;
        }
      }
      
      // Trả về trực tiếp nếu không có wrapper
      return data as T;
    }
    
    return data as T;
  } catch (error) {
    const parseError = new Error(
      `[${serviceName}] ${methodName}: Không thể phân tích phản hồi JSON từ một yêu cầu thành công.`
    );
    if (throwError) throw parseError;
    logServiceError(serviceName, methodName, parseError);
    return {} as T;
  }
}

/**
 * Format lỗi để hiển thị thân thiện với người dùng
 * @param error Đối tượng lỗi
 * @returns Chuỗi thông báo lỗi thân thiện
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message;
    
    // Xử lý các lỗi từ auth.middleware.ts
    if (message.includes('Authorization header is required')) {
      return 'Vui lòng đăng nhập để tiếp tục sử dụng.';
    }
    
    if (message.includes('Invalid authorization format')) {
      return 'Định dạng xác thực không hợp lệ. Vui lòng đăng nhập lại.';
    }
    
    if (message.includes('Invalid token payload') || message.includes('Invalid or expired token')) {
      return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    }
    
    // Xử lý các loại lỗi HTTP cụ thể
    if (message.includes('Network Error') || message.includes('Failed to fetch')) {
      return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.';
    }
    
    if (message.includes('401') || message.includes('Unauthorized') || message.includes('Phiên đăng nhập đã hết hạn')) {
      return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    }
    
    if (message.includes('403') || message.includes('Forbidden') || message.includes('không có quyền')) {
      return 'Bạn không có quyền thực hiện hành động này.';
    }
    
    if (message.includes('404') || message.includes('Not Found')) {
      return 'Không tìm thấy tài nguyên yêu cầu.';
    }
    
    if (message.includes('500') || message.includes('Internal Server Error')) {
      return 'Đã xảy ra lỗi từ máy chủ. Vui lòng thử lại sau.';
    }
    
    if (message.includes('400') || message.includes('Bad Request')) {
      return 'Dữ liệu gửi đi không hợp lệ. Vui lòng kiểm tra lại thông tin.';
    }
    
    // Trả về message gốc nếu đã được format từ các hàm handle khác
    if (message.includes('[') && message.includes(']')) {
      return message;
    }
    
    return error.message;
  }
  
  return 'Đã xảy ra lỗi không xác định.';
}