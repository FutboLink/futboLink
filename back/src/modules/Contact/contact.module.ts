import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { MailingModule } from '../Mailing/mailing.module';

@Module({
  imports: [MailingModule],
  controllers: [ContactController],
})
export class ContactModule {} 