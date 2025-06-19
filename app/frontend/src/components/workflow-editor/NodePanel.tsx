import React, { useState } from 'react';
import { 
  Zap, 
  MousePointerClick, 
  Database, 
  Network, 
  ArrowRightLeft,
  Clock,
  Play,
  Square,
  Folder,
  Repeat,
  Plus,
  Minus,
  X,
  Link,
  Loader,
  MousePointer,
  MoveHorizontal,
  MoveVertical,
  ArrowUp,
  ArrowDown,
  ClipboardList,
  FileText,
  Mail,
  Clipboard,
  Type,
  TextCursorInput,
  ListFilter,
  CheckSquare,
  ExternalLink,
  Search,
  GitFork,
  GitMerge,
  ShieldAlert,
  LayoutPanelTop,
  MessageCircle,
  BellRing,
  CalendarDays,
  Save,
  Globe,
  Tag
} from 'lucide-react';

interface NodeItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  type: string;
  description: string;
  parameters: Record<string, any>;
}

interface NodeCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  nodes: NodeItem[];
}

const nodeCategories: NodeCategory[] = [
  {
    id: 'general',
    name: 'Chung',
    icon: <Zap className="h-4 w-4" />,
    color: '#f59e0b',
    bgColor: '#78350f',
    nodes: [
      {
        id: 'start',
        label: 'Bắt đầu',
        icon: <Play className="h-4 w-4" />,
        type: 'triggerNode',
        description: 'Điểm bắt đầu của workflow. Không có tham số.',
        parameters: {}
      },
      {
        id: 'executeWorkflow',
        label: 'Gọi workflow',
        icon: <Folder className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Gọi và thực thi một workflow khác. Tham số: workflowId (string, ví dụ: "login_process").',
        parameters: {
          workflowId: ''
        }
      },
      {
        id: 'end',
        label: 'Kết thúc',
        icon: <Square className="h-4 w-4" />,
        type: 'outputNode',
        description: 'Điểm kết thúc của workflow. Không có tham số.',
        parameters: {}
      },
      {
        id: 'blocksGroup',
        label: 'Nhóm khối',
        icon: <LayoutPanelTop className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Nhóm các node để tổ chức workflow. Tham số: groupName (string, ví dụ: "Authentication Steps").',
        parameters: {
          groupName: 'Nhóm 1'
        }
      },
      {
        id: 'note',
        label: 'Ghi chú',
        icon: <FileText className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Thêm ghi chú vào workflow. Tham số: text (string, ví dụ: "This is a note").',
        parameters: {
          text: ''
        }
      },
      {
        id: 'workflowState',
        label: 'Trạng thái workflow',
        icon: <Play className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Đặt trạng thái của workflow. Tham số: state (string, ví dụ: "start", "pause", "stop").',
        parameters: {
          state: 'start'
        }
      }
    ]
  },
  {
    id: 'browser',
    name: 'Trình duyệt',
    icon: <Network className="h-4 w-4" />,
    color: '#3b82f6',
    bgColor: '#1e3a8a',
    nodes: [
      {
        id: 'openURL',
        label: 'Mở URL',
        icon: <ExternalLink className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Mở một trang web. Tham số: url (string, ví dụ: "https://www.example.com"), urlVariableRef (string, ví dụ: "$targetUrl"), minWait (ms), maxWait (ms).',
        parameters: {
          url: '',
          urlVariableRef: '',
          minWait: 1000,
          maxWait: 3000
        }
      },
      {
        id: 'imageSearch',
        label: 'Tìm hình ảnh',
        icon: <Search className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Tìm kiếm hình ảnh trên công cụ tìm kiếm. Tham số: query (string, ví dụ: "cats"), queryVariableRef (string, ví dụ: "$searchQuery"), minWait (ms), maxWait (ms).',
        parameters: {
          query: '',
          queryVariableRef: '',
          minWait: 1000,
          maxWait: 3000
        }
      },
      {
        id: 'activeTab',
        label: 'Tab hiện tại',
        icon: <LayoutPanelTop className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Chuyển tới tab đang hoạt động. Không có tham số.',
        parameters: {}
      },
      {
        id: 'newTab',
        label: 'Tab mới',
        icon: <Plus className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Mở một tab mới. Tham số: minWait (ms), maxWait (ms).',
        parameters: {
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'resourceStatus',
        label: 'Trạng thái tài nguyên',
        icon: <FileText className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Kiểm tra trạng thái tài nguyên trên trang. Tham số: resourceType (string, ví dụ: "image", "script").',
        parameters: {
          resourceType: ''
        }
      },
      {
        id: 'switchTab',
        label: 'Chuyển tab',
        icon: <ArrowRightLeft className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Chuyển đến tab khác. Tham số: tabIndex (number, ví dụ: 0), tabIndexVariableRef (string, ví dụ: "$tabIndex"), minWait (ms), maxWait (ms).',
        parameters: {
          tabIndex: 0,
          tabIndexVariableRef: '',
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'newWindow',
        label: 'Cửa sổ mới',
        icon: <LayoutPanelTop className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Mở cửa sổ trình duyệt mới. Tham số: minWait (ms), maxWait (ms).',
        parameters: {
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'goBack',
        label: 'Quay lại',
        icon: <ArrowRightLeft className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Quay lại trang trước. Tham số: minWait (ms), maxWait (ms).',
        parameters: {
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'goForward',
        label: 'Đi tiếp',
        icon: <ArrowRightLeft className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Đi đến trang tiếp theo. Tham số: minWait (ms), maxWait (ms).',
        parameters: {
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'closeTab',
        label: 'Đóng tab',
        icon: <X className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Đóng tab hiện tại. Tham số: minWait (ms), maxWait (ms).',
        parameters: {
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'reloadPage',
        label: 'Tải lại trang',
        icon: <Repeat className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Tải lại trang hiện tại. Tham số: minWait (ms), maxWait (ms).',
        parameters: {
          minWait: 1000,
          maxWait: 3000
        }
      },
      {
        id: 'getURL',
        label: 'Lấy URL',
        icon: <Link className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Lấy URL của trang hiện tại và lưu vào biến. Tham số: resultVar (string, ví dụ: "currentUrl").',
        parameters: {
          resultVar: ''
        }
      }
    ]
  },
  {
    id: 'webInteraction',
    name: 'Tương tác Web',
    icon: <MousePointerClick className="h-4 w-4" />,
    color: '#ec4899',
    bgColor: '#831843',
    nodes: [
      {
        id: 'click',
        label: 'Click',
        icon: <MousePointerClick className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Click vào phần tử. Tham số: selectorType (string, ví dụ: "css"), selectorValue (string, ví dụ: "#myButton"), selectorVariableRef (string, ví dụ: "$buttonSelector"), clickType (string, ví dụ: "left"), timeout (ms), minWait (ms), maxWait (ms).',
        parameters: {
          selectorType: 'css',
          selectorValue: '',
          selectorVariableRef: '',
          clickType: 'left',
          timeout: 5000,
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'doubleClick',
        label: 'Double Click',
        icon: <MousePointerClick className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Double click vào phần tử. Tham số: selectorType (string), selectorValue (string), selectorVariableRef (string, ví dụ: "$buttonSelector"), timeout (ms), minWait (ms), maxWait (ms).',
        parameters: {
          selectorType: 'css',
          selectorValue: '',
          selectorVariableRef: '',
          timeout: 5000,
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'rightClick',
        label: 'Right Click',
        icon: <MousePointerClick className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Click chuột phải vào phần tử. Tham số: selectorType (string), selectorValue (string), selectorVariableRef (string, ví dụ: "$buttonSelector"), timeout (ms), minWait (ms), maxWait (ms).',
        parameters: {
          selectorType: 'css',
          selectorValue: '',
          selectorVariableRef: '',
          timeout: 5000,
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'hover',
        label: 'Hover',
        icon: <MousePointer className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Di chuột qua phần tử. Tham số: selectorType (string), selectorValue (string), selectorVariableRef (string, ví dụ: "$elementSelector"), timeout (ms), minWait (ms), maxWait (ms).',
        parameters: {
          selectorType: 'css',
          selectorValue: '',
          selectorVariableRef: '',
          timeout: 5000,
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'focus',
        label: 'Focus',
        icon: <MousePointer className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Đặt focus vào phần tử. Tham số: selectorType (string), selectorValue (string), selectorVariableRef (string, ví dụ: "$elementSelector"), timeout (ms), minWait (ms), maxWait (ms).',
        parameters: {
          selectorType: 'css',
          selectorValue: '',
          selectorVariableRef: '',
          timeout: 5000,
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'type',
        label: 'Nhập',
        icon: <Type className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Nhập văn bản hoặc giá trị từ biến. Tham số: selectorType (string), selectorValue (string), selectorVariableRef (string, ví dụ: "$inputSelector"), text (string), variableRef (string, ví dụ: "$inputText"), delay (ms), minWait (ms), maxWait (ms).',
        parameters: {
          selectorType: 'css',
          selectorValue: '',
          selectorVariableRef: '',
          text: '',
          variableRef: '',
          delay: 100,
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'clearInput',
        label: 'Xóa input',
        icon: <X className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Xóa nội dung trường nhập liệu. Tham số: selectorType (string), selectorValue (string), selectorVariableRef (string, ví dụ: "$inputSelector"), timeout (ms), minWait (ms), maxWait (ms).',
        parameters: {
          selectorType: 'css',
          selectorValue: '',
          selectorVariableRef: '',
          timeout: 5000,
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'selectOption',
        label: 'Chọn option',
        icon: <ListFilter className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Chọn option từ dropdown. Tham số: selectorType (string), selectorValue (string), selectorVariableRef (string, ví dụ: "$dropdownSelector"), value (string), variableRef (string, ví dụ: "$selectedValue"), timeout (ms), minWait (ms), maxWait (ms).',
        parameters: {
          selectorType: 'css',
          selectorValue: '',
          selectorVariableRef: '',
          value: '',
          variableRef: '',
          timeout: 5000,
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'upload',
        label: 'Upload file',
        icon: <FileText className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Tải lên file. Tham số: selectorType (string), selectorValue (string), selectorVariableRef (string, ví dụ: "$fileInputSelector"), filePath (string), filePathVariableRef (string, ví dụ: "$filePath"), timeout (ms), minWait (ms), maxWait (ms).',
        parameters: {
          selectorType: 'css',
          selectorValue: '',
          selectorVariableRef: '',
          filePath: '',
          filePathVariableRef: '',
          timeout: 5000,
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'download',
        label: 'Download file',
        icon: <FileText className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Tải xuống file. Tham số: url (string), urlVariableRef (string, ví dụ: "$downloadUrl"), savePath (string), savePathVariableRef (string, ví dụ: "$savePath"), minWait (ms), maxWait (ms).',
        parameters: {
          url: '',
          urlVariableRef: '',
          savePath: '',
          savePathVariableRef: '',
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'scroll',
        label: 'Scroll',
        icon: <MoveVertical className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Cuộn trang. Tham số: direction (string, ví dụ: "down"), directionVariableRef (string, ví dụ: "$scrollDirection"), amount (number), amountVariableRef (string, ví dụ: "$scrollAmount"), minWait (ms), maxWait (ms).',
        parameters: {
          direction: 'down',
          directionVariableRef: '',
          amount: 500,
          amountVariableRef: '',
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'scrollToElement',
        label: 'Scroll tới phần tử',
        icon: <MoveVertical className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Cuộn đến phần tử. Tham số: selectorType (string), selectorValue (string), selectorVariableRef (string, ví dụ: "$elementSelector"), timeout (ms), minWait (ms), maxWait (ms).',
        parameters: {
          selectorType: 'css',
          selectorValue: '',
          selectorVariableRef: '',
          timeout: 5000,
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'pressKey',
        label: 'Nhấn phím',
        icon: <Type className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Nhấn phím. Tham số: key (string, ví dụ: "Enter"), keyVariableRef (string, ví dụ: "$keyToPress"), modifier (string), modifierVariableRef (string, ví dụ: "$modifierKey"), minWait (ms), maxWait (ms).',
        parameters: {
          key: 'Enter',
          keyVariableRef: '',
          modifier: '',
          modifierVariableRef: '',
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'dragAndDrop',
        label: 'Drag and Drop',
        icon: <MoveHorizontal className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Kéo và thả phần tử. Tham số: sourceSelectorType (string), sourceSelectorValue (string), sourceSelectorVariableRef (string, ví dụ: "$sourceSelector"), targetSelectorType (string), targetSelectorValue (string), targetSelectorVariableRef (string, ví dụ: "$targetSelector"), timeout (ms), minWait (ms), maxWait (ms).',
        parameters: {
          sourceSelectorType: 'css',
          sourceSelectorValue: '',
          sourceSelectorVariableRef: '',
          targetSelectorType: 'css',
          targetSelectorValue: '',
          targetSelectorVariableRef: '',
          timeout: 5000,
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'getAttribute',
        label: 'Lấy Attribute',
        icon: <Tag className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Lấy giá trị attribute của phần tử và lưu vào biến. Tham số: selectorType (string), selectorValue (string), selectorVariableRef (string, ví dụ: "$elementSelector"), attribute (string, ví dụ: "data-id"), resultVar (string, ví dụ: "elementId").',
        parameters: {
          selectorType: 'css',
          selectorValue: '',
          selectorVariableRef: '',
          attribute: '',
          resultVar: '',
          timeout: 5000,
          minWait: 500,
          maxWait: 2000
        }
      }
    ]
  },
  {
    id: 'controlFlow',
    name: 'Điều khiển Luồng',
    icon: <GitFork className="h-4 w-4" />,
    color: '#8b5cf6',
    bgColor: '#4c1d95',
    nodes: [
      {
        id: 'if',
        label: 'If-Else',
        icon: <GitFork className="h-4 w-4" />,
        type: 'conditionNode',
        description: 'Rẽ nhánh dựa trên điều kiện. Tham số: condition (string, ví dụ: "$myVar > 10"), conditionVariableRef (string, ví dụ: "$conditionValue").',
        parameters: {
          condition: '',
          conditionVariableRef: ''
        }
      },
      {
        id: 'switch',
        label: 'Switch-Case',
        icon: <GitFork className="h-4 w-4" />,
        type: 'conditionNode',
        description: 'Chuyển luồng dựa trên giá trị. Tham số: variable (string, ví dụ: "status"), variableRef (string, ví dụ: "$statusValue"), cases (array, ví dụ: [{case: "success", action: "proceed"}]).',
        parameters: {
          variable: '',
          variableRef: '',
          cases: []
        }
      },
      {
        id: 'loop',
        label: 'Vòng lặp',
        icon: <Repeat className="h-4 w-4" />,
        type: 'loopNode',
        description: 'Lặp lại hành động, lưu biến đếm. Tham số: times (number, ví dụ: 5), timesVariableRef (string, ví dụ: "$loopCount"), loopVariable (string, ví dụ: "i").',
        parameters: {
          times: 5,
          timesVariableRef: '',
          loopVariable: 'i'
        }
      },
      {
        id: 'forEach',
        label: 'For Each',
        icon: <Repeat className="h-4 w-4" />,
        type: 'loopNode',
        description: 'Lặp qua mảng, lưu biến phần tử. Tham số: array (string, ví dụ: "myArray"), arrayVariableRef (string, ví dụ: "$myArray"), itemVariable (string, ví dụ: "item").',
        parameters: {
          array: '',
          arrayVariableRef: '',
          itemVariable: 'item'
        }
      },
      {
        id: 'while',
        label: 'While',
        icon: <Repeat className="h-4 w-4" />,
        type: 'loopNode',
        description: 'Lặp khi điều kiện đúng. Tham số: condition (string, ví dụ: "$myVar < 10"), conditionVariableRef (string, ví dụ: "$conditionValue").',
        parameters: {
          condition: '',
          conditionVariableRef: ''
        }
      },
      {
        id: 'break',
        label: 'Break',
        icon: <X className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Thoát khỏi vòng lặp hiện tại. Không có tham số.',
        parameters: {}
      },
      {
        id: 'continue',
        label: 'Continue',
        icon: <ArrowRightLeft className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Bỏ qua lần lặp hiện tại. Không có tham số.',
        parameters: {}
      },
      {
        id: 'try',
        label: 'Try-Catch',
        icon: <ShieldAlert className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Bắt và xử lý lỗi. Tham số: errorVar (string, ví dụ: "errorMessage").',
        parameters: {
          errorVar: ''
        }
      },
      {
        id: 'return',
        label: 'Return',
        icon: <ArrowRightLeft className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Trả về giá trị và kết thúc. Tham số: value (any, ví dụ: "result"), variableRef (string, ví dụ: "$returnValue").',
        parameters: {
          value: '',
          variableRef: ''
        }
      },
      {
        id: 'retry',
        label: 'Retry',
        icon: <Repeat className="h-4 w-4" />,
        type: 'actionNode',
        description: 'Thử lại hành động khi lỗi. Tham số: times (number, ví dụ: 3), timesVariableRef (string, ví dụ: "$retryCount"), delay (ms).',
        parameters: {
          times: 3,
          timesVariableRef: '',
          delay: 1000
        }
      }
    ]
  },
  {
    id: 'data',
    name: 'Dữ liệu',
    icon: <Database className="h-4 w-4" />,
    color: '#10b981',
    bgColor: '#064e3b',
    nodes: [
      {
        id: 'variable',
        label: 'Biến',
        icon: <Database className="h-4 w-4" />,
        type: 'dataNode',
        description: 'Khai báo hoặc cập nhật biến. Tham số: name (string, ví dụ: "myVar"), value (any, ví dụ: "value"), valueVariableRef (string, ví dụ: "$inputValue").',
        parameters: {
          name: '',
          value: '',
          valueVariableRef: ''
        }
      },
      {
        id: 'array',
        label: 'Mảng',
        icon: <Database className="h-4 w-4" />,
        type: 'dataNode',
        description: 'Tạo hoặc cập nhật mảng. Tham số: name (string, ví dụ: "myArray"), value (array, ví dụ: []), valueVariableRef (string, ví dụ: "$inputArray").',
        parameters: {
          name: '',
          value: [],
          valueVariableRef: ''
        }
      },
      {
        id: 'object',
        label: 'Đối tượng',
        icon: <Database className="h-4 w-4" />,
        type: 'dataNode',
        description: 'Tạo hoặc cập nhật đối tượng. Tham số: name (string, ví dụ: "myObject"), value (object, ví dụ: {}), valueVariableRef (string, ví dụ: "$inputObject").',
        parameters: {
          name: '',
          value: {},
          valueVariableRef: ''
        }
      },
      {
        id: 'math',
        label: 'Toán học',
        icon: <Plus className="h-4 w-4" />,
        type: 'dataNode',
        description: 'Thực hiện phép tính. Tham số: operation (string, ví dụ: "add"), operands (array, ví dụ: [1, 2]), operandsVariableRef (string, ví dụ: "$inputOperands"), resultVar (string, ví dụ: "sum").',
        parameters: {
          operation: 'add',
          operands: [],
          operandsVariableRef: '',
          resultVar: ''
        }
      },
      {
        id: 'string',
        label: 'Chuỗi',
        icon: <Type className="h-4 w-4" />,
        type: 'dataNode',
        description: 'Thao tác với chuỗi. Tham số: operation (string, ví dụ: "concat"), strings (array, ví dụ: ["Hello", "World"]), stringsVariableRef (string, ví dụ: "$inputStrings"), resultVar (string, ví dụ: "resultString").',
        parameters: {
          operation: 'concat',
          strings: [],
          stringsVariableRef: '',
          resultVar: ''
        }
      },
      {
        id: 'date',
        label: 'Ngày',
        icon: <Clock className="h-4 w-4" />,
        type: 'dataNode',
        description: 'Thao tác với ngày tháng. Tham số: operation (string, ví dụ: "now"), resultVar (string, ví dụ: "currentDate").',
        parameters: {
          operation: 'now',
          resultVar: ''
        }
      },
      {
        id: 'json',
        label: 'JSON',
        icon: <ClipboardList className="h-4 w-4" />,
        type: 'dataNode',
        description: 'Thao tác với JSON. Tham số: operation (string, ví dụ: "parse"), data (string, ví dụ: "{\"key\": \"value\"}"), dataVariableRef (string, ví dụ: "$inputJson"), resultVar (string, ví dụ: "parsedJson").',
        parameters: {
          operation: 'parse',
          data: '',
          dataVariableRef: '',
          resultVar: ''
        }
      },
      {
        id: 'regex',
        label: 'RegExp',
        icon: <Search className="h-4 w-4" />,
        type: 'dataNode',
        description: 'Tìm kiếm với biểu thức chính quy. Tham số: pattern (string, ví dụ: "\\d+"), text (string), textVariableRef (string, ví dụ: "$inputText"), flags (string, ví dụ: "g"), resultVar (string, ví dụ: "matches").',
        parameters: {
          pattern: '',
          text: '',
          textVariableRef: '',
          flags: 'g',
          resultVar: ''
        }
      },
      {
        id: 'randomize',
        label: 'Ngẫu nhiên',
        icon: <ArrowRightLeft className="h-4 w-4" />,
        type: 'dataNode',
        description: 'Tạo giá trị ngẫu nhiên. Tham số: type (string, ví dụ: "number"), min (number), minVariableRef (string, ví dụ: "$minValue"), max (number), maxVariableRef (string, ví dụ: "$maxValue"), resultVar (string, ví dụ: "randomValue").',
        parameters: {
          type: 'number',
          min: 1,
          minVariableRef: '',
          max: 100,
          maxVariableRef: '',
          resultVar: ''
        }
      },
      {
        id: 'sort',
        label: 'Sắp xếp',
        icon: <ArrowUp className="h-4 w-4" />,
        type: 'dataNode',
        description: 'Sắp xếp mảng. Tham số: array (string, ví dụ: "myArray"), arrayVariableRef (string, ví dụ: "$inputArray"), order (string, ví dụ: "ascending"), resultVar (string, ví dụ: "sortedArray").',
        parameters: {
          array: '',
          arrayVariableRef: '',
          order: 'ascending',
          resultVar: ''
        }
      },
      {
        id: 'filter',
        label: 'Lọc',
        icon: <ListFilter className="h-4 w-4" />,
        type: 'dataNode',
        description: 'Lọc mảng. Tham số: array (string, ví dụ: "myArray"), arrayVariableRef (string, ví dụ: "$inputArray"), condition (string, ví dụ: "item > 10"), conditionVariableRef (string, ví dụ: "$filterCondition"), resultVar (string, ví dụ: "filteredArray").',
        parameters: {
          array: '',
          arrayVariableRef: '',
          condition: '',
          conditionVariableRef: '',
          resultVar: ''
        }
      },
      {
        id: 'map',
        label: 'Map',
        icon: <GitMerge className="h-4 w-4" />,
        type: 'dataNode',
        description: 'Áp dụng hàm cho mảng. Tham số: array (string, ví dụ: "myArray"), arrayVariableRef (string, ví dụ: "$inputArray"), operation (string, ví dụ: "item * 2"), operationVariableRef (string, ví dụ: "$mapOperation"), resultVar (string, ví dụ: "mappedArray").',
        parameters: {
          array: '',
          arrayVariableRef: '',
          operation: '',
          operationVariableRef: '',
          resultVar: ''
        }
      }
    ]
  },
  {
    id: 'wait',
    name: 'Chờ đợi',
    icon: <Clock className="h-4 w-4" />,
    color: '#84cc16',
    bgColor: '#365314',
    nodes: [
      {
        id: 'delay',
        label: 'Chờ',
        icon: <Clock className="h-4 w-4" />,
        type: 'waitNode',
        description: 'Tạm dừng thực thi. Tham số: duration (ms, ví dụ: 1000), durationVariableRef (string, ví dụ: "$waitTime").',
        parameters: {
          duration: 1000,
          durationVariableRef: ''
        }
      },
      {
        id: 'waitForPageLoad',
        label: 'Chờ trang tải',
        icon: <Loader className="h-4 w-4" />,
        type: 'waitNode',
        description: 'Chờ trang tải hoàn tất. Tham số: timeout (ms, ví dụ: 30000), timeoutVariableRef (string, ví dụ: "$loadTimeout").',
        parameters: {
          timeout: 30000,
          timeoutVariableRef: ''
        }
      },
      {
        id: 'waitForSelector',
        label: 'Chờ phần tử',
        icon: <Loader className="h-4 w-4" />,
        type: 'waitNode',
        description: 'Chờ phần tử xuất hiện. Tham số: selectorType (string, ví dụ: "css"), selectorValue (string, ví dụ: "#myElement"), selectorVariableRef (string, ví dụ: "$elementSelector"), timeout (ms), timeoutVariableRef (string, ví dụ: "$waitTimeout").',
        parameters: {
          selectorType: 'css',
          selectorValue: '',
          selectorVariableRef: '',
          timeout: 30000,
          timeoutVariableRef: ''
        }
      },
      {
        id: 'waitForXPath',
        label: 'Chờ XPath',
        icon: <Loader className="h-4 w-4" />,
        type: 'waitNode',
        description: 'Chờ phần tử xác định bằng XPath. Tham số: selectorType, selectorValue, selectorVariableRef, timeout, timeoutVariableRef',
        parameters: {
          selectorType: 'xpath',
          selectorValue: '',
          selectorVariableRef: '',
          timeout: 30000,
          timeoutVariableRef: ''
        }
      },
      {
        id: 'waitConnections',
        label: 'Chờ kết nối',
        icon: <Loader className="h-4 w-4" />,
        type: 'waitNode',
        description: 'Chờ sự kiện hoặc kết nối. Tham số: event, eventVariableRef, timeout, timeoutVariableRef',
        parameters: {
          event: '',
          eventVariableRef: '',
          timeout: 30000,
          timeoutVariableRef: ''
        }
      }
    ]
  },
  {
    id: 'onlineServices',
    name: 'Dịch vụ Online',
    icon: <Network className="h-4 w-4" />,
    color: '#06b6d4',
    bgColor: '#164e63',
    nodes: [
      {
        id: 'mailSend',
        label: 'Gửi Email',
        icon: <Mail className="h-4 w-4" />,
        type: 'serviceNode',
        description: 'Gửi email. Tham số: to (string), toVariableRef (string, ví dụ: "$recipient"), subject (string), subjectVariableRef (string, ví dụ: "$emailSubject"), body (string), bodyVariableRef (string, ví dụ: "$emailContent"), minWait (ms), maxWait (ms).',
        parameters: {
          to: '',
          toVariableRef: '',
          subject: '',
          subjectVariableRef: '',
          body: '',
          bodyVariableRef: '',
          minWait: 1000,
          maxWait: 3000
        }
      },
      {
        id: 'sms',
        label: 'Gửi SMS',
        icon: <Mail className="h-4 w-4" />,
        type: 'serviceNode',
        description: 'Gửi SMS. Tham số: to (string), toVariableRef (string, ví dụ: "$phoneNumber"), message (string), messageVariableRef (string, ví dụ: "$smsContent"), minWait (ms), maxWait (ms).',
        parameters: {
          to: '',
          toVariableRef: '',
          message: '',
          messageVariableRef: '',
          minWait: 1000,
          maxWait: 3000
        }
      },
      {
        id: 'apiCall',
        label: 'Gọi API',
        icon: <Network className="h-4 w-4" />,
        type: 'serviceNode',
        description: 'Gọi API RESTful. Tham số: url (string), urlVariableRef (string, ví dụ: "$apiUrl"), method (string), methodVariableRef (string, ví dụ: "$apiMethod"), headers (object), headersVariableRef (string, ví dụ: "$apiHeaders"), body (object), bodyVariableRef (string, ví dụ: "$apiPayload"), resultVar (string, ví dụ: "apiResult"), minWait (ms), maxWait (ms).',
        parameters: {
          url: '',
          urlVariableRef: '',
          method: 'GET',
          methodVariableRef: '',
          headers: {},
          headersVariableRef: '',
          body: {},
          bodyVariableRef: '',
          resultVar: '',
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'webhook',
        label: 'Webhook',
        icon: <Network className="h-4 w-4" />,
        type: 'serviceNode',
        description: 'Gửi dữ liệu đến webhook. Tham số: url (string), urlVariableRef (string, ví dụ: "$webhookUrl"), payload (object), payloadVariableRef (string, ví dụ: "$webhookPayload"), resultVar (string, ví dụ: "webhookResult"), minWait (ms), maxWait (ms).',
        parameters: {
          url: '',
          urlVariableRef: '',
          payload: {},
          payloadVariableRef: '',
          resultVar: '',
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'chatgpt',
        label: 'ChatGPT',
        icon: <MessageCircle className="h-4 w-4" />,
        type: 'serviceNode',
        description: 'Tương tác với ChatGPT API. Tham số: prompt (string, ví dụ: "Hello, how are you?"), promptVariableRef (string, ví dụ: "$chatPrompt"), model (string, ví dụ: "gpt-3.5-turbo"), resultVar (string, ví dụ: "chatResponse"), minWait (ms), maxWait (ms).',
        parameters: {
          prompt: '',
          promptVariableRef: '',
          model: 'gpt-3.5-turbo',
          resultVar: '',
          minWait: 1000,
          maxWait: 3000
        }
      },
      {
        id: 'translate',
        label: 'Dịch',
        icon: <Globe className="h-4 w-4" />,
        type: 'serviceNode',
        description: 'Dịch văn bản. Tham số: text (string), textVariableRef (string, ví dụ: "$textToTranslate"), sourceLang (string, ví dụ: "auto"), targetLang (string, ví dụ: "en"), resultVar (string, ví dụ: "translatedText"), minWait (ms), maxWait (ms).',
        parameters: {
          text: '',
          textVariableRef: '',
          sourceLang: 'auto',
          targetLang: 'en',
          resultVar: '',
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'notification',
        label: 'Thông báo',
        icon: <BellRing className="h-4 w-4" />,
        type: 'serviceNode',
        description: 'Gửi thông báo qua kênh. Tham số: channel, channelVariableRef, message, messageVariableRef, minWait, maxWait',
        parameters: {
          channel: 'telegram',
          channelVariableRef: '',
          message: '',
          messageVariableRef: '',
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'calendar',
        label: 'Lịch',
        icon: <CalendarDays className="h-4 w-4" />,
        type: 'serviceNode',
        description: 'Thao tác với lịch. Tham số: action, actionVariableRef, event, eventVariableRef, resultVar, minWait, maxWait',
        parameters: {
          action: 'add',
          actionVariableRef: '',
          event: {},
          eventVariableRef: '',
          resultVar: '',
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'database',
        label: 'Cơ sở dữ liệu',
        icon: <Database className="h-4 w-4" />,
        type: 'serviceNode',
        description: 'Tương tác với cơ sở dữ liệu. Tham số: operation, operationVariableRef, table, tableVariableRef, data, dataVariableRef, resultVar, minWait, maxWait',
        parameters: {
          operation: 'select',
          operationVariableRef: '',
          table: '',
          tableVariableRef: '',
          data: {},
          dataVariableRef: '',
          resultVar: '',
          minWait: 500,
          maxWait: 2000
        }
      },
      {
        id: 'storage',
        label: 'Lưu trữ Cloud',
        icon: <Save className="h-4 w-4" />,
        type: 'serviceNode',
        description: 'Tương tác với lưu trữ đám mây. Tham số: service, serviceVariableRef, operation, operationVariableRef, path, pathVariableRef, data, dataVariableRef, resultVar, minWait, maxWait',
        parameters: {
          service: 'dropbox',
          serviceVariableRef: '',
          operation: 'upload',
          operationVariableRef: '',
          path: '',
          pathVariableRef: '',
          data: null,
          dataVariableRef: '',
          resultVar: '',
          minWait: 500,
          maxWait: 2000
        }
      }
    ]
  }
];

function NodePanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(
    nodeCategories.reduce((acc, category) => {
      acc[category.id] = true;
      return acc;
    }, {} as Record<string, boolean>)
  );

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, type: string, data: NodeItem) => {
    console.log('NodePanel: Starting drag with:', { type, data });
    event.dataTransfer.setData('application/reactflow/type', type);
    event.dataTransfer.setData('application/reactflow/data', JSON.stringify({
      nodeId: data.id,
      label: data.label,
      description: data.description,
      parameters: data.parameters
    }));
    event.dataTransfer.effectAllowed = 'move';
    
    // Add visual feedback
    const draggedElement = event.currentTarget;
    draggedElement.style.opacity = '0.5';
    
    // Reset opacity after drag ends
    setTimeout(() => {
      draggedElement.style.opacity = '1';
    }, 100);
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const filteredCategories = searchTerm.trim() === '' 
    ? nodeCategories 
    : nodeCategories.map(category => ({
        ...category,
        nodes: category.nodes.filter(node => 
          node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          node.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(category => category.nodes.length > 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-2 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm node..."
            className="w-full pl-8 pr-2 py-1 text-sm border border-gray-300 rounded"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setSearchTerm('')}
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {filteredCategories.map((category) => (
          <div key={category.id} className="mb-2">
            <button
              className={`flex items-center justify-between w-full text-left rounded px-2 py-1.5 mb-1 text-white text-sm font-medium transition-colors`}
              style={{ backgroundColor: category.bgColor }}
              onClick={() => toggleCategory(category.id)}
            >
              <div className="flex items-center">
                <div className="mr-2">{category.icon}</div>
                <span>{category.name}</span>
              </div>
              <div>
                {expandedCategories[category.id] ? (
                  <ArrowUp className="h-3 w-3 text-white" />
                ) : (
                  <ArrowDown className="h-3 w-3 text-white" />
                )}
              </div>
            </button>
            {expandedCategories[category.id] && (
              <div className="pl-1 space-y-1">
                {category.nodes.map((node) => (
                  <div
                    key={node.id}
                    className="flex items-center rounded px-2 py-1.5 text-xs bg-white border border-gray-200 hover:bg-gray-50 cursor-grab select-none transition-opacity duration-150"
                    draggable={true}
                    onDragStart={(event) => onDragStart(event, node.type, node)}
                    style={{ touchAction: 'none' }}
                  >
                    <div 
                      className="h-4 w-4 flex items-center justify-center mr-2"
                      style={{ color: category.color }}
                    >
                      {node.icon}
                    </div>
                    <div className="flex-1">{node.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default NodePanel;