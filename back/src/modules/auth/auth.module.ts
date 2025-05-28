import { Module } from '@nestjs/common';
import { authController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt'; 
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { EmailService } from '@modules/Mailing/email.service';
import { UserService } from '../user/user.service';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule } from '@nestjs/config';

// JWT Secret hardcoded for development - in production this should be an env variable
const JWT_SECRET = 'futbolinkSecureJwtSecret2023';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || JWT_SECRET,
      signOptions: { expiresIn: '7d' }, // Extended to 7 days to allow more time for password reset
    }),
    TypeOrmModule.forFeature([User]),
    ConfigModule,
  ],
  controllers: [authController],
  providers: [AuthService, EmailService, UserService, JwtStrategy],
})
export class AuthModule {}
