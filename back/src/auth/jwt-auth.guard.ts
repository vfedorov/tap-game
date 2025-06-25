import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import {User} from "@app/models/user.model";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
        'roles',
        context.getHandler(),
    ) || [];

    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) return false;

    try {
      const user = jwt.verify(token, process.env.JWT_SECRET as string) as User;
      request.user = user;

      if (requiredRoles.length === 0) return true;
      return requiredRoles.includes(user.role);
    } catch {
      return false;
    }
  }
}