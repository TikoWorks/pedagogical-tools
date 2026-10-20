import Image from 'next/image';
import { useState, type FocusEvent } from 'react';

type SessionNameInputProps = {
  sessionName: string;
  onSessionNameChange: (name: string) => void;
  onSessionNameSave?: (name: string) => Promise<void>;
};

export default function SessionNameInput({
  sessionName,
  onSessionNameChange,
  onSessionNameSave,
}: SessionNameInputProps) {
  const [error, setError] = useState('');

  // arvo luetaan suoraan kentästä (event.target.value) eikä propsista,
  // jotta validointi toimii myös silloin, kun vanhempi komponentti ei ehdi
  // päivittää sessionName-tilaa ennen blur-tapahtumaa.
  async function handleBlur(event: FocusEvent<HTMLInputElement>) {
    const value = event.target.value;

    if (!value.trim()) {
      setError('Session name is required');
      return;
    }

    setError('');
    await onSessionNameSave?.(value);
  }

  return (
    <div className="relative w-full">
      {error && (
        <p className="text-magenta absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap text-[1rem] 2xl:text-[1.5rem]">
          {error}
        </p>
      )}

      <input
        // lisätään data-testid, jotta testit voivat löytää kentän helposti
        data-testid="session-name-input"
        className="bg-tumma/50 h-12 w-full rounded-2xl border-3 border-white/30 px-10 text-center text-[1.25rem] text-white focus:border-[#F562A1] focus:outline-none 2xl:h-16 2xl:px-12 2xl:text-[1.75rem]"
        type="text"
        value={sessionName}
        // (Issue #77): virheilmoitus poistetaan heti, kun käyttäjä
        // kirjoittaa kelvollisen nimen. Aiemmin ilmoitus pysyi näkyvissä
        // seuraavaan blur-tapahtumaan asti, vaikka nimi oli jo korjattu.
        // Pelkät välilyönnit eivät poista ilmoitusta (trim).
        onChange={(event) => {
          onSessionNameChange(event.target.value);

          if (event.target.value.trim()) {
            setError('');
          }
        }}
        onBlur={handleBlur}
      />

      <Image
        className="absolute top-1/2 right-4 h-auto w-5 -translate-y-1/2 2xl:right-6 2xl:w-[25px]"
        src="/images/pencil.svg"
        alt=""
        width={25}
        height={25}
      />
    </div>
  );
}
