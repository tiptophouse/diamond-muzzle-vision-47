// src/api/sftp.ts
import { http } from "./http";

export type ProvisionResponse = {
  host_name: string;
  port_number: number;
  folder: string;
  username: string;
  password: string;
  test_result: boolean;
};

export async function provisionSftp(): Promise<ProvisionResponse> {
  return http<ProvisionResponse>("/api/v1/sftp/provision", { method: "POST" });
}