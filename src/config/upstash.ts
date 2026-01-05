import { Client as WorkflowClient } from "@upstash/workflow";
import { QSTASH_URL, QSTASH_TOKEN } from "./env";

export const workflowClient = new WorkflowClient({
    baseUrl: QSTASH_URL as string,
    token: QSTASH_TOKEN as string,
});