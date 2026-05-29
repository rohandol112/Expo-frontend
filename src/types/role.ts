export interface Role {
  id: string;
  name: string;
  users: number;
  description: string;
  permissions: Record<string, string[]>;
}
