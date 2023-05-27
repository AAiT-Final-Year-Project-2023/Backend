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
    DELETED_REQUEST_POST = 'deleted request post',
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
    REQUEST_POST_CREATED = 'Request post created successfully',
    REQUEST_POST_UPDATED = 'Request post updated successfully',
    REQUEST_POST_DELETED = 'Request post deleted successfully',
    REQUEST_POST_UPVOTED = 'Your request post got upvoted',
    REQUEST_POST_DOWNVOTED = 'Your request post got downvoted',
    REQUEST_POST_CONTRIBUTION_MADE = 'New contribution made to your request post',
    REQUEST_POST_PUBLIC = 'Request post access changed to Public',
    REQUEST_POST_PRIVATE = 'Request post access changed to Private',
    REQUEST_POST_CLOSED = 'Request post closed successfully',
    REQUEST_POST_SPACE_WARNING = 'Request post running out of space',
    REQUEST_POST_SPACE_FULL = 'Request post disk storage out of space',

    CONTRIBUTION_CREATED = 'contribution created',
    CONTRIBUTION_DELETED = 'contribution deleted',
    CONTRIBUTION_ACCEPTED = 'contribution accepted',
    CONTRIBUTION_REJECTED = 'contribution rejected',

    PAYMENT_ACCEPTED = 'Payment deposited to your account',
    PAYMENT_MADE = 'Payment withdrawn from your account',

    DATASET_CREATED = 'Dataset successfully created',
    DATASET_UPDATED = 'Dataset successfully updated',
    DATASET_UPVOTED = 'Your dataset got upvoted',
    DATASET_DOWNVOTED = 'Your dataset got downvoted',
    DATASET_PURCHASED = 'Your dataset got purchased',
    DATASET_PURCHASED_SUCCESS = 'Dataset successfully purchased',
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
    ME = 'me',
    ALL = 'all',
}

export enum FilterContributionByStatus {
    ALL = 'all',
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
}
