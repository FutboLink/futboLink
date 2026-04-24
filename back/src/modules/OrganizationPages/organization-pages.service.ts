import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  OrganizationPage,
  OrganizationPageStatus,
  OrganizationPageType,
} from './entities/organization-page.entity';
import { User } from '../user/entities/user.entity';
import { UserType } from '../user/roles.enum';
import { CreateOrganizationPageDto } from './dto/create-organization-page.dto';
import { UpdateOrganizationPageDto } from './dto/update-organization-page.dto';
import { ListOrganizationPagesQueryDto } from './dto/list-organization-pages-query.dto';

const ADMIN_ONLY_TYPES: OrganizationPageType[] = [
  OrganizationPageType.LEAGUE,
  OrganizationPageType.FEDERATION,
  OrganizationPageType.NATIONAL_TEAM,
];

function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

type AuthUser = { id: string; role: string };

@Injectable()
export class OrganizationPagesService {
  constructor(
    @InjectRepository(OrganizationPage)
    private readonly pageRepository: Repository<OrganizationPage>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    dto: CreateOrganizationPageDto,
    authUser: AuthUser,
  ): Promise<OrganizationPage> {
    const isAdmin = authUser.role === UserType.ADMIN;

    if (ADMIN_ONLY_TYPES.includes(dto.type) && !isAdmin) {
      throw new ForbiddenException(
        'Solo un ADMIN puede crear páginas de tipo LEAGUE, FEDERATION o NATIONAL_TEAM',
      );
    }

    if (!isAdmin) {
      const dbUser = await this.userRepository.findOne({
        where: { id: authUser.id },
        select: { id: true, role: true, puesto: true },
      });
      if (!dbUser) {
        throw new ForbiddenException('Usuario no encontrado');
      }
      if (dbUser.role === UserType.PLAYER && dbUser.puesto === 'Jugador') {
        throw new ForbiddenException(
          'Los futbolistas no pueden crear páginas de organizaciones',
        );
      }
    }

    const leagueId = dto.type === OrganizationPageType.CLUB ? dto.leagueId : null;
    if (leagueId) {
      const league = await this.pageRepository.findOne({ where: { id: leagueId } });
      if (!league) {
        throw new BadRequestException('La liga referenciada no existe');
      }
      if (league.type !== OrganizationPageType.LEAGUE) {
        throw new BadRequestException('El leagueId debe apuntar a una página tipo LEAGUE');
      }
    }

    const slug = await this.generateUniqueSlug(dto.name);

    const page = this.pageRepository.create({
      type: dto.type,
      name: dto.name,
      slug,
      country: dto.country ?? null,
      region: dto.region ?? null,
      foundationYear: dto.foundationYear ?? null,
      description: dto.description ?? null,
      logoUrl: dto.logoUrl ?? null,
      bannerUrl: dto.bannerUrl ?? null,
      website: dto.website ?? null,
      contactEmail: dto.contactEmail ?? null,
      phone: dto.phone ?? null,
      socialMedia: dto.socialMedia ?? {},
      status: OrganizationPageStatus.APPROVED,
      ownerId: authUser.id,
      leagueId,
    });

    return this.pageRepository.save(page);
  }

  async findAll(
    query: ListOrganizationPagesQueryDto,
    authUser?: AuthUser,
  ): Promise<{ data: OrganizationPage[]; total: number; page: number; limit: number }> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const isAdmin = authUser?.role === UserType.ADMIN;

    const qb = this.pageRepository.createQueryBuilder('op');

    if (!isAdmin) {
      qb.andWhere('op.status = :status', { status: OrganizationPageStatus.APPROVED });
    }

    if (query.type) {
      qb.andWhere('op.type = :type', { type: query.type });
    }

    if (query.country) {
      qb.andWhere('op.country = :country', { country: query.country });
    }

    if (query.q) {
      qb.andWhere('op.name ILIKE :q', { q: `%${query.q}%` });
    }

    qb.orderBy('op.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async findOne(id: string, authUser?: AuthUser): Promise<OrganizationPage> {
    const page = await this.pageRepository.findOne({ where: { id } });
    if (!page) {
      throw new NotFoundException(`Organization page ${id} not found`);
    }
    this.assertVisibility(page, authUser);
    return page;
  }

  async findBySlug(slug: string, authUser?: AuthUser): Promise<OrganizationPage> {
    const page = await this.pageRepository.findOne({ where: { slug } });
    if (!page) {
      throw new NotFoundException(`Organization page con slug "${slug}" no encontrada`);
    }
    this.assertVisibility(page, authUser);
    return page;
  }

  async findMine(authUser: AuthUser): Promise<OrganizationPage[]> {
    return this.pageRepository.find({
      where: { ownerId: authUser.id },
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    dto: UpdateOrganizationPageDto,
    authUser: AuthUser,
  ): Promise<OrganizationPage> {
    const page = await this.pageRepository.findOne({ where: { id } });
    if (!page) {
      throw new NotFoundException(`Organization page ${id} not found`);
    }

    const isAdmin = authUser.role === UserType.ADMIN;
    const isOwner = page.ownerId === authUser.id;
    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('No tenés permisos para editar esta página');
    }

    if (dto.leagueId !== undefined) {
      if (page.type !== OrganizationPageType.CLUB) {
        dto.leagueId = null as unknown as string;
      } else if (dto.leagueId) {
        const league = await this.pageRepository.findOne({
          where: { id: dto.leagueId },
        });
        if (!league || league.type !== OrganizationPageType.LEAGUE) {
          throw new BadRequestException(
            'El leagueId debe apuntar a una página tipo LEAGUE existente',
          );
        }
      }
    }

    Object.assign(page, dto);
    return this.pageRepository.save(page);
  }

  async deactivate(id: string, authUser: AuthUser): Promise<OrganizationPage> {
    if (authUser.role !== UserType.ADMIN) {
      throw new ForbiddenException('Solo un ADMIN puede desactivar páginas');
    }
    const page = await this.pageRepository.findOne({ where: { id } });
    if (!page) {
      throw new NotFoundException(`Organization page ${id} not found`);
    }
    page.status = OrganizationPageStatus.DEACTIVATED;
    return this.pageRepository.save(page);
  }

  async hardDelete(id: string, authUser: AuthUser): Promise<void> {
    if (authUser.role !== UserType.ADMIN) {
      throw new ForbiddenException('Solo un ADMIN puede eliminar páginas');
    }
    const page = await this.pageRepository.findOne({ where: { id } });
    if (!page) {
      throw new NotFoundException(`Organization page ${id} not found`);
    }
    await this.pageRepository.remove(page);
  }

  private assertVisibility(page: OrganizationPage, authUser?: AuthUser): void {
    const isAdmin = authUser?.role === UserType.ADMIN;
    if (isAdmin) return;
    if (page.status !== OrganizationPageStatus.APPROVED) {
      throw new NotFoundException('Organization page not found');
    }
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    const base = slugify(name) || 'page';
    let candidate = base;
    let suffix = 2;
    while (await this.pageRepository.findOne({ where: { slug: candidate } })) {
      candidate = `${base}-${suffix}`;
      suffix += 1;
    }
    return candidate;
  }
}
