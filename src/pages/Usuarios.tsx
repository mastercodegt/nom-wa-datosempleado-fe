import { Modal } from "@/components/ui/modal";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import { PlusIcon } from "@/icons";
import { RolService, UsuarioService, type Rol, type Usuario, type UsuarioRequest } from "@/services";
import {
    DetailsList,
    DetailsListLayoutMode,
    SelectionMode,
    type IColumn,
} from "@fluentui/react";
import { useEffect, useRef, useState, type FormEvent } from "react";

type UsuarioForm = {
    nombre: string;
    apellido: string;
    correo: string;
    rolId: string;
    contrasena: string;
    estado: boolean;
};

const emptyForm: UsuarioForm = {
    nombre: "",
    apellido: "",
    correo: "",
    rolId: "",
    contrasena: "",
    estado: true,
};

const columns: IColumn[] = [
    {
        key: "id",
        name: "ID",
        fieldName: "id",
        minWidth: 64,
        maxWidth: 84,
        isResizable: true,
    },
    {
        key: "nombre",
        name: "Nombre",
        fieldName: "nombre",
        minWidth: 120,
        maxWidth: 180,
        isResizable: true,
    },
    {
        key: "apellido",
        name: "Apellido",
        fieldName: "apellido",
        minWidth: 120,
        maxWidth: 180,
        isResizable: true,
    },
    {
        key: "correo",
        name: "Correo electrónico",
        fieldName: "correo",
        minWidth: 220,
        maxWidth: 320,
        isResizable: true,
    },
    {
        key: "estado",
        name: "Estado",
        minWidth: 100,
        maxWidth: 130,
        isResizable: true,
        onRender: (item?: Usuario) => (item?.estado ? "Activo" : "Inactivo"),
    },
];

async function sha256(value: string): Promise<string> {
    const bytes = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
}

