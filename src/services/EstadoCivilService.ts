import { apiRequest } from "./apiConfig";

export interface EstadoCivil {
    id: number;
    nombre: string;
    estado: boolean;
    colaboradores: unknown[] | null;
}

export class EstadoCivilService {
    static obtenerTodos(): Promise<EstadoCivil[]> {
        return apiRequest<EstadoCivil[]>("/EstadoCivils");
    }
}
