import { Modal } from "@/components/ui/modal";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useModal } from "@/hooks/useModal";
import { RegenerateIcon, SearchIcon } from "@/icons";
import { ColaboradorService, type Colaborador } from "@/services";
import { useEffect, useMemo, useState } from "react";
import {
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  type IColumnDragDropDetails,
  type IColumn,
  type IDetailsRowProps,
  type IRenderFunction,
} from "@fluentui/react";

type AgeColorStatus = {
  color: "none" | "yellow" | "red";
  range: string;
  meaning: string;
  rowClass: string;
};

function getAgeColorStatus(age: number): AgeColorStatus {
  if (age >= 51) {
    return {
      color: "red",
      range: "51 años o más",
      meaning: "Por favor quédese en casa.",
      rowClass: "!bg-error-50 dark:!bg-error-500/15",
    };
  }

  if (age >= 26) {
    return {
      color: "yellow",
      range: "26 a 50 años",
      meaning: "Tenga cuidado y tome todas las medidas de prevención.",
      rowClass: "!bg-warning-50 dark:!bg-warning-500/15",
    };
  }

  return {
    color: "none",
    range: "18 a 25 años",
    meaning: "Fuera de peligro; no requiere color de alerta.",
    rowClass: "",
  };
}

const initialColumns: IColumn[] = [
  {
    key: "id",
    name: "ID",
    fieldName: "id",
    minWidth: 48,
    maxWidth: 64,
    isResizable: true,
  },
  {
    key: "nombre",
    name: "Nombre",
    fieldName: "nombre",
    minWidth: 88,
    maxWidth: 112,
    isResizable: true,
  },
  {
    key: "apellido",
    name: "Apellido",
    fieldName: "apellido",
    minWidth: 96,
    maxWidth: 128,
    isResizable: true,
  },
  {
    key: "direccion",
    name: "Dirección",
    fieldName: "direccion",
    minWidth: 176,
    maxWidth: 232,
    isResizable: true,
  },
  {
    key: "edad",
    name: "Edad",
    fieldName: "edad",
    minWidth: 48,
    maxWidth: 64,
    isResizable: true,
  },
  {
    key: "profesionNombre",
    name: "Profesión",
    fieldName: "profesionNombre",
    minWidth: 160,
    maxWidth: 240,
    isResizable: true,
  },
  {
    key: "estadoCivilNombre",
    name: "Estado civil",
    fieldName: "estadoCivilNombre",
    minWidth: 120,
    maxWidth: 180,
    isResizable: true,
  },
];

