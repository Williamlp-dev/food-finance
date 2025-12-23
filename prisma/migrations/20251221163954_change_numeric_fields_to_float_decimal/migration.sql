/*
  Warnings:

  - You are about to alter the column `baseSalary` on the `employee` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.
  - You are about to alter the column `total` on the `purchase` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.
  - You are about to alter the column `unitPrice` on the `purchase_item` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.
  - You are about to alter the column `total` on the `purchase_item` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.
  - You are about to alter the column `unitCost` on the `stock_item` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.
  - You are about to alter the column `totalValue` on the `stock_item` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "employee" ALTER COLUMN "baseSalary" SET DEFAULT 0,
ALTER COLUMN "baseSalary" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "purchase" ALTER COLUMN "total" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "purchase_item" ALTER COLUMN "quantity" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "unitPrice" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "total" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "stock_item" ALTER COLUMN "quantity" SET DEFAULT 0,
ALTER COLUMN "quantity" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "unitCost" SET DEFAULT 0,
ALTER COLUMN "unitCost" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "totalValue" SET DEFAULT 0,
ALTER COLUMN "totalValue" SET DATA TYPE DECIMAL(10,2);
