# Shopper Cart - Aplicación de Compras

## Documentación de la API para Postman

### Configuración de Autenticación

Para los endpoints protegidos, necesitarás incluir un token de Firebase en el header `Authorization`:

```
Authorization: Bearer <tu-token-firebase>
```

Para obtener un token, puedes iniciar sesión en la aplicación y usar la consola del navegador para obtener el token de auth.currentUser.

### Endpoints de Productos

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
      "image": "url_imagen",
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
    "image": "url_imagen",
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
  "image": "url_imagen",
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
    "image": "url_imagen",
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
    "image": "url_imagen",
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
      "image": "url_imagen",
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
      "image": "url_imagen",
      "category": "electrónica",
      "stock": 10
    }
  ]
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
