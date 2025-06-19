"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LaunchService = void 0;
const Profile_1 = require("../models/Profile");
const ProfileGroup_1 = require("../models/ProfileGroup");
const utils_service_1 = require("../utils/utils.service");
// Dynamic import for p-limit to avoid ES Module issues
let pLimit;
const crypto_1 = require("crypto");
const executor_1 = require("../workflow/executor");
class LaunchService {
    static async launchProfile(userId, profileId, options = {}) {
        let context = null;
        try {
            const profile = await Profile_1.ProfileModel.findById(parseInt(profileId, 10));
            if (!profile) {
                throw new Error("Profile không tồn tại hoặc không thuộc về người dùng.");
            }
            console.log(`Đang khởi chạy browser cho profile ${profileId}...`);
            const { context: browserContext, page, browser, } = await utils_service_1.UtilService.launch(profile, options);
            // context = browserContext;
            console.log(`Browser đã được khởi chạy cho profile ${profileId}.`);
            // await ProfileModel.update(profile.id, { status: "active" });
            // const fingerprintData = profile.fingerprint ? JSON.parse(profile.fingerprint) : {};
            // const userAgent = fingerprintData.userAgent || (await page.evaluate("navigator.userAgent"));
            // const newSession = await ProfileSessionModel.create({
            //   profileId: profile.id.toString(),
            //   status: "running",
            //   startTime: new Date(),
            //   userAgent:"",
            //   ip: "DYNAMIC_IP_FROM_PROXY_CHECK",
            // });
            // return newSession;
            return { success: true, profileId: profile.id };
        }
        catch (error) {
            console.error(`Lỗi khi khởi chạy browser cho profile ${profileId}:`, error.message);
            // if (context) {
            //   await context
            //     .close()
            //     .catch((e) => console.error("Lỗi khi đóng browser context:", e));
            // }
            throw new Error(`Không thể khởi chạy browser: ${error.message}`);
        }
    }
    static async launchConcurrentProfiles(userId, profileIds, concurrent, options = {}) {
        const queue = [...profileIds]; // Tạo hàng đợi từ danh sách profileIds
        const sessions = []; // Lưu thông tin các session đã chạy
        const launchProfile = async (profileId) => {
            try {
                // Tìm profile trong database
                const profile = await Profile_1.ProfileModel.findById(parseInt(profileId));
                if (!profile) {
                    throw new Error(`Profile ${profileId} không tồn tại hoặc không thuộc về người dùng.`);
                }
                console.log(`Đang khởi chạy browser cho profile ${profileId}...`);
                const { context, page, browser } = await utils_service_1.UtilService.launch(profile, options);
                // const { context, page, browser } = await UtilService.launchTest(
                //   options,
                // );
                console.log(`Browser đã được khởi chạy cho profile ${profileId}.`);
                // Cập nhật trạng thái profile
                await Profile_1.ProfileModel.update(profile.id, { status: "active" });
                // Tạo session mới cho profile
                // const fingerprintData = profile.fingerprint ? JSON.parse(profile.fingerprint) : {};
                // const userAgent = fingerprintData.userAgent || (await page.evaluate("navigator.userAgent"));
                // const newSession = await ProfileSessionModel.create({
                //   profileId: profile.id.toString(),
                //   status: "running",
                //   startTime: new Date(),
                //   userAgent,
                //   ip: "DYNAMIC_IP_FROM_PROXY_CHECK",
                // });
                // sessions.push(newSession);
                // Giả lập automation hoàn thành hoặc profile bị tắt (có thể thay bằng logic thực tế)
                await new Promise((resolve) => setTimeout(resolve, (0, crypto_1.randomInt)(5000, 10000))); // Chờ 10 giây
                await context.close(); // Đóng browser sau khi hoàn thành
            }
            catch (error) {
                console.error(`Lỗi khi khởi chạy profile ${profileId}:`, error);
            }
        };
        // Tạo các worker để xử lý hàng đợi
        const workers = Array.from({ length: concurrent }, async () => {
            while (queue.length > 0) {
                const profileId = queue.shift(); // Lấy profile tiếp theo từ hàng đợi
                if (profileId) {
                    // await limit(() => launchProfile(profileId)); // Chạy profile trong giới hạn luồng
                    await launchProfile(profileId);
                }
            }
        });
        await Promise.all(workers); // Chờ tất cả worker hoàn thành
        return "sessions";
    }
    static async launchConcurrentGroupProfiles(userId, groupId, concurrent, options = {}) {
        try {
            const groupMembers = await ProfileGroup_1.ProfileGroupModel.getProfiles(parseInt(groupId));
            if (groupMembers.length === 0) {
                throw new Error(`Không có profile nào trong group ${groupId} thuộc về người dùng.`);
            }
            const profileIds = groupMembers.map((profile) => profile.id.toString());
            return await this.launchConcurrentProfiles(userId, profileIds, concurrent, options);
        }
        catch (error) {
            console.error(`Lỗi khi lấy profile từ group ${groupId}:`, error);
            throw new Error(`Không thể chạy profile group: ${error.message}`);
        }
    }
    /**
       * Chạy workflow với một profile đơn và quản lý execution
       */
    static async executeWorkflowWithProfile(userId, profileId, workflowId, options = {}) {
        try {
            const profile = await Profile_1.ProfileModel.findById(parseInt(profileId));
            // Tạo bản ghi execution với trạng thái "running"
            // const execution = await WorkflowExecutionModel.create({
            //   workflowId: parseInt(workflowId),
            //   status: "running",
            //   startTime: new Date(),
            //   progress: JSON.stringify({ completed: 0, total: 100, percentComplete: 0 }),
            // });
            if (!profile) {
                throw new Error(`Profile ${profileId} not found`);
            }
            const { context, page, browser } = await utils_service_1.UtilService.launch(options);
            try {
                // TODO: Implement workflow execution logic
                // const result = { variables: {} };
                // // Cập nhật execution thành "completed"
                // if (execution) {
                //   await WorkflowExecutionModel.update(execution.id, {
                //     status: "completed",
                //     endTime: new Date(),
                //     results: JSON.stringify({
                //       successCount: 1,
                //       failureCount: 0,
                //       details: [{ profileId, success: true, variables: result.variables || {} }],
                //     }),
                //     progress: JSON.stringify({ completed: 100, total: 100, percentComplete: 100 }),
                //   });
                // }
                console.error(`try run profile wiht workflow ${workflowId}:`);
                let execution = (0, executor_1.executeWorkflow)(workflowId, context, page, userId);
                console.error(`finish run profile wiht workflow ${workflowId}:`);
                return execution;
            }
            catch (workflowError) {
                // Cập nhật execution thành "failed"
                // if (execution) {
                //   await WorkflowExecutionModel.update(execution.id, {
                //     status: "failed",
                //     endTime: new Date(),
                //     errorMessage: workflowError instanceof Error ? workflowError.message : "Workflow execution failed",
                //   });
                // }
                throw workflowError;
            }
            finally {
                await context.close(); // Đóng context sau khi hoàn thành
            }
        }
        catch (error) {
            console.error(`Error executing workflow for profile ${profileId}:`, error);
            throw error;
        }
    }
    /**
     * Chạy workflow với danh sách profile kèm số luồng đồng thời
     */
    static async executeWorkflowWithProfiles(userId, profileIds, workflowId, concurrent, options = {}) {
        if (!pLimit) {
            pLimit = (await Promise.resolve().then(() => __importStar(require('p-limit')))).default;
        }
        const limit = pLimit(concurrent); // Giới hạn số luồng đồng thời
        const executionPromises = profileIds.map(profileId => limit(() => this.executeWorkflowWithProfile(userId, profileId, workflowId, options).catch(error => {
            console.error(`Error executing workflow for profile ${profileId}:`, error);
            return null; // Trả về null nếu có lỗi để không làm gián đoạn các luồng khác
        })));
        const results = await Promise.all(executionPromises);
        return results.filter(result => result !== null); // Lọc bỏ các kết quả lỗi
    }
    /**
     * Chạy workflow với một group profile kèm số luồng đồng thời
     */
    static async executeWorkflowWithProfileGroup(userId, groupId, workflowId, concurrent, options = {}) {
        const group = await ProfileGroup_1.ProfileGroupModel.findById(parseInt(groupId));
        if (!group)
            throw new Error("Profile group not found");
        const profiles = await ProfileGroup_1.ProfileGroupModel.getProfiles(parseInt(groupId));
        const profileIds = profiles.map(profile => profile.id.toString());
        return this.executeWorkflowWithProfiles(userId, profileIds, workflowId, concurrent, options);
    }
}
exports.LaunchService = LaunchService;
