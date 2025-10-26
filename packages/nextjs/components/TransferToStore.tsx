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

export default function TransferToStoreModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { sendAsync: moveToStore, isPending: isMovingToStore } =
    useScaffoldWriteContract({
      contractName: "ProductRegistry",
      functionName: "move_to_instore",
    });
  const { sendAsync: transferProduct, isPending: isTransferringProduct } =
    useScaffoldWriteContract({
      contractName: "ProductRegistry",
      functionName: "transfer_product",
    });

  const transferToStoreSchema = z.object({
    code: z.string().min(30).max(30),
    newOwner: z.string().min(2).max(50),
  });

  const form = useForm<z.infer<typeof transferToStoreSchema>>({
    resolver: zodResolver(transferToStoreSchema),
    defaultValues: {
      code: "",
      newOwner: "",
    },
  });

  async function onSubmit(data: z.infer<typeof transferToStoreSchema>) {
    try {
      await moveToStore({
        args: [data.code],
      });
      await transferProduct({
        args: [data.code, data.newOwner],
      });
    } catch (err) {
      console.error(err);
      const errorMessage = (err as Error)?.message || "";

      toast.error?.(
        errorMessage.includes("Product not registered")
          ? "El producto no existe"
          : errorMessage.includes(
                "Only Manufacturer owner can move to in-store"
              )
            ? "No eres el owner o no eres Manufacturer"
            : errorMessage.includes("Invalid state transition: must be Created")
              ? "El producto no está en estado CREATED"
              : errorMessage.includes("New owner address cannot be zero")
                ? "Dirección inválida"
                : errorMessage.includes(
                      "Only current owner can transfer product"
                    )
                  ? "No eres el owner"
                  : errorMessage.includes(
                        "Cannot transfer product in return or recycled state"
                      )
                    ? "Estado no permite transferencia"
                    : errorMessage.includes("Product already registered")
                      ? "El producto ya está registrado"
                      : errorMessage.includes("Manufacturer can register")
                        ? "Solo el fabricante puede registrar productos"
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
                name="code"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-product-code">
                      Código del producto
                    </FieldLabel>
                    <Input
                      {...field}
                      id="form-product-code"
                      aria-invalid={fieldState.invalid}
                      placeholder="e.g. 0x1234567890abcdef"
                      autoComplete="off"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="newOwner"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-product-new-owner">
                      Nuevo propietario
                    </FieldLabel>
                    <Input
                      {...field}
                      id="form-product-new-owner"
                      aria-invalid={fieldState.invalid}
                      placeholder="e.g. 0x1234567890abcdef"
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
              disabled={isMovingToStore || isTransferringProduct}
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
