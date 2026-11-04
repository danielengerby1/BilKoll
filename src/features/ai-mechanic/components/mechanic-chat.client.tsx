"use client";

import { useRef, useState, useTransition } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { askMechanicAction, type MechanicReply } from "../server/actions";
import { ChatMessage, type ChatEntry } from "./chat-message";

const EXAMPLES = [
  "Det gnisslar när jag bromsar",
  "Motorlampan lyser gult – kan jag köra?",
  "När måste jag byta till vinterdäck?",
  "Bilen startar inte, det bara klickar",
];

export function MechanicChat({ regnr, vehicleLabel }: { regnr: string | null; vehicleLabel: string | null }) {
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [question, setQuestion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const endRef = useRef<HTMLDivElement>(null);

  function ask(text: string) {
    const q = text.trim();
    if (!q || pending) return;
    setError(null);
    const history = entries.map((e) =>
      e.role === "user" ? { role: "user" as const, content: e.text } : { role: "assistant" as const, content: e.reply.answerSv },
    );
    setEntries((prev) => [...prev, { role: "user", text: q }]);
    setQuestion("");
    startTransition(async () => {
      const res = await askMechanicAction({ question: q, history, regnr });
      if (res.ok) {
        const reply: MechanicReply = res.data;
        setEntries((prev) => [...prev, { role: "assistant", reply }]);
      } else {
        setError(res.error);
      }
      requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }));
    });
  }

  return (
    <div className="grid gap-4">
      {vehicleLabel && <p className="text-sm text-muted-foreground">Svarar om din {vehicleLabel}.</p>}

      <div className="grid gap-3" aria-live="polite">
        {entries.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <Button key={ex} variant="outline" size="sm" onClick={() => ask(ex)}>
                {ex}
              </Button>
            ))}
          </div>
        )}
        {entries.map((e, i) => (
          <ChatMessage key={i} entry={e} />
        ))}
        {pending && <p className="text-sm text-muted-foreground">Mekanikern tänker…</p>}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(question);
        }}
        className="grid gap-2 rounded-xl border bg-card p-4 shadow-sm"
      >
        <Label htmlFor="question">Din fråga</Label>
        <Textarea
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              ask(question);
            }
          }}
          rows={3}
          placeholder="Beskriv vad som händer med bilen…"
          maxLength={1000}
        />
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" disabled={pending || question.trim().length < 3} className="justify-self-end">
          <Send aria-hidden /> Fråga
        </Button>
      </form>
    </div>
  );
}
