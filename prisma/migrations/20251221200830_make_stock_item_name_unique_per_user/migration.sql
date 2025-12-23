/*
  Warnings:

  - A unique constraint covering the columns `[name,userId]` on the table `stock_item` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "stock_item_name_userId_key" ON "stock_item"("name", "userId");
