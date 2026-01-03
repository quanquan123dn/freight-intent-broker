import { PrismaClient, Role, OrgType, TransportMode, Urgency, PlanType, SubscriptionStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Clean existing data
    await prisma.auditLog.deleteMany();
    await prisma.buyerFeedback.deleteMany();
    await prisma.leadDelivery.deleteMany();
    await prisma.match.deleteMany();
    await prisma.leadScore.deleteMany();
    await prisma.rfqEvent.deleteMany();
    await prisma.rfqAttachment.deleteMany();
    await prisma.rfqContact.deleteMany();
    await prisma.rfqCargo.deleteMany();
    await prisma.rfqRoute.deleteMany();
    await prisma.rfq.deleteMany();
    await prisma.entitlement.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.buyerPreference.deleteMany();
    await prisma.buyerProfile.deleteMany();
    await prisma.orgMember.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.org.deleteMany();
    await prisma.user.deleteMany();

    const passwordHash = await bcrypt.hash('Password123!', 12);

    // Create Admin user
    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@fib.com',
            passwordHash,
            role: Role.ADMIN,
        },
    });
    console.log('✅ Created admin user:', adminUser.email);

    // Create Ops user
    const opsUser = await prisma.user.create({
        data: {
            email: 'ops@fib.com',
            passwordHash,
            role: Role.OPS,
        },
    });
    console.log('✅ Created ops user:', opsUser.email);

    // Create 10 Buyer organizations with preferences
    const buyerConfigs = [
        { name: 'Global Freight Solutions', lanes: ['VN-US', 'VN-EU'], modes: [TransportMode.SEA], commodities: ['electronics', 'textiles'] },
        { name: 'Pacific Logistics Co', lanes: ['VN-US', 'VN-CA'], modes: [TransportMode.SEA, TransportMode.AIR], commodities: ['furniture'] },
        { name: 'Euro Express Cargo', lanes: ['VN-EU', 'VN-UK'], modes: [TransportMode.AIR], commodities: ['garments', 'shoes'] },
        { name: 'Japan Freight Network', lanes: ['VN-JP'], modes: [TransportMode.SEA], commodities: ['seafood', 'agriculture'] },
        { name: 'Korea Trade Links', lanes: ['VN-KR'], modes: [TransportMode.SEA, TransportMode.AIR], commodities: ['electronics'] },
        { name: 'Australia Connect', lanes: ['VN-AU', 'VN-NZ'], modes: [TransportMode.SEA], commodities: ['furniture', 'crafts'] },
        { name: 'China Gateway Logistics', lanes: ['VN-CN'], modes: [TransportMode.ROAD, TransportMode.RAIL], commodities: ['machinery'] },
        { name: 'Southeast Asia Forwarding', lanes: ['VN-SG', 'VN-TH', 'VN-MY'], modes: [TransportMode.ROAD, TransportMode.SEA], commodities: [] },
        { name: 'Middle East Shipping', lanes: ['VN-AE', 'VN-SA'], modes: [TransportMode.SEA], commodities: ['coffee', 'rice'] },
        { name: 'Premium Air Cargo', lanes: ['VN-*'], modes: [TransportMode.AIR], commodities: ['pharmaceuticals', 'tech'] },
    ];

    for (let i = 0; i < buyerConfigs.length; i++) {
        const config = buyerConfigs[i];

        const buyerUser = await prisma.user.create({
            data: {
                email: `buyer${i + 1}@example.com`,
                passwordHash,
                role: Role.BUYER,
            },
        });

        const buyerOrg = await prisma.org.create({
            data: {
                name: config.name,
                type: OrgType.BUYER,
                members: {
                    create: { userId: buyerUser.id, role: 'owner' },
                },
                buyerProfile: {
                    create: {
                        companyName: config.name,
                        description: `Leading forwarder specializing in ${config.lanes.join(', ')} routes`,
                        preferences: {
                            create: {
                                modes: config.modes,
                                lanes: config.lanes,
                                commodityTags: config.commodities,
                                urgencyAccepted: [Urgency.LOW, Urgency.MEDIUM, Urgency.HIGH],
                                excludedLanes: [],
                            },
                        },
                    },
                },
                subscriptions: {
                    create: {
                        plan: i < 3 ? PlanType.PRO : PlanType.BASIC,
                        status: SubscriptionStatus.ACTIVE,
                        startDate: new Date(),
                        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                        entitlements: {
                            create: {
                                quotaPerDay: i < 3 ? 20 : 5,
                                exclusiveLanes: i === 0 ? ['VN-US'] : [],
                            },
                        },
                    },
                },
            },
        });

        console.log(`✅ Created buyer: ${config.name}`);
    }

    // Create 5 Shipper users
    for (let i = 0; i < 5; i++) {
        const shipperUser = await prisma.user.create({
            data: {
                email: `shipper${i + 1}@export.vn`,
                passwordHash,
                role: Role.SHIPPER,
            },
        });

        await prisma.org.create({
            data: {
                name: `Vietnam Exporter ${i + 1}`,
                type: OrgType.SHIPPER,
                members: {
                    create: { userId: shipperUser.id, role: 'owner' },
                },
            },
        });

        console.log(`✅ Created shipper: shipper${i + 1}@export.vn`);
    }

    // Create 20 sample RFQs
    const rfqSamples = [
        { title: 'FCL 40HC Electronics to LA', origin: 'VN', dest: 'US', mode: TransportMode.SEA, commodity: 'electronics', weight: 18000 },
        { title: 'LCL Garments to Hamburg', origin: 'VN', dest: 'DE', mode: TransportMode.SEA, commodity: 'garments', weight: 2500 },
        { title: 'Air Freight Pharma to Tokyo', origin: 'VN', dest: 'JP', mode: TransportMode.AIR, commodity: 'pharmaceuticals', weight: 500 },
        { title: '2x40FT Furniture to Sydney', origin: 'VN', dest: 'AU', mode: TransportMode.SEA, commodity: 'furniture', weight: 35000 },
        { title: 'Urgent Parts to Seoul', origin: 'VN', dest: 'KR', mode: TransportMode.AIR, commodity: 'electronics', weight: 800 },
        { title: 'Coffee Export to Dubai', origin: 'VN', dest: 'AE', mode: TransportMode.SEA, commodity: 'coffee', weight: 20000 },
        { title: '20FT Textiles to UK', origin: 'VN', dest: 'UK', mode: TransportMode.SEA, commodity: 'textiles', weight: 12000 },
        { title: 'Seafood to Japan', origin: 'VN', dest: 'JP', mode: TransportMode.AIR, commodity: 'seafood', weight: 3000 },
        { title: 'Machinery to Singapore', origin: 'VN', dest: 'SG', mode: TransportMode.SEA, commodity: 'machinery', weight: 8000 },
        { title: 'Rice Export to Saudi', origin: 'VN', dest: 'SA', mode: TransportMode.SEA, commodity: 'rice', weight: 50000 },
        { title: 'Shoes to Poland', origin: 'VN', dest: 'PL', mode: TransportMode.SEA, commodity: 'shoes', weight: 6000 },
        { title: 'Tech Components to Canada', origin: 'VN', dest: 'CA', mode: TransportMode.AIR, commodity: 'tech', weight: 200 },
        { title: 'Handicrafts to New Zealand', origin: 'VN', dest: 'NZ', mode: TransportMode.SEA, commodity: 'crafts', weight: 4000 },
        { title: 'Garments to France', origin: 'VN', dest: 'FR', mode: TransportMode.SEA, commodity: 'garments', weight: 7500 },
        { title: 'Auto Parts to Thailand', origin: 'VN', dest: 'TH', mode: TransportMode.ROAD, commodity: 'machinery', weight: 15000 },
        { title: 'Electronics to Malaysia', origin: 'VN', dest: 'MY', mode: TransportMode.SEA, commodity: 'electronics', weight: 9000 },
        { title: 'Furniture to Netherlands', origin: 'VN', dest: 'NL', mode: TransportMode.SEA, commodity: 'furniture', weight: 22000 },
        { title: 'Textile Roll to China', origin: 'VN', dest: 'CN', mode: TransportMode.RAIL, commodity: 'textiles', weight: 30000 },
        { title: 'Express Docs to US', origin: 'VN', dest: 'US', mode: TransportMode.AIR, commodity: 'documents', weight: 50 },
        { title: 'Agricultural Products to Korea', origin: 'VN', dest: 'KR', mode: TransportMode.SEA, commodity: 'agriculture', weight: 25000 },
    ];

    const statuses = ['INGESTED', 'VERIFIED', 'MATCHED'] as const;

    for (let i = 0; i < rfqSamples.length; i++) {
        const sample = rfqSamples[i];
        const tradeLaneKey = `${sample.origin}-${sample.dest}`;
        const status = statuses[i % 3];
        const piiHash = `hash_${i}_${Date.now()}`;

        const rfq = await prisma.rfq.create({
            data: {
                source: 'FORM',
                title: sample.title,
                status,
                urgency: i % 3 === 0 ? Urgency.HIGH : i % 3 === 1 ? Urgency.MEDIUM : Urgency.LOW,
                readyDate: new Date(Date.now() + (7 + i) * 24 * 60 * 60 * 1000),
                notes: `Sample RFQ for ${sample.commodity} shipment`,
                route: {
                    create: {
                        originCountry: sample.origin,
                        originCity: 'Ho Chi Minh City',
                        destCountry: sample.dest,
                        mode: sample.mode,
                        tradeLaneKey,
                    },
                },
                cargo: {
                    create: {
                        commodity: sample.commodity,
                        weightKg: sample.weight,
                        volumeCbm: sample.weight / 250, // Rough estimate
                    },
                },
                contact: {
                    create: {
                        contactName: `Contact Person ${i + 1}`,
                        companyName: `Vietnam Exporter ${(i % 5) + 1}`,
                        email: `contact${i + 1}@export.vn`,
                        phone: `+84 90${String(1000000 + i).slice(1)}`,
                        piiHash,
                        verified: status !== 'INGESTED',
                    },
                },
                events: {
                    create: {
                        action: 'created',
                        actor: 'seed',
                        details: { source: 'SEED' },
                    },
                },
            },
        });

        // Add score
        const score = 50 + Math.floor(Math.random() * 40);
        await prisma.leadScore.create({
            data: {
                rfqId: rfq.id,
                totalScore: score,
                breakdown: {
                    corporateEmail: 15,
                    hasReadyDate: 10,
                    hasVolume: 10,
                    completeRoute: 15,
                },
            },
        });

        console.log(`✅ Created RFQ: ${sample.title} (${status})`);
    }

    console.log('\n🎉 Seeding complete!');
    console.log('\n📋 Test accounts:');
    console.log('  Admin: admin@fib.com / Password123!');
    console.log('  Ops: ops@fib.com / Password123!');
    console.log('  Buyer: buyer1@example.com / Password123!');
    console.log('  Shipper: shipper1@export.vn / Password123!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
