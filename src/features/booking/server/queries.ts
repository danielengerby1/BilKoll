import "server-only";
import { db } from "@/server/db";

export async function getBookingContext(workshopId: string, serviceSlug: string) {
  const price = await db.workshopServicePrice.findFirst({
    where: { workshopId, service: { slug: serviceSlug } },
    include: { workshop: true, service: true },
  });
  return price;
}

export function getBooking(id: string) {
  return db.bookingRequest.findUnique({ where: { id }, include: { workshop: true, service: true } });
}
