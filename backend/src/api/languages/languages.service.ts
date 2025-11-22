import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class LanguagesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.language.findMany({
      orderBy: {
        code: 'asc',
      },
    });
  }

  async findActive() {
    return this.prisma.language.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        code: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const language = await this.prisma.language.findUnique({
      where: { id },
    });

    if (!language) {
      throw new NotFoundException(`Language with id ${id} not found`);
    }

    return language;
  }

  async findByCode(code: string) {
    const language = await this.prisma.language.findUnique({
      where: { code },
    });

    if (!language) {
      throw new NotFoundException(`Language with code ${code} not found`);
    }

    return language;
  }

  async create(data: {
    code: string;
    name: string;
    nativeName: string;
    isActive?: boolean;
  }) {
    return this.prisma.language.create({
      data: {
        code: data.code,
        name: data.name,
        nativeName: data.nativeName,
        isActive: data.isActive ?? true,
      },
    });
  }

  async update(
    id: number,
    data: {
      name?: string;
      nativeName?: string;
      isActive?: boolean;
    },
  ) {
    const language = await this.prisma.language.findUnique({
      where: { id },
    });

    if (!language) {
      throw new NotFoundException(`Language with id ${id} not found`);
    }

    return this.prisma.language.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    const language = await this.prisma.language.findUnique({
      where: { id },
    });

    if (!language) {
      throw new NotFoundException(`Language with id ${id} not found`);
    }

    // Проверяем, есть ли переводы, использующие этот язык
    const translationsCount = await this.prisma.fundTranslation.count({
      where: { languageId: id },
    });

    if (translationsCount > 0) {
      // Не удаляем язык, если есть переводы, просто деактивируем
      return this.prisma.language.update({
        where: { id },
        data: { isActive: false },
      });
    }

    return this.prisma.language.delete({
      where: { id },
    });
  }
}

