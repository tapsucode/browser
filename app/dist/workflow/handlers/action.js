"use strict";
// File: final/workflow/handlers/action.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.actionHandler = void 0;
const actionHandler = async (context, params, nodeId) => {
    const { page, browserContext, variables } = context;
    switch (nodeId) {
        case 'executeWorkflow':
            // Note: This would require importing workflowService, keeping as placeholder for now
            context.log.push({
                timestamp: new Date(),
                level: 'info',
                message: `Executing sub-workflow: ${params.workflowId}`,
                nodeId
            });
            break;
        case 'blocksGroup':
        case 'note':
            // Organizational nodes: no runtime action
            break;
        case 'workflowState':
            context.state = params.state;
            break;
        case 'openURL': {
            const target = params.url || variables[params.urlVariableRef];
            if (page && page.goto) {
                await page.goto(target, { waitUntil: 'networkidle' });
            }
            variables.lastOpenedUrl = target;
            break;
        }
        case 'imageSearch': {
            const selector = params.selectorValue || variables[params.selectorVariableRef];
            if (page && page.$) {
                const exists = await page.$(selector);
                variables[params.resultVar] = !!exists;
            }
            break;
        }
        case 'activeTab':
            // context.page already current
            break;
        case 'newTab': {
            if (browserContext && browserContext.newPage) {
                context.page = await browserContext.newPage();
            }
            break;
        }
        case 'resourceStatus': {
            if (page && page.evaluate) {
                context.resourceStatus = await page.evaluate((type) => {
                    return Array.from(window.performance.getEntries()).filter((r) => r.initiatorType === type).length;
                }, params.resourceType);
            }
            break;
        }
        case 'switchTab': {
            if (browserContext && browserContext.pages) {
                const pages = browserContext.pages();
                const idx = params.tabIndexVariableRef
                    ? variables[params.tabIndexVariableRef]
                    : params.tabIndex;
                context.page = pages[idx] || context.page;
            }
            break;
        }
        case 'newWindow':
            if (browserContext && browserContext.newPage) {
                context.page = await browserContext.newPage();
            }
            break;
        case 'goBack':
            if (page && page.goBack) {
                await page.goBack();
            }
            break;
        case 'goForward':
            if (page && page.goForward) {
                await page.goForward();
            }
            break;
        case 'closeTab':
            if (page && page.close) {
                await page.close();
            }
            break;
        case 'reloadPage':
            if (page && page.reload) {
                await page.reload();
            }
            break;
        case 'getURL':
            if (page && page.url) {
                variables[params.resultVar] = page.url();
            }
            break;
        case 'click':
            if (page && page.click) {
                await page.click(params.selectorValue || variables[params.selectorVariableRef], { timeout: params.timeout });
            }
            break;
        case 'doubleClick':
            if (page && page.dblclick) {
                await page.dblclick(params.selectorValue || variables[params.selectorVariableRef]);
            }
            break;
        case 'rightClick':
            if (page && page.click) {
                await page.click(params.selectorValue || variables[params.selectorVariableRef], { button: 'right', timeout: params.timeout });
            }
            break;
        case 'hover':
            if (page && page.hover) {
                await page.hover(params.selectorValue || variables[params.selectorVariableRef]);
            }
            break;
        case 'focus':
            if (page && page.focus) {
                await page.focus(params.selectorValue || variables[params.selectorVariableRef]);
            }
            break;
        case 'type':
            if (page && page.type) {
                await page.type(params.selectorValue || variables[params.selectorVariableRef], params.text || variables[params.variableRef], { delay: params.delay });
            }
            break;
        case 'clearInput':
            if (page && page.fill) {
                await page.fill(params.selectorValue || variables[params.selectorVariableRef], '');
            }
            break;
        case 'selectOption':
            if (page && page.selectOption) {
                await page.selectOption(params.selectorValue || variables[params.selectorVariableRef], params.value || variables[params.variableRef]);
            }
            break;
        case 'upload':
            if (page && page.setInputFiles) {
                await page.setInputFiles(params.selectorValue || variables[params.selectorVariableRef], params.filePath || variables[params.filePathVariableRef]);
            }
            break;
        case 'download':
            if (page && page.goto) {
                await page.goto(params.url || variables[params.urlVariableRef]);
            }
            break;
        case 'scroll':
            if (page && page.evaluate) {
                await page.evaluate(({ dir, amt }) => window.scrollBy(0, dir === 'down' ? amt : -amt), { dir: params.direction, amt: params.amount });
            }
            break;
        case 'scrollToElement':
            if (page && page.locator) {
                await page.locator(params.selectorValue || variables[params.selectorVariableRef]).scrollIntoViewIfNeeded();
            }
            break;
        case 'pressKey':
            if (page && page.keyboard && page.keyboard.press) {
                await page.keyboard.press(params.key || variables[params.keyVariableRef]);
            }
            break;
        case 'dragAndDrop':
            if (page && page.dragAndDrop) {
                await page.dragAndDrop(params.sourceSelectorValue || variables[params.sourceSelectorVariableRef], params.targetSelectorValue || variables[params.targetSelectorVariableRef]);
            }
            break;
        case 'getAttribute':
            if (page && page.getAttribute) {
                variables[params.resultVar] = await page.getAttribute(params.selectorValue || variables[params.selectorVariableRef], params.attribute);
            }
            break;
        // Control-flow cases
        case 'break':
        case 'continue':
        case 'try':
        case 'return':
        case 'retry':
            // Handled in loop or control-flow handlers
            break;
        default:
            context.log.push({
                timestamp: new Date(),
                level: 'warn',
                message: `Unhandled action node: ${nodeId}`,
                nodeId
            });
    }
    return context;
};
exports.actionHandler = actionHandler;
