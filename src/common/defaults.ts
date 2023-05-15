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
    email_verification = 5,
    change_password = 5,
}

export enum NotificationType {
    UPVOTE = 'upvote',
    CONTRIBUTION_MADE = 'contribution made',
    CONTRIBUTION_ACCEPTED = 'contribution accepted',
    CONTRIBUTION_REJECTED = 'contribution rejected',
    PAYMENT_ACCEPTED = 'payment accepted',
}
