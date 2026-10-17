import SignInForm from "@/components/auth/SignInForm";
import PageMeta from "@/components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Iniciar sesión | TailAdmin"
        description="Accede a tu panel de administración de TailAdmin."
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
