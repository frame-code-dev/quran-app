// components/SuratDetail.js
import React from 'react';

const SuratDetail = ({ surat }) => {
  return (
    <div>
      <h1 className='font-bold p-5 text-center'>{surat.namaLatin} ({surat.nama})</h1>
      <div className='border p-5'>
        <p><strong>Arti:</strong> {surat.arti}</p>
        <p><strong>Jumlah Ayat:</strong> {surat.jumlahAyat}</p>
        <p><strong>Tempat Turun:</strong> {surat.tempatTurun}</p>
        <hr/>
        <h2>Ayat:</h2>
        {surat.ayat.map((ayat) => (
          <p key={ayat.nomorAyat}><strong>{ayat.nomorAyat}</strong>: {ayat.teksArab} - {ayat.teksIndonesia}</p>
        ))}
      </div>
    </div>
  );
};

export default SuratDetail;
