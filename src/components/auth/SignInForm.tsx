import Label from "@/components/form/Label";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import {
  ChevronLeftIcon,
  EnvelopeIcon,
  EyeCloseIcon,
  EyeIcon,
  LockIcon,
} from "@/icons";
import { AuthService } from "@/services";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);
    const correo = String(formData.get("correo") ?? "").trim();
    const contraseña = String(formData.get("contraseña") ?? "");

    try {
      setIsSubmitting(true);
      const passwordBytes = new TextEncoder().encode(contraseña);
      const hashBuffer = await crypto.subtle.digest("SHA-256", passwordBytes);
      const contraseñaSha256 = Array.from(new Uint8Array(hashBuffer))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");

      await AuthService.iniciarSesion(correo, contraseñaSha256);
      navigate("/");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible iniciar sesión. Inténtalo de nuevo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col">





      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div>
          <div className="mb-5 sm:mb-8">
            <img
              src="/images/logo/images.png"
              alt="Toyota"
              className="mb-6 h-14 w-auto object-contain object-left"
            />
            <h1 className="mb-2 text-title-sm font-semibold text-gray-800 sm:text-title-md dark:text-white/90">
              Iniciar sesión
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Introduce tu correo electrónico y contraseña para continuar.
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Correo electrónico <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <EnvelopeIcon className="pointer-events-none absolute inset-s-4 top-1/2 z-10 size-5 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="email"
                      id="email"
                      name="correo"
                      autoComplete="email"
                      placeholder="nombre@empresa.com"
                      required
                      className="h-12 rounded-xl border-gray-200 bg-white/95 ps-11 text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:border-brand-500 focus:ring-brand-500/15 dark:border-gray-700 dark:bg-gray-900/85 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <Label>
                    Contraseña <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <LockIcon className="pointer-events-none absolute inset-s-4 top-1/2 z-10 size-5 -translate-y-1/2 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="contraseña"
                      autoComplete="current-password"
                      placeholder="Escribe tu contraseña"
                      required
                      className="h-12 rounded-xl border-gray-200 bg-white/95 ps-11 pe-12 text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:border-brand-500 focus:ring-brand-500/15 dark:border-gray-700 dark:bg-gray-900/85 dark:text-white"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-e-3 top-1/2 z-30 -translate-y-1/2 rounded-md p-1 text-gray-400 transition hover:text-brand-500 focus-visible:outline-2 focus-visible:outline-brand-500"
                    >
                      {showPassword ? (
                        <EyeIcon className="size-5 fill-current" />
                      ) : (
                        <EyeCloseIcon className="size-5 fill-current" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block text-theme-sm font-normal text-gray-700 dark:text-gray-400">
                      Mantener la sesión iniciada
                    </span>
                  </div>
                  <Link
                    to="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                {errorMessage && (
                  <p className="text-sm text-error-600" role="alert">
                    {errorMessage}
                  </p>
                )}
                <div>
                  <Button className="w-full" size="sm" disabled={isSubmitting}>
                    {isSubmitting ? "Validando..." : "Iniciar sesión"}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-center text-sm font-normal text-gray-700 sm:text-start dark:text-gray-400">
                ¿No tienes una cuenta? {" "}
                <Link
                  to="/signup"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Crear cuenta
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
