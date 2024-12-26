import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JobsModule } from './modules/Jobs/jobs.module';
import typeormConfig from './modules/config/typeorm';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [typeormConfig] }),
    TypeOrmModule.forRootAsync({ useFactory: typeormConfig }),
    JobsModule,
    UserModule
  ],
})
export class AppModule {}
