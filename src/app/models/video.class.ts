/**
 * Possible processing states reported by the backend.
 */
export type ProcessingState = 'pending' | 'processing' | 'ready' | 'error';

/**
 * Represents a video entity in the application.
 *
 * Stores metadata, media file paths, and category information
 * for each uploaded or processed video.
 *
 * Used across playback, library, and user modules.
 */
export class Video {
    /** Unique numeric identifier for the video. */
    id: number;

    /** Date and time when the video was created or uploaded. */
    created_at: Date;

    /** Title of the video displayed in listings and details. */
    title: string;

    /** Detailed description of the video content. */
    description: string;

    /** Category or genre of the video (e.g., "Action", "Comedy"). */
    category: string;

    /** URL or path to the video's thumbnail or preview image. */
    image_file: string;

    /** URL or path to the original video file. */
    video_file: string;

    /**
     * Mapping of available converted video files by quality.
     * Example: { "360p": "path/to/360p.mp4", "720p": "path/to/720p.mp4" }
     */
    converted_files: Record<string, string>;

    /**
     * Current processing state of the video reported by the backend.
     * - "pending" / "processing"
     * - "ready"
     * - "error"
     */
    processing_state: ProcessingState;

    /**
     * Optional error message from the backend if processing failed.
     */
    processing_error: string | null;

    /**
     * Creates a new instance of the `Video` class.
     *
     * Initializes all video properties with safe defaults if missing.
     *
     * @param obj - Partial video data object containing raw values.
     */
    constructor(obj: any = {}) {
        const rawId = obj?.id;
        this.id = typeof rawId === 'number' ? rawId : 0;

        this.created_at = obj?.created_at ? new Date(obj.created_at) : new Date();
        this.title = obj?.title ?? '';
        this.description = obj?.description ?? '';
        this.category = obj?.category ?? '';
        this.image_file = obj?.image_file ?? '';
        this.video_file = obj?.video_file ?? '';

        this.converted_files = obj?.converted_files ?? {};

        this.processing_state = (obj?.processing_state as ProcessingState) ?? 'ready';
        this.processing_error = obj?.processing_error ?? null;
    }
}
