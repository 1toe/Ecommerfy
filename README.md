# Shopper Cart - Aplicación de Compras

## Documentación de la API para Postman

### Configuración de Autenticación

Para los endpoints protegidos, necesitarás incluir un token de Firebase en el header `Authorization`:

```
Authorization: Bearer <tu-token-firebase>
```

Para obtener un token, puedes iniciar sesión en la aplicación y usar la consola del navegador para obtener el token de auth.currentUser.

### Endpoints de Productos (API Local)

#### Obtener todos los productos

- **URL**: `/api/products`
- **Método**: GET
- **Auth**: Requiere token
- **Respuesta exitosa**:

```json
{
  "success": true,
  "products": [
    {
      "id": "abc123",
      "name": "Producto 1",
      "description": "Descripción del producto",
      "price": 19.99,
      "category": "electrónica",
      "stock": 10
    }
  ]
}
```

#### Obtener un producto específico

- **URL**: `/api/products/:id`
- **Método**: GET
- **Auth**: Requiere token
- **Respuesta exitosa**:

```json
{
  "success": true,
  "product": {
    "id": "abc123",
    "name": "Producto 1",
    "description": "Descripción del producto",
    "price": 19.99,
    "category": "electrónica",
    "stock": 10
  }
}
```

#### Crear un producto nuevo (solo admin)

- **URL**: `/api/products`
- **Método**: POST
- **Auth**: Requiere token de administrador
- **Body**:

```json
{
  "name": "Nuevo Producto",
  "description": "Descripción del nuevo producto",
  "price": 29.99,
  "category": "hogar",
  "stock": 5
}
```

- **Respuesta exitosa**:

```json
{
  "success": true,
  "productId": "xyz789",
  "product": {
    "id": "xyz789",
    "name": "Nuevo Producto",
    "description": "Descripción del nuevo producto",
    "price": 29.99,
    "category": "hogar",
    "stock": 5
  }
}
```

#### Actualizar un producto (solo admin)

- **URL**: `/api/products/:id`
- **Método**: PUT
- **Auth**: Requiere token de administrador
- **Body**:

```json
{
  "name": "Producto Actualizado",
  "price": 39.99,
  "stock": 15
}
```

- **Respuesta exitosa**:

```json
{
  "success": true,
  "product": {
    "id": "abc123",
    "name": "Producto Actualizado",
    "description": "Descripción del producto",
    "price": 39.99,
    "category": "electrónica",
    "stock": 15
  }
}
```

#### Eliminar un producto (solo admin)

- **URL**: `/api/products/:id`
- **Método**: DELETE
- **Auth**: Requiere token de administrador
- **Respuesta exitosa**:

```json
{
  "success": true,
  "message": "Producto eliminado correctamente"
}
```

#### Obtener productos por categoría

- **URL**: `/api/products/category/:category`
- **Método**: GET
- **Auth**: Requiere token
- **Respuesta exitosa**:

```json
{
  "success": true,
  "products": [
    {
      "id": "abc123",
      "name": "Producto 1",
      "description": "Descripción del producto",
      "price": 19.99,
      "category": "electrónica",
      "stock": 10
    }
  ]
}
```

#### Buscar productos

- **URL**: `/api/products/search`
- **Método**: POST
- **Auth**: Requiere token
- **Body**:

```json
{
  "searchTerm": "texto a buscar"
}
```

- **Respuesta exitosa**:

```json
{
  "success": true,
  "products": [
    {
      "id": "abc123",
      "name": "Producto que contiene texto a buscar",
      "description": "Descripción del producto",
      "price": 19.99,
      "category": "electrónica",
      "stock": 10
    }
  ]
}
```

### Firebase Realtime Database

Esta aplicación también admite interacción directa con Firebase Realtime Database. A continuación se detallan las operaciones que puedes realizar con Postman.

#### Obtener todos los productos desde Realtime Database

- **URL**: `https://app-334-default-rtdb.firebaseio.com/products.json`
- **Método**: GET
- **Respuesta exitosa**:

```json
{
  "-ProductID1": {
    "name": "Smartphone Samsung Galaxy S23",
    "description": "Smartphone de última generación con 8GB RAM y 256GB almacenamiento",
    "price": 899.99,
    "category": "electrónica",
    "stock": 15
  },
  "-ProductID2": {
    "name": "Laptop Gaming MSI GF63",
    "description": "Laptop gaming con procesador Intel i7, 16GB RAM, RTX 3060, 512GB SSD",
    "price": 1299.99,
    "category": "laptops",
    "stock": 10
  }
}
```

#### Obtener un producto específico desde Realtime Database

- **URL**: `https://app-334-default-rtdb.firebaseio.com/products/{productId}.json`
- **Método**: GET
- **Respuesta exitosa**:

```json
{
  "name": "Smartphone Samsung Galaxy S23",
  "description": "Smartphone de última generación con 8GB RAM y 256GB almacenamiento",
  "price": 899.99,
  "category": "electrónica",
  "stock": 15
}
```

#### Crear un nuevo producto en Realtime Database

- **URL**: `https://app-334-default-rtdb.firebaseio.com/products.json`
- **Método**: POST
- **Body**:

```json
{
  "id": "3",
  "name": "Tablet iPad Pro",
  "description": "Tablet Apple con pantalla Liquid Retina de 11 pulgadas",
  "price": 799.99,
  "category": "tablets",
  "stock": 8
}
```

- **Respuesta exitosa**:

```json
{
  "name": "-ProductID3"
}
```

#### Actualizar un producto en Realtime Database

- **URL**: `https://app-334-default-rtdb.firebaseio.com/products/{productId}.json`
- **Método**: PATCH
- **Body**:

```json
{
  "price": 749.99,
  "stock": 12
}
```

- **Respuesta exitosa**:

```json
{
  "price": 749.99,
  "stock": 12
}
```

#### Eliminar un producto en Realtime Database

- **URL**: `https://app-334-default-rtdb.firebaseio.com/products/{productId}.json`
- **Método**: DELETE
- **Respuesta exitosa**:

```
null
```

### Sistema de ID acumulativos

Para mantener IDs acumulativos, se utiliza el nodo `lastId` en la Realtime Database:

1. Obtener el último ID utilizado:
   - **URL**: `https://app-334-default-rtdb.firebaseio.com/lastId.json`
   - **Método**: GET

2. Actualizar el último ID después de crear un producto:
   - **URL**: `https://app-334-default-rtdb.firebaseio.com/lastId.json`
   - **Método**: PUT
   - **Body**:
   ```json
   {
     "value": 4
   }
   ```

### Verificar si un usuario es administrador

- **URL**: `/api/admin/check`
- **Método**: GET
- **Auth**: Requiere token
- **Respuesta exitosa**:

```json
{
  "isAdmin": true
}
```
