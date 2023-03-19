export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
}

export enum UserStatus {
    BANNED = 'banned',
    WARNING = 'warning',
    NORMAL = 'normal',
}

export enum ContributionStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
}

export enum DataType {
    IMAGE = 'image',
    AUDIO = 'audio',
    VIDEO = 'video',
    TEXT = 'text',
}

export enum DatasetAccess {
    PRIVATE = 'private',
    PUBLIC = 'public',
}
