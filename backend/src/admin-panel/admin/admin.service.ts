import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateAdmin(username: string, password: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { username },
    });

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    // Обновляем время последнего входа
    await this.prisma.admin.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() },
    });

    const { password: _password, ...result } = admin;
    return result;
  }

  async login(username: string, password: string) {
    const admin = await this.validateAdmin(username, password);

    const payload = {
      username: admin.username,
      sub: admin.id,
      type: 'admin',
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
      },
    };
  }

  async createDefaultAdmin() {
    const existingAdmin = await this.prisma.admin.findUnique({
      where: { username: 'flutter' },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('123', 10);

      await this.prisma.admin.create({
        data: {
          username: 'flutter',
          password: hashedPassword,
          email: 'admin@etftracker.com',
          firstName: 'Admin',
          lastName: 'User',
        },
      });

      console.log(
        'Создан администратор по умолчанию: username=flutter, password=123',
      );
    }
  }

  async getAllAdmins() {
    return this.prisma.admin.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getAdminById(id: string) {
    return this.prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async createAdmin(data: {
    username: string;
    password: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.admin.create({
      data: {
        username: data.username,
        password: hashedPassword,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateAdmin(
    id: string,
    data: {
      email?: string;
      firstName?: string;
      lastName?: string;
      isActive?: boolean;
    },
  ) {
    return this.prisma.admin.update({
      where: { id },
      data,
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async deleteAdmin(id: string) {
    return this.prisma.admin.delete({
      where: { id },
    });
  }

  async getDashboardStats() {
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1,
    );
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    // Общее количество приложений
    const totalApplications = await this.prisma.application.count({
      where: { isActive: true },
    });

    // Общее количество активных пользователей
    const totalUsers = await this.prisma.user.count({
      where: { isActive: true },
    });

    // Количество уведомлений сегодня
    const notificationsToday = await this.prisma.notificationLog.count({
      where: {
        createdAt: {
          gte: startOfToday,
        },
      },
    });

    // Количество пользователей за текущий месяц
    const usersThisMonth = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    // Количество пользователей за прошлый месяц
    const usersLastMonth = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
    });

    // Расчет роста пользователей
    const userGrowth =
      usersLastMonth > 0
        ? Math.round(((usersThisMonth - usersLastMonth) / usersLastMonth) * 100)
        : usersThisMonth > 0
          ? 100
          : 0;

    // Статистика по ETF потокам
    const etfFlowCount = await this.prisma.eTFFlow.count();
    const btcFlowCount = await this.prisma.bTCFlow.count();

    // Последние активности (уведомления)
    const recentActivities = await this.prisma.notificationLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        title: true,
        createdAt: true,
        sentToTokens: true,
        successCount: true,
        failureCount: true,
      },
    });

    return {
      totalApplications,
      totalUsers,
      notificationsToday,
      userGrowth,
      etfFlowCount,
      btcFlowCount,
      recentActivities,
    };
  }
}
