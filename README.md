# yiqihua-core

Core utilities for Yiqihua functionality with TypeScript support. This package provides efficient group expense settlement calculations to minimize the number of transactions needed to balance shared expenses.

## Installation

```bash
npm install yiqihua-core
```

## Usage

### Basic Example

```typescript
import { yiqihua } from 'yiqihua-core';

const result = yiqihua({
  individuals: [
    { name: 'Alice', amountSpent: 70 },
    { name: 'Bob', amountSpent: 50 },
    { name: 'Charlie', amountSpent: 0 },
    { name: 'David', amountSpent: 0 }
  ]
});

console.log(result);
// {
//   totalAmount: 120,
//   averageAmount: 30,
//   settlements: [
//     { from: 'Charlie', to: 'Alice', amount: 30 },
//     { from: 'David', to: 'Alice', amount: 10 },
//     { from: 'David', to: 'Bob', amount: 20 }
//   ]
// }
```

### Using Amount Units (for precise calculations)

```typescript
import { yiqihua } from 'yiqihua-core';

// Working with cents (decimals: 2)
const result = yiqihua({
  decimals: 2,
  individuals: [
    { name: 'Alice', amountUnits: 1050 }, // $10.50
    { name: 'Bob', amountUnits: 950 }     // $9.50
  ]
});
```

### Custom Decimal Precision

```typescript
// For cryptocurrencies with 3 decimal places
const result = yiqihua({
  decimals: 3,
  individuals: [
    { name: 'Alice', amountSpent: 1.234 },
    { name: 'Bob', amountSpent: 5.678 }
  ]
});
```

## API Reference

### `yiqihua(input: YiqihuaInput): YiqihuaOutput`

Calculates optimal settlements for shared expenses.

#### YiqihuaInput

```typescript
interface YiqihuaInput {
  individuals: Array<{
    name: string;
    amountSpent?: number;    // Amount spent as decimal
    amountUnits?: number;    // Amount as integer units (for precision)
  }>;
  decimals?: number;         // Decimal places (0-8, default: 2)
}
```

**Note:** Each individual must provide exactly one of `amountSpent` or `amountUnits`.

#### YiqihuaOutput

```typescript
interface YiqihuaOutput {
  totalAmount: number;                              // Total amount spent
  averageAmount: number;                            // Average per person
  settlements: Array<{                              // Minimal transfers needed
    from: string;
    to: string;
    amount: number;
  }>;
}
```

## Features

- **Minimal Transfers**: Calculates the minimum number of transactions needed
- **High Precision**: Avoids floating-point errors using integer arithmetic
- **Flexible Input**: Accepts either decimal amounts or integer units
- **TypeScript Support**: Full type definitions included
- **Zero Dependencies**: Lightweight and fast

## License

MIT