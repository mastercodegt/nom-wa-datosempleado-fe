import SignInForm from "@/components/auth/SignInForm";
import PageMeta from "@/components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Iniciar sesión | Toyota"
        description="Accede al panel de administración de Toyota."
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
