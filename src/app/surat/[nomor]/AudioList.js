"use client";

import { useSearchParams, useRouter } from 'next/navigation';

const AudioList = ({ surat }) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const reciter = searchParams.get('reciter') || '01'; // Default reciter is '01'

    const reciters = {
        '01': 'Abdullah-Al-Juhany',
        '02': 'Abdul-Muhsin-Al-Qasim',
        '03': 'Abdurrahman-as-Sudais',
        '04': 'Ibrahim-Al-Dossari',
        '05': 'Misyari-Rasyid-Al-Afasi'
    };

    const handleReciterChange = (event) => {
        const params = new URLSearchParams(searchParams);
        params.set('reciter', event.target.value);
        router.push(`${router.pathname}?${params.toString()}`);
    };

    return (
        <div>
            <select onChange={handleReciterChange} value={reciter} className="mb-4 p-2 border rounded">
                {Object.entries(reciters).map(([key, name]) => (
                    <option key={key} value={key}>{name}</option>
                ))}
            </select>

            {surat.ayat.map((ayat, index) => (
                <div key={ayat.nomorAyat} className='flex flex-col p-2 gap-3'>
                    <div>
                        <h4 className='text-lg font-bold'>{ayat.teksArab} </h4>
                        <small className='text-xs italic'>{ayat.teksIndonesia}</small>
                    </div>
                    <audio controls>
                        <source src={`https://equran.nos.wjv-1.neo.id/audio-full/${reciters[reciter]}/${('00' + (index + 1)).slice(-3)}.mp3`} type="audio/mpeg" />
                        Your browser does not support the audio element.
                    </audio>
                    <hr/>
                </div>
            ))}
        </div>
    );
};

export default AudioList;
