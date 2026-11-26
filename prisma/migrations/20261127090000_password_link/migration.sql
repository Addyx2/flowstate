-- AlterTable
ALTER TABLE "User" ADD COLUMN     "passwordTokenExpAt" TIMESTAMP(3),
ADD COLUMN     "passwordTokenHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_passwordTokenHash_key" ON "User"("passwordTokenHash");

