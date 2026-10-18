import { apiRequest } from "./apiConfig";

export interface Rol {
    id: number;
    nombre: string;
    estado: boolean;
    usuarios: unknown[] | null;
    permisos: unknown[] | null;
}

export class RolService {
    static obtenerTodos(): Promise<Rol[]> {
        return apiRequest<Rol[]>("/roles");
    }
}
