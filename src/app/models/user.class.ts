export class User {
    id: number;
    username: string;
    email: string;
    phone: string | null;
    address: string | null;
    password: string;
    token: string;

    constructor(obj: any) {
        this.id = obj?.id ?? null;
        this.username = obj?.username ?? '';
        this.email = obj?.email ?? '';
        this.phone = obj?.phone ?? null;
        this.address = obj?.address ?? null;
        this.password = obj?.password ?? '';
        this.token = obj?.token ?? '';
    }
}