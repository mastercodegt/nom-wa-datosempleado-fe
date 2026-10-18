import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import PageMeta from "@/components/common/PageMeta";
import { ProfesionService, type Profesion } from "@/services";
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
        minWidth: 200,
        maxWidth: 360,
        isResizable: true,
    },
    {
        key: "estado",
        name: "Estado",
        minWidth: 120,
        maxWidth: 160,
        isResizable: true,
        onRender: (item?: Profesion) => (item?.estado ? "Activo" : "Inactivo"),
    },
];

export default function Profesiones() {
    const [items, setItems] = useState<Profesion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        let isMounted = true;

        ProfesionService.obtenerTodas()
            .then((data) => {
                if (isMounted) setItems(data);
            })
            .catch(() => {
                if (isMounted) setErrorMessage("No fue posible cargar las profesiones.");
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
                title="Profesiones | Toyota"
                description="Consulta las profesiones registradas."
            />
            <PageBreadcrumb pageTitle="Profesiones" />
            <section className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3 lg:mb-6">
                    <h1 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Profesiones
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
                        Cargando profesiones...
                    </p>
                ) : errorMessage ? (
                    <p className="py-8 text-center text-sm text-error-600" role="alert">
                        {errorMessage}
                    </p>
                ) : items.length === 0 ? (
                    <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        No hay profesiones para mostrar.
                    </p>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
                        <DetailsList
                            className="min-w-[420px] [&_.ms-DetailsHeader]:bg-gray-50 dark:[&_.ms-DetailsHeader]:bg-gray-900"
                            items={items}
                            columns={columns}
                            selectionMode={SelectionMode.none}
                            layoutMode={DetailsListLayoutMode.fixedColumns}
                            isHeaderVisible
                            getKey={(item: Profesion) => String(item.id)}
                            ariaLabelForGrid="Lista de profesiones"
                        />
                    </div>
                )}
            </section>
        </>
    );
}
