import { UnauthorizedException } from "@nestjs/common";

export function RoleGuard(allowedRoles: string[]) {
    return (req: any, res: any, next: () => void) => {
      const { role } = req.user;
      if (!allowedRoles.includes(role)) {
        throw new UnauthorizedException('Access denied');
      }
      next();
    };
  }
  