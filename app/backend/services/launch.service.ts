import { ProfileModel } from "../models/Profile";
import { ProfileGroupModel } from "../models/ProfileGroup";
import { ProfileSessionModel } from "../models/ProfileSession";
import { ProxyModel } from "../models/Proxy";
import * as playwright from "playwright";
import { UtilService } from "../utils/utils.service";
// Dynamic import for p-limit to avoid ES Module issues
let pLimit: any;
import { WorkflowExecutionModel } from "../models/WorkflowExecution";
import { randomInt } from "crypto";
import { executeWorkflow } from "../workflow/executor";
export class LaunchService {
  static async launchProfile(
    userId: string,
    profileId: string,
    options: any = {},
  ) {
    let context: playwright.BrowserContext | null = null;
    try {
      const profile = await ProfileModel.findById(parseInt(profileId, 10));

      if (!profile) {
        throw new Error(
          "Profile không tồn tại hoặc không thuộc về người dùng.",
        );
      }

      console.log(`Đang khởi chạy browser cho profile ${profileId}...`);
      const {
        context: browserContext,
        page,
        browser,
      } = await UtilService.launch(profile, options);

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
    } catch (error: any) {
      console.error(
        `Lỗi khi khởi chạy browser cho profile ${profileId}:`,
        error.message,
      );
      // if (context) {
      //   await context
      //     .close()
      //     .catch((e) => console.error("Lỗi khi đóng browser context:", e));
      // }
      throw new Error(`Không thể khởi chạy browser: ${error.message}`);
    }
  }

  static async launchConcurrentProfiles(
    userId: string,
    profileIds: string[],
    concurrent: number,
    options: any = {},
  ) {
    const queue = [...profileIds]; // Tạo hàng đợi từ danh sách profileIds
    const sessions: any[] = []; // Lưu thông tin các session đã chạy

    const launchProfile = async (profileId: string) => {
      try {
        // Tìm profile trong database
        const profile = await ProfileModel.findById(parseInt(profileId));

        if (!profile) {
          throw new Error(
            `Profile ${profileId} không tồn tại hoặc không thuộc về người dùng.`,
          );
        }

        console.log(`Đang khởi chạy browser cho profile ${profileId}...`);
        const { context, page, browser } = await UtilService.launch(
          profile,
          options,
        );

        // const { context, page, browser } = await UtilService.launchTest(
        //   options,
        // );
        console.log(`Browser đã được khởi chạy cho profile ${profileId}.`);

        // Cập nhật trạng thái profile
        await ProfileModel.update(profile.id, { status: "active" });

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
        await new Promise((resolve) => setTimeout(resolve, randomInt(5000, 10000))); // Chờ 10 giây
        await context.close(); // Đóng browser sau khi hoàn thành
      } catch (error: any) {
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

  static async launchConcurrentGroupProfiles(
    userId: string,
    groupId: string,
    concurrent: number,
    options: any = {},
  ) {
    try {
      const groupMembers = await ProfileGroupModel.getProfiles(
        parseInt(groupId),
      );

      if (groupMembers.length === 0) {
        throw new Error(
          `Không có profile nào trong group ${groupId} thuộc về người dùng.`,
        );
      }

      const profileIds = groupMembers.map((profile) => profile.id.toString());

      return await this.launchConcurrentProfiles(
        userId,
        profileIds,
        concurrent,
        options,
      );
    } catch (error: any) {
      console.error(`Lỗi khi lấy profile từ group ${groupId}:`, error);
      throw new Error(`Không thể chạy profile group: ${error.message}`);
    }
  }

  /**
     * Chạy workflow với một profile đơn và quản lý execution
     */
  static async executeWorkflowWithProfile(userId: string, profileId: string, workflowId: string, options: any = {}) {
    try {
      const profile = await ProfileModel.findById(parseInt(profileId));

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

      const { context, page, browser } = await UtilService.launch(options);
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
        let execution = executeWorkflow(workflowId,context, page, userId);
        console.error(`finish run profile wiht workflow ${workflowId}:`);

        return execution;
      } catch (workflowError) {
        // Cập nhật execution thành "failed"
        // if (execution) {
        //   await WorkflowExecutionModel.update(execution.id, {
        //     status: "failed",
        //     endTime: new Date(),
        //     errorMessage: workflowError instanceof Error ? workflowError.message : "Workflow execution failed",
        //   });
        // }
        throw workflowError;
      } finally {
        await context.close(); // Đóng context sau khi hoàn thành
      }
    } catch (error) {
      console.error(`Error executing workflow for profile ${profileId}:`, error);
      throw error;
    }
  }

  /**
   * Chạy workflow với danh sách profile kèm số luồng đồng thời
   */
  static async executeWorkflowWithProfiles(userId: string, profileIds: string[], workflowId: string, concurrent: number, options: any = {}) {
    if (!pLimit) {
      pLimit = (await import('p-limit')).default;
    }
    const limit = pLimit(concurrent); // Giới hạn số luồng đồng thời
    const executionPromises = profileIds.map(profileId =>
      limit(() => this.executeWorkflowWithProfile(userId, profileId, workflowId, options).catch(error => {
        console.error(`Error executing workflow for profile ${profileId}:`, error);
        return null; // Trả về null nếu có lỗi để không làm gián đoạn các luồng khác
      }))
    );
    const results = await Promise.all(executionPromises);
    return results.filter(result => result !== null); // Lọc bỏ các kết quả lỗi
  }

  /**
   * Chạy workflow với một group profile kèm số luồng đồng thời
   */
  static async executeWorkflowWithProfileGroup(userId: string, groupId: string, workflowId: string, concurrent: number, options: any = {}) {
    const group = await ProfileGroupModel.findById(parseInt(groupId));
    if (!group) throw new Error("Profile group not found");

    const profiles = await ProfileGroupModel.getProfiles(parseInt(groupId));

    const profileIds = profiles.map(profile => profile.id.toString());
    return this.executeWorkflowWithProfiles(userId, profileIds, workflowId, concurrent, options);
  }
}