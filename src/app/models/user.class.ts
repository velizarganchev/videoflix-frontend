/**
 * Represents a user entity within the application.
 *
 * Contains user identification details, contact information,
 * authentication data, and a list of favorite videos.
 *
 * Used throughout authentication, profile, and video modules.
 */
export class User {
    /**
     * Unique numeric identifier for the user.
     */
    id: number;

    /**
     * Display name or username chosen by the user.
     */
    username: string;

    /**
     * User's email address, used for login and communication.
     */
    email: string;

    /**
     * Optional user phone number.
     */
    phone: string | null;

    /**
     * Optional user address.
     */
    address: string | null;

    /**
     * List of videos marked as favorites by the user.
     */
    favorite_videos: any[];

    /**
     * Creates a new instance of the `User` class.
     *
     * Initializes all user properties from the provided object,
     * applying safe defaults when values are missing.
     *
     * @param obj - Partial user data object.
     *
     * @example
     * const user = new User({ id: 1, email: 'john@example.com' });
     */
    constructor(obj: any) {
        this.id = obj?.id ?? null;
        this.username = obj?.username ?? '';
        this.email = obj?.email ?? '';
        this.phone = obj?.phone ?? null;
        this.address = obj?.address ?? null;
        this.favorite_videos = obj?.favorite_videos ?? [];
    }
}
