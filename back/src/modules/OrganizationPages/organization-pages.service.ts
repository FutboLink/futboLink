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
import { EmailService } from '../Mailing/email.service';

const ADMIN_ONLY_TYPES: OrganizationPageType[] = [
  OrganizationPageType.LEAGUE,
  OrganizationPageType.FEDERATION,
  OrganizationPageType.NATIONAL_TEAM,
];

// Anti-duplicados: scores devueltos por pg_trgm.similarity().
// >= PENDING_THRESHOLD: la página queda en PENDING_REVIEW (admin decide).
// >= WARN_THRESHOLD: solo se muestra como advertencia al usuario en el wizard.
const SIMILARITY_PENDING_THRESHOLD = 0.4;
const SIMILARITY_WARN_THRESHOLD = 0.25;

export type SimilarPageMatch = {
  id: string;
  name: string;
  slug: string;
  type: OrganizationPageType;
  country: string | null;
  status: OrganizationPageStatus;
  score: number;
};

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
    private readonly emailService: EmailService,
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
      // Solo el Futbolista puro (PLAYER + puesto "Jugador" o vacío) está
      // bloqueado. Cuerpo Técnico, Agente, Dirección y demás puestos
      // pueden crear páginas. Espejo de `isFootballer` en el front.
      const puestoLower = (dbUser.puesto || '').toLowerCase();
      const isPureFootballer =
        dbUser.role === UserType.PLAYER &&
        (puestoLower === '' || puestoLower === 'jugador');
      if (isPureFootballer) {
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

    const matches = await this.findSimilarPages(
      dto.name,
      dto.type,
      dto.country ?? null,
      SIMILARITY_WARN_THRESHOLD,
    );
    const topScore = matches[0]?.score ?? 0;
    const status =
      topScore >= SIMILARITY_PENDING_THRESHOLD
        ? OrganizationPageStatus.PENDING_REVIEW
        : OrganizationPageStatus.APPROVED;

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
      status,
      ownerId: authUser.id,
      leagueId,
    });

    return this.pageRepository.save(page);
  }

  async findSimilarPages(
    name: string,
    type: OrganizationPageType,
    country: string | null,
    minScore: number = SIMILARITY_WARN_THRESHOLD,
    excludeId?: string,
  ): Promise<SimilarPageMatch[]> {
    const trimmed = name?.trim();
    if (!trimmed) return [];

    const qb = this.pageRepository
      .createQueryBuilder('op')
      .select([
        'op.id AS id',
        'op.name AS name',
        'op.slug AS slug',
        'op.type AS type',
        'op.country AS country',
        'op.status AS status',
      ])
      .addSelect('similarity(op.name, :name)', 'score')
      .where('op.type = :type', { type })
      .andWhere('op.status IN (:...visibleStatuses)', {
        visibleStatuses: [
          OrganizationPageStatus.APPROVED,
          OrganizationPageStatus.PENDING_REVIEW,
        ],
      })
      .andWhere('similarity(op.name, :name) >= :minScore', {
        name: trimmed,
        minScore,
      });

    if (country) {
      qb.andWhere('op.country = :country', { country });
    } else {
      qb.andWhere('op.country IS NULL');
    }

    if (excludeId) {
      qb.andWhere('op.id != :excludeId', { excludeId });
    }

    qb.orderBy('score', 'DESC').limit(5);

    const rows = await qb.getRawMany<{
      id: string;
      name: string;
      slug: string;
      type: OrganizationPageType;
      country: string | null;
      status: OrganizationPageStatus;
      score: string;
    }>();

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      type: r.type,
      country: r.country,
      status: r.status,
      score: Number(r.score),
    }));
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
    // Cargamos también `owner` (solo id + role) para que el front pueda
    // distinguir "Perfil Administrado" — una página creada por un user
    // común que la representa — de las páginas creadas/curadas por un
    // admin, que no tienen un dueño que las administre.
    // Usamos queryBuilder para no exponer todas las columnas de User
    // (especialmente password).
    const page = await this.pageRepository
      .createQueryBuilder('page')
      .leftJoinAndSelect('page.league', 'league')
      .leftJoin('page.owner', 'owner')
      .addSelect(['owner.id', 'owner.role'])
      .where('page.slug = :slug', { slug })
      .getOne();
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

  async checkDuplicates(
    name: string,
    type: OrganizationPageType,
    country: string | null,
  ): Promise<{
    matches: SimilarPageMatch[];
    topScore: number;
    willBePending: boolean;
    pendingThreshold: number;
    warnThreshold: number;
  }> {
    const matches = await this.findSimilarPages(
      name,
      type,
      country,
      SIMILARITY_WARN_THRESHOLD,
    );
    const topScore = matches[0]?.score ?? 0;
    return {
      matches,
      topScore,
      willBePending: topScore >= SIMILARITY_PENDING_THRESHOLD,
      pendingThreshold: SIMILARITY_PENDING_THRESHOLD,
      warnThreshold: SIMILARITY_WARN_THRESHOLD,
    };
  }

  async findPending(
    authUser: AuthUser,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: OrganizationPage[]; total: number; page: number; limit: number }> {
    if (authUser.role !== UserType.ADMIN) {
      throw new ForbiddenException('Solo un ADMIN puede listar páginas pendientes');
    }
    const safePage = page > 0 ? page : 1;
    const safeLimit = limit > 0 ? limit : 20;

    const [data, total] = await this.pageRepository.findAndCount({
      where: { status: OrganizationPageStatus.PENDING_REVIEW },
      relations: ['owner'],
      order: { createdAt: 'ASC' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    });
    return { data, total, page: safePage, limit: safeLimit };
  }

  async approve(id: string, authUser: AuthUser): Promise<OrganizationPage> {
    if (authUser.role !== UserType.ADMIN) {
      throw new ForbiddenException('Solo un ADMIN puede aprobar páginas');
    }
    const page = await this.pageRepository.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!page) {
      throw new NotFoundException(`Organization page ${id} not found`);
    }
    if (
      page.status !== OrganizationPageStatus.PENDING_REVIEW &&
      page.status !== OrganizationPageStatus.REJECTED
    ) {
      throw new BadRequestException(
        'Solo se pueden aprobar páginas pendientes o rechazadas',
      );
    }
    page.status = OrganizationPageStatus.APPROVED;
    page.rejectionReason = null;
    const saved = await this.pageRepository.save(page);
    if (page.owner?.email) {
      const ownerName = `${page.owner.name ?? ''} ${page.owner.lastname ?? ''}`.trim();
      void this.emailService.sendOrgPageApprovedEmail(
        page.owner.email,
        ownerName,
        saved.name,
        saved.slug,
      );
    }
    return saved;
  }

  async reject(
    id: string,
    authUser: AuthUser,
    reason?: string,
  ): Promise<OrganizationPage> {
    if (authUser.role !== UserType.ADMIN) {
      throw new ForbiddenException('Solo un ADMIN puede rechazar páginas');
    }
    const page = await this.pageRepository.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!page) {
      throw new NotFoundException(`Organization page ${id} not found`);
    }
    page.status = OrganizationPageStatus.REJECTED;
    page.rejectionReason = reason?.trim() ? reason.trim() : null;
    const saved = await this.pageRepository.save(page);
    if (page.owner?.email) {
      const ownerName = `${page.owner.name ?? ''} ${page.owner.lastname ?? ''}`.trim();
      void this.emailService.sendOrgPageRejectedEmail(
        page.owner.email,
        ownerName,
        saved.name,
        saved.slug,
        saved.rejectionReason,
      );
    }
    return saved;
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

    // Usamos `update()` (UPDATE directo) en vez de `Object.assign + save()`
    // para evitar la ambigüedad de TypeORM con FKs declarados como `@Column`
    // + `@ManyToOne` con el mismo nombre — el `save` a veces no detecta el
    // cambio del leagueId cuando la relación no está cargada. Después
    // recargamos con `relations: ['league']` para devolver la entidad
    // hidratada al front.
    await this.pageRepository.update(id, dto);
    const reloaded = await this.pageRepository.findOne({
      where: { id },
      relations: ['league'],
    });
    if (!reloaded) {
      throw new NotFoundException(`Organization page ${id} not found`);
    }
    return reloaded;
  }

  async republish(id: string, authUser: AuthUser): Promise<OrganizationPage> {
    const page = await this.pageRepository.findOne({ where: { id } });
    if (!page) {
      throw new NotFoundException(`Organization page ${id} not found`);
    }
    const isAdmin = authUser.role === UserType.ADMIN;
    const isOwner = page.ownerId === authUser.id;
    if (!isAdmin && !isOwner) {
      throw new ForbiddenException(
        'No tenés permisos para republicar esta página',
      );
    }
    if (page.status !== OrganizationPageStatus.REJECTED) {
      throw new BadRequestException(
        'Solo se pueden republicar páginas rechazadas',
      );
    }
    const matches = await this.findSimilarPages(
      page.name,
      page.type,
      page.country ?? null,
      SIMILARITY_WARN_THRESHOLD,
      page.id,
    );
    const topScore = matches[0]?.score ?? 0;
    page.status =
      topScore >= SIMILARITY_PENDING_THRESHOLD
        ? OrganizationPageStatus.PENDING_REVIEW
        : OrganizationPageStatus.APPROVED;
    page.rejectionReason = null;
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
    const isOwner = !!authUser?.id && page.ownerId === authUser.id;
    if (isOwner) return;
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
