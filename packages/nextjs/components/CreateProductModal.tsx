"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
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
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { nanoid } from "nanoid";

export default function CreateProductModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { sendAsync: registerProduct, isPending } = useScaffoldWriteContract({
    contractName: "ProductRegistry",
    functionName: "register_product",
  });
  const registerProductSchema = z.object({
    code: z.string().min(30).max(30),
    name: z.string().min(2).max(50),
  });

  const form = useForm<z.infer<typeof registerProductSchema>>({
    resolver: zodResolver(registerProductSchema),
    defaultValues: {
      code: nanoid(30),
      name: "",
    },
  });

  async function onSubmit(data: z.infer<typeof registerProductSchema>) {
    try {
      await registerProduct({
        args: [data.code, data.name],
      });
    } catch (err) {
      console.error(err);
      toast.error?.(
        (err as Error)?.message.includes("Manufacturer can register")
          ? "Solo el fabricante puede registrar productos"
          : (err as Error)?.message.includes("Product already registered")
            ? "El producto ya está registrado"
            : "Error desconocido"
      );
    }
    onOpenChange(false);
    form.reset();
  }

  return (
    <main className="flex items-center justify-center  p-4">
      <Card className="max-w-xl w-full">
        <CardContent>
          <form
            id="form-product-registry"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-product-name">
                      Nombre del producto
                    </FieldLabel>
                    <Input
                      {...field}
                      id="form-product-name"
                      aria-invalid={fieldState.invalid}
                      placeholder="e.g. Audifonos Bluetooth"
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
              form="form-product-registry"
            >
              Continuar
            </Button>
          </Field>
        </CardFooter>
      </Card>
    </main>
  );
}
