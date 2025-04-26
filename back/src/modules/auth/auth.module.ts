import { Module } from '@nestjs/common';
import { authController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt'; 
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { EmailService } from '../Mailing/email.service';
import { UserService } from '../user/user.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [authController],
  providers: [AuthService, EmailService, UserService, JwtStrategy],
})
export class AuthModule {}
