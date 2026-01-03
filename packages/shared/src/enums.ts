// ==================== ENUMS ====================
export enum Role {
    ADMIN = 'ADMIN',
    OPS = 'OPS',
    SHIPPER = 'SHIPPER',
    BUYER = 'BUYER',
}

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED',
}

export enum OrgType {
    SHIPPER = 'SHIPPER',
    BUYER = 'BUYER',
}

export enum RfqStatus {
    INGESTED = 'INGESTED',
    SPAM_SUSPECTED = 'SPAM_SUSPECTED',
    VERIFIED = 'VERIFIED',
    MATCHED = 'MATCHED',
    DISTRIBUTED = 'DISTRIBUTED',
    IN_NEGOTIATION = 'IN_NEGOTIATION',
    WON = 'WON',
    LOST = 'LOST',
    EXPIRED = 'EXPIRED',
}

export enum RfqSource {
    FORM = 'FORM',
    EMAIL = 'EMAIL',
    CRAWL = 'CRAWL',
    PARTNER = 'PARTNER',
    MANUAL = 'MANUAL',
}

export enum Urgency {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
}

export enum TransportMode {
    SEA = 'SEA',
    AIR = 'AIR',
    ROAD = 'ROAD',
    RAIL = 'RAIL',
    MULTIMODAL = 'MULTIMODAL',
}

export enum ServiceType {
    DOOR_TO_DOOR = 'DOOR_TO_DOOR',
    PORT_TO_PORT = 'PORT_TO_PORT',
    DOOR_TO_PORT = 'DOOR_TO_PORT',
    PORT_TO_DOOR = 'PORT_TO_DOOR',
}

export enum PlanType {
    BASIC = 'BASIC',
    PRO = 'PRO',
    ENTERPRISE = 'ENTERPRISE',
}

export enum SubscriptionStatus {
    ACTIVE = 'ACTIVE',
    CANCELLED = 'CANCELLED',
    EXPIRED = 'EXPIRED',
    PAST_DUE = 'PAST_DUE',
}

export enum DeliveryChannel {
    WEB_APP = 'WEB_APP',
    EMAIL = 'EMAIL',
    API = 'API',
    WEBHOOK = 'WEBHOOK',
}

export enum FeedbackOutcome {
    WON = 'WON',
    LOST = 'LOST',
    NO_RESPONSE = 'NO_RESPONSE',
    IN_PROGRESS = 'IN_PROGRESS',
}
