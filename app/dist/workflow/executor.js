"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeWorkflow = executeWorkflow;
const engine_1 = require("./engine");
const Workflow_1 = require("../models/Workflow");
const workflow_file_1 = require("../utils/workflow.file");
// Phần 2: Khởi chạy workflow từ file system
async function executeWorkflow(workflowId, browserContext, page, userId) {
    // Load JSON định nghĩa workflow
    // const workflowPath = path.resolve(
    //   __dirname,
    //   "../backend/data/workflows",
    //   `${workflowId}.json`,
    // );
    // if (!fs.existsSync(workflowPath)) {
    //   throw new Error(`Workflow not found: ${workflowId}`);
    // }
    // const workflowJson = JSON.parse(fs.readFileSync(workflowPath, "utf-8"));
    const numericWorkflowId = parseInt(workflowId, 10);
    const numericUserId = parseInt(userId, 10);
    if (isNaN(numericWorkflowId)) {
        throw new Error(`Invalid Workflow ID: ${workflowId}`);
    }
    if (isNaN(numericUserId)) {
        // Nếu userId không hợp lệ, không thể xác thực quyền sở hữu
        throw new Error("User not authenticated or invalid User ID.");
    }
    // 2. Lấy metadata của workflow từ Database để kiểm tra sự tồn tại và quyền truy cập
    const workflowRecord = await Workflow_1.WorkflowModel.findByIdAndOwnerId(numericWorkflowId, numericUserId);
    // Nếu không có record, nghĩa là workflow không tồn tại hoặc người dùng không có quyền
    if (!workflowRecord) {
        throw new Error(`Workflow with ID ${numericWorkflowId} not found or access denied.`);
    }
    // 3. Đọc nội dung chi tiết (nodes, edges) từ file system
    // Dùng đường dẫn tương đối (ví dụ: "1/123.json") lấy từ DB
    const workflowContentObject = await workflow_file_1.WorkflowFileService.read(workflowRecord.workflowContent);
    // Gọi engine để thực thi
    const resultContext = await (0, engine_1.execute)(workflowContentObject, {
        browserContext,
        page,
        userId,
    });
    return resultContext;
}
