# 🚀 Product Registry - Guía de Uso en Frontend

## 📋 Pasos Completos

### 1️⃣ Compilar y Deploy Contratos
Compila los contratos:
```bash
yarn compile
```
Después, en dos terminales separadas, corre:
```bash
# Terminal 1: Iniciar devnet local
yarn chain

# Terminal 2: Deploy contratos
yarn deploy --network devnet
```

Esto deployará automáticamente:
- ✅ IdentityRegistry
- ✅ RewardManager
- ✅ ProductRegistry
- ✅ ReturnValidationManager

Los contratos se auto-exportan a `/packages/nextjs/contracts/deployedContracts.ts`

---

### 2️⃣ Iniciar Frontend

```bash
# Terminal 3
cd packages/nextjs
yarn dev
```

Visita: **http://localhost:3000/product-registry**

---

### 3️⃣ Flujo de Uso

#### A. Registrar Usuario (Todos)
1. Ve a la tab "👤 Usuario"
2. Selecciona tu rol:
   - **Manufacturer (1)**: Registra y gestiona productos
   - **Seller (2)**: Vende productos
   - **Buyer (3)**: Compra productos
3. Ingresa metadata (nombre, email, etc.)
4. Click en "Registrar Usuario"
5. Confirma en tu wallet

#### B. Registrar Producto (Solo Manufacturer)
1. Ve a la tab "📦 Registrar"
2. Ingresa ID del producto (ej: "SKU-001")
3. Ingresa descripción
4. Click en "Registrar Producto"
5. Confirma en tu wallet

#### C. Mover a Tienda (Solo Manufacturer)
**NOTA**: Esta función aún no tiene componente, deberás crearla o llamarla manualmente

```typescript
const { writeAsync } = useScaffoldWriteContract({
  contractName: "ProductRegistry",
  functionName: "move_to_instore",
});

await writeAsync({ args: [productId] });
```

#### D. Vender Producto (Solo Seller)
1. Ve a la tab "🏪 Vender"
2. Ingresa ID del producto
3. Ingresa dirección del comprador
4. Click en "Vender Producto"
5. Confirma en tu wallet

#### E. Buscar Producto (Todos)
1. Ve a la tab "🔍 Buscar"
2. Ingresa ID del producto
3. Click en "Buscar"
4. Ve la información completa:
   - Estado actual
   - Owner
   - Descripción
   - Historial de eventos

---

## 🎨 Componentes Creados

```
components/ProductRegistry/
├── RegisterUser.tsx          # Registro de usuarios con roles
├── RegisterProduct.tsx       # Registro de productos (Manufacturer)
├── SellProduct.tsx          # Venta de productos (Seller)
├── ProductInfo.tsx          # Búsqueda y visualización
└── index.ts                 # Exportaciones
```

```
app/
└── product-registry/
    └── page.tsx             # Página principal con tabs
```

---

## 🔧 Cómo Usar los Hooks de Scaffold-Stark

### Leer Datos (Read Functions)

```typescript
import { useScaffoldReadContract } from "~~/hooks/scaffold-stark";

const { data, isLoading } = useScaffoldReadContract({
  contractName: "ProductRegistry",
  functionName: "get_product_info",
  args: [productId],
});

// data contiene: [productId, owner, description, status, timestamp]
```

### Escribir Datos (Write Functions)

```typescript
import { useScaffoldWriteContract } from "~~/hooks/scaffold-stark";

const { writeAsync, isPending } = useScaffoldWriteContract({
  contractName: "ProductRegistry",
  functionName: "register_product",
});

// Llamar la función
await writeAsync({
  args: [productId, description],
});
```

### Con Notificaciones

```typescript
import { notification } from "~~/utils/scaffold-stark";

try {
  await writeAsync({ args: [...] });
  notification.success("¡Operación exitosa!");
} catch (error) {
  notification.error(error?.message || "Error");
}
```

---

## 📊 Estados del Producto

| Código | Estado | Descripción |
|--------|--------|-------------|
| 0 | Created | Producto recién registrado |
| 1 | InStore | En tienda, disponible para venta |
| 2 | Sold | Vendido a un comprador |
| 3 | ReturnedToStore | Devuelto a la tienda |
| 4 | ReturnedToFactory | Devuelto al fabricante |
| 5 | Recycled | Reciclado (recompensa emitida) |

---

## 🔐 Roles del Sistema

### Manufacturer (Role 1)
**Permisos:**
- ✅ Registrar productos
- ✅ Mover productos a tienda
- ✅ Reciclar productos
- ✅ Transferir productos

### Seller (Role 2)
**Permisos:**
- ✅ Vender productos a compradores

### Buyer (Role 3)
**Permisos:**
- ✅ Crear solicitudes de retorno
- ✅ Ver información de productos

---

## 🛠️ Componentes Adicionales Recomendados

### 1. MoveToStore.tsx (Manufacturer)
```typescript
const { writeAsync } = useScaffoldWriteContract({
  contractName: "ProductRegistry",
  functionName: "move_to_instore",
});
```

### 2. CreateReturn.tsx (Buyer)
```typescript
const { writeAsync } = useScaffoldWriteContract({
  contractName: "ReturnValidationManager",
  functionName: "create_return",
});
```

### 3. ValidateReturn.tsx (Validator)
```typescript
const { writeAsync } = useScaffoldWriteContract({
  contractName: "ReturnValidationManager",
  functionName: "validate_return",
});
```

### 4. RecycleProduct.tsx (Manufacturer)
```typescript
const { writeAsync } = useScaffoldWriteContract({
  contractName: "ProductRegistry",
  functionName: "factory_recycle",
});
```

---

## 🐛 Troubleshooting

### Error: "Only Manufacturer can register products"
- Verifica que te hayas registrado con role = 1
- Asegúrate de usar la wallet correcta

### Error: "Product already registered"
- Usa un productId diferente
- Verifica que no esté registrado con ProductInfo

### Error: "Product not registered"
- Primero registra el producto
- Verifica el ID ingresado

### Error: "Invalid state transition"
- Verifica el flujo: Created → InStore → Sold
- Usa ProductInfo para ver el estado actual

### Contratos no aparecen
- Verifica que deployedContracts.ts tenga las direcciones
- Re-deploy con: `yarn deploy --reset --network devnet`

---

## 📱 Ejemplo de Página Completa

Ya creamos `/app/product-registry/page.tsx` que incluye:
- ✅ Tabs para cada funcionalidad
- ✅ Todos los componentes integrados
- ✅ Guía de uso incorporada
- ✅ Información de roles
- ✅ Diseño responsive con DaisyUI

**Solo necesitas visitar**: http://localhost:3000/product-registry

---

## 🚀 Próximos Pasos

1. ✅ Deploy contratos localmente
2. ✅ Iniciar frontend
3. ✅ Registrarte como usuario
4. ✅ Probar el flujo completo
5. 🔜 Crear componentes adicionales (Move, Return, Recycle)
6. 🔜 Deploy a Sepolia testnet
7. 🔜 Integrar con frontend de producción

---

¿Necesitas ayuda con algún paso o quieres que cree más componentes?
