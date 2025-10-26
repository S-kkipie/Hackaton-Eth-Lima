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
import React from "react";

export default function ValidateReturnModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { sendAsync: validateReturn, isPending } = useScaffoldWriteContract({
    contractName: "ReturnValidationManager",
    functionName: "validate_return",
  });
  const [returnId, setReturnId] = React.useState("");

  return (
    <main className="flex items-center justify-center  p-4">
      <Card className="max-w-xl w-full">
        <CardContent>
          <Input
            value={returnId}
            onChange={(e) => setReturnId(e.target.value)}
            placeholder="ID de retorno"
            className="mb-4"
          />
          <div>
            <Button
              onClick={async () => {
                try {
                  await validateReturn({
                    args: ["1", true, "Producto en buen estado"],
                  });
                } catch (err) {
                  console.error(err);
                  const errorMessage = (err as Error)?.message || "";

                  toast.error?.(
                    errorMessage.includes("Return not found")
                      ? "No se encontró el retorno"
                      : "Error al validar el retorno"
                  );
                  return;
                }
                toast.success?.("Retorno validado exitosamente");
                onOpenChange(false);
              }}
            >
              Validar Retorno
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                try {
                  await validateReturn({
                    args: ["1", false, "Producto  dañado"],
                  });
                } catch (err) {
                  console.error(err);
                  const errorMessage = (err as Error)?.message || "";

                  toast.error?.(
                    errorMessage.includes("Return not found")
                      ? "No se encontró el retorno"
                      : "Error al validar el retorno"
                  );
                  return;
                }
                toast.success?.("Retorno cancelado exitosamente");
                onOpenChange(false);
              }}
              className="ml-2"
            >
              Cancelar Retorno
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
