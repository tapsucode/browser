"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = execute;
const parser_1 = require("./parser");
const registry_1 = require("./registry");
// Phần 1: Engine thực thi workflow
// async function execute(workflowJson: any, { browserContext, page, userId }: {
//   browserContext: any;
//   page: any;
//   userId: string;
// }) {
//   // Parse workflow
//   const { nodesMap, adjList } = parseWorkflow(workflowJson);
//   const order = topoSort(nodesMap, adjList);
//   // Khởi tạo context
//   let context: any = {
//     browserContext,
//     page,
//     variables: {},
//     userId,
//     log: [],
//   };
//   // Thực thi các node theo thứ tự topo
//   for (const nodeId of order) {
//     const node = nodesMap.get(nodeId);
//     if (!node) {
//       throw new Error(`Node not found: ${nodeId}`);
//     }
//     const handler = registry[node.type];
//     if (!handler) {
//       throw new Error(`No handler registered for type: ${node.type}`);
//     }
//     context = await handler(context, node.parameters, nodeId);
//   }
//   return context;
// }
// export { execute };
async function execute(workflowJson, { browserContext, page, userId }) {
    // --- LOG: Bắt đầu quá trình thực thi ---
    console.log("=======================================");
    console.log(`[ENGINE] Starting workflow execution for user: ${userId}`);
    console.log("=======================================");
    // 1. Parse workflow
    console.log("[ENGINE] Parsing workflow structure (nodes and edges)...");
    const { nodesMap, adjList } = (0, parser_1.parseWorkflow)(workflowJson);
    console.log(`[ENGINE] Parsed. Found ${nodesMap.size} nodes.`);
    // 2. Sắp xếp thứ tự thực thi (Topological Sort)
    console.log("[ENGINE] Performing topological sort to determine execution order...");
    const order = (0, parser_1.topoSort)(nodesMap, adjList);
    console.log("[ENGINE] Execution order determined:", order); // In ra thứ tự các node sẽ chạy
    // 3. Khởi tạo context
    console.log("[ENGINE] Initializing execution context...");
    let context = {
        browserContext,
        page,
        variables: {},
        userId,
        log: [], // Mảng log nội bộ của workflow
    };
    console.log("[ENGINE] Context initialized.");
    // 4. Thực thi các node theo thứ tự đã sắp xếp
    console.log("--- Executing Nodes ---");
    for (const nodeId of order) {
        const node = nodesMap.get(nodeId);
        if (!node) {
            // Log lỗi này trước khi ném ra
            console.error(`[ENGINE] FATAL: Node with ID '${nodeId}' not found in nodesMap.`);
            throw new Error(`Node not found: ${nodeId}`);
        }
        // --- LOG: Trước khi thực thi một node ---
        console.log(`\n[NODE] Executing node: ID='${nodeId}', Type='${node.type}'`);
        // In ra các tham số của node để dễ debug
        console.log(`[NODE] Parameters:`, JSON.stringify(node.data.parameters, null, 2));
        const handler = registry_1.registry[node.type];
        if (!handler) {
            console.error(`[ENGINE] FATAL: No handler registered for node type: '${node.type}'`);
            throw new Error(`No handler registered for type: ${node.type}`);
        }
        try {
            // Gọi handler để thực thi logic của node
            const startTime = Date.now();
            context = await handler(context, node.data.parameters, nodeId);
            const endTime = Date.now();
            // --- LOG: Sau khi thực thi thành công một node ---
            console.log(`[NODE] Successfully executed node '${nodeId}'. Duration: ${endTime - startTime}ms`);
            // Bạn có thể log trạng thái của variables sau mỗi bước nếu muốn
            // console.log(`[CONTEXT] Variables after node '${nodeId}':`, context.variables);
        }
        catch (error) {
            // --- LOG: Khi có lỗi xảy ra trong một handler ---
            console.error(`[NODE] ERROR during execution of node ID='${nodeId}', Type='${node.type}'`);
            console.error(error); // In ra toàn bộ lỗi
            // Ném lại lỗi để dừng toàn bộ workflow
            throw new Error(`Execution failed at node '${nodeId}': ${error.message}`);
        }
    }
    // --- LOG: Kết thúc workflow ---
    console.log("\n=======================================");
    console.log("[ENGINE] Workflow execution finished successfully.");
    console.log("=======================================");
    // Trả về context cuối cùng chứa kết quả
    return context;
}
