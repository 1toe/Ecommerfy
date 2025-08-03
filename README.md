# ShopAPP

## API Documentation with Postman

### Authentication Setup

For protected endpoints, you will need to include a Firebase token in the `Authorization` header:

```
Authorization: Bearer <your-firebase-token>
```

### Product Endpoints (Local API)

#### Get all products

- **URL**: `/api/products`
- **Method**: GET
- **Auth**: Token required
- **Successful Response**:

```json
{
  "success": true,
  "products": [
    {
      "id": "abc123",
      "name": "Product 1",
      "description": "Product description",
      "price": 19.99,
      "category": "electronics",
      "stock": 10
    }
  ]
}
```

#### Get a specific product

- **URL**: `/api/products/:id`
- **Method**: GET
- **Auth**: Token required
- **Successful Response**:

```json
{
  "success": true,
  "product": {
    "id": "abc123",
    "name": "Product 1",
    "description": "Product description",
    "price": 19.99,
    "category": "electronics",
    "stock": 10
  }
}
```
#### Create a new product as admin
 * **URL**: `/api/products`
- **Method**: POST
- **Auth**: Admin token required
- **Body**:

```json
{
  "name": "New Product",
  "description": "Description of the new product",
  "price": 29.99,
  "category": "home",
  "stock": 5
}
```

- **Successful Response**:

```json
{
  "success": true,
  "productId": "xyz789",
  "product": {
    "id": "xyz789",
    "name": "New Product",
    "description": "Description of the new product",
    "price": 29.99,
    "category": "home",
    "stock": 5
  }
}
```

#### Update a product (admin only)

- **URL**: `/api/products/:id`
- **Method**: PUT
- **Auth**: Admin token required
- **Body**:

```json
{
  "name": "Updated Product",
  "price": 39.99,
  "stock": 15
}
```

- **Successful Response**:

```json
{
  "success": true,
  "product": {
    "id": "abc123",
    "name": "Updated Product",
    "description": "Product description",
    "price": 39.99,
    "category": "electronics",
    "stock": 15
  }
}
```

#### Delete a product (admin only)

- **URL**: `/api/products/:id`
- **Method**: DELETE
- **Auth**: Admin token required
- **Successful Response**:

```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

#### Get products by category

- **URL**: `/api/products/category/:category`
- **Method**: GET
- **Auth**: Token required
- **Successful Response**:

```json
{
  "success": true,
  "products": [
    {
      "id": "abc123",
      "name": "Product 1",
      "description": "Product description",
      "price": 19.99,
      "category": "electronics",
      "stock": 10
    }
  ]
}
```

#### Search products

- **URL**: `/api/products/search`
- **Method**: POST
- **Auth**: Token required
- **Body**:

```json
{
  "searchTerm": "text to search"
}
```

- **Successful Response**:

```json
{
  "success": true,
  "products": [
    {
      "id": "abc123",
      "name": "Product containing search text",
      "description": "Product description",
      "price": 19.99,
      "category": "electronics",
      "stock": 10
    }
  ]
}
```

### Firebase Realtime DatabasTo
#### Get all products from Realtime Database

- **URL**: `https://app-334-default-rtdb.firebaseio.com/products.json`
- **Method**: GET
- **Successful Response**:

```json
{
  "-ProductID1": {
    "name": "Smartphone Samsung Galaxy S23",
    "description": "Latest generation smartphone with 8GB RAM and 256GB storage",
    "price": 899.99,
    "category": "electronics",
    "stock": 15
  },
  "-ProductID2": {
    "name": "MSI GF63 Gaming Laptop",
    "description": "Gaming laptop with Intel i7 processor, 16GB RAM, RTX 3060, 512GB SSD",
    "price": 1299.99,
    "category": "laptops",
    "stock": 10
  }
}
```

#### Get a specific product from Realtime Database

- **URL**: `https://app-334-default-rtdb.firebaseio.com/products/{productId}.json`
- **Method**: GET
- **Successful Response**:

```json
{
  "name": "Smartphone Samsung Galaxy S23",
  "description": "Latest generation smartphone with 8GB RAM and 256GB storage",
  "price": 899.99,
  "category": "electronics",
  "stock": 15
}
```

#### Create a new product in Realtime Database

- **URL**: `https://app-334-default-rtdb.firebaseio.com/products.json`
- **Method**: POST
- **Body**:

```json
{
  "id": "3",
  "name": "iPad Pro Tablet",
  "description": "Apple tablet with 11-inch Liquid Retina display",
  "price": 799.99,
  "category": "tablets",
  "stock": 8
}
```

- **Successful Response**:

```json
{
  "name": "-ProductID3"
}
```

#### Update a product in Realtime Database

- **URL**: `https://app-334-default-rtdb.firebaseio.com/products/{productId}.json`
- **Method**: PATCH
- **Body**:

```json
{
  "price": 749.99,
  "stock": 12
}
```

- **Successful Response**:

```json
{
  "price": 749.99,
  "stock": 12
}`
Shopper
