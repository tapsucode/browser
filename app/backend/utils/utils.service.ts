import { ProxyModel } from "../models/Proxy";
import * as playwright from "playwright";
import fs from "fs-extra";
import path from "path";
import { config } from "../config/env";
import { FingerprintData } from "../models/Profile"; // Giả sử bạn có một interface cho fingerprint

const getProfileDataPath = (profileId: string) => {
  const profileDataDir = config.PROFILE_DATA_DIR.startsWith('./') ?
    path.join(process.cwd(), config.PROFILE_DATA_DIR.slice(2)) :
    config.PROFILE_DATA_DIR;
  return path.join(profileDataDir, profileId);
};

export class UtilService {
  static async getProxyAddress(proxyId: number): Promise<string | undefined> {
    try {
      const proxy = await ProxyModel.findById(proxyId);
      return proxy ? `${proxy.ip}:${proxy.port}` : undefined;
    } catch (error) {
      console.error("Error getting proxy address:", error);
      return undefined;
    }
  }

  static async launch(profile: any, options: any = {}) {
    const profileDataDir = getProfileDataPath(profile.id);
    fs.ensureDirSync(profileDataDir);

    const browserType = playwright.chromium;

    // const browserType = profile.browserType?.toLowerCase() || config.DEFAULT_BROWSER_TYPE;
    // const pwBrowserType: { [key: string]: keyof typeof playwright } = {
    //   chrome: "chromium",
    //   chromium: "chromium",
    //   firefox: "firefox",
    //   edge: "chromium",
    //   safari: "webkit",
    //   webkit: "webkit",
    // };
    // const selectedBrowser = pwBrowserType[browserType] || "chromium";

    // const browserTypeInstance = (playwright as any)[selectedBrowser] as playwright.BrowserType<{}>;
    // if (!browserTypeInstance) {
    //   throw new Error(`Unsupported browser type: ${profile.browserType}`);
    // }

    const browserTypeInstance = playwright.chromium; // Chỉ sử dụng Chromium để tránh lỗi

    // const baseLaunchArgs  = [
    //   "--disable-blink-features=AutomationControlled",
    //   "--disable-infobars",
    //   "--no-sandbox",
    //   "--disable-setuid-sandbox",
    //   "--disable-gpu",
    //   "--disable-dev-shm-usage",
    //   "--aggressive-cache-discard",
    //   "--disable-cache",
    //   "--disk-cache-size=0",
    //   "--v8-cache-options=off",
    // ];

    // const launchArgs = this.buildLaunchArgsFromFingerprint(profile, baseLaunchArgs);

    let proxyConfig: {
      server: string;
      username?: string;
      password?: string;
    } | undefined;
    if (profile.proxy?.host && profile.proxy?.port) {
      proxyConfig = {
        server: `${profile.proxy.type}://${profile.proxy.host}:${profile.proxy.port}`,
        username: profile.proxy.username,
        password: profile.proxy.password,
      };
    }

    const context = await browserTypeInstance.launchPersistentContext(
      profileDataDir,
      {
        headless: options.headless ?? false,
        // args: launchArgs,
        // proxy: proxyConfig,
        executablePath: config.CUSTOM_CHROMIUM_PATH,
      },
    );

    const page = await context.newPage();
    await page.goto("about:blank");

    return { context, page, browser: context.browser() };
  }

