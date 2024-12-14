-- CreateTable
CREATE TABLE "Task" (
    "id" SERIAL NOT NULL,
    "itemLabel" VARCHAR(200),
    "itemDescription" TEXT,
    "itemStatus" VARCHAR(200) NOT NULL,
    "dueDateTime" TIMESTAMP(3) NOT NULL,
    "dateTimeSet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateTimeModified" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Task_id_key" ON "Task"("id");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
