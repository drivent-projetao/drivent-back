import { prisma } from "@/config";
import { Local } from ".prisma/client";

export function createLocale(name: string): Promise<Local> {
  return prisma.local.create({
    data: {
      name,
    },
  });
}
