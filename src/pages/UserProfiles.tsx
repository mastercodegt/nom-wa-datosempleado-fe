import PageBreadcrumb from "@/components/common/PageBreadCrumb";
export default function UserProfiles() {
  return (
    <>
      <PageBreadcrumb pageTitle="Colaboradores" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 lg:mb-7 dark:text-white/90">
          Grid Empleados
        </h3>
        <div className="space-y-6">
          <p className="text-theme-sm text-gray-500 dark:text-gray-400">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
            tincidunt, nisl eget aliquam tincidunt, nunc nisl aliquam
            tincidunt, eget aliquam nisl nunc eget nisl. Sed tincidunt, nisl
            eget aliquam tincidunt, nunc nisl aliquam tincidunt, eget aliquam
            nisl nunc eget nisl.
          </p>
        </div>
      </div>
    </>
  );
}
