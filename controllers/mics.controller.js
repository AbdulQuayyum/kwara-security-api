import { HTTP_STATUS_OK, HTTP_STATUS_CREATED, HTTP_STATUS_BAD_REQUEST, HTTP_STATUS_UNAUTHORIZED, HTTP_STATUS_FORBIDDEN, HTTP_STATUS_NOT_FOUND, HTTP_STATUS_CONFLICT, HTTP_STATUS_TOO_MANY_REQUESTS, HTTP_STATUS_INTERNAL_SERVER_ERROR } from "../utilities/status.js";

export async function GetLgasAndWards(req, res) {
    try {
        const lgasAndWards = {
            "Asa": ["Yowere/Sosoki", "Adigbongbo/Awe/Orimaro", "Elebue/Agbona/Fata", "Onire/Odegiwa/Alapa", "Yowere II/Okeweru", "Gambari/Aiyekale", "Efue/Berikodo", "Owode/Gbogun", "Ballah/Otte", "Ogondoroko/Reke", "Ago-Oja/Oshin/Sapati/Laduba", "Afon", "Ila-Oja", "Ogele", "Budo-Egba", "Okesho", "Odo-Ode/Aboto"],
            "Baruten": ["Boriya/Shiya", "Gure/Gwasoro", "Gwedebereru/Babane", "Gwanara", "Ilesha", "Kenu/Taberu", "Kpaura/Yakiru", "Kiyoru/Bwen", "Okuta", "Shinawu/Tunbuyan", "Yashikira"],
            "Edu": ["Lafiagi I", "Lafiagi II", "Lafiagi III", "Lafiagi IV", "Tsaragi I", "Tsaragi II", "Tsaragi III", "Tsonga I", "Tsonga II", "Tsonga III"],
            "Ekiti": ["Eruku", "Isapa", "Koro", "Obbo-Aiyegunle I", "Obbo-Aiyegunle II", "Obbo-Ile", "Osi I", "Osi II", "Opin", "Oke-Opin/Etan"],
            "Ifelodun": ["Oke-Ode I", "Oke-Ode II", "Oke-Ode III", "Ora", "Ile-Ire", "Agunjin", "Oro-Ago", "Omu-Aran I", "Omu-Aran II", "Omu-Aran III", "Share I", "Share II", "Share III", "Share IV", "Share V", "Igbaja I", "Igbaja II", "Igbaja III", "Idofian I", "Idofian II"],
            "Ilorin East": ["Agbeyangi/Gbadamu/Osin", "Gambari I", "Balogun Gambari II", "Ibagun", "Apado", "Iponrin", "Magaji Are I", "Magaji Are II", "Marafa/Pepele", "Maya/Ile-Apa", "Oke Oyi/Oke Ose/Alalubosa", "Zango"],
            "Ilorin South": ["Akanbi I", "Akanbi II", "Akanbi III", "Akanbi IV", "Akanbi V", "Balogun-Fulani I", "Balogun-Fulani II", "Balogun-Fulani III", "Okaka I", "Okaka II", "Oke-Ogun"],
            "Ilorin West": ["Adewole", "Ajikobi", "Baboko", "Badari", "Balogun Alanamu Central", "Magaji Ngeri", "Oloje", "Ogidi", "Ojuekun/Zarumi", "Oko-Erin", "Ubandawaki", "Warrah/Egbe Jila/Oshin"],
            "Irepodun": ["Ajase Ipo I", "Ajase Ipo II", "Arandun", "Esie/Ijan", "Ipetu/Rore/Aran-Orin", "Omu-Aran I", "Omu-Aran II", "Omu-Aran III", "Oro I", "Oro II", "Oko"],
            "Isin": ["Alla", "Edidi", "Isanlu I", "Isanlu II", "Ijara", "Iwo", "Owu Isin", "Oke Onigbin", "Sabaja/Pamo", "Oke Aba", "Olla"],
            "Kaiama": ["Adena", "Bani", "Gwanabe I", "Gwanabe II", "Gwaria", "Kaiama I", "Kaiama II", "Kaiama III", "Kemanji", "Wajibe"],
            "Moro": ["Jebba", "Bode-Saadu", "Okemi", "Lanwa", "Ejidongari", "Okutala", "Babadudu", "Oloru", "Pakunmo", "Womi/Ayaki", "Abati/Alara", "Shao", "Logun/Jehunkunnu", "Malete/Gbugudu", "Ajanaku", "Megida", "Arobadi"],
            "Offa": ["Balogun", "Shawo South West", "Shawo Central", "Shawo South East", "Essa A", "Essa B", "Essa C", "Ojomu North/North West", "Ojomu Central I", "Ojomu Central II", "Ojomu South East", "Igboidun"],
            "Oke Ero": ["Aiyedun", "Ekan", "Imoji/Ilale/Erinmope", "Iloffa", "Imode/Egosi", "Idofin Igbana I", "Idofin Igbana II", "Idofin/Odo-Ashe", "Odo-Owa I", "Odo-Owa II"],
            "Oyun": ["Erin-Ile South", "Ilemona", "Igbona", "Irra", "Inaja/Ahogbada", "Ikotun", "Ojoku", "Ijagbo", "Igosun", "Ipee", "Erin-Ile North"],
            "Pategi": ["Patigi I", "Patigi II", "Patigi III", "Patigi IV", "Egba I", "Egba II", "Egba III", "Egba IV", "Egba V", "Kpada I", "Kpada II"]
        }

        res.status(HTTP_STATUS_OK).json({
            success: true,
            status: HTTP_STATUS_OK,
            message: 'LGAs and wards retrieved successfully',
            data: lgasAndWards
        });
    } catch (error) {
        res.status(HTTP_STATUS_BAD_REQUEST).json({
            success: false,
            status: HTTP_STATUS_BAD_REQUEST,
            message: 'Error occurred',
            error: error.message
        });
    }
}

export async function GetStates(req, res) {
    try {
        const states = [
            "Kwara State",
        ]

        res.status(HTTP_STATUS_OK).json({
            success: true,
            status: HTTP_STATUS_OK,
            message: 'States retrieved successfully',
            data: states
        });
    } catch (error) {
        res.status(HTTP_STATUS_BAD_REQUEST).json({
            success: false,
            status: HTTP_STATUS_BAD_REQUEST,
            message: 'Error occurred',
            error: error.message
        });
    }
}
