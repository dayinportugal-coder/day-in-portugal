#!/usr/bin/env python3
"""Write /i18n/assistant/{en,es,fr,de,pt}.json — rule-based booking help."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
GYG = "https://www.getyourguide.com/porto-l151/porto-bridges-cruise-with-option-wine-cellar-tour-or-sunset-t402384/?partner_id=QYSYONP&utm_medium=online_publisher"
GYG_DOURO = "https://www.getyourguide.com/porto-l151/from-porto-douro-valley-w-boat-tour-wine-tasting-lunch-t73660/?partner_id=QYSYONP&utm_medium=online_publisher"
PENA = "https://tp.media/r?campaign_id=89&marker=784671&p=2074&sub_id=dayinportugal.com&trs=580652&u=https%3A%2F%2Fwww.tiqets.com%2Fen%2Fsintra-attractions-c76496%2Ftickets-for-national-palace-of-pena-park-entry-ticket-p1120392%2F"
JER = "https://tp.media/r?campaign_id=89&marker=784671&p=2074&sub_id=dayinportugal.com&trs=580652&u=https%3A%2F%2Fwww.tiqets.com%2Fen%2Flisbon-attractions-c76528%2Ftickets-for-jeronimos-monastery-entry-p1012358%2F"
WELCOME = "https://tp.media/r?campaign_id=627&marker=784671&p=8919&sub_id=dayinportugal.com&trs=580652&u=https%3A%2F%2Fwww.welcomepickups.com%2Fporto%2Fairport-transfer%2F"
KIWI_OPO = "https://tp.media/r?campaign_id=1&marker=784671&p=647&sub_id=dayinportugal.com&trs=580652&u=https%3A%2F%2Fkiwitaxi.com%2Fen%2Fportugal%2Fporto-airport"
KIWI_LIS = "https://tp.media/r?campaign_id=1&marker=784671&p=647&sub_id=dayinportugal.com&trs=580652&u=https%3A%2F%2Fkiwitaxi.com%2Fen%2Fportugal%2Fhumberto-delgado-airport"
AUTO = "https://autoeurope.tpx.li/YUpIVJHl"
LOCAL_OPO = "https://tp.media/r?campaign_id=87&marker=784671&p=2043&sub_id=dayinportugal.com&trs=580652&u=https%3A%2F%2Fwww.localrent.com%2Fen%2Fportugal%2Fporto%2F"
LOCAL_LIS = "https://tp.media/r?campaign_id=87&marker=784671&p=2043&sub_id=dayinportugal.com&trs=580652&u=https%3A%2F%2Fwww.localrent.com%2Fen%2Fportugal%2Flisbon%2F"
SAILY = "https://tp.media/r?campaign_id=629&marker=784671&p=8979&sub_id=dayinportugal.com&trs=580652&u=https%3A%2F%2Fsaily.com%2Fesim-portugal%2F"
YESIM = "https://tp.media/r?campaign_id=224&marker=784671&p=5998&sub_id=dayinportugal.com&trs=580652&u=https%3A%2F%2Fyesim.tech%2Fcountry%2Fportugal%2F"
BAG_OPO = "https://tp.media/r?campaign_id=209&marker=784671&p=5867&sub_id=dayinportugal.com&trs=580652&u=https%3A%2F%2Fradicalstorage.com%2Fluggage-storage%2Fporto"
BAG_LIS = "https://tp.media/r?campaign_id=209&marker=784671&p=5867&sub_id=dayinportugal.com&trs=580652&u=https%3A%2F%2Fradicalstorage.com%2Fluggage-storage%2Flisbon"

# Each language: ui strings, then intents as (id, keywords, answer, links, price_flag)
# links are (href, label, ext)

def L(href, label, ext=False):
    return {"href": href, "label": label, "ext": ext}

DATA = {
"en": {
 "title": "Booking help", "close": "Close", "send": "Send",
 "placeholder": "Tickets, a transfer, a place to sleep…",
 "intro": "Say what you need for Lisbon, Porto or a day trip. We’ll point you to the guide and to the partner page. We don’t take payment, and we can’t see live prices or availability.",
 "note": "We never ask for payment or personal documents. The only contact is dayinportugal@gmail.com.",
 "sensitive": "We never ask for payment, card numbers or identity documents. Nothing you type is sent to us. The only contact is dayinportugal@gmail.com.",
 "priceNote": "We can’t promise a price or a free slot. The partner page is the one that counts.",
 "fallback": "I can point you to tickets and tours, airport transfers, places to sleep, car hire, luggage storage and an eSIM, for Lisbon, Porto and the day trips. Try a button below, or write to dayinportugal@gmail.com.",
 "fallbackLinks": [L("/book", "Book in Porto"), L("/lisbon-book-first", "Book before Lisbon"), L("mailto:dayinportugal@gmail.com", "dayinportugal@gmail.com")],
 "quick": [
   {"id": "tickets-porto", "label": "Tickets in Porto"},
   {"id": "tickets-lisbon", "label": "Tickets in Lisbon"},
   {"id": "transfer", "label": "Airport transfer"},
   {"id": "stay", "label": "Where to sleep"},
   {"id": "car", "label": "Car hire"},
   {"id": "day", "label": "Day trips"},
   {"id": "practical", "label": "eSIM and luggage"},
 ],
 "intents": []
},
}

# Fill English intents, then mirror structure in other languages below.
EN_INTENTS = [
("tickets-porto", ["ticket","tickets","cruise","cellar","cave","lello","fado","tour","book","gaia","bridge","bridges","wine"],
 "For Porto, book the timed things before you fly: a six-bridges cruise, a Gaia cellar, Livraria Lello if you care about the staircase. The guide says what is worth it. Price and time are on the partner page.",
 [L("/book","Book in Porto"), L("/porto-river-cruise","Six bridges cruise"), L("/gaia-port-cellars","Port cellars in Gaia"), L("/livraria-lello-tickets","Livraria Lello"), L("/fado-in-porto","Fado in Porto"), L("/porto-food-tours","Food and wine tours"), L(GYG,"Six bridges cruise on GetYourGuide", True)], False),
("tickets-lisbon", ["lisbon","lisboa","pena","sintra","jeronimos","jerónimos","belem","belém","oceanario","tram","ticket","monastery","tower"],
 "In Lisbon the doors that sell out are timed: Pena, and Jerónimos if you want the cloister. Start with the three-day plan, then the page on what to book before you fly.",
 [L("/lisbon-3-days","3 days in Lisbon"), L("/sintra-day-trip","Sintra day trip"), L("/lisbon-book-first","Book before Lisbon"), L(PENA,"Pena on Tiqets", True), L(JER,"Jerónimos on Tiqets", True)], False),
("transfer", ["transfer","airport","taxi","pickup","pick up","uber","kiwi","welcome","opo","landing","flight"],
 "Porto airport is on the metro. Lisbon airport is on the red metro line. A pre-booked car is for a late landing or a lot of bags. We don’t quote the fare.",
 [L("/porto-airport-transfer","Porto airport to the city"), L("/lisbon-airport-transfer","Lisbon airport to the city"), L(WELCOME,"Welcome Pickups in Porto", True), L(KIWI_OPO,"Kiwitaxi from Porto airport", True), L(KIWI_LIS,"Kiwitaxi from Lisbon airport", True)], False),
("stay", ["stay","hotel","sleep","room","airbnb","where to stay","neighbourhood","neighborhood","hostel","bed"],
 "Where you sleep changes the trip. In Porto we would pick Cedofeita or Bonfim over the noisiest bit of Ribeira. In Lisbon, Baixa and Chiado are the easy base. Search from the guide — we don’t list live rooms.",
 [L("/stay","Where to sleep in Porto"), L("/lisbon-where-to-stay","Where to sleep in Lisbon")], False),
("car", ["car","hire","rental","rent","drive","auto europe","localrent"],
 "Inside Porto or Lisbon you usually don’t need a car. Hire one for the Douro if you won’t take the train or a guided day. Compare the excess before you pay. We can’t see which cars are free.",
 [L("/rent-car","Car or metro?"), L(AUTO,"Compare car hire on Auto Europe", True), L(LOCAL_OPO,"Local rental firms in Porto", True), L(LOCAL_LIS,"Compare car hire in Lisbon", True)], False),
("day", ["douro","sintra","evora","évora","cascais","aveiro","braga","guimaraes","guimarães","day trip","excursion","povoa","póvoa"],
 "Day trips we actually cover: the Douro from Porto, Sintra, Cascais and Évora from Lisbon, plus Aveiro, Braga and Guimarães. Pick the guide, then the partner page if you want a guided day.",
 [L("/porto-day-trips","Day trips from Porto"), L("/douro-day","Douro Valley"), L("/sintra-day-trip","Sintra"), L("/cascais-day-trip","Cascais"), L("/evora-day-trip","Évora"), L("/aveiro-day-trip","Aveiro"), L("/braga-guimaraes-day-trip","Braga and Guimarães"), L(GYG_DOURO,"A Douro day on GetYourGuide", True)], False),
("practical", ["esim","sim","luggage","bag","bags","storage","data","internet","saily","yesim","radical"],
 "Install an eSIM before you land if your phone is unlocked. Leave bags with Radical Storage when the room isn’t ready. Plans and lockers change — the partner page has the current offer.",
 [L("/book-first","Book before you fly (Porto)"), L("/lisbon-book-first","Book before Lisbon"), L(SAILY,"Portugal eSIM on Saily", True), L(YESIM,"Portugal eSIM on Yesim", True), L(BAG_OPO,"Luggage storage in Porto", True), L(BAG_LIS,"Luggage storage in Lisbon", True)], False),
("visa", ["visa","d7","d8","nomad","residence","aima","visto"],
 "The D7 and D8 pages are practical notes with links to the official forms. They are not legal advice, and rules change. Read the guide, then the government page.",
 [L("/portugal-d7-visa","Portugal D7 visa"), L("/portugal-d8-digital-nomad-visa","Portugal D8 visa")], False),
("price", ["price","prices","cost","cheap","available","availability","discount","how much","euro","€"],
 "We don’t quote prices or say whether something is free tomorrow.",
 [L("/book","Book in Porto"), L("/lisbon-book-first","Book before Lisbon")], True),
("contact", ["email","contact","human","help","phone","whatsapp"],
 "The only contact is dayinportugal@gmail.com. There is no phone line. We don’t take bookings ourselves.",
 [L("mailto:dayinportugal@gmail.com","dayinportugal@gmail.com")], False),
]

def pack(ui, intents):
    ui = dict(ui)
    ui["intents"] = [
        {"id": i, "keywords": k, "answer": a, "links": links, "price": price}
        for i, k, a, links, price in intents
    ]
    return ui

out = ROOT / "i18n" / "assistant"
out.mkdir(parents=True, exist_ok=True)

def dump(lang, obj):
    (out / f"{lang}.json").write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

dump("en", pack(DATA["en"], EN_INTENTS))

# Other languages: same link targets, translated keywords, answers and labels.
# Link hrefs stay identical. Labels are translated. Guide paths stay unprefixed;
# assistant.js adds the language prefix.

ES = {
 "title": "Ayuda para reservar", "close": "Cerrar", "send": "Enviar",
 "placeholder": "Entradas, un traslado, dónde dormir…",
 "intro": "Dinos qué necesitas en Lisboa, Porto o una excursión. Te llevamos a la guía y a la página del socio. No cobramos, y no vemos precios ni disponibilidad en directo.",
 "note": "Nunca pedimos un pago ni documentos. El único contacto es dayinportugal@gmail.com.",
 "sensitive": "Nunca pedimos un pago, un número de tarjeta ni un documento de identidad. Lo que escribes no se envía a ningún sitio. El único contacto es dayinportugal@gmail.com.",
 "priceNote": "No podemos prometer un precio ni una plaza libre. Manda la página del socio.",
 "fallback": "Puedo indicarte entradas y tours, traslados de aeropuerto, dónde dormir, alquiler de coche, consigna y una eSIM, para Lisboa, Porto y las excursiones. Prueba un botón o escribe a dayinportugal@gmail.com.",
 "fallbackLinks": [L("/book","Reservar en Porto"), L("/lisbon-book-first","Reservar antes de Lisboa"), L("mailto:dayinportugal@gmail.com","dayinportugal@gmail.com")],
 "quick": [
   {"id":"tickets-porto","label":"Entradas en Porto"},
   {"id":"tickets-lisbon","label":"Entradas en Lisboa"},
   {"id":"transfer","label":"Traslado del aeropuerto"},
   {"id":"stay","label":"Dónde dormir"},
   {"id":"car","label":"Alquiler de coche"},
   {"id":"day","label":"Excursiones"},
   {"id":"practical","label":"eSIM y equipaje"},
 ],
}
ES_I = [
("tickets-porto", ["entrada","entradas","crucero","bodega","lello","fado","tour","reservar","gaia","puente","puentes","vino","billete"],
 "En Porto conviene reservar antes de volar lo que lleva hora: el crucero de los seis puentes, una bodega en Gaia y la Livraria Lello si te importa la escalera. La guía dice qué merece la pena. El precio y la hora están en la página del socio.",
 [L("/book","Reservar en Porto"), L("/porto-river-cruise","Crucero de los seis puentes"), L("/gaia-port-cellars","Bodegas en Gaia"), L("/livraria-lello-tickets","Livraria Lello"), L("/fado-in-porto","Fado en Porto"), L("/porto-food-tours","Tours de comida y vino"), L(GYG,"Crucero de los seis puentes en GetYourGuide", True)], False),
("tickets-lisbon", ["lisboa","lisbon","pena","sintra","jeronimos","belem","belém","oceanario","tranvia","tranvía","entrada","monasterio","torre"],
 "En Lisboa lo que se agota lleva hora de entrada: Pena, y los Jerónimos si quieres el claustro. Empieza por el plan de tres días y por la página de qué reservar antes de volar.",
 [L("/lisbon-3-days","3 días en Lisboa"), L("/sintra-day-trip","Excursión a Sintra"), L("/lisbon-book-first","Reserva antes de Lisboa"), L(PENA,"Pena en Tiqets", True), L(JER,"Jerónimos en Tiqets", True)], False),
("transfer", ["traslado","aeropuerto","taxi","recogida","vuelo","aterrizar","kiwi","welcome"],
 "El aeropuerto de Porto está en el metro. El de Lisboa, en la línea roja. Un coche reservado sirve para un aterrizaje tarde o muchas maletas. No damos la tarifa.",
 [L("/porto-airport-transfer","Del aeropuerto de Porto a la ciudad"), L("/lisbon-airport-transfer","Del aeropuerto de Lisboa a la ciudad"), L(WELCOME,"Welcome Pickups en Porto", True), L(KIWI_OPO,"Kiwitaxi desde el aeropuerto de Porto", True), L(KIWI_LIS,"Kiwitaxi desde el aeropuerto de Lisboa", True)], False),
("stay", ["dormir","hotel","alojamiento","habitacion","habitación","airbnb","barrio","hostal"],
 "Dónde duermes cambia el viaje. En Porto elegiríamos Cedofeita o Bonfim antes que el trozo más ruidoso de Ribeira. En Lisboa, Baixa y Chiado son la base fácil. Busca desde la guía: no tenemos habitaciones en directo.",
 [L("/stay","Dónde dormir en Porto"), L("/lisbon-where-to-stay","Dónde dormir en Lisboa")], False),
("car", ["coche","alquiler","alquilar","conducir","auto europe"],
 "Dentro de Porto o Lisboa normalmente no hace falta coche. Alquíralo para el Douro si no vas en tren ni en excursión organizada. Compara la franquicia antes de pagar. No vemos qué coches quedan libres.",
 [L("/rent-car","¿Coche o metro?"), L(AUTO,"Comparar alquiler en Auto Europe", True), L(LOCAL_OPO,"Empresas locales en Porto", True), L(LOCAL_LIS,"Comparar alquiler en Lisboa", True)], False),
("day", ["douro","sintra","evora","évora","cascais","aveiro","braga","guimaraes","guimarães","excursion","excursión","povoa","póvoa"],
 "Excursiones que sí cubrimos: el Douro desde Porto, Sintra, Cascais y Évora desde Lisboa, y también Aveiro, Braga y Guimarães. Elige la guía y, si quieres el día organizado, la página del socio.",
 [L("/porto-day-trips","Excursiones desde Porto"), L("/douro-day","Valle del Douro"), L("/sintra-day-trip","Sintra"), L("/cascais-day-trip","Cascais"), L("/evora-day-trip","Évora"), L("/aveiro-day-trip","Aveiro"), L("/braga-guimaraes-day-trip","Braga y Guimarães"), L(GYG_DOURO,"Un día en el Douro en GetYourGuide", True)], False),
("practical", ["esim","sim","equipaje","maleta","consigna","datos","internet","saily","yesim"],
 "Instala una eSIM antes de aterrizar si el teléfono está libre. Deja las maletas en Radical Storage si la habitación no está lista. Los planes y las taquillas cambian: la oferta actual está en la página del socio.",
 [L("/book-first","Reserva antes de volar (Porto)"), L("/lisbon-book-first","Reserva antes de Lisboa"), L(SAILY,"eSIM de Portugal en Saily", True), L(YESIM,"eSIM de Portugal en Yesim", True), L(BAG_OPO,"Consigna en Porto", True), L(BAG_LIS,"Consigna en Lisboa", True)], False),
("visa", ["visado","visa","d7","d8","nomada","nómada","residencia","aima"],
 "Las páginas del D7 y del D8 son notas prácticas con enlaces a los formularios oficiales. No son asesoría jurídica, y las normas cambian. Lee la guía y después la página del gobierno.",
 [L("/portugal-d7-visa","Visado D7 de Portugal"), L("/portugal-d8-digital-nomad-visa","Visado D8 de Portugal")], False),
("price", ["precio","precios","cuesta","barato","disponible","disponibilidad","descuento","cuanto","cuánto","euro"],
 "No damos precios ni decimos si mañana queda sitio.",
 [L("/book","Reservar en Porto"), L("/lisbon-book-first","Reserva antes de Lisboa")], True),
("contact", ["correo","email","contacto","humano","telefono","teléfono","whatsapp"],
 "El único contacto es dayinportugal@gmail.com. No hay teléfono. Las reservas no las hacemos nosotros.",
 [L("mailto:dayinportugal@gmail.com","dayinportugal@gmail.com")], False),
]
dump("es", pack(ES, ES_I))

FR = {
 "title": "Aide à la réservation", "close": "Fermer", "send": "Envoyer",
 "placeholder": "Billets, un transfert, où dormir…",
 "intro": "Dites ce qu’il vous faut à Lisbonne, à Porto ou pour une excursion. Nous vous menons au guide et à la page du partenaire. Nous n’encaissons rien, et nous ne voyons ni les prix ni les disponibilités en direct.",
 "note": "Nous ne demandons jamais de paiement ni de document. Le seul contact est dayinportugal@gmail.com.",
 "sensitive": "Nous ne demandons jamais de paiement, de numéro de carte ni de pièce d’identité. Ce que vous écrivez ne nous est pas envoyé. Le seul contact est dayinportugal@gmail.com.",
 "priceNote": "Nous ne promettons ni un prix ni une place libre. C’est la page du partenaire qui compte.",
 "fallback": "Je peux vous indiquer billets et visites, transferts d’aéroport, où dormir, location de voiture, consigne et eSIM, pour Lisbonne, Porto et les excursions. Essayez un bouton, ou écrivez à dayinportugal@gmail.com.",
 "fallbackLinks": [L("/book","Réserver à Porto"), L("/lisbon-book-first","Réserver avant Lisbonne"), L("mailto:dayinportugal@gmail.com","dayinportugal@gmail.com")],
 "quick": [
   {"id":"tickets-porto","label":"Billets à Porto"},
   {"id":"tickets-lisbon","label":"Billets à Lisbonne"},
   {"id":"transfer","label":"Transfert aéroport"},
   {"id":"stay","label":"Où dormir"},
   {"id":"car","label":"Location de voiture"},
   {"id":"day","label":"Excursions"},
   {"id":"practical","label":"eSIM et bagages"},
 ],
}
FR_I = [
("tickets-porto", ["billet","billets","croisiere","croisière","cave","lello","fado","visite","reserver","réserver","gaia","pont","ponts","vin"],
 "À Porto, réservez avant le vol ce qui se fait à heure fixe : la croisière des six ponts, une cave à Gaia, la Livraria Lello si l’escalier vous intéresse. Le guide dit ce qui vaut le coup. Le prix et l’heure sont sur la page du partenaire.",
 [L("/book","Réserver à Porto"), L("/porto-river-cruise","Croisière des six ponts"), L("/gaia-port-cellars","Caves à Gaia"), L("/livraria-lello-tickets","Livraria Lello"), L("/fado-in-porto","Fado à Porto"), L("/porto-food-tours","Parcours gastronomiques"), L(GYG,"Croisière des six ponts sur GetYourGuide", True)], False),
("tickets-lisbon", ["lisbonne","lisbon","pena","sintra","jeronimos","belem","belém","oceanario","tram","billet","monastere","monastère","tour"],
 "À Lisbonne, ce qui part vite est à horaire fixe : Pena, et les Jerónimos si vous voulez le cloître. Commencez par les trois jours, puis par la page sur ce qu’il faut réserver avant le vol.",
 [L("/lisbon-3-days","3 jours à Lisbonne"), L("/sintra-day-trip","Excursion à Sintra"), L("/lisbon-book-first","Réserver avant Lisbonne"), L(PENA,"Pena sur Tiqets", True), L(JER,"Jerónimos sur Tiqets", True)], False),
("transfer", ["transfert","aeroport","aéroport","taxi","vol","arrivee","arrivée","kiwi","welcome"],
 "L’aéroport de Porto est sur le métro. Celui de Lisbonne est sur la ligne rouge. Une voiture réservée sert pour une arrivée tardive ou beaucoup de bagages. Nous ne donnons pas le tarif.",
 [L("/porto-airport-transfer","De l’aéroport de Porto au centre"), L("/lisbon-airport-transfer","De l’aéroport de Lisbonne au centre"), L(WELCOME,"Welcome Pickups à Porto", True), L(KIWI_OPO,"Kiwitaxi depuis l’aéroport de Porto", True), L(KIWI_LIS,"Kiwitaxi depuis l’aéroport de Lisbonne", True)], False),
("stay", ["dormir","hotel","hôtel","logement","chambre","airbnb","quartier","auberge"],
 "L’endroit où vous dormez change le voyage. À Porto, nous choisirions Cedofeita ou Bonfim plutôt que le coin le plus bruyant de Ribeira. À Lisbonne, Baixa et Chiado sont la base simple. Cherchez depuis le guide : nous n’avons pas de chambres en direct.",
 [L("/stay","Où dormir à Porto"), L("/lisbon-where-to-stay","Où dormir à Lisbonne")], False),
("car", ["voiture","location","louer","conduire","auto europe"],
 "Dans Porto ou Lisbonne, une voiture est rarement utile. Louez-en une pour le Douro si vous ne prenez ni le train ni une excursion guidée. Comparez la franchise avant de payer. Nous ne voyons pas quelles voitures restent libres.",
 [L("/rent-car","Voiture ou métro ?"), L(AUTO,"Comparer sur Auto Europe", True), L(LOCAL_OPO,"Loueurs locaux à Porto", True), L(LOCAL_LIS,"Comparer une location à Lisbonne", True)], False),
("day", ["douro","sintra","evora","évora","cascais","aveiro","braga","guimaraes","guimarães","excursion","povoa","póvoa"],
 "Les excursions que nous couvrons vraiment : le Douro depuis Porto, Sintra, Cascais et Évora depuis Lisbonne, plus Aveiro, Braga et Guimarães. Prenez le guide, puis la page du partenaire si vous voulez la journée organisée.",
 [L("/porto-day-trips","Excursions au départ de Porto"), L("/douro-day","Vallée du Douro"), L("/sintra-day-trip","Sintra"), L("/cascais-day-trip","Cascais"), L("/evora-day-trip","Évora"), L("/aveiro-day-trip","Aveiro"), L("/braga-guimaraes-day-trip","Braga et Guimarães"), L(GYG_DOURO,"Une journée dans le Douro sur GetYourGuide", True)], False),
("practical", ["esim","sim","bagage","valise","consigne","donnees","données","internet","saily","yesim"],
 "Installez une eSIM avant d’atterrir si le téléphone est débloqué. Déposez les bagages chez Radical Storage si la chambre n’est pas prête. Forfaits et consignes changent : l’offre du moment est sur la page du partenaire.",
 [L("/book-first","Réserver avant le vol (Porto)"), L("/lisbon-book-first","Réserver avant Lisbonne"), L(SAILY,"eSIM Portugal chez Saily", True), L(YESIM,"eSIM Portugal chez Yesim", True), L(BAG_OPO,"Consigne à Porto", True), L(BAG_LIS,"Consigne à Lisbonne", True)], False),
("visa", ["visa","d7","d8","nomade","residence","résidence","aima"],
 "Les pages D7 et D8 sont des notes pratiques, avec les liens vers les formulaires officiels. Ce n’est pas un conseil juridique, et les règles changent. Lisez le guide, puis la page du gouvernement.",
 [L("/portugal-d7-visa","Visa D7 pour le Portugal"), L("/portugal-d8-digital-nomad-visa","Visa D8 pour le Portugal")], False),
("price", ["prix","tarif","cher","pas cher","disponible","disponibilite","disponibilité","reduction","réduction","combien","euro"],
 "Nous n’indiquons pas de prix et nous ne disons pas s’il reste de la place demain.",
 [L("/book","Réserver à Porto"), L("/lisbon-book-first","Réserver avant Lisbonne")], True),
("contact", ["email","courriel","contact","humain","telephone","téléphone","whatsapp"],
 "Le seul contact est dayinportugal@gmail.com. Il n’y a pas de téléphone. Nous ne prenons pas les réservations nous-mêmes.",
 [L("mailto:dayinportugal@gmail.com","dayinportugal@gmail.com")], False),
]
dump("fr", pack(FR, FR_I))

DE = {
 "title": "Hilfe beim Buchen", "close": "Schließen", "send": "Senden",
 "placeholder": "Tickets, ein Transfer, eine Unterkunft…",
 "intro": "Sagen Sie, was Sie in Lissabon, Porto oder für einen Tagesausflug brauchen. Wir zeigen den Guide und die Partnerseite. Wir nehmen kein Geld an und sehen weder Preise noch Verfügbarkeit live.",
 "note": "Wir fragen nie nach Zahlung oder Ausweisen. Der einzige Kontakt ist dayinportugal@gmail.com.",
 "sensitive": "Wir fragen nie nach Zahlung, Kartennummern oder Ausweisen. Was Sie tippen, wird nicht an uns gesendet. Der einzige Kontakt ist dayinportugal@gmail.com.",
 "priceNote": "Wir können keinen Preis und keinen freien Platz zusagen. Es gilt die Partnerseite.",
 "fallback": "Ich kann Tickets und Touren, Flughafentransfers, Unterkünfte, Mietwagen, Gepäckaufbewahrung und eine eSIM zeigen, für Lissabon, Porto und die Tagesausflüge. Nutzen Sie einen Knopf oder schreiben Sie an dayinportugal@gmail.com.",
 "fallbackLinks": [L("/book","In Porto buchen"), L("/lisbon-book-first","Vor Lissabon buchen"), L("mailto:dayinportugal@gmail.com","dayinportugal@gmail.com")],
 "quick": [
   {"id":"tickets-porto","label":"Tickets in Porto"},
   {"id":"tickets-lisbon","label":"Tickets in Lissabon"},
   {"id":"transfer","label":"Flughafentransfer"},
   {"id":"stay","label":"Unterkunft"},
   {"id":"car","label":"Mietwagen"},
   {"id":"day","label":"Tagesausflüge"},
   {"id":"practical","label":"eSIM und Gepäck"},
 ],
}
DE_I = [
("tickets-porto", ["ticket","tickets","fahrt","kreuzfahrt","keller","lello","fado","tour","buchen","gaia","brucke","brücke","brucken","brücken","wein"],
 "In Porto buchen Sie vor dem Flug, was eine Uhrzeit hat: die Fahrt unter den sechs Brücken, einen Keller in Gaia, die Livraria Lello, wenn Ihnen die Treppe wichtig ist. Der Guide sagt, was sich lohnt. Preis und Zeit stehen auf der Partnerseite.",
 [L("/book","In Porto buchen"), L("/porto-river-cruise","Fahrt unter den sechs Brücken"), L("/gaia-port-cellars","Portweinkeller in Gaia"), L("/livraria-lello-tickets","Livraria Lello"), L("/fado-in-porto","Fado in Porto"), L("/porto-food-tours","Ess- und Weintouren"), L(GYG,"Sechs-Brücken-Fahrt bei GetYourGuide", True)], False),
("tickets-lisbon", ["lissabon","lissabon","pena","sintra","jeronimos","belem","belém","oceanario","strassenbahn","straßenbahn","ticket","kloster","turm"],
 "In Lissabon sind die Türen mit Zeitfenster die, die ausgehen: Pena, und die Jerónimos, wenn Sie den Kreuzgang wollen. Beginnen Sie mit den drei Tagen und mit der Seite, was Sie vor dem Flug buchen.",
 [L("/lisbon-3-days","3 Tage in Lissabon"), L("/sintra-day-trip","Tagesausflug nach Sintra"), L("/lisbon-book-first","Vor Lissabon buchen"), L(PENA,"Pena bei Tiqets", True), L(JER,"Jerónimos bei Tiqets", True)], False),
("transfer", ["transfer","flughafen","taxi","abholung","flug","landung","kiwi","welcome"],
 "Der Flughafen Porto liegt an der Metro. Der Flughafen Lissabon an der roten Linie. Ein vorgebuchtes Auto ist für eine späte Landung oder viel Gepäck. Den Fahrpreis nennen wir nicht.",
 [L("/porto-airport-transfer","Vom Flughafen Porto in die Stadt"), L("/lisbon-airport-transfer","Vom Flughafen Lissabon in die Stadt"), L(WELCOME,"Welcome Pickups in Porto", True), L(KIWI_OPO,"Kiwitaxi vom Flughafen Porto", True), L(KIWI_LIS,"Kiwitaxi vom Flughafen Lissabon", True)], False),
("stay", ["ubernachten","übernachten","hotel","unterkunft","zimmer","airbnb","viertel","hostel"],
 "Wo Sie schlafen, verändert die Reise. In Porto würden wir Cedofeita oder Bonfim nehmen, nicht die lauteste Ecke der Ribeira. In Lissabon sind Baixa und Chiado die einfache Basis. Suchen Sie über den Guide — wir haben keine Live-Zimmer.",
 [L("/stay","Wo in Porto übernachten"), L("/lisbon-where-to-stay","Wo in Lissabon übernachten")], False),
("car", ["auto","mietwagen","mieten","fahren","auto europe"],
 "In Porto oder Lissabon brauchen Sie meist kein Auto. Mieten Sie eines fürs Douro-Tal, wenn Sie weder Zug noch geführten Tag nehmen. Vergleichen Sie die Selbstbeteiligung, bevor Sie zahlen. Wir sehen nicht, welche Autos frei sind.",
 [L("/rent-car","Auto oder Metro?"), L(AUTO,"Mietwagen bei Auto Europe vergleichen", True), L(LOCAL_OPO,"Lokale Verleiher in Porto", True), L(LOCAL_LIS,"Mietwagen in Lissabon vergleichen", True)], False),
("day", ["douro","sintra","evora","évora","cascais","aveiro","braga","guimaraes","guimarães","tagesausflug","ausflug","povoa","póvoa"],
 "Tagesausflüge, die wir wirklich beschreiben: das Douro-Tal ab Porto, Sintra, Cascais und Évora ab Lissabon, dazu Aveiro, Braga und Guimarães. Nehmen Sie den Guide, und die Partnerseite, wenn Sie den Tag geführt wollen.",
 [L("/porto-day-trips","Tagesausflüge ab Porto"), L("/douro-day","Douro-Tal"), L("/sintra-day-trip","Sintra"), L("/cascais-day-trip","Cascais"), L("/evora-day-trip","Évora"), L("/aveiro-day-trip","Aveiro"), L("/braga-guimaraes-day-trip","Braga und Guimarães"), L(GYG_DOURO,"Ein Douro-Tag bei GetYourGuide", True)], False),
("practical", ["esim","sim","gepack","gepäck","koffer","aufbewahrung","daten","internet","saily","yesim"],
 "Installieren Sie eine eSIM vor der Landung, wenn das Handy frei geschaltet ist. Geben Sie das Gepäck bei Radical Storage ab, wenn das Zimmer noch nicht bereit ist. Tarife und Schließfächer ändern sich — das aktuelle Angebot steht auf der Partnerseite.",
 [L("/book-first","Vor dem Flug buchen (Porto)"), L("/lisbon-book-first","Vor Lissabon buchen"), L(SAILY,"Portugal-eSIM bei Saily", True), L(YESIM,"Portugal-eSIM bei Yesim", True), L(BAG_OPO,"Gepäckaufbewahrung in Porto", True), L(BAG_LIS,"Gepäckaufbewahrung in Lissabon", True)], False),
("visa", ["visum","visa","d7","d8","nomade","nomaden","aufenthalt","aima"],
 "Die Seiten zu D7 und D8 sind praktische Notizen mit Links zu den amtlichen Formularen. Das ist keine Rechtsberatung, und die Regeln ändern sich. Lesen Sie den Guide, dann die Seite der Behörde.",
 [L("/portugal-d7-visa","Portugal D7 Visum"), L("/portugal-d8-digital-nomad-visa","Portugal D8 Visum")], False),
("price", ["preis","preise","kosten","günstig","gunstig","verfugbar","verfügbar","verfugbarkeit","rabatt","wie viel","euro"],
 "Wir nennen keine Preise und sagen nicht, ob morgen noch etwas frei ist.",
 [L("/book","In Porto buchen"), L("/lisbon-book-first","Vor Lissabon buchen")], True),
("contact", ["email","kontakt","mensch","telefon","whatsapp","anrufen"],
 "Der einzige Kontakt ist dayinportugal@gmail.com. Es gibt keine Telefonnummer. Buchungen nehmen wir nicht selbst an.",
 [L("mailto:dayinportugal@gmail.com","dayinportugal@gmail.com")], False),
]
dump("de", pack(DE, DE_I))

PT = {
 "title": "Ajuda para reservar", "close": "Fechar", "send": "Enviar",
 "placeholder": "Bilhetes, um transfer, onde dormir…",
 "intro": "Diga o que precisa em Lisboa, no Porto ou numa excursão. Indicamos o guia e a página do parceiro. Não recebemos pagamentos e não vemos preços nem disponibilidade em tempo real.",
 "note": "Nunca pedimos pagamentos nem documentos. O único contacto é dayinportugal@gmail.com.",
 "sensitive": "Nunca pedimos pagamentos, números de cartão ou documentos de identificação. O que escreve não nos é enviado. O único contacto é dayinportugal@gmail.com.",
 "priceNote": "Não prometemos um preço nem um lugar livre. Vale o que está na página do parceiro.",
 "fallback": "Posso indicar bilhetes e visitas, transfers de aeroporto, onde dormir, aluguer de carro, depósito de bagagem e um eSIM, para Lisboa, Porto e as excursões. Experimente um botão ou escreva para dayinportugal@gmail.com.",
 "fallbackLinks": [L("/book","Reservar no Porto"), L("/lisbon-book-first","Reserve antes de Lisboa"), L("mailto:dayinportugal@gmail.com","dayinportugal@gmail.com")],
 "quick": [
   {"id":"tickets-porto","label":"Bilhetes no Porto"},
   {"id":"tickets-lisbon","label":"Bilhetes em Lisboa"},
   {"id":"transfer","label":"Transfer do aeroporto"},
   {"id":"stay","label":"Onde dormir"},
   {"id":"car","label":"Aluguer de carro"},
   {"id":"day","label":"Excursões"},
   {"id":"practical","label":"eSIM e bagagem"},
 ],
}
PT_I = [
("tickets-porto", ["bilhete","bilhetes","cruzeiro","cave","lello","fado","visita","reservar","gaia","ponte","pontes","vinho"],
 "No Porto, reserve antes de voar o que tem hora marcada: o cruzeiro das seis pontes, uma cave em Gaia, a Livraria Lello se a escadaria lhe interessa. O guia diz o que vale a pena. O preço e a hora estão na página do parceiro.",
 [L("/book","Reservar no Porto"), L("/porto-river-cruise","Cruzeiro das seis pontes"), L("/gaia-port-cellars","Caves em Gaia"), L("/livraria-lello-tickets","Livraria Lello"), L("/fado-in-porto","Fado no Porto"), L("/porto-food-tours","Visitas de comida e vinho"), L(GYG,"Cruzeiro das seis pontes na GetYourGuide", True)], False),
("tickets-lisbon", ["lisboa","lisbon","pena","sintra","jeronimos","belem","belém","oceanario","electrico","elétrico","bilhete","mosteiro","torre"],
 "Em Lisboa, o que esgota tem hora de entrada: o Pena, e os Jerónimos se quiser o claustro. Comece pelo plano de três dias e pela página do que reservar antes de voar.",
 [L("/lisbon-3-days","3 dias em Lisboa"), L("/sintra-day-trip","Excursão a Sintra"), L("/lisbon-book-first","Reserve antes de Lisboa"), L(PENA,"Pena na Tiqets", True), L(JER,"Jerónimos na Tiqets", True)], False),
("transfer", ["transfer","aeroporto","taxi","recolha","voo","aterragem","kiwi","welcome"],
 "O aeroporto do Porto está no metro. O de Lisboa está na linha vermelha. Um carro reservado serve para uma aterragem tarde ou muita bagagem. Não indicamos o preço da viagem.",
 [L("/porto-airport-transfer","Do aeroporto do Porto à cidade"), L("/lisbon-airport-transfer","Do aeroporto de Lisboa à cidade"), L(WELCOME,"Welcome Pickups no Porto", True), L(KIWI_OPO,"Kiwitaxi a partir do aeroporto do Porto", True), L(KIWI_LIS,"Kiwitaxi a partir do aeroporto de Lisboa", True)], False),
("stay", ["dormir","hotel","alojamento","quarto","airbnb","bairro","hostel","pousada"],
 "O sítio onde se dorme muda a viagem. No Porto, escolheríamos Cedofeita ou Bonfim em vez do troço mais ruidoso da Ribeira. Em Lisboa, a Baixa e o Chiado são a base simples. Procure a partir do guia — não temos quartos em tempo real.",
 [L("/stay","Onde dormir no Porto"), L("/lisbon-where-to-stay","Onde ficar em Lisboa")], False),
("car", ["carro","aluguer","alugar","conduzir","auto europe"],
 "Dentro do Porto ou de Lisboa, regra geral, não é preciso carro. Alugue um para o Douro se não for de comboio nem numa excursão organizada. Compare a franquia antes de pagar. Não vemos que carros estão livres.",
 [L("/rent-car","Carro ou metro?"), L(AUTO,"Comparar aluguer na Auto Europe", True), L(LOCAL_OPO,"Empresas locais no Porto", True), L(LOCAL_LIS,"Comparar aluguer em Lisboa", True)], False),
("day", ["douro","sintra","evora","évora","cascais","aveiro","braga","guimaraes","guimarães","excursao","excursão","povoa","póvoa"],
 "Excursões que o guia cobre mesmo: o Douro a partir do Porto, Sintra, Cascais e Évora a partir de Lisboa, e ainda Aveiro, Braga e Guimarães. Escolha o guia e, se quiser o dia organizado, a página do parceiro.",
 [L("/porto-day-trips","Excursões a partir do Porto"), L("/douro-day","Vale do Douro"), L("/sintra-day-trip","Sintra"), L("/cascais-day-trip","Cascais"), L("/evora-day-trip","Évora"), L("/aveiro-day-trip","Aveiro"), L("/braga-guimaraes-day-trip","Braga e Guimarães"), L(GYG_DOURO,"Um dia no Douro na GetYourGuide", True)], False),
("practical", ["esim","sim","bagagem","mala","deposito","depósito","dados","internet","saily","yesim","telemovel","telemóvel"],
 "Instale um eSIM antes de aterrar, se o telemóvel estiver desbloqueado. Deixe as malas na Radical Storage se o quarto ainda não estiver pronto. Os planos e os cacifos mudam — a oferta actual está na página do parceiro.",
 [L("/book-first","Reserve antes de voar (Porto)"), L("/lisbon-book-first","Reserve antes de Lisboa"), L(SAILY,"eSIM de Portugal na Saily", True), L(YESIM,"eSIM de Portugal na Yesim", True), L(BAG_OPO,"Depósito de bagagem no Porto", True), L(BAG_LIS,"Depósito de bagagem em Lisboa", True)], False),
("visa", ["visto","visa","d7","d8","nomada","nómada","residencia","residência","aima"],
 "As páginas do D7 e do D8 são notas práticas, com ligações aos formulários oficiais. Não são aconselhamento jurídico, e as regras mudam. Leia o guia e depois a página do Estado.",
 [L("/portugal-d7-visa","Visto D7 para Portugal"), L("/portugal-d8-digital-nomad-visa","Visto D8 para Portugal")], False),
("price", ["preco","preço","precos","preços","custa","barato","disponivel","disponível","disponibilidade","desconto","quanto","euro"],
 "Não indicamos preços nem dizemos se amanhã ainda há lugar.",
 [L("/book","Reservar no Porto"), L("/lisbon-book-first","Reserve antes de Lisboa")], True),
("contact", ["email","contacto","contato","pessoa","telefone","telemovel","telemóvel","whatsapp"],
 "O único contacto é dayinportugal@gmail.com. Não há telefone. As reservas não as fazemos nós.",
 [L("mailto:dayinportugal@gmail.com","dayinportugal@gmail.com")], False),
]
dump("pt", pack(PT, PT_I))
print("assistant json written")
