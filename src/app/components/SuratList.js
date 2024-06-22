import Link from "next/link";

const SuratList = ({ surat }) => {
    return (
        <div className='border p-3'>
            <Link href={`/surat/${surat.nomor}`} className="block max-w-sm p-6 bg-white border border-gray-200 rounded shadow hover:bg-gray-100 mb-3">
                <h2 className='font-bold'>{surat.namaLatin} ({surat.nama}) <small>{surat.arti}</small></h2>
                <hr/>
                <p>Ayat: {surat.jumlahAyat}</p>
                <p>Tempat Turun: {surat.tempatTurun}</p>
            </Link>
        </div>
    )
}

export default SuratList;