import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateOrganizationPageDto } from './create-organization-page.dto';

export class UpdateOrganizationPageDto extends PartialType(
  OmitType(CreateOrganizationPageDto, ['type'] as const),
) {}
