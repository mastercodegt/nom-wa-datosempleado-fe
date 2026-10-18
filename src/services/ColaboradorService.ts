import { apiRequest } from "./apiConfig";

export interface Colaborador {
    id: number;
    nombre: string;
    apellido: string;
    direccion: string;
    edad: number;
    profesionId: number;
    profesionNombre: string;
    estadoCivilId: number;
    estadoCivilNombre: string;
}

export type NuevoColaborador = Omit<Colaborador, "id">;

const endpoint = "/Colaboradors";

export class ColaboradorService {
    static obtenerTodos(): Promise<Colaborador[]> {
        return apiRequest<Colaborador[]>(endpoint);
    }

    static obtenerPorId(id: number): Promise<Colaborador> {
        return apiRequest<Colaborador>(`${endpoint}/${encodeURIComponent(id)}`);
    }

    static crear(colaborador: NuevoColaborador): Promise<Colaborador> {
        return apiRequest<Colaborador>(endpoint, {
            method: "POST",
            body: JSON.stringify(colaborador),
        });
    }

    static actualizar(
        id: number,
        colaborador: Colaborador,
    ): Promise<void> {
        return apiRequest<void>(`${endpoint}/${encodeURIComponent(id)}`, {
            method: "PUT",
            body: JSON.stringify(colaborador),
        });
    }

    static eliminar(id: number): Promise<void> {
        return apiRequest<void>(`${endpoint}/${encodeURIComponent(id)}`, {
            method: "DELETE",
        });
    }
}
