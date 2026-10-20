"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import HostGameHeader from "@/components/host/HostGameHeader";
import HostGameFooter from "@/components/host/HostGameFooter";
import WordCloud from "@/components/host/WordCloud";
import ResetConfirmation from "@/components/host/ResetConfirmation";
import type { Session, Submission } from "@/types";

type RawSubmission = {
  data: {
    word: string;
  };
};

export default function HostPage() {
  // Sessionin datan muuttuja
  const [sessionData, setSessionData] = useState<Session | null>(null);
  const [submissionsData, setSubmissionsData] = useState<Submission[]>([]);
  const [sessionName, setSessionName] = useState("");
  const [sessionNameDraft, setSessionNameDraft] = useState("");
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  // virhetila latausvirheille. Aiemmin virhe heitettiin (throw)
  // eikä sitä käsitelty, jolloin komponentti jäi loputtomaan Loading-tilaan.
  const [loadError, setLoadError] = useState("");

  // Session datan haku
  useEffect(() => {
    // Peruutuslippu estää vanhentuneen vastauksen (Strict Moden kaksoisajo
    // kehitystilassa) ylikirjoittamasta nimikenttää kesken muokkauksen.
    let cancelled = false;

    async function getSessionData() {
      try {
        const response = await fetch(`/api/session/`, {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch session: ${response.status} ${response.statusText}`,
          );
        }

        const data = await response.json();

        if (cancelled) {
          return;
        }

        setSessionData(data);
        setSessionName(data.name);
        setSessionNameDraft(data.name);
      } catch (error) {
        console.error("getSessionData error: ", error);
        // throw poistettu, virhe näytetään käyttäjälle.
        if (!cancelled) {
          setLoadError("Session could not be loaded.");
        }
      }
    }

    getSessionData();

    return () => {
      cancelled = true;
    };

    // Funktio ajetaan komponentin alustuksessa
  }, []);

  // effectin riippuvuus on sessionId, ei koko sessionData-olio.
  // Aiemmin jokainen nimenmuutos (setSessionData(updatedSession)) loi uuden
  // olion, mikä haki submissionit uudelleen ja uudelleenluoi realtime-kanavan.
  const sessionId = sessionData?.id;

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    // peruutuslippu myös submissioneille, jotta vanha GET-vastaus
    // ei ylikirjoita tilaa, kun effect on jo siivottu.
    let cancelled = false;

    // Haetaan submissionit kannasta
    async function getSubmissionsData() {
      try {
        const response = await fetch(`/api/submission/`, {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch submissions: ${response.status} ${response.statusText}`,
          );
        }

        const data = await response.json();
        const grouped: Submission[] = [];

        data.forEach((submission: RawSubmission) => {
          //normalisointi
          const word = submission.data.word.trim().toLowerCase();

          // Tarkistetaan, onko sana jo lisätty
          const existing = grouped.find((item) => item.word === word);

          if (existing) {
            existing.count += 1;
          } else {
            grouped.push({
              word,
              count: 1,
            });
          }
        });

        if (cancelled) {
          return;
        }

        setSubmissionsData(grouped);
      } catch (error) {
        // throw poistettu, virhe vain lokiin (sanapilvi pysyy tyhjänä).
        console.error("getSubmissionsData error: ", error);
      }
    }

    getSubmissionsData();

    // Realtime-kuuntelu uusille submissioneille
    const channel = supabase
      .channel(`session:${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "submission",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          //normalisointi
          const word = payload.new.data.word.trim().toLowerCase();

          setSubmissionsData((current) => {
            // Tarkistetaan, onko sana jo sanapilvessä
            const existing = current.find((item) => item.word === word);

            // Jos sana löytyy, kasvatetaan sen määrää yhdellä
            if (existing) {
              return current.map((item) =>
                item.word === word ? { ...item, count: item.count + 1 } : item,
              );
            }
            //lisätään uusi sana ensimmäistä kertaa
            return [
              ...current,
              {
                word,
                count: 1,
              },
            ];
          });
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  // latausvirhe näytetään eikä jäädä loputtomaan Loading-tilaan.
  if (loadError) {
    return (
      <div role="alert">
        {loadError}{" "}
        <button type="button" onClick={() => window.location.reload()}>
          Try again
        </button>
      </div>
    );
  }

  if (!sessionData) {
    return <div>Loading...</div>;
  }

  // varavaihtoehto, jos NEXT_PUBLIC_APP_URL puuttuu. Aiemmin
  // tuloksena oli "undefined/join/..." eli rikkinäinen QR-koodi.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
  const joinUrl = `${appUrl}/join/${sessionData.join_code}`;

  // Session nimen vaihto
  async function updateSessionName(name: string) {
    // ei lähetetä PATCH-kutsua, jos nimi ei ole muuttunut.
    if (name.trim() === sessionName) {
      return;
    }

    try {
      const response = await fetch("/api/session", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to update session: ${response.status} ${response.statusText}`,
        );
      }

      const updatedSession = await response.json();
      setSessionData(updatedSession);
      setSessionName(updatedSession.name);
      setSessionNameDraft(updatedSession.name);
    } catch (error) {
      console.error("updateSessionName error: ", error);
      // Muokkaus epäonnistui, joten palautetaan luonnos
      // tallennettuun nimeen. Näin kenttä ja otsikko eivät jää eri arvoihin.
      setSessionNameDraft(sessionName);
    }
  }

  //Submissioneiden poistaminen
  async function resetSubmissions() {
    try {
      const response = await fetch("/api/submission", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to delete submissions: ${response.status} ${response.statusText}`,
        );
      }

      setSubmissionsData([]);
      setShowResetConfirmation(false);
    } catch (error) {
      console.error("resetSubmissions error:", error);
    }
  }

  return (
    <main className="relative flex h-dvh w-full flex-col overflow-hidden">
      <div className="absolute -inset-0.5 bg-[url('/images/host_background.svg')] bg-size-[100%_100%] bg-no-repeat" />

      {showResetConfirmation && (
        <ResetConfirmation
          onCancel={() => setShowResetConfirmation(false)}
          onReset={resetSubmissions}
        />
      )}
      <HostGameHeader joinUrl={joinUrl} sessionName={sessionName} />

      {submissionsData.length === 0 ? (
        <section className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center 2xl:pb-24 2xl:gap-6">
          <Image
            className="h-40 w-40"
            src="/images/cloud.svg"
            alt=""
            width={200}
            height={200}
          />
          <h2 className="text-[2rem] font-bold text-white 2xl:text-[3rem]">
            No words yet
          </h2>
        </section>
      ) : (
        <section className="relative z-10 min-h-0 flex-1">
          <WordCloud submissions={submissionsData} />
        </section>
      )}
      <HostGameFooter
        sessionName={sessionNameDraft}
        onSessionNameChange={setSessionNameDraft}
        onSessionNameSave={updateSessionName}
        onReset={() => setShowResetConfirmation(true)}
      />
    </main>
  );
}
