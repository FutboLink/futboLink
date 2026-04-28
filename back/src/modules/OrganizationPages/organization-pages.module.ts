import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationPage } from './entities/organization-page.entity';
import { User } from '../user/entities/user.entity';
import { OrganizationPagesController } from './organization-pages.controller';
import { OrganizationPagesService } from './organization-pages.service';
import { MailingModule } from '../Mailing/mailing.module';

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationPage, User]), MailingModule],
  controllers: [OrganizationPagesController],
  providers: [OrganizationPagesService],
  exports: [OrganizationPagesService],
})
export class OrganizationPagesModule {}
