import { Modal } from "@/components/ui/modal";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import colaboradores from "@/data/colaboradores.json";
import { useModal } from "@/hooks/useModal";
import { SearchIcon } from "@/icons";
import { useMemo, useState } from "react";
import {
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  type IColumnDragDropDetails,
  type IColumn,
  type IDetailsRowProps,
  type IRenderFunction,
} from "@fluentui/react";

type Colaborador = {
  id_colaborador: number;
  nombre: string;
  apellido: string;
  direccion: string;
  edad: number;
  id_profesion: number;
  id_estado_civil: number;
};

type SortState = {
  key: keyof Colaborador;
  descending: boolean;
};

const initialColumns: IColumn[] = [
  {
    key: "id_colaborador",
    name: "ID",
    fieldName: "id_colaborador",
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
    key: "id_profesion",
    name: "ID profesión",
    fieldName: "id_profesion",
    minWidth: 80,
    maxWidth: 104,
    isResizable: true,
  },
  {
    key: "id_estado_civil",
    name: "ID estado civil",
    fieldName: "id_estado_civil",
    minWidth: 96,
    maxWidth: 120,
    isResizable: true,
  },
];

export default function UserProfiles() {
  const [search, setSearch] = useState("");
  const [professionFilter, setProfessionFilter] = useState("");
  const [maritalStatusFilter, setMaritalStatusFilter] = useState("");
  const [columns, setColumns] = useState(initialColumns);
  const [sort, setSort] = useState<SortState | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<Colaborador | null>(null);
  const { isOpen, openModal, closeModal } = useModal();
  const colaboradorData = colaboradores as Colaborador[];

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
          !professionFilter || String(item.id_profesion) === professionFilter;
        const matchesMaritalStatus =
          !maritalStatusFilter ||
          String(item.id_estado_civil) === maritalStatusFilter;

        return matchesSearch && matchesProfession && matchesMaritalStatus;
      })
      .sort((first, second) => {
        if (!sort) return 0;

        const firstValue = first[sort.key];
        const secondValue = second[sort.key];
        const comparison =
          typeof firstValue === "number" && typeof secondValue === "number"
            ? firstValue - secondValue
            : String(firstValue).localeCompare(String(secondValue), "es", {
              sensitivity: "base",
            });

        return sort.descending ? -comparison : comparison;
      });
  }, [colaboradorData, maritalStatusFilter, professionFilter, search, sort]);

  const sortedColumns = columns.map((column) => ({
    ...column,
    isSorted: sort?.key === column.key,
    isSortedDescending:
      sort?.key === column.key ? sort.descending : undefined,
    showSortIconWhenUnsorted: true,
  }));

  const handleColumnHeaderClick = (_event?: React.MouseEvent<HTMLElement>, column?: IColumn) => {
    if (!column) return;

    setSort((current) => ({
      key: column.key as keyof Colaborador,
      descending:
        current?.key === column.key ? !current.descending : false,
    }));
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

    const professionHighlight =
      rowProps.item.id_profesion === 1
        ? "!bg-success-50 dark:!bg-success-500/15"
        : "";

    const enhancedRowProps = {
      ...rowProps,
      onDoubleClick: () => {
        setSelectedRecord(rowProps.item as Colaborador);
        openModal();
      },
      className: `${rowProps.className ?? ""} ${professionHighlight}`,
    };

    return defaultRender(enhancedRowProps);
  };

  const professionOptions = [...new Set(colaboradorData.map((item) => item.id_profesion))].sort(
    (first, second) => first - second,
  );
  const maritalStatusOptions = [...new Set(colaboradorData.map((item) => item.id_estado_civil))].sort(
    (first, second) => first - second,
  );

  return (
    <>
      <PageBreadcrumb pageTitle="Colaboradores" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 lg:mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Grid de colaboradores
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {filteredItems.length} de {colaboradorData.length} colaboradores
          </span>
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
              {professionOptions.map((profession) => (
                <option key={profession} value={profession}>
                  Profesión {profession}
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
              {maritalStatusOptions.map((status) => (
                <option key={status} value={status}>
                  Estado civil {status}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
          <DetailsList
            className="min-w-[840px] [&_.ms-DetailsHeader]:bg-gray-50 [&_.ms-DetailsRow]:cursor-pointer dark:[&_.ms-DetailsHeader]:bg-gray-900"
            items={filteredItems}
            columns={sortedColumns}
            selectionMode={SelectionMode.single}
            layoutMode={DetailsListLayoutMode.fixedColumns}
            isHeaderVisible
            getKey={(item: Colaborador) => String(item.id_colaborador)}
            onActiveItemChanged={(item?: Colaborador) => {
              setSelectedRecord(item ?? null);
            }}
            onColumnHeaderClick={handleColumnHeaderClick}
            columnReorderOptions={{ onColumnDrop: handleColumnDrop }}
            onRenderRow={renderRow}
            ariaLabelForGrid="Directorio de colaboradores"
          />
        </div>
      </div>
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="mx-4 max-w-lg p-6 sm:p-8"
      >
        {selectedRecord && (
          <div>
            <p className="mb-1 text-sm font-medium text-brand-500">
              Colaborador #{selectedRecord.id_colaborador}
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
                  ID profesión
                </dt>
                <dd className="mt-1 text-sm text-gray-800 dark:text-white/90">
                  {selectedRecord.id_profesion}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  ID estado civil
                </dt>
                <dd className="mt-1 text-sm text-gray-800 dark:text-white/90">
                  {selectedRecord.id_estado_civil}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </Modal>
    </>
  );
}
