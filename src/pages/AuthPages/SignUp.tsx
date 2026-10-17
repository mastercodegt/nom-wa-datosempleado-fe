import SignUpForm from "@/components/auth/SignUpForm";
import PageMeta from "@/components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="Crear cuenta | Toyota"
        description="Crea una cuenta para acceder al panel de administración de Toyota."
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
