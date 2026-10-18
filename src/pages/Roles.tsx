import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import { RolService, type Rol } from "@/services";
import {
    DetailsList,
    DetailsListLayoutMode,
    SelectionMode,
    type IColumn,
} from "@fluentui/react";
import { useEffect, useState } from "react";

const columns: IColumn[] = [
    {
        key: "id",
        name: "ID",
        fieldName: "id",
        minWidth: 72,
        maxWidth: 100,
        isResizable: true,
    },
    {
        key: "nombre",
        name: "Nombre",
        fieldName: "nombre",
        minWidth: 180,
        maxWidth: 300,
        isResizable: true,
    },
    {
        key: "estado",
        name: "Estado",
        minWidth: 110,
        maxWidth: 140,
        isResizable: true,
        onRender: (item?: Rol) => (item?.estado ? "Activo" : "Inactivo"),
    },
    {
        key: "usuarios",
        name: "Usuarios",
        minWidth: 100,
        maxWidth: 140,
        isResizable: true,
        onRender: (item?: Rol) => item?.usuarios?.length ?? "—",
    },
    {
        key: "permisos",
        name: "Permisos",
        minWidth: 100,
        maxWidth: 140,
        isResizable: true,
        onRender: (item?: Rol) => item?.permisos?.length ?? "—",
    },
];

export default function Roles() {
    const [items, setItems] = useState<Rol[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        let isMounted = true;

        RolService.obtenerTodos()
            .then((data) => {
                if (isMounted) setItems(data);
            })
            .catch(() => {
                if (isMounted) setErrorMessage("No fue posible cargar los roles.");
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <>
            <PageMeta
                title="Roles | Toyota"
                description="Consulta los roles registrados."
            />
            <PageBreadcrumb pageTitle="Roles" />
            <section className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3 lg:mb-6">
                    <h1 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Roles
                    </h1>
                    {!isLoading && !errorMessage && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {items.length} registros
                        </span>
                    )}
                </div>

                {isLoading ? (
                    <p
                        className="py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                        role="status"
                    >
                        Cargando roles...
                    </p>
                ) : errorMessage ? (
                    <p className="py-8 text-center text-sm text-error-600" role="alert">
                        {errorMessage}
                    </p>
                ) : items.length === 0 ? (
                    <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        No hay roles para mostrar.
                    </p>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
                        <DetailsList
                            className="min-w-[640px] [&_.ms-DetailsHeader]:bg-gray-50 dark:[&_.ms-DetailsHeader]:bg-gray-900"
                            items={items}
                            columns={columns}
                            selectionMode={SelectionMode.none}
                            layoutMode={DetailsListLayoutMode.fixedColumns}
                            isHeaderVisible
                            getKey={(item: Rol) => String(item.id)}
                            ariaLabelForGrid="Lista de roles"
                        />
                    </div>
                )}
            </section>
        </>
    );
}
