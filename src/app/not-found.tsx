import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid justify-items-center gap-4 py-16 text-center">
      <h1 className="text-3xl font-bold">Sidan hittades inte</h1>
      <p className="text-muted-foreground">Kontrollera adressen eller registreringsnumret och försök igen.</p>
      <Link href="/" className={buttonVariants()}>
        Till startsidan
      </Link>
    </div>
  );
}
