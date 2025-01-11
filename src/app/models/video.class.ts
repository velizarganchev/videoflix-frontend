export class Video {
    id: number;
    created_at: Date;
    title: string;
    description: string;
    image_file: string;
    video_file: string;
    converted_files: string[];

    constructor(obj: any) {
        this.id = obj?.id ?? null;
        this.created_at = obj.created_at ? new Date(obj.created_at) : new Date();
        this.title = obj?.title ?? '';
        this.description = obj?.description ?? '';
        this.image_file = obj?.image_file ?? '';
        this.video_file = obj?.video_file ?? '';
        this.converted_files = obj?.converted_files ?? [];
    }
}