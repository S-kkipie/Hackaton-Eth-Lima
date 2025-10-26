# 📚 Documentación de Contratos - Frontend

Guía completa de todas las funciones de los contratos y cómo usarlas desde el frontend.

---

## 📑 Tabla de Contenidos

1. [IdentityRegistry](#1️⃣-identityregistry)
2. [ProductRegistry](#2️⃣-productregistry)
3. [ReturnValidationManager](#3️⃣-returnvalidationmanager)
4. [RewardManager](#4️⃣-rewardmanager)
5. [Ejemplos Completos](#5️⃣-ejemplos-completos)
6. [Flujos de Usuario](#6️⃣-flujos-de-usuario)

---

## 1️⃣ IdentityRegistry

Gestiona roles y metadatos de usuarios del sistema.

### 📖 Roles Disponibles

| Código | Rol | Descripción |
|--------|-----|-------------|
| `0` | Unassigned | Sin rol asignado |
| `1` | Manufacturer | Fabricante de productos |
| `2` | Seller | Vendedor/Tienda |
| `3` | Buyer | Comprador final |

---

### 🔧 Funciones

#### `register_user(role, metadata)`
Registra un usuario con su rol y metadata.

**Parámetros:**
- `role` (felt252): Código del rol (1, 2, o 3)
- `metadata` (felt252): Información adicional (nombre, email, etc.)

**Permisos:** Cualquiera (self-registration)

**Ejemplo:**
```typescript
import { useScaffoldWriteContract } from "~~/hooks/scaffold-stark";

const { writeAsync: registerUser, isPending } = useScaffoldWriteContract({
  contractName: "IdentityRegistry",
  functionName: "register_user",
});

// Registrar como Manufacturer
await registerUser({
  args: ["1", "Juan Perez - Fabrica XYZ"],
});

// Registrar como Seller
await registerUser({
  args: ["2", "Tienda ABC"],
});

// Registrar como Buyer
await registerUser({
  args: ["3", "Maria Lopez"],
});
```

**Errores Comunes:**
- `"Usuario ya registrado"` - La wallet ya tiene un rol asignado

---

#### `get_role(account)`
Obtiene el rol de una cuenta.

**Parámetros:**
- `account` (ContractAddress): Dirección de la wallet

**Retorna:** `felt252` - Código del rol

**Ejemplo:**
```typescript
import { useScaffoldReadContract } from "~~/hooks/scaffold-stark";
import { useAccount } from "@starknet-react/core";

const { address } = useAccount();

const { data: userRole } = useScaffoldReadContract({
  contractName: "IdentityRegistry",
  functionName: "get_role",
  args: address ? [address] : undefined,
});

// userRole será "1", "2", "3", etc.
const isManufacturer = userRole === "1";
const isSeller = userRole === "2";
const isBuyer = userRole === "3";
```

---

#### `get_metadata(account)`
Obtiene la metadata de una cuenta.

**Parámetros:**
- `account` (ContractAddress): Dirección de la wallet

**Retorna:** `felt252` - Metadata almacenada

**Ejemplo:**
```typescript
const { data: metadata } = useScaffoldReadContract({
  contractName: "IdentityRegistry",
  functionName: "get_metadata",
  args: [userAddress],
});
```

---

#### `set_metadata(metadata)`
Actualiza tu propia metadata.

**Parámetros:**
- `metadata` (felt252): Nueva metadata

**Permisos:** Solo el usuario mismo

**Ejemplo:**
```typescript
const { writeAsync: updateMetadata } = useScaffoldWriteContract({
  contractName: "IdentityRegistry",
  functionName: "set_metadata",
});

await updateMetadata({
  args: ["Nueva información actualizada"],
});
```

---

#### `revoke_role(account)`
Revoca el rol de un usuario (solo owner).

**Parámetros:**
- `account` (ContractAddress): Dirección a revocar

**Permisos:** Solo owner del contrato

---

## 2️⃣ ProductRegistry

Gestiona el ciclo de vida completo de los productos.

### 📊 Estados del Producto

| Código | Estado | Descripción | Color UI |
|--------|--------|-------------|----------|
| `0` | CREATED | Recién registrado | 🔵 Info |
| `1` | IN_STORE | En tienda, disponible | 🟢 Success |
| `2` | SOLD | Vendido a comprador | 🟣 Primary |
| `3` | RETURNED_TO_STORE | Devuelto a tienda | 🟡 Warning |
| `4` | RETURNED_TO_FACTORY | Devuelto a fábrica | 🟡 Warning |
| `5` | RECYCLED | Reciclado | ⚫ Secondary |

---

### 🔧 Funciones

#### `register_product(product_id, description)`
Registra un nuevo producto.

**Parámetros:**
- `product_id` (felt252): ID único del producto
- `description` (felt252): Descripción del producto

**Permisos:** Solo Manufacturer (role = 1)

**Estado inicial:** CREATED (0)

**Ejemplo:**
```typescript
const { writeAsync: registerProduct } = useScaffoldWriteContract({
  contractName: "ProductRegistry",
  functionName: "register_product",
});

await registerProduct({
  args: [
    "SKU-12345",           // product_id
    "Laptop Dell XPS 13"  // description
  ],
});
```

**Errores Comunes:**
- `"Only Manufacturer can register products"` - No tienes role de Manufacturer
- `"Product already registered"` - El product_id ya existe
- `"Owner address cannot be zero"` - Error en constructor (no debería pasar)

---

#### `move_to_instore(product_id)`
Mueve un producto de CREATED → IN_STORE.

**Parámetros:**
- `product_id` (felt252): ID del producto

**Permisos:** 
- Solo Manufacturer (role = 1)
- Debe ser el owner del producto

**Validaciones:**
- Producto debe existir
- Estado actual debe ser CREATED (0)
- Caller debe ser Manufacturer Y owner

**Ejemplo:**
```typescript
const { writeAsync: moveToStore } = useScaffoldWriteContract({
  contractName: "ProductRegistry",
  functionName: "move_to_instore",
});

await moveToStore({
  args: ["SKU-12345"],
});
```

**Errores Comunes:**
- `"Product not registered"` - El producto no existe
- `"Only Manufacturer owner can move to in-store"` - No eres el owner o no eres Manufacturer
- `"Invalid state transition: must be Created"` - El producto no está en estado CREATED

---

#### `sell_to_user(product_id, buyer)`
Vende un producto de IN_STORE → SOLD.

**Parámetros:**
- `product_id` (felt252): ID del producto
- `buyer` (ContractAddress): Dirección del comprador

**Permisos:** Solo Seller (role = 2)

**Validaciones:**
- Buyer no puede ser dirección cero
- Producto debe existir
- Estado actual debe ser IN_STORE (1)

**Ejemplo:**
```typescript
const { writeAsync: sellProduct } = useScaffoldWriteContract({
  contractName: "ProductRegistry",
  functionName: "sell_to_user",
});

await sellProduct({
  args: [
    "SKU-12345",                    // product_id
    "0x0742...9876"                 // buyer address
  ],
});
```

**Cambios:**
- Owner cambia al buyer
- Estado cambia a SOLD (2)
- Se emiten eventos: ProductTransferred + ProductStatusUpdated

**Errores Comunes:**
- `"Buyer address cannot be zero"` - Dirección inválida
- `"Only Seller can sell products"` - No tienes role de Seller
- `"Invalid state transition: must be InStore"` - El producto no está en tienda

---

#### `transfer_product(product_id, new_owner)`
Transfiere la propiedad de un producto.

**Parámetros:**
- `product_id` (felt252): ID del producto
- `new_owner` (ContractAddress): Nueva dirección propietaria

**Permisos:** Solo el owner actual del producto

**Validaciones:**
- new_owner no puede ser dirección cero
- Producto debe existir
- Caller debe ser el owner actual
- NO se puede transferir si está en estados: RETURNED_TO_STORE, RETURNED_TO_FACTORY, o RECYCLED

**Ejemplo:**
```typescript
const { writeAsync: transferProduct } = useScaffoldWriteContract({
  contractName: "ProductRegistry",
  functionName: "transfer_product",
});

await transferProduct({
  args: [
    "SKU-12345",
    "0x0123...abcd"  // new_owner
  ],
});
```

**Cambios:**
- Owner cambia a new_owner
- Estado cambia a SOLD (2)
- History length incrementa

**Errores Comunes:**
- `"New owner address cannot be zero"` - Dirección inválida
- `"Product not registered"` - Producto no existe
- `"Only current owner can transfer product"` - No eres el owner
- `"Cannot transfer product in return or recycled state"` - Estado no permite transferencia

---

#### `factory_recycle(product_id)`
Marca un producto como reciclado y emite recompensa.

**Parámetros:**
- `product_id` (felt252): ID del producto

**Permisos:** Solo Manufacturer (role = 1)

**Validaciones:**
- Producto debe existir
- Estado actual debe ser RETURNED_TO_FACTORY (4)

**Proceso:**
1. Cambia estado a RECYCLED (5)
2. Lee el returns_initiator (quien inició el retorno)
3. Si returns_initiator no es zero, llama a RewardManager.claim_reward()
4. Emite evento ProductStatusUpdated

**Ejemplo:**
```typescript
const { writeAsync: recycleProduct } = useScaffoldWriteContract({
  contractName: "ProductRegistry",
  functionName: "factory_recycle",
});

await recycleProduct({
  args: ["SKU-12345"],
});
```

**Errores Comunes:**
- `"Only Manufacturer can perform recycling"` - No eres Manufacturer
- `"Invalid state transition: must be ReturnedToFactory"` - Estado incorrecto

---

#### `apply_validated_return(return_id)`
Aplica un retorno validado (llamado por ReturnValidationManager).

**Parámetros:**
- `return_id` (felt252): ID del retorno

**Permisos:** Solo ReturnValidationManager

**⚠️ Uso interno:** Esta función normalmente NO la llamas desde el frontend.

---

#### `get_product_info(product_id)`
Obtiene información completa de un producto.

**Parámetros:**
- `product_id` (felt252): ID del producto

**Retorna:** `(product_id, owner, description, status, timestamp)`
- `product_id` (felt252): ID del producto
- `owner` (ContractAddress): Propietario actual
- `description` (felt252): Descripción
- `status` (felt252): Estado actual (0-5)
- `timestamp` (u64): Timestamp (actualmente siempre 0)

**Ejemplo:**
```typescript
const { data: productInfo } = useScaffoldReadContract({
  contractName: "ProductRegistry",
  functionName: "get_product_info",
  args: ["SKU-12345"],
});

if (productInfo) {
  const [id, owner, description, status, timestamp] = productInfo;
  
  console.log("Product ID:", id);
  console.log("Owner:", owner);
  console.log("Description:", description);
  console.log("Status:", status); // "0", "1", "2", etc.
}
```

---

#### `get_product_history(product_id)`
Obtiene la longitud del historial de un producto.

**Parámetros:**
- `product_id` (felt252): ID del producto

**Retorna:** `(history_length)`
- `history_length` (felt252): Número de eventos en el historial

**Ejemplo:**
```typescript
const { data: history } = useScaffoldReadContract({
  contractName: "ProductRegistry",
  functionName: "get_product_history",
  args: ["SKU-12345"],
});

const historyLength = history?.[0]; // Número de eventos
```

---

#### Funciones de Configuración (Solo Owner)

##### `set_return_manager(return_manager_addr)`
Configura la dirección del ReturnValidationManager.

**Ejemplo:**
```typescript
const { writeAsync: setReturnManager } = useScaffoldWriteContract({
  contractName: "ProductRegistry",
  functionName: "set_return_manager",
});

await setReturnManager({
  args: ["0x...ReturnManager_address"],
});
```

##### `set_identity_registry(identity_registry_addr)`
Actualiza la dirección del IdentityRegistry.

##### `set_reward_manager(reward_manager_addr)`
Actualiza la dirección del RewardManager.

---

## 3️⃣ ReturnValidationManager

Gestiona solicitudes de retorno y su validación.

### 📊 Estados de Retorno

| Código | Estado | Descripción |
|--------|--------|-------------|
| `1` | PENDING | Esperando validación |
| `2` | APPROVED | Aprobado por validator |
| `3` | REJECTED | Rechazado |
| `4` | CANCELLED | Cancelado por usuario |

---

### 🔧 Funciones

#### `create_return(product_id, target_status)`
Crea una solicitud de retorno.

**Parámetros:**
- `product_id` (felt252): ID del producto a retornar
- `target_status` (felt252): Estado destino (3 o 4)
  - `3` = RETURNED_TO_STORE
  - `4` = RETURNED_TO_FACTORY

**Permisos:** Cualquier usuario (típicamente el comprador)

**Ejemplo:**
```typescript
const { writeAsync: createReturn } = useScaffoldWriteContract({
  contractName: "ReturnValidationManager",
  functionName: "create_return",
});

// Retornar a tienda
await createReturn({
  args: [
    "SKU-12345",  // product_id
    "3"           // RETURNED_TO_STORE
  ],
});

// Retornar a fábrica
await createReturn({
  args: [
    "SKU-12345",  // product_id
    "4"           // RETURNED_TO_FACTORY
  ],
});
```

**Proceso:**
1. Genera un return_id automáticamente
2. Guarda product_id, user, target_status
3. Estado inicial: PENDING (1)
4. Emite evento ReturnCreated

---

#### `validate_return(return_id, is_valid, evidence_ipfs)`
Valida o rechaza un retorno.

**Parámetros:**
- `return_id` (felt252): ID del retorno
- `is_valid` (bool): true = aprobar, false = rechazar
- `evidence_ipfs` (felt252): Hash IPFS de evidencia

**Permisos:** Solo validators autorizados

**Ejemplo:**
```typescript
const { writeAsync: validateReturn } = useScaffoldWriteContract({
  contractName: "ReturnValidationManager",
  functionName: "validate_return",
});

// Aprobar retorno
await validateReturn({
  args: [
    "1",              // return_id
    true,             // is_valid = approve
    "QmX..."          // IPFS hash de evidencia
  ],
});

// Rechazar retorno
await validateReturn({
  args: [
    "1",              // return_id
    false,            // is_valid = reject
    "QmY..."          // IPFS hash explicando rechazo
  ],
});
```

**Proceso si is_valid = true:**
1. Cambia estado a APPROVED (2)
2. Guarda evidencia y validator
3. **Llama automáticamente a ProductRegistry.apply_validated_return()**
4. El producto cambia de estado según target_status

---

#### `cancel_return(return_id)`
Cancela una solicitud de retorno.

**Parámetros:**
- `return_id` (felt252): ID del retorno

**Permisos:** Solo el usuario que creó el retorno

**Ejemplo:**
```typescript
const { writeAsync: cancelReturn } = useScaffoldWriteContract({
  contractName: "ReturnValidationManager",
  functionName: "cancel_return",
});

await cancelReturn({
  args: ["1"], // return_id
});
```

---

#### `get_return(return_id)`
Obtiene información de un retorno.

**Parámetros:**
- `return_id` (felt252): ID del retorno

**Retorna:** `(product_id, user, status, validator, evidence_ipfs, timestamp, target_status)`

**Ejemplo:**
```typescript
const { data: returnInfo } = useScaffoldReadContract({
  contractName: "ReturnValidationManager",
  functionName: "get_return",
  args: ["1"],
});

if (returnInfo) {
  const [productId, user, status, validator, evidence, timestamp, target] = returnInfo;
  
  const isPending = status === "1";
  const isApproved = status === "2";
  const isRejected = status === "3";
}
```

---

#### Funciones de Configuración (Solo Owner)

##### `add_validator(validator)`
Agrega un validator autorizado.

**Ejemplo:**
```typescript
const { writeAsync: addValidator } = useScaffoldWriteContract({
  contractName: "ReturnValidationManager",
  functionName: "add_validator",
});

await addValidator({
  args: ["0x...validator_address"],
});
```

##### `remove_validator(validator)`
Remueve un validator.

##### `set_product_registry(product_registry)`
Configura la dirección del ProductRegistry.

---

## 4️⃣ RewardManager

Gestiona recompensas por reciclaje.

### 🔧 Funciones

#### `claim_reward(product_id, user)`
Emite una recompensa (llamado por ProductRegistry).

**⚠️ Uso interno:** Esta función normalmente NO la llamas directamente.
Se llama automáticamente cuando se ejecuta `factory_recycle()`.

---

#### `get_user_rewards(user)`
Obtiene el total de recompensas de un usuario.

**Parámetros:**
- `user` (ContractAddress): Dirección del usuario

**Retorna:** `(total_rewards)`

**Ejemplo:**
```typescript
const { data: rewards } = useScaffoldReadContract({
  contractName: "RewardManager",
  functionName: "get_user_rewards",
  args: [userAddress],
});

const totalRewards = rewards?.[0]; // Total acumulado
```

---

#### Funciones de Configuración (Solo Owner)

##### `set_registry_address(registry_address)`
Configura la dirección del ProductRegistry.

##### `set_reward_amount(amount)`
Configura la cantidad de recompensa por reciclaje.

**Ejemplo:**
```typescript
const { writeAsync: setRewardAmount } = useScaffoldWriteContract({
  contractName: "RewardManager",
  functionName: "set_reward_amount",
});

await setRewardAmount({
  args: [{ low: "100", high: "0" }], // 100 tokens
});
```

---

## 5️⃣ Ejemplos Completos

### Ejemplo 1: Componente de Estado del Usuario

```typescript
"use client";

import { useAccount } from "@starknet-react/core";
import { useScaffoldReadContract } from "~~/hooks/scaffold-stark";

export const UserStatus = () => {
  const { address } = useAccount();

  const { data: userRole } = useScaffoldReadContract({
    contractName: "IdentityRegistry",
    functionName: "get_role",
    args: address ? [address] : undefined,
  });

  const { data: metadata } = useScaffoldReadContract({
    contractName: "IdentityRegistry",
    functionName: "get_metadata",
    args: address ? [address] : undefined,
  });

  const getRoleName = (role: string) => {
    const roles: Record<string, string> = {
      "0": "Sin Rol",
      "1": "Manufacturer",
      "2": "Seller",
      "3": "Buyer",
    };
    return roles[role] || "Desconocido";
  };

  if (!address) return <div>Conecta tu wallet</div>;

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Tu Perfil</h2>
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Rol</div>
            <div className="stat-value text-lg">
              {getRoleName(userRole?.toString() || "0")}
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">Metadata</div>
            <div className="stat-value text-sm">
              {metadata?.toString() || "Sin metadata"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

### Ejemplo 2: Dashboard de Productos

```typescript
"use client";

import { useState } from "react";
import { useScaffoldReadContract } from "~~/hooks/scaffold-stark";

export const ProductDashboard = () => {
  const [productIds] = useState(["SKU-001", "SKU-002", "SKU-003"]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {productIds.map((productId) => (
        <ProductCard key={productId} productId={productId} />
      ))}
    </div>
  );
};

const ProductCard = ({ productId }: { productId: string }) => {
  const { data: productInfo, isLoading } = useScaffoldReadContract({
    contractName: "ProductRegistry",
    functionName: "get_product_info",
    args: [productId],
  });

  if (isLoading) return <div className="skeleton h-32 w-full"></div>;

  const [id, owner, description, status] = productInfo || [];

  const statusColors: Record<string, string> = {
    "0": "badge-info",
    "1": "badge-success",
    "2": "badge-primary",
    "3": "badge-warning",
    "4": "badge-warning",
    "5": "badge-secondary",
  };

  const statusNames: Record<string, string> = {
    "0": "Created",
    "1": "In Store",
    "2": "Sold",
    "3": "Returned to Store",
    "4": "Returned to Factory",
    "5": "Recycled",
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">{productId}</h2>
        <p className="text-sm opacity-70">{description?.toString()}</p>
        <div className="card-actions justify-between items-center">
          <span className={`badge ${statusColors[status?.toString() || "0"]}`}>
            {statusNames[status?.toString() || "0"]}
          </span>
          <span className="text-xs font-mono">
            {owner?.toString().slice(0, 6)}...{owner?.toString().slice(-4)}
          </span>
        </div>
      </div>
    </div>
  );
};
```

---

### Ejemplo 3: Flujo Completo de Retorno

```typescript
"use client";

import { useState } from "react";
import { useScaffoldWriteContract, useScaffoldReadContract } from "~~/hooks/scaffold-stark";
import { notification } from "~~/utils/scaffold-stark";

export const ReturnFlow = ({ productId }: { productId: string }) => {
  const [returnId, setReturnId] = useState<string>("");

  // 1. Crear retorno
  const { writeAsync: createReturn, isPending: isCreating } = useScaffoldWriteContract({
    contractName: "ReturnValidationManager",
    functionName: "create_return",
  });

  // 2. Ver estado del retorno
  const { data: returnInfo } = useScaffoldReadContract({
    contractName: "ReturnValidationManager",
    functionName: "get_return",
    args: returnId ? [returnId] : undefined,
  });

  const handleCreateReturn = async () => {
    try {
      await createReturn({
        args: [productId, "3"], // RETURNED_TO_STORE
      });
      notification.success("Retorno creado!");
    } catch (error: any) {
      notification.error(error?.message);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleCreateReturn}
        disabled={isCreating}
        className="btn btn-warning"
      >
        {isCreating ? "Creando..." : "Crear Solicitud de Retorno"}
      </button>

      {returnInfo && (
        <div className="alert alert-info">
          <div>
            <h3 className="font-bold">Estado del Retorno</h3>
            <div className="text-sm">
              Status: {returnInfo[2]?.toString()}
              {returnInfo[2] === "1" && " (Pendiente)"}
              {returnInfo[2] === "2" && " (Aprobado)"}
              {returnInfo[2] === "3" && " (Rechazado)"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
```

---

## 6️⃣ Flujos de Usuario

### Flujo A: Manufacturer Completo

```typescript
// 1. Registrarse como Manufacturer
await registerUser({ args: ["1", "Mi Fabrica"] });

// 2. Registrar producto
await registerProduct({ args: ["SKU-001", "Laptop"] });

// 3. Mover a tienda
await moveToStore({ args: ["SKU-001"] });

// 4. Esperar venta...

// 5. Cuando retorne a fábrica, reciclar
await recycleProduct({ args: ["SKU-001"] });
```

---

### Flujo B: Seller Completo

```typescript
// 1. Registrarse como Seller
await registerUser({ args: ["2", "Tienda Tech"] });

// 2. Vender producto que esté IN_STORE
await sellProduct({
  args: ["SKU-001", "0x...buyer_address"]
});
```

---

### Flujo C: Buyer Completo

```typescript
// 1. Registrarse como Buyer
await registerUser({ args: ["3", "Juan Cliente"] });

// 2. Comprar (el seller hace esto)

// 3. Si necesita retornar
await createReturn({ args: ["SKU-001", "3"] });

// 4. Esperar validación...

// 5. Si se recicla, recibirás recompensa automáticamente
const rewards = await getRewards({ args: [myAddress] });
```

---

## 📝 Notas Importantes

### ✅ Mejores Prácticas

1. **Siempre validar estados antes de operaciones**
   ```typescript
   const { data: productInfo } = useScaffoldReadContract({
     contractName: "ProductRegistry",
     functionName: "get_product_info",
     args: [productId],
   });
   
   const canSell = productInfo?.[3] === "1"; // IN_STORE
   ```

2. **Manejar errores específicamente**
   ```typescript
   try {
     await sellProduct({ args: [...] });
   } catch (error: any) {
     if (error.message.includes("Only Seller")) {
       notification.error("Necesitas ser Seller");
     } else if (error.message.includes("must be InStore")) {
       notification.error("Producto no disponible");
     }
   }
   ```

3. **Usar loading states**
   ```typescript
   const { writeAsync, isPending } = useScaffoldWriteContract({...});
   
   <button disabled={isPending}>
     {isPending ? "Procesando..." : "Ejecutar"}
   </button>
   ```

4. **Validar direcciones**
   ```typescript
   if (buyerAddress === "0x0" || !buyerAddress) {
     notification.error("Dirección inválida");
     return;
   }
   ```

---

### ⚠️ Errores Comunes

1. **"Product not registered"**
   - Verifica que el producto exista primero
   - Usa `get_product_info` para confirmar

2. **"Invalid state transition"**
   - Verifica el estado actual del producto
   - Sigue el flujo: CREATED → IN_STORE → SOLD

3. **"Only X can..."**
   - Verifica tu rol con `get_role`
   - Registra tu usuario si no lo has hecho

4. **"Zero address"**
   - No uses direcciones vacías o 0x0
   - Valida inputs antes de enviar

---

## 🎯 Tips de Performance

1. **Cachea lecturas frecuentes**
   ```typescript
   const { data, isLoading } = useScaffoldReadContract({
     contractName: "IdentityRegistry",
     functionName: "get_role",
     args: [address],
     // Stale time para evitar re-fetches innecesarios
   });
   ```

2. **Batch operations cuando sea posible**
   - Agrupa múltiples `get_product_info` calls

3. **Usa optimistic updates**
   - Actualiza UI antes de confirmación
   - Revert si falla

---

**¿Necesitas más ejemplos o aclaraciones sobre alguna función?** 🚀
