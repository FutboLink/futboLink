import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

// Igual que AuthGuard pero sin lanzar 401 si no hay token o el token es inválido.
// Si el token es válido, setea request.user para que el controller lo use.
// Si no, deja pasar la request sin user (acceso público).
@Injectable()
export class OptionalAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization']?.split(' ')[1];
    if (!token) return true;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      request.user = decoded;
    } catch {
      // token inválido o expirado: lo ignoramos y la request entra como anónima
    }
    return true;
  }
}
