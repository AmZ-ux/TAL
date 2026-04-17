import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient, Role, Status } from '@prisma/client';
import { hash } from 'bcrypt';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

const runDbE2e = process.env.RUN_DB_E2E === 'true';
const describeCritical = runDbE2e ? describe : describe.skip;

describeCritical('Critical Flows (e2e)', () => {
  let app: INestApplication<App>;
  const prisma = new PrismaClient();
  const created = {
    institutionId: '',
    passengerId: '',
    passengerUserId: '',
    feeForReceiptId: '',
    feeForPaymentId: '',
    receiptId: '',
  };

  const suffix = Date.now().toString();
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@transport.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@123456';
  const passengerEmail = `passenger.${suffix}@transport.local`;
  const passengerPassword = 'Passenger@123';

  let adminAccessToken = '';
  let passengerAccessToken = '';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('auth: login as admin', async () => {
    const response = await request(app.getHttpServer()).post('/auth/login').send({
      email: adminEmail,
      password: adminPassword,
    });

    expect(response.status).toBe(201);
    expect(response.body.accessToken).toBeDefined();
    adminAccessToken = response.body.accessToken as string;
  });

  it('passenger creation flow', async () => {
    const institutionResponse = await request(app.getHttpServer())
      .post('/institutions')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        name: `E2E Institution ${suffix}`,
      });

    expect(institutionResponse.status).toBe(201);
    created.institutionId = institutionResponse.body.id as string;

    const passengerResponse = await request(app.getHttpServer())
      .post('/passengers')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        fullName: `E2E Passenger ${suffix}`,
        phone: '11999998888',
        email: passengerEmail,
        institutionId: created.institutionId,
        course: 'Engineering',
        shift: 'Morning',
        boardingPoint: 'Main stop',
      });

    expect(passengerResponse.status).toBe(201);
    created.passengerId = passengerResponse.body.id as string;
  });

  it('receipt upload and approval flow', async () => {
    const passengerUser = await prisma.user.create({
      data: {
        email: passengerEmail,
        passwordHash: await hash(passengerPassword, 12),
        role: Role.PASSENGER,
      },
    });
    created.passengerUserId = passengerUser.id;

    await prisma.passengerProfile.update({
      where: { id: created.passengerId },
      data: {
        userId: passengerUser.id,
      },
    });

    const feeForReceipt = await prisma.monthlyFee.create({
      data: {
        passengerId: created.passengerId,
        referenceMonth: '2026-12',
        amount: '350.00',
        dueDate: new Date('2026-12-25T03:00:00.000Z'),
        status: Status.PENDING,
      },
    });
    created.feeForReceiptId = feeForReceipt.id;

    const loginPassengerResponse = await request(app.getHttpServer()).post('/auth/login').send({
      email: passengerEmail,
      password: passengerPassword,
    });
    expect(loginPassengerResponse.status).toBe(201);
    passengerAccessToken = loginPassengerResponse.body.accessToken as string;

    const createReceiptResponse = await request(app.getHttpServer())
      .post('/receipts')
      .set('Authorization', `Bearer ${passengerAccessToken}`)
      .send({
        monthlyFeeId: created.feeForReceiptId,
        fileType: 'image/png',
        fileUrl:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+b9k8AAAAASUVORK5CYII=',
      });

    expect(createReceiptResponse.status).toBe(201);
    created.receiptId = createReceiptResponse.body.id as string;

    const approveResponse = await request(app.getHttpServer())
      .patch(`/receipts/${created.receiptId}/approve`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        adminNotes: 'E2E approval',
      });

    expect(approveResponse.status).toBe(200);
    expect(approveResponse.body.status).toBe('APPROVED');
  });

  it('monthly fee payment update flow', async () => {
    const feeForPayment = await prisma.monthlyFee.create({
      data: {
        passengerId: created.passengerId,
        referenceMonth: '2026-11',
        amount: '420.00',
        dueDate: new Date('2026-11-25T03:00:00.000Z'),
        status: Status.PENDING,
      },
    });
    created.feeForPaymentId = feeForPayment.id;

    const markPaidResponse = await request(app.getHttpServer())
      .patch(`/monthly-fees/${created.feeForPaymentId}/pay`)
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send();

    expect(markPaidResponse.status).toBe(200);
    expect(markPaidResponse.body.status).toBe('PAID');

    const listResponse = await request(app.getHttpServer())
      .get('/monthly-fees')
      .query({ passengerId: created.passengerId })
      .set('Authorization', `Bearer ${adminAccessToken}`);

    expect(listResponse.status).toBe(200);
    expect(Array.isArray(listResponse.body)).toBe(true);
    const paymentFee = (listResponse.body as Array<{ id: string; status: string }>).find(
      (item) => item.id === created.feeForPaymentId,
    );
    expect(paymentFee?.status).toBe('PAID');
  });

  afterAll(async () => {
    if (created.passengerUserId) {
      await prisma.notification.deleteMany({
        where: { userId: created.passengerUserId },
      });

      const entityIds = [
        created.receiptId,
        created.feeForReceiptId,
        created.feeForPaymentId,
        created.passengerId,
      ].filter((item) => item.length > 0);

      await prisma.auditLog.deleteMany({
        where: {
          OR: [
            { actorId: created.passengerUserId },
            ...(entityIds.length > 0
              ? [
                  {
                    entityId: {
                      in: entityIds,
                    },
                  },
                ]
              : []),
          ],
        },
      });
    }

    if (created.passengerId) {
      await prisma.passengerProfile.deleteMany({
        where: { id: created.passengerId },
      });
    }

    if (created.passengerUserId) {
      await prisma.user.deleteMany({
        where: { id: created.passengerUserId },
      });
    }

    if (created.institutionId) {
      await prisma.institution.deleteMany({
        where: { id: created.institutionId },
      });
    }

    await app.close();
    await prisma.$disconnect();
  });
});
