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

// in minutes
export enum CodeExpiration {
    email_verification = 15,
    change_password = 15,
}

export enum NotificationType {
    UPVOTE = 'upvote',
    CONTRIBUTION_MADE = 'contribution made',
    CONTRIBUTION_ACCEPTED = 'contribution accepted',
    CONTRIBUTION_REJECTED = 'contribution rejected',
    PAYMENT_ACCEPTED = 'payment accepted',
}

export enum DataTypeFilter {
    IMAGE = 'image',
    AUDIO = 'audio',
    VIDEO = 'video',
    TEXT = 'text',
    ALL = 'all',
}

export enum SortOrder {
    ASC = 'ASC',
    DESC = 'DESC',
}

export enum Owner {
    SELF = 'self',
    ALL = 'all',
}
