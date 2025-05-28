import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ContactController } from './contact.controller';

@Module({
  imports: [ConfigModule],
  controllers: [ContactController],
  providers: [],
  exports: []
})
export class ContactModule {} 