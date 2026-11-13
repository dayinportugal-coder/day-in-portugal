/* Douro Day Planner data. Every fact has a source and the date we checked it.
   Times: CP "Linha do Douro" timetable valid since 3 Nov 2026 (PDF), read 13/11/2026.
   Update CHECKED and the arrays below when CP publishes a new timetable. */
window.DDP_DATA = {
  checked: "2026-11-13",
  closure: { from: "2026-11-03", to: "2027-03-24", reopen: "2027-03-25" },
  sources: {
    cpTimetable: { label: "CP timetable, Linha do Douro, valid since 3 Nov 2026 (PDF)", url: "https://www.cp.pt/info/documents/d/cp/horarios_douro_03-11-2026" },
    ipNotice: { label: "Infraestruturas de Portugal: Douro line works, Marco–Régua closed 3 Nov 2026 – 24 Mar 2027", url: "https://servicos.infraestruturasdeportugal.pt/pt-pt/alertas/ferrovia/modernizacao-da-linha-do-douro-constrangimentos-circulacao-ferroviaria-0" },
    cpFares: { label: "CP fares Porto–Régua–Pocinho, valid from 1 Jan 2026 (PDF)", url: "https://www.cp.pt/info/documents/d/cp/precos-regional-interregional-porto-pocinho" },
    cpHome: { label: "cp.pt (live times and alerts)", url: "https://www.cp.pt/en" },
    imtTolls: { label: "IMT: 2026 toll rates, A4 Porto–Amarante (Brisa)", url: "https://www.imt-ip.pt/rodoviario/infraestruturas-rodoviarias/rede-rodoviaria/taxas-de-portagem/" },
    osrm: { label: "OpenStreetMap routing (OSRM), Porto São Bento → Pinhão", url: "https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=41.1456%2C-8.6110%3B41.1906%2C-7.5463" },
    law37: { label: "Lei n.º 37/2024 (Diário da República): tolls removed on the A4 Transmontana/Túnel do Marão, A24 and other roads from 1 Jan 2025", url: "https://diariodarepublica.pt/dr/detalhe/lei/37-2024-875716581" },
    hertz: { label: "Hertz Portugal: mandatory e-toll (Via Verde) fee on rentals", url: "https://www.hertz.pt/p/en/hertz-together/mandatory-e-toll-service-via-verde-for-renting-a-car" },
    gyg: { label: "GetYourGuide listings (prices as shown on 13/11/2026)", url: "https://www.getyourguide.com/douro-valley-l4965/?partner_id=QYSYONP&utm_medium=online_publisher" }
  },

  /* Train + replacement bus. All services below are marked "Daily" (remark 1) in the CP PDF. */
  train: {
    out: [
      { id: "early", label: "Early start (most time in the valley)", legs: [
        { mode: "train", from: "Porto Campanhã", dep: "07:30", to: "Caíde", arr: "08:16", note: "InterRegional 891" },
        { mode: "bus", from: "Caíde", dep: "08:20", to: "Régua", arr: "09:35", note: "CP direct replacement bus" },
        { mode: "train", from: "Régua", dep: "11:04", to: "Pinhão", arr: "11:31", note: "InterRegional 991, along the river" }
      ] },
      { id: "late", label: "Later start from São Bento", legs: [
        { mode: "train", from: "Porto São Bento", dep: "09:25", to: "Caíde", arr: "10:16", note: "InterRegional 893 (Campanhã 09:30)" },
        { mode: "bus", from: "Caíde", dep: "10:20", to: "Régua", arr: "11:35", note: "CP direct replacement bus" },
        { mode: "train", from: "Régua", dep: "13:00", to: "Pinhão", arr: "13:27", note: "InterRegional 993" }
      ] }
    ],
    back: [
      { id: "last", label: "Last useful return", legs: [
        { mode: "train", from: "Pinhão", dep: "17:15", to: "Régua", arr: "17:41", note: "InterRegional 996" },
        { mode: "bus", from: "Régua", dep: "17:45", to: "Caíde", arr: "19:10", note: "CP direct replacement bus" },
        { mode: "train", from: "Caíde", dep: "19:30", to: "Porto São Bento", arr: "20:25", note: "Urbano 15546 (Campanhã 20:20)" }
      ] },
      { id: "mid", label: "Earlier return", legs: [
        { mode: "train", from: "Pinhão", dep: "13:57", to: "Régua", arr: "14:23", note: "InterRegional 994" },
        { mode: "bus", from: "Régua", dep: "14:28", to: "Caíde", arr: "15:43", note: "CP direct replacement bus" },
        { mode: "train", from: "Caíde", dep: "16:53", to: "Porto Campanhã", arr: "17:35", note: "InterRegional 896" }
      ] }
    ],
    fare: { pinhaoFromSaoBento: 12.45, pinhaoFromCampanha: 12.35, halfRate: "50% fares exist for children and other eligible groups (see CP)" }
  },

  car: {
    km: 125, minutes: 95,
    tollEachWay: 4.75,
    tollNote: "A4 Porto–Amarante toll plazas, class 1 car, 2026 (IMT). The A4 Túnel do Marão/Transmontana section and the A24 are toll-free since 1 Jan 2025.",
    rentalTollFee: "Rental cars carry a Via Verde tag; Hertz, for example, charges €2.21 a day (max €22.14 per rental) on top of the tolls.",
    maps: "https://www.google.com/maps/dir/?api=1&origin=Porto+S%C3%A3o+Bento&destination=Pinh%C3%A3o&travelmode=driving",
    hire: "https://autoeurope.tpx.li/YUpIVJHl"
  },

  tours: {
    wine: [
      { title: "Douro wine tour with a sommelier & boat trip", url: "https://www.getyourguide.com/porto-l151/porto-douro-valley-wine-tour-with-a-sommelier-boat-trip-t712700/", price: 129, was: 139, hours: "10 h", rating: "5.0", reviews: "931", tag: "Small group" },
      { title: "Douro Valley: 2 wineries, lunch and cruise", url: "https://www.getyourguide.com/porto-l151/porto-douro-valley-tour-with-2-wineries-lunch-and-cruise-t484339/", price: 101, was: 199, hours: "9 h", rating: "4.9", reviews: "1,875", tag: "Small group" }
    ],
    scenery: [
      { title: "Douro Valley with boat tour, wine tasting & lunch", url: "https://www.getyourguide.com/porto-l151/from-porto-douro-valley-with-boat-tour-wine-tasting-lunch-t73660/", price: 50, was: 100, hours: "7–10 h", rating: "4.7", reviews: "23,888", tag: "Most booked" },
      { title: "Small-group Douro Valley tour with wine & cruise", url: "https://www.getyourguide.com/porto-l151/from-porto-small-group-douro-valley-tour-with-wine-cruise-t453364/", price: 99, was: 139, hours: "10 h", rating: "4.8", reviews: "388", tag: "Small group" }
    ],
    tiqets: "https://tp.media/r?campaign_id=89&marker=784671&p=2074&sub_id=dayinportugal.com&trs=580652&u=https%3A%2F%2Fwww.tiqets.com%2Fen%2Fday-trips-from-porto-tickets-l238967%2F"
  },

  /* Places in Pinhão. Hours only from the owner's own page. */
  places: [
    { name: "Quinta do Bomfim (Dow's, Symington)", kind: "Quinta", where: "Pinhão, by the river",
      rule: { winter: { months: [11,12,1,2], text: "09:30–18:30 daily, last visit 17:00" }, summer: { months: [3,4,5,6,7,8,9,10], text: "10:00–19:00 daily, last visit 17:30" }, closed: ["12-25","01-01","07-04"] },
      book: "https://www.symington.com/visit/quinta-do-bomfim/", source: "symington.com", note: "Book the tasting online first." },
    { name: "Quinta da Roêda (Croft)", kind: "Quinta", where: "Pinhão, about 5 min by taxi or 30 min on foot from the station",
      rule: { all: { text: "09:30–18:00 daily, last entry 16:30; English tours 10:00, 14:15, 16:15" }, closed: ["12-25","01-01"] },
      book: "https://croftport.com/en/quinta-da-roeda-wine-tourism/", source: "croftport.com", note: "Visits by appointment." }
  ],
  boats: [
    { title: "1-hour electric boat cruise & wine tasting", url: "https://www.getyourguide.com/pinhao-l89870/pinhao-douro-river-solar-boat-tour-with-wine-tasting-t611115/", price: 16, was: 20, hours: "1 h", rating: "4.8", reviews: "1,136" },
    { title: "50-minute boat trip with Port wine", url: "https://www.getyourguide.com/pinhao-l89870/pinhao-douro-river-1-hour-boat-trip-with-port-wine-t626174/", price: 15, hours: "50 min", rating: "4.6", reviews: "493" },
    { title: "2-hour rabelo boat tour with Port", url: "https://www.getyourguide.com/pinhao-l89870/from-pinhao-douro-valley-rabelo-boat-tour-with-port-wine-t630232/", price: 30, hours: "2 h", rating: "4.4", reviews: "628" }
  ],
  stay22: "https://www.stay22.com/allez/booking?aid=dayinportugal&link=https%3A%2F%2Fwww.booking.com%2Fsearchresults.html%3Fss%3DPinh%25C3%25A3o&campaign=douro-planner"
};
