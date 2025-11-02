/**
 * Represents a video entity in the application.
 *
 * Stores metadata, media file paths, and category information
 * for each uploaded or processed video.
 *
 * Used across playback, library, and user modules.
 */
export class Video {
    /**
     * Unique numeric identifier for the video.
     */
    id: number;

    /**
     * Date and time when the video was created or uploaded.
     */
    created_at: Date;

    /**
     * Title of the video displayed in listings and details.
     */
    title: string;

    /**
     * Detailed description of the video content.
     */
    description: string;

    /**
     * Category or genre of the video (e.g., "Action", "Comedy").
     */
    category: string;

    /**
     * URL or path to the video's thumbnail or preview image.
     */
    image_file: string;

    /**
     * URL or path to the original video file.
     */
    video_file: string;

    /**
     * Array of URLs or file paths to converted video formats (e.g., different resolutions).
     */
    converted_files: string[];

    /**
     * Creates a new instance of the `Video` class.
     *
     * Initializes all video properties with safe defaults if missing.
     *
     * @param obj - Partial video data object containing raw values.
     *
     * @example
     * const video = new Video({ title: 'Demo', category: 'Tutorial' });
     */
    constructor(obj: any) {
        this.id = obj?.id ?? null;
        this.created_at = obj.created_at ? new Date(obj.created_at) : new Date();
        this.title = obj?.title ?? '';
        this.description = obj?.description ?? '';
        this.category = obj?.category ?? '';
        this.image_file = obj?.image_file ?? '';
        this.video_file = obj?.video_file ?? '';
        this.converted_files = obj?.converted_files ?? [];
    }
}
