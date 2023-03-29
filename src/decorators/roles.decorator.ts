import { SetMetadata } from "@nestjs/common";
import { UserRole } from "src/common/defaults";

export const ROLES_KEY = 'roles';
export const Roles = (role: UserRole) => SetMetadata(ROLES_KEY, role);