  /**
 * Xây dựng mảng launch arguments từ một đối tượng FingerprintData.
 * @param fingerprint - Đối tượng chứa thông tin fingerprint.
 * @param initialArgs - Một mảng các arguments ban đầu (tùy chọn).
 * @returns Mảng các arguments hoàn chỉnh.
 */
static buildLaunchArgsFromFingerprint(
  fingerprint: FingerprintData | undefined,
  initialArgs: string[] = []
): string[] {
  // Tạo một bản sao để không làm thay đổi mảng ban đầu
  const finalArgs = [...initialArgs];

  // Nếu không có fingerprint, trả về mảng args ban đầu
  if (!fingerprint) {
    return finalArgs;
  }

  // Duyệt qua tất cả các thuộc tính của đối tượng fingerprint
  for (const key in fingerprint) {
    // Ép kiểu để TypeScript hiểu key là một thuộc tính hợp lệ của FingerprintData
    const typedKey = key as keyof FingerprintData;
    const value = fingerprint[typedKey];

    // Lọc bỏ những thuộc tính là null, undefined, 0, hoặc chuỗi rỗng
    if (value === null || value === undefined || value === 0 || value === '') {
      continue; // Bỏ qua và đi đến thuộc tính tiếp theo
    }
    
    // Gọi hàm helper để thêm cờ tương ứng
    this.applyFingerprintArg(typedKey, value, finalArgs);
  }

  return finalArgs;
}

  /**
 * Hàm này nhận vào một key và value từ đối tượng fingerprint,
 * sau đó thêm cờ (flag) tương ứng vào mảng launchArgs.
 * @param key - Tên thuộc tính của fingerprint (ví dụ: 'userAgent', 'timezone').
 * @param value - Giá trị của thuộc tính đó.
 * @param args - Mảng launchArgs hiện tại để thêm cờ mới vào.
 */
  static applyFingerprintArg(key: keyof FingerprintData, value: any, args: string[]): void {

    switch (key) {
      // case 'userAgent':
      //   args.push(`--user-agent="${value}"`);
      //   break;
      // case 'timezone':
      //   args.push(`--spoof-timezone=${value}`);
      //   break;
      // case 'language':
      //   args.push(`--lang=${value}`);
      //   break;

      // case 'resolution':
      //   args.push(`--window-size=${value}`);
      //   break;

      // case 'platform':
      //   args.push(`--spoof-platform-name=${value}`);
      //   break;

      // case 'doNotTrack':
      //   if (value) {
      //     args.push('--enable-do-not-track');
      //   }
      //   break;

      case 'hardwareConcurrency':
        args.push(`--spoof-hardware-concurrency=${value}`);
        break;

      case 'deviceMemory':
        args.push(`--spoof-device-memory=${value}`);
        break;
      case 'canvas':
        args.push(`--spoof-canvas-noise-level=${value}`);
        break;

      case 'webGL':
        if (value) {
          args.push(`--enable-webgl-spoofing`);
        }
        break;
      default:
        break;
    }
  }

  /**
   * Khởi chạy một phiên trình duyệt Playwright với cấu hình tối thiểu để test.
   * Không sử dụng profile data, proxy, hay fingerprint phức tạp.
   * @param {object} options - Tùy chọn, ví dụ: { headless: true }
   * @returns {Promise<{context: playwright.BrowserContext, page: playwright.Page, browser: playwright.Browser}>}
   */
  static async launchTest(options: { headless?: boolean } = {}) {
    try {
      console.log("Launching a minimal browser for testing...");

      // 1. Chọn trình duyệt mặc định (chromium là lựa chọn an toàn nhất)
      const browserType = playwright.chromium;

      // 2. Các đối số khởi chạy cơ bản
      const launchArgs = [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--disable-dev-shm-usage',
      ];

      // 3. Khởi chạy trình duyệt
      // Dùng `browserType.launch` thay vì `launchPersistentContext` để không lưu lại dữ liệu
      const browser = await browserType.launch({
        headless: options.headless ?? false, // Mặc định là có giao diện
        args: launchArgs,
        executablePath: config.CUSTOM_CHROMIUM_PATH,
      });

      // 4. Tạo một context và một trang mới
      const context = await browser.newContext();
      const page = await context.newPage();

      console.log("Test browser launched successfully.");

      // 5. Trả về các đối tượng cần thiết
      return { context, page, browser };

    } catch (error: any) {
      console.error("Failed to launch test browser:", error);
      throw new Error(`Could not launch test browser: ${error.message}`);
    }
  }
}
