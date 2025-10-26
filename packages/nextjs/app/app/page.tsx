"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useScaffoldWriteContract } from "@/hooks/scaffold-stark/useScaffoldWriteContract";
import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
  FieldContent,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Title } from "@/components/ui/title";
import { useScaffoldReadContract } from "@/hooks/scaffold-stark/useScaffoldReadContract";
import { useAccount } from "@/hooks/useAccount";
import { redirect } from "next/navigation";

export default function Page() {
  const { address } = useAccount();

  const { data: userRole } = useScaffoldReadContract({
    contractName: "IdentityRegistry",
    functionName: "get_role",
    args: address ? [address] : undefined,
  });

  if(userRole && userRole !== 0) {
    redirect('/app/dashboard');
  }

  const { sendAsync: registerUser, isPending } = useScaffoldWriteContract({
    contractName: "IdentityRegistry",
    functionName: "register_user",
  });

  const registerUserSchema = z.object({
    role: z.string(),
    name: z.string().min(2).max(50),
  });

  const form = useForm<z.infer<typeof registerUserSchema>>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      role: "1",
      name: "",
    },
  });

  async function onSubmit(data: z.infer<typeof registerUserSchema>) {
    const roleNumber = parseInt(data.role);
    try {
      await registerUser({
        args: [roleNumber, data.name],
      });
    } catch (err) {
      toast.error?.(
        (err as Error)?.message.includes("ya registrado")
          ? "Usuario ya registrado"
          : "Fallo al registrar usuario"
      );
    }
  }

  return (
    <main className="flex items-center justify-center min-h-svh p-4">
      <Card className="max-w-xl w-full">
        <CardHeader>
          <Title>Hablanos de ti</Title>
        </CardHeader>
        <CardContent>
          <form
            id="form-identity-registry"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FieldGroup>
              <Controller
                name="role"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    orientation="responsive"
                    data-invalid={fieldState.invalid}
                  >
                    <FieldContent>
                      <FieldLabel htmlFor="form-identity-role">
                        Tu rol
                      </FieldLabel>
                      <FieldDescription>
                        Porfavor selecciona el rol que desempeñas.
                      </FieldDescription>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </FieldContent>
                    <Select
                      name={field.name}
                      value={String(field.value)}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        id="form-identity-role"
                        aria-invalid={fieldState.invalid}
                        className="min-w-[120px]"
                      >
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent position="item-aligned">
                        <SelectItem value={"1"}>Fabricante</SelectItem>
                        <SelectItem value={"2"}>Vendedor</SelectItem>
                        <SelectItem value={"3"}>Comprador</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-identity-name">
                      Nombres
                    </FieldLabel>
                    <Input
                      {...field}
                      id="form-identity-name"
                      aria-invalid={fieldState.invalid}
                      placeholder="e.g. Juan Perez"
                      autoComplete="off"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Field orientation="horizontal">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Borrar campos
            </Button>
            <Button
              disabled={isPending}
              type="submit"
              form="form-identity-registry"
            >
              Continuar
            </Button>
          </Field>
        </CardFooter>
      </Card>
    </main>
  );
}
