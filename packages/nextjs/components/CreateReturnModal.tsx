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

export default function CreateReturnModal({
  open,
  onOpenChange,
  isBuyer,
}: {
  isBuyer: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { sendAsync: createReturn, isPending: isCreatingReturn } =
    useScaffoldWriteContract({
      contractName: "ReturnValidationManager",
      functionName: "create_return",
    });

  const { sendAsync: transferProduct, isPending: isTransferringProduct } =
    useScaffoldWriteContract({
      contractName: "ProductRegistry",
      functionName: "transfer_product",
    });

  const createReturnSchema = z.object({
    returnState: z.string(),
    code: z.string().min(30).max(30),
    newOwner: z.string().min(2).max(50),
  });

  const form = useForm<z.infer<typeof createReturnSchema>>({
    resolver: zodResolver(createReturnSchema),
    defaultValues: {
      code: "",
      newOwner: "",
      returnState: isBuyer ? "3" : "4",
    },
  });

  async function onSubmit(data: z.infer<typeof createReturnSchema>) {
    try {
      await createReturn({
        args: [data.code, data.returnState],
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
          : errorMessage.includes("Buyer address cannot be zero")
            ? "Dirección inválida"
            : errorMessage.includes("Only Seller can sell products")
              ? "No tienes role de Seller"
              : errorMessage.includes(
                    "Invalid state transition: must be InStore"
                  )
                ? "El producto no está en tienda"
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
          <form id="form-sell-product" onSubmit={form.handleSubmit(onSubmit)}>
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
                    <FieldLabel htmlFor="form-product-new-buyer">
                      Vendedor del producto
                    </FieldLabel>
                    <Input
                      {...field}
                      id="form-product-new-buyer"
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
              disabled={isCreatingReturn || isTransferringProduct}
              type="submit"
              form="form-sell-product"
            >
              Continuar
            </Button>
          </Field>
        </CardFooter>
      </Card>
    </main>
  );
}
