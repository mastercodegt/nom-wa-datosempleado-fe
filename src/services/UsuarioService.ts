import { apiRequest } from "./apiConfig";
import type { Rol } from "./RolService";

export interface Usuario {
    id: number;
    nombre: string;
    apellido: string;
    rolId: number;
    rol?: Rol | null;
    correo: string;
    contrasena?: string;
    estado: boolean;
    permisos?: unknown[] | null;
}

export interface UsuarioRequest {
    nombre: string;
    apellido: string;
    rolId: number;
    rol: Rol;
    correo: string;
    contrasena?: string;
    estado: boolean;
    permisos: unknown[];
}

export class UsuarioService {
    static obtenerTodos(): Promise<Usuario[]> {
        return apiRequest<Usuario[]>("/Usuarios");
    }

    static obtenerPorId(id: number): Promise<Usuario> {
        return apiRequest<Usuario>(`/Usuarios/${encodeURIComponent(id)}`);
    }

    static crear(usuario: UsuarioRequest): Promise<Usuario> {
        return apiRequest<Usuario>("/Usuarios", {
            method: "POST",
            body: JSON.stringify(usuario),
        });
    }

    static actualizar(id: number, usuario: UsuarioRequest): Promise<void> {
        return apiRequest<void>(`/Usuarios/${encodeURIComponent(id)}`, {
            method: "PUT",
            body: JSON.stringify(usuario),
        });
    }
}