export default function Usuarios() {
    const [items, setItems] = useState<Usuario[]>([]);
    const [roles, setRoles] = useState<Rol[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingRoles, setIsLoadingRoles] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
    const [form, setForm] = useState<UsuarioForm>(emptyForm);
    const [errorMessage, setErrorMessage] = useState("");
    const [rolesError, setRolesError] = useState("");
    const detailRequestId = useRef(0);

    const loadUsers = async () => {
        const data = await UsuarioService.obtenerTodos();
        setItems(data);
    };

    useEffect(() => {
        let isMounted = true;

        UsuarioService.obtenerTodos()
            .then((data) => {
                if (isMounted) setItems(data);
            })
            .catch(() => {
                if (isMounted) setErrorMessage("No fue posible cargar los usuarios.");
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        RolService.obtenerTodos()
            .then((data) => {
                if (isMounted) setRoles(data.filter((role) => role.estado));
            })
            .catch(() => {
                if (isMounted) setRolesError("No fue posible cargar los roles.");
            })
            .finally(() => {
                if (isMounted) setIsLoadingRoles(false);
            });

        return () => {
            isMounted = false;
            detailRequestId.current += 1;
        };
    }, []);

    const openUserDetails = async (userId: number) => {
        const requestId = ++detailRequestId.current;
        setIsCreating(false);
        setSelectedUser(null);
        setForm(emptyForm);
        setErrorMessage("");
        setIsLoadingDetail(true);
        setIsModalOpen(true);

        try {
            const user = await UsuarioService.obtenerPorId(userId);
            if (requestId !== detailRequestId.current) return;

            setSelectedUser(user);
            setForm({
                nombre: user.nombre ?? "",
                apellido: user.apellido ?? "",
                correo: user.correo ?? "",
                rolId: String(user.rolId ?? user.rol?.id ?? ""),
                contrasena: "",
                estado: user.estado,
            });
        } catch {
            if (requestId === detailRequestId.current) {
                setErrorMessage("No fue posible cargar el detalle del usuario.");
            }
        } finally {
            if (requestId === detailRequestId.current) setIsLoadingDetail(false);
        }
    };

    const openCreateForm = () => {
        detailRequestId.current += 1;
        setSelectedUser(null);
        setIsCreating(true);
        setForm({ ...emptyForm, rolId: roles[0] ? String(roles[0].id) : "" });
        setErrorMessage("");
        setIsModalOpen(true);
    };

    const closeModal = () => {
        detailRequestId.current += 1;
        setIsModalOpen(false);
        setErrorMessage("");
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage("");

        if (!form.rolId) {
            setErrorMessage("Selecciona un rol para el usuario.");
            return;
        }
        const selectedRole = roles.find((role) => role.id === Number(form.rolId));
        if (!selectedRole) {
            setErrorMessage("El rol seleccionado ya no está disponible.");
            return;
        }
        if (isCreating && !form.contrasena) {
            setErrorMessage("Ingresa una contraseña para el usuario.");
            return;
        }

        setIsSaving(true);
        try {
            const password = form.contrasena
                ? await sha256(form.contrasena)
                : selectedUser?.contrasena;
            const payload: UsuarioRequest = {
                nombre: form.nombre.trim(),
                apellido: form.apellido.trim(),
                correo: form.correo.trim(),
                rolId: Number(form.rolId),
                rol: selectedRole,
                estado: form.estado,
                permisos: selectedUser?.permisos ?? [],
                ...(password ? { contrasena: password } : {}),
            };

            if (selectedUser) {
                await UsuarioService.actualizar(selectedUser.id, payload);
            } else {
                await UsuarioService.crear(payload);
            }

            await loadUsers();
            closeModal();
        } catch {
            setErrorMessage(
                isCreating
                    ? "No fue posible crear el usuario. Revisa los datos e inténtalo nuevamente."
                    : "No fue posible actualizar el usuario. Revisa los datos e inténtalo nuevamente.",
            );
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <PageMeta
                title="Usuarios | Toyota"
                description="Consulta y administra los usuarios registrados."
            />
            <PageBreadcrumb pageTitle="Usuarios" />
            <section className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3 lg:mb-6">
                    <div>
                        <h1 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Usuarios
                        </h1>
                        {!isLoading && !errorMessage && (
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {items.length} registros
                            </p>
                        )}
                    </div>
                </div>

                {isLoading ? (
                    <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400" role="status">
                        Cargando usuarios...
                    </p>
                ) : errorMessage && items.length === 0 ? (
                    <p className="py-8 text-center text-sm text-error-600" role="alert">
                        {errorMessage}
                    </p>
                ) : items.length === 0 ? (
                    <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        No hay usuarios para mostrar.
                    </p>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
                        <DetailsList
                            className="min-w-[720px] [&_.ms-DetailsHeader]:bg-gray-50 [&_.ms-DetailsRow]:cursor-pointer dark:[&_.ms-DetailsHeader]:bg-gray-900"
                            items={items}
                            columns={columns}
                            selectionMode={SelectionMode.single}
                            layoutMode={DetailsListLayoutMode.fixedColumns}
                            isHeaderVisible
                            getKey={(item: Usuario) => String(item.id)}
                            onActiveItemChanged={(item?: Usuario) => {
                                if (item) void openUserDetails(item.id);
                            }}
                            ariaLabelForGrid="Lista de usuarios"
                        />
                    </div>
                )}
            </section>

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                className="mx-4 max-w-2xl p-6 sm:p-8"
            >
                <div>
                    <h2 className="mb-5 pe-10 text-xl font-semibold text-gray-800 dark:text-white/90">
                        {isCreating ? "Crear usuario" : "Detalle del usuario"}
                    </h2>

                    {isLoadingDetail ? (
                        <p className="py-8 text-center text-sm text-gray-500" role="status">
                            Cargando detalle del usuario...
                        </p>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Nombre
                                    <input
                                        value={form.nombre}
                                        onChange={(event) => setForm({ ...form, nombre: event.target.value })}
                                        required
                                        autoComplete="given-name"
                                        className="mt-1.5 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 shadow-theme-xs outline-none focus:border-brand-500 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white"
                                    />
                                </label>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Apellido
                                    <input
                                        value={form.apellido}
                                        onChange={(event) => setForm({ ...form, apellido: event.target.value })}
                                        required
                                        autoComplete="family-name"
                                        className="mt-1.5 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 shadow-theme-xs outline-none focus:border-brand-500 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white"
                                    />
                                </label>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 sm:col-span-2">
                                    Correo electrónico
                                    <input
                                        type="email"
                                        value={form.correo}
                                        onChange={(event) => setForm({ ...form, correo: event.target.value })}
                                        required
                                        autoComplete="email"
                                        className="mt-1.5 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 shadow-theme-xs outline-none focus:border-brand-500 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white"
                                    />
                                </label>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Rol
                                    <select
                                        value={form.rolId}
                                        onChange={(event) => setForm({ ...form, rolId: event.target.value })}
                                        required
                                        disabled={isLoadingRoles || roles.length === 0}
                                        className="mt-1.5 h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 shadow-theme-xs outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                    >
                                        <option value="">Selecciona un rol</option>
                                        {roles.map((role) => (
                                            <option key={role.id} value={role.id}>
                                                {role.nombre}
                                            </option>
                                        ))}
                                    </select>
                                    {rolesError && (
                                        <span className="mt-1 block text-xs text-error-600" role="alert">
                                            {rolesError}
                                        </span>
                                    )}
                                </label>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Estado
                                    <select
                                        value={form.estado ? "true" : "false"}
                                        onChange={(event) => setForm({ ...form, estado: event.target.value === "true" })}
                                        className="mt-1.5 h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 shadow-theme-xs outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                    >
                                        <option value="true">Activo</option>
                                        <option value="false">Inactivo</option>
                                    </select>
                                </label>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 sm:col-span-2">
                                    {isCreating ? "Contraseña" : "Nueva contraseña (opcional)"}
                                    <input
                                        type="password"
                                        value={form.contrasena}
                                        onChange={(event) => setForm({ ...form, contrasena: event.target.value })}
                                        required={isCreating}
                                        autoComplete="new-password"
                                        placeholder={isCreating ? "Ingresa una contraseña" : "Dejar en blanco para conservar la actual"}
                                        className="mt-1.5 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 shadow-theme-xs outline-none focus:border-brand-500 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
                                    />
                                </label>
                            </div>

                            {errorMessage && (
                                <p className="text-sm text-error-600" role="alert">
                                    {errorMessage}
                                </p>
                            )}

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="h-10 rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving || isLoadingRoles || roles.length === 0}
                                    className="h-10 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isSaving ? "Guardando..." : isCreating ? "Crear usuario" : "Guardar cambios"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </Modal>
        </>
    );
}
