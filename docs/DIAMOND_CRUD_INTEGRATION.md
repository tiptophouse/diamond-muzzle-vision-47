# Diamond CRUD Operations - FastAPI Integration Guide

## Overview

This document explains the proper way to perform Create, Read, Update, and Delete (CRUD) operations on diamonds using the FastAPI backend integration.

## Critical Requirements

### 1. Diamond ID Format

**IMPORTANT**: The FastAPI backend requires an **integer `diamond_id`** for all update and delete operations.

```typescript
// ❌ WRONG - Using stock number (string)
deleteDiamond({ diamondId: "ABC123", userId: 123 });

// ✅ CORRECT - Using integer diamond_id
deleteDiamond({ diamondId: 456, userId: 123 });
```

### 2. Field Naming Convention

The backend uses **snake_case** while the frontend uses **camelCase**. The hooks automatically handle this transformation.

```typescript
// Frontend (camelCase)
{
  stockNumber: "ABC123",
  pricePerCarat: 5000,
  certificateNumber: "123456"
}

// Backend (snake_case)
{
  stock: "ABC123",
  price_per_carat: 5000,
  certificate_number: 123456
}
```

## Usage Examples

### Extracting Diamond ID

Always use the `extractDiamondId()` helper to safely get the integer ID:

```typescript
import { extractDiamondId } from '@/api/diamondTransformers';

const diamondId = extractDiamondId(diamond);

if (!diamondId) {
  console.error('Invalid diamond ID');
  return;
}
```

### Creating a Diamond

```typescript
import { useCreateDiamond } from '@/hooks/api/useDiamonds';

const createDiamond = useCreateDiamond();

const handleCreate = () => {
  if (!user?.id) return;

  const diamondData = {
    stockNumber: 'ABC123',
    shape: 'Round',
    carat: 1.5,
    color: 'G',
    clarity: 'VS1',
    cut: 'Excellent',
    polish: 'Excellent',
    symmetry: 'Excellent',
    fluorescence: 'None',
    certificateNumber: '123456789',
    lab: 'GIA',
    pricePerCarat: 5000,
  };

  createDiamond.mutate(
    { data: diamondData, userId: user.id },
    {
      onSuccess: (response) => {
        console.log('✅ Created:', response);
      },
      onError: (error) => {
        console.error('❌ Failed:', error);
      },
    }
  );
};
```

### Updating a Diamond

```typescript
import { useUpdateDiamond } from '@/hooks/api/useDiamonds';
import { extractDiamondId } from '@/api/diamondTransformers';

const updateDiamond = useUpdateDiamond();

const handleUpdate = (diamond: Diamond) => {
  if (!user?.id) return;

  const diamondId = extractDiamondId(diamond);
  
  if (!diamondId) {
    console.error('Cannot update: Invalid diamond ID');
    return;
  }

  const updates = {
    pricePerCarat: 5500,
    storeVisible: true,
  };

  updateDiamond.mutate(
    { diamondId, data: updates, userId: user.id },
    {
      onSuccess: (response) => {
        console.log('✅ Updated:', response);
      },
      onError: (error) => {
        console.error('❌ Failed:', error);
      },
    }
  );
};
```

### Deleting a Diamond

```typescript
import { useDeleteDiamond } from '@/hooks/api/useDiamonds';
import { extractDiamondId } from '@/api/diamondTransformers';

const deleteDiamond = useDeleteDiamond();

const handleDelete = (diamond: Diamond) => {
  if (!user?.id) return;

  const diamondId = extractDiamondId(diamond);
  
  if (!diamondId) {
    console.error('Cannot delete: Invalid diamond ID');
    return;
  }

  if (confirm(`Delete diamond ${diamond.stockNumber}?`)) {
    deleteDiamond.mutate(
      { diamondId, userId: user.id },
      {
        onSuccess: (response) => {
          console.log('✅ Deleted:', response);
        },
        onError: (error) => {
          console.error('❌ Failed:', error);
        },
      }
    );
  }
};
```

### Fetching All Diamonds

```typescript
import { useGetAllStones } from '@/hooks/api/useDiamonds';

const { data: diamonds, isLoading, error } = useGetAllStones(user.id);

// diamonds will contain the list of diamonds from FastAPI
// Each diamond object will have a diamond_id field
```

## API Endpoints

### GET All Stones
```
GET /api/v1/get_all_stones?user_id={userId}
```

Returns array of diamonds with `diamond_id` field.

### POST Create Diamond
```
POST /api/v1/diamonds
```

Body: Diamond data in snake_case format (automatically transformed by hook)

### PUT Update Diamond
```
PUT /api/v1/diamonds/{diamond_id}
```

Requires integer `diamond_id` in URL path.

### DELETE Delete Diamond
```
DELETE /api/v1/delete_stone/{diamond_id}
```

Requires integer `diamond_id` in URL path.

## Common Errors

### Error: "Invalid diamond ID"

**Cause**: The diamond object doesn't have a `diamond_id` field.

**Solution**: 
1. Ensure the backend is returning `diamond_id` in the response
2. Check that you're using data from `useGetAllStones()` 
3. Verify the diamond object structure in console

### Error: "Cannot read property 'diamond_id'"

**Cause**: Trying to access diamond_id before data is loaded.

**Solution**: Always check if the diamond object exists and has a valid ID:

```typescript
const diamondId = extractDiamondId(diamond);
if (!diamondId) {
  console.error('Invalid diamond');
  return;
}
```

### Error: "Field name mismatch"

**Cause**: Using snake_case in frontend or camelCase in backend calls.

**Solution**: The hooks handle transformation automatically. Always use camelCase in your components:

```typescript
// ✅ CORRECT
const data = {
  stockNumber: "ABC",
  pricePerCarat: 5000
};

// ❌ WRONG
const data = {
  stock_number: "ABC",  // Don't use snake_case in frontend
  price_per_carat: 5000
};
```

## Testing

To test diamond CRUD operations:

1. **Create**: Check that toast notification appears and diamond shows in list
2. **Update**: Verify changes reflect immediately (optimistic updates)
3. **Delete**: Confirm diamond disappears from UI and shows success message

Always check the console for detailed logs:
- `💎 Creating diamond:` - Create operation
- `✏️ Updating diamond ID:` - Update operation  
- `🗑️ Deleting diamond ID:` - Delete operation
- `✅` - Success
- `❌` - Error

## Need Help?

If you encounter issues:

1. Check console logs for detailed error messages
2. Verify the diamond object has a `diamond_id` field
3. Ensure you're using the correct hooks from `@/hooks/api/useDiamonds`
4. Review this documentation for proper usage patterns
