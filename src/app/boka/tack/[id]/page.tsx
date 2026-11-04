import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CircleCheckBig } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBooking } from "@/features/booking/server/queries";
import { formatDateSv } from "@/lib/dates";
import { formatSek } from "@/lib/money";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Förfrågan skickad" };

export default async function BookingThanksPage({ params }: { params: Promise<{ id: string }> }) {
  const booking = await getBooking((await params).id);
  if (!booking) notFound();

  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader className="items-center text-center">
        <CircleCheckBig aria-hidden className="size-12 text-success" />
        <CardTitle className="text-2xl">Bokningsförfrågan skickad</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 text-center">
        <p>
          {booking.workshop.name} har fått din förfrågan om <strong>{booking.service.titleSv.toLowerCase()}</strong> den{" "}
          {formatDateSv(booking.preferredDate)}. De bekräftar tiden till {booking.customerEmail}.
        </p>
        <p className="text-sm text-muted-foreground">
          Pris vid bokning: <strong className="text-foreground">{formatSek(booking.quotedTotalSek)}</strong> inkl. moms. Om
          verkstaden hittar mer som behöver göras ska de fråga dig först – godkänn inget extra utan pris.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/granska" className={buttonVariants({ variant: "outline" })}>Granska en tilläggsoffert</Link>
          <Link href="/" className={buttonVariants()}>Till startsidan</Link>
        </div>
      </CardContent>
    </Card>
  );
}