export default function UserProfiles() {
  const [search, setSearch] = useState("");
  const [professionFilter, setProfessionFilter] = useState("");
  const [maritalStatusFilter, setMaritalStatusFilter] = useState("");
  const [columns, setColumns] = useState(initialColumns);
  const [selectedRecord, setSelectedRecord] = useState<Colaborador | null>(null);
  const [colaboradorData, setColaboradorData] = useState<Colaborador[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");
  const { isOpen, openModal, closeModal } = useModal();

  useEffect(() => {
    let isMounted = true;

    ColaboradorService.obtenerTodos()
      .then((data) => {
        if (isMounted) setColaboradorData(data);
      })
      .catch(() => {
        if (isMounted) setLoadError("No fue posible cargar los colaboradores.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("es");

    return colaboradorData
      .filter((item) => {
        const matchesSearch =
          !normalizedSearch ||
          Object.values(item).some((value) =>
            String(value).toLocaleLowerCase("es").includes(normalizedSearch),
          );
        const matchesProfession =
          !professionFilter || String(item.profesionId) === professionFilter;
        const matchesMaritalStatus =
          !maritalStatusFilter ||
          String(item.estadoCivilId) === maritalStatusFilter;

        return matchesSearch && matchesProfession && matchesMaritalStatus;
      });
  }, [colaboradorData, maritalStatusFilter, professionFilter, search]);

  const refreshData = async () => {
    setIsRefreshing(true);
    setLoadError("");

    try {
      const data = await ColaboradorService.obtenerTodos();
      setColaboradorData(data);
    } catch {
      setLoadError("No fue posible actualizar los colaboradores.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleColumnDrop = ({ draggedIndex, targetIndex }: IColumnDragDropDetails) => {
    if (draggedIndex === targetIndex) return;

    setColumns((currentColumns) => {
      const reorderedColumns = [...currentColumns];
      const [movedColumn] = reorderedColumns.splice(draggedIndex, 1);
      if (!movedColumn) return currentColumns;
      reorderedColumns.splice(targetIndex, 0, movedColumn);
      return reorderedColumns;
    });
  };

  const renderRow: IRenderFunction<IDetailsRowProps> = (rowProps, defaultRender) => {
    if (!rowProps || !defaultRender) return null;

    const ageColor = getAgeColorStatus((rowProps.item as Colaborador).edad);

    const enhancedRowProps = {
      ...rowProps,
      onDoubleClick: () => {
        setSelectedRecord(rowProps.item as Colaborador);
        openModal();
      },
      className: `${rowProps.className ?? ""} ${ageColor.rowClass}`,
    };

    return defaultRender(enhancedRowProps);
  };

  const professionOptions = Array.from(
    new Map(colaboradorData.map((item) => [item.profesionId, item.profesionNombre])),
  ).sort(([firstId], [secondId]) => firstId - secondId);
  const maritalStatusOptions = Array.from(
    new Map(colaboradorData.map((item) => [item.estadoCivilId, item.estadoCivilNombre])),
  ).sort(([firstId], [secondId]) => firstId - secondId);

  return (
    <>
      <PageBreadcrumb pageTitle="Colaboradores" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 lg:mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Grid de colaboradores
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredItems.length} de {colaboradorData.length} colaboradores
            </span>
            <button
              type="button"
              onClick={refreshData}
              disabled={isLoading || isRefreshing}
              aria-label="Actualizar colaboradores"
              title="Actualizar colaboradores"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-300 px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
            >
              <RegenerateIcon className={`size-4 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </div>
        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="relative sm:col-span-2 xl:col-span-2">
            <span className="sr-only">Buscar colaboradores</span>
            <SearchIcon className="pointer-events-none absolute inset-s-3.5 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre, dirección o cualquier dato"
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent ps-11 pe-4 text-sm text-gray-800 shadow-theme-xs outline-none transition placeholder:text-gray-400 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
          </label>
          <label>
            <span className="sr-only">Filtrar por profesión</span>
            <select
              value={professionFilter}
              onChange={(event) => setProfessionFilter(event.target.value)}
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 shadow-theme-xs outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              <option value="">Todas las profesiones</option>
              {professionOptions.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Filtrar por estado civil</span>
            <select
              value={maritalStatusFilter}
              onChange={(event) => setMaritalStatusFilter(event.target.value)}
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 shadow-theme-xs outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              <option value="">Todos los estados civiles</option>
              {maritalStatusOptions.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <section
          aria-labelledby="age-color-legend"
          className="mb-5 border-y border-gray-200 py-4 dark:border-gray-800"
        >
          <h4
            id="age-color-legend"
            className="mb-3 text-sm font-semibold text-gray-800 dark:text-white/90"
          >
            Significado de los colores por edad
          </h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <span className="mt-1 size-4 shrink-0 rounded-sm border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900" />
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <span className="block font-medium text-gray-800 dark:text-white/90">
                  18 a 25 años: sin color
                </span>
                Fuera de peligro.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-1 size-4 shrink-0 rounded-sm bg-warning-400" />
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <span className="block font-medium text-gray-800 dark:text-white/90">
                  26 a 50 años: amarillo
                </span>
                Tenga cuidado y tome todas las medidas de prevención.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-1 size-4 shrink-0 rounded-sm bg-error-500" />
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <span className="block font-medium text-gray-800 dark:text-white/90">
                  51 años o más: rojo
                </span>
                Por favor quédese en casa.
              </p>
            </div>
          </div>
        </section>
        {isLoading ? (
          <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400" role="status">
            Cargando colaboradores...
          </p>
        ) : loadError ? (
          <p className="py-8 text-center text-sm text-error-600" role="alert">
            {loadError}
          </p>
        ) : colaboradorData.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            No hay colaboradores para mostrar.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
            <DetailsList
              className="min-w-[840px] [&_.ms-DetailsHeader]:bg-gray-50 [&_.ms-DetailsRow]:cursor-pointer dark:[&_.ms-DetailsHeader]:bg-gray-900"
              items={filteredItems}
              columns={columns}
              selectionMode={SelectionMode.single}
              layoutMode={DetailsListLayoutMode.fixedColumns}
              isHeaderVisible
              getKey={(item: Colaborador) => String(item.id)}
              onActiveItemChanged={(item?: Colaborador) => {
                setSelectedRecord(item ?? null);
              }}
              columnReorderOptions={{ onColumnDrop: handleColumnDrop }}
              onRenderRow={renderRow}
              ariaLabelForGrid="Directorio de colaboradores"
            />
          </div>
        )}
      </div>
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="mx-4 max-w-lg p-6 sm:p-8"
      >
        {selectedRecord && (
          <div>
            {(() => {
              const ageColor = getAgeColorStatus(selectedRecord.edad);
              return (
                <div
                  className={`mb-5 rounded-lg border border-gray-200 p-4 dark:border-gray-700 ${ageColor.rowClass}`}
                >
                  <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                    Clasificación: {ageColor.color === "none" ? "Sin color" : ageColor.color === "yellow" ? "Amarillo" : "Rojo"}
                  </p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {selectedRecord.edad} años ({ageColor.range}). {ageColor.meaning}
                  </p>
                </div>
              );
            })()}
            <p className="mb-1 text-sm font-medium text-brand-500">
              Colaborador #{selectedRecord.id}
            </p>
            <h2 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
              {selectedRecord.nombre} {selectedRecord.apellido}
            </h2>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Dirección
                </dt>
                <dd className="mt-1 text-sm text-gray-800 dark:text-white/90">
                  {selectedRecord.direccion}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Edad
                </dt>
                <dd className="mt-1 text-sm text-gray-800 dark:text-white/90">
                  {selectedRecord.edad}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Profesión
                </dt>
                <dd className="mt-1 text-sm text-gray-800 dark:text-white/90">
                  {selectedRecord.profesionNombre} (ID {selectedRecord.profesionId})
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Estado civil
                </dt>
                <dd className="mt-1 text-sm text-gray-800 dark:text-white/90">
                  {selectedRecord.estadoCivilNombre} (ID {selectedRecord.estadoCivilId})
                </dd>
              </div>
            </dl>
          </div>
        )}
      </Modal>
    </>
  );
}
