import { apiRequest } from "./apiConfig";

export interface AuthSession {
    idUsuario: number;
    nombreCompleto: string;
    idRol: number;
    nombreRol: string;
    token: string;
}

export interface StoredAuthSession extends AuthSession {
    correo: string;
}

interface AuthRequest {
    correo: string;
    contrasena: string;
}

export class AuthService {
    static async iniciarSesion(
        correo: string,
        contraseñaSha256: string,
    ): Promise<AuthSession> {
        const session = await apiRequest<AuthSession>("/Authenticate", {
            method: "POST",
            body: JSON.stringify({
                correo,
                contrasena: contraseñaSha256,
            } satisfies AuthRequest),
        });

        sessionStorage.setItem(
            "authSession",
            JSON.stringify({ ...session, correo }),
        );
        return session;
    }

    static cerrarSesion(): void {
        sessionStorage.removeItem("authSession");
    }
}
