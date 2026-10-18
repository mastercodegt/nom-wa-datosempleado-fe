import { apiRequest } from "./apiConfig";

export interface Profesion {
    id: number;
    nombre: string;
    estado: boolean;
    colaboradores: unknown[] | null;
}

export class ProfesionService {
    static obtenerTodas(): Promise<Profesion[]> {
        return apiRequest<Profesion[]>("/Profesions");
    }
}
