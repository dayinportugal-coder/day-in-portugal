#!/usr/bin/env python3
"""Write tools/i18n/shared/{es,fr,de,pt}.json from the English shared catalog."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
shared = json.loads((ROOT / "tools/i18n/shared-en.json").read_text(encoding="utf-8"))

IDENTITY = {
    "Klook", "Saily", "Yesim", "Évora", "Tiqets", "Sintra", "Kiwitaxi", "Instagram",
    "CC BY 4.0", "Aviasales", "CC BY 2.0", "Localrent", "Auto Europe", "CC BY-SA 4.0",
    "CC BY-SA 2.0", "GetYourGuide", "CC BY-SA 3.0", "Welcome Pickups", "Radical Storage",
    "Wikimedia Commons", "dayinportugal@gmail.com", "Day in Portugal",
    "Instagram — @dayinportugal", "Day in Portugal on Instagram",
    "Vitor Oliveira from Torres Vedras, PORTUGAL", "Cascais",
}

# prefix -> (es, fr, de, pt). Prefix must match exactly one shared string.
T = {}

def put(prefix, es, fr, de, pt):
    exact = [s for s in shared if s == prefix]
    hits = exact or [s for s in shared if s.startswith(prefix)]
    if len(hits) != 1:
        raise SystemExit(f"{prefix!r} matched {hits}")
    T[hits[0]] = (es, fr, de, pt)

put("or", "o", "ou", "oder", "ou")
put("Main", "Principal", "Menu principal", "Hauptmenü", "Menu principal")
put("Shop", "Tienda", "Boutique", "Shop", "Loja")
put(", via", ", vía", ", via", ", über", ", via")
put("Photo:", "Foto:", "Photo :", "Foto:", "Foto:")
put("Lisbon", "Lisboa", "Lisbonne", "Lissabon", "Lisboa")
put("Privacy", "Privacidad", "Confidentialité", "Datenschutz", "Privacidade")
put("Contact:", "Contacto:", "Contact :", "Kontakt:", "Contacto:")
put("Arriving", "Llegada", "À l'arrivée", "Anreise", "À chegada")
put("Open menu", "Abrir menú", "Ouvrir le menu", "Menü öffnen", "Abrir menu")
put("The guide", "La guía", "Le guide", "Der Reiseführer", "O guia")
put("Assistant", "Asistente", "Assistant", "Assistent", "Assistente")
put("Breadcrumb", "Migas de pan", "Fil d'Ariane", "Brotkrumen", "Percurso")
put("How we earn", "Cómo ganamos", "Comment nous gagnons", "So verdienen wir", "Como ganhamos")
put("how we earn", "cómo ganamos", "comment nous gagnons", "so verdienen wir", "como ganhamos")
put("Douro Valley", "Valle del Douro", "Vallée du Douro", "Douro-Tal", "Vale do Douro")
put("Good to know", "Conviene saber", "Bon à savoir", "Gut zu wissen", "Convém saber")
put("Follow along", "Síguenos", "Suivez-nous", "Folgen Sie uns", "Siga-nos")
put("Book in Porto", "Reservar en Porto", "Réserver à Porto", "In Porto buchen", "Reservar no Porto")
put("Car or metro?", "¿Coche o metro?", "Voiture ou métro ?", "Auto oder Metro?", "Carro ou metro?")
put("Fado in Porto", "Fado en Porto", "Le fado à Porto", "Fado in Porto", "Fado no Porto")
put("Photo credits", "Créditos de las fotos", "Crédits photo", "Bildnachweise", "Créditos das fotos")
put("car or metro?", "¿coche o metro?", "voiture ou métro ?", "Auto oder Metro?", "carro ou metro?")
put("fado in Porto", "fado en Porto", "fado à Porto", "Fado in Porto", "fado no Porto")
put("Your question", "Tu pregunta", "Votre question", "Ihre Frage", "A sua pergunta")
put("Where to sleep", "Dónde dormir", "Où dormir", "Wo übernachten", "Onde dormir")
put("Lisbon guides:", "Guías de Lisboa:", "Guides de Lisbonne :", "Lissabon-Guides:", "Guias de Lisboa:")
put("where to sleep", "dónde dormir", "où dormir", "wo übernachten", "onde dormir")
put("Skip to content", "Saltar al contenido", "Aller au contenu", "Zum Inhalt springen", "Saltar para o conteúdo")
put("3 days in Porto", "3 días en Porto", "3 jours à Porto", "3 Tage in Porto", "3 dias no Porto")
put("Cookie settings", "Ajustes de cookies", "Paramètres des cookies", "Cookie-Einstellungen", "Definições de cookies")
put("Portugal D7 visa", "Visado D7 de Portugal", "Visa D7 pour le Portugal", "Portugal D7 Visum", "Visto D7 para Portugal")
put("3 days in Lisbon", "3 días en Lisboa", "3 jours à Lisbonne", "3 Tage in Lissabon", "3 dias em Lisboa")
put("Braga & Guimarães", "Braga y Guimarães", "Braga et Guimarães", "Braga und Guimarães", "Braga e Guimarães")
put("What to bring home", "Qué llevarse a casa", "Quoi rapporter", "Was man mitnimmt", "O que levar para casa")
put("Six bridges cruise", "Crucero de los seis puentes", "Croisière des six ponts", "Fahrt unter den sechs Brücken", "Cruzeiro das seis pontes")
put("Privacy (services)", "Privacidad (servicios)", "Confidentialité (services)", "Datenschutz (Dienstleistungen)", "Privacidade (serviços)")
put(". Resized to WebP.", ". Convertida a WebP.", ". Redimensionnée en WebP.", ". In WebP umgewandelt.", ". Redimensionada para WebP.")
put("Porto in a few days", "Porto en unos días", "Porto en quelques jours", "Porto in ein paar Tagen", "Porto em poucos dias")
put("Food and wine tours", "Tours de comida y vino", "Parcours gastronomiques", "Ess- und Weintouren", "Visitas de comida e vinho")
put("Airport to the city", "Del aeropuerto a la ciudad", "De l'aéroport au centre", "Vom Flughafen in die Stadt", "Do aeroporto à cidade")
put("Book before you fly", "Reserva antes de volar", "Réservez avant le vol", "Buchen Sie vor dem Flug", "Reserve antes de voar")
put("Aveiro & Costa Nova", "Aveiro y Costa Nova", "Aveiro et Costa Nova", "Aveiro und Costa Nova", "Aveiro e Costa Nova")
put("See dates and price", "Ver fechas y precio", "Voir les dates et le prix", "Termine und Preis ansehen", "Ver datas e preço")
put("book before you fly", "reserva antes de volar", "réservez avant le vol", "buchen Sie vor dem Flug", "reserve antes de voar")
put("airport to the city", "del aeropuerto a la ciudad", "de l'aéroport au centre", "vom Flughafen in die Stadt", "do aeroporto à cidade")
put("Port cellars in Gaia", "Bodegas de vino de Oporto en Gaia", "Caves de porto à Gaia", "Portweinkeller in Gaia", "Caves de vinho do Porto em Gaia")
put("Day trips from Porto", "Excursiones desde Porto", "Excursions au départ de Porto", "Tagesausflüge ab Porto", "Excursões a partir do Porto")
put("day trips from Porto", "excursiones desde Porto", "excursions au départ de Porto", "Tagesausflüge ab Porto", "excursões a partir do Porto")
put("Questions people ask", "Preguntas frecuentes", "Questions fréquentes", "Häufige Fragen", "Perguntas frequentes")
put("port cellars in Gaia", "bodegas de vino de Oporto en Gaia", "caves de porto à Gaia", "Portweinkeller in Gaia", "caves de vinho do Porto em Gaia")
put("Douro Valley day trip", "Excursión al valle del Douro", "Excursion dans la vallée du Douro", "Tagesausflug ins Douro-Tal", "Excursão ao vale do Douro")
put("Search stays in Porto", "Buscar alojamiento en Porto", "Chercher un logement à Porto", "Unterkünfte in Porto suchen", "Procurar alojamento no Porto")
put("Livraria Lello tickets", "Entradas para la Livraria Lello", "Billets pour la Livraria Lello", "Tickets für die Livraria Lello", "Bilhetes para a Livraria Lello")
put("Portugal eSIM on Saily", "eSIM de Portugal en Saily", "eSIM Portugal chez Saily", "Portugal-eSIM bei Saily", "eSIM de Portugal na Saily")
put("where to sleep in Porto", "dónde dormir en Porto", "où dormir à Porto", "wo in Porto übernachten", "onde dormir no Porto")
put("Compare car hire in Porto", "Comparar el alquiler de coches en Porto", "Comparer les locations de voiture à Porto", "Mietwagen in Porto vergleichen", "Comparar aluguer de carro no Porto")
put("Porto airport to the city", "Del aeropuerto de Porto a la ciudad", "De l'aéroport de Porto au centre", "Vom Flughafen Porto in die Stadt", "Do aeroporto do Porto à cidade")
put("Braga & Guimarães day trip", "Excursión a Braga y Guimarães", "Excursion à Braga et Guimarães", "Tagesausflug nach Braga und Guimarães", "Excursão a Braga e Guimarães")
put("Portugal D8 digital nomad visa", "Visado D8 de nómada digital para Portugal", "Visa D8 nomade numérique pour le Portugal", "Portugal D8 Visum für digitale Nomaden", "Visto D8 de nómada digital para Portugal")
put("Beach base: Póvoa", "Base de playa: Póvoa / Vila do Conde", "Base balnéaire : Póvoa / Vila do Conde", "Strandbasis: Póvoa / Vila do Conde", "Base de praia: Póvoa / Vila do Conde")
put("© Day in Portugal", "© Day in Portugal · Guía de Porto ·", "© Day in Portugal · Guide de Porto ·", "© Day in Portugal · Porto-Guide ·", "© Day in Portugal · Guia do Porto ·")
put("Porto, one useful post", "Porto, una publicación útil cada vez.", "Porto, une publication utile à la fois.", "Porto, ein nützlicher Beitrag nach dem anderen.", "Porto, uma publicação útil de cada vez.")
put("Gifts from Portugal", "Regalos de Portugal — ver la tienda", "Cadeaux du Portugal — voir la boutique", "Geschenke aus Portugal — zum Shop", "Presentes de Portugal — ver a loja")
put(", via Wikimedia Commons. Resized", ", vía Wikimedia Commons. Redimensionada y convertida a WebP.", ", via Wikimedia Commons. Redimensionnée et convertie en WebP.", ", über Wikimedia Commons. Größe geändert und in WebP umgewandelt.", ", via Wikimedia Commons. Redimensionada e convertida para WebP.")
put("Some links pay us a commission", "Algunos enlaces nos dan una comisión, sin coste extra para ti —", "Certains liens nous versent une commission, sans frais en plus pour vous —", "Einige Links bringen uns eine Provision, ohne Aufpreis für Sie —", "Alguns links dão-nos uma comissão, sem custo extra para si —")
put("The Ribeira riverfront", "La Ribeira de Porto vista desde Gaia, al otro lado del Douro", "Le quai de Ribeira à Porto, vu depuis Gaia de l'autre côté du Douro", "Die Ribeira in Porto, vom Gaia-Ufer über den Douro gesehen", "A Ribeira no Porto, vista de Gaia do outro lado do Douro")
put("Short tips from the north", "Consejos breves desde el norte de Portugal — qué reservar y qué saltarse — en Instagram.", "Des conseils courts depuis le nord du Portugal — quoi réserver, quoi laisser — sur Instagram.", "Kurze Tipps aus dem Norden Portugals — was man bucht und was man auslässt — auf Instagram.", "Dicas curtas a partir do norte de Portugal — o que reservar e o que saltar — no Instagram.")
put("FICTIONAL BUSINESS", "NEGOCIO FICTICIO: una demo preparada por Pedro Carvalho con datos inventados, para mostrar cómo funciona.", "COMMERCE FICTIF : une démo préparée par Pedro Carvalho, avec des informations inventées, pour montrer comment cela fonctionne.", "FIKTIVER BETRIEB: eine von Pedro Carvalho vorbereitete Demo mit erfundenen Angaben, um zu zeigen, wie es funktioniert.", "NEGÓCIO FICTÍCIO: uma demonstração preparada por Pedro Carvalho com dados inventados, para mostrar como funciona.")
put("This is a simplified demo", "Esto es una demo simplificada: funciona con reglas (respuestas escritas de antemano), no es el asistente terminado. Contacto:", "Ceci est une démo simplifiée : elle suit des règles (réponses écrites à l'avance), ce n'est pas l'assistant définitif. Contact :", "Dies ist eine vereinfachte Demo: sie arbeitet mit Regeln (vorher geschriebene Antworten), nicht mit dem fertigen Assistenten. Kontakt:", "Isto é uma demonstração simplificada: funciona com regras (respostas escritas antecipadamente), não é o assistente acabado. Contacto:")
put("An independent Porto guide", "Una guía independiente de Porto, escrita desde el norte. No somos una agencia de viajes. Algunos enlaces son de afiliados: pagas el precio público.", "Un guide indépendant de Porto, écrit depuis le nord. Pas une agence de voyages. Certains liens sont des liens d'affiliation : vous payez le prix public.", "Ein unabhängiger Porto-Guide, geschrieben aus dem Norden. Kein Reisebüro. Manche Links sind Affiliate-Links — Sie zahlen den öffentlichen Preis.", "Um guia independente do Porto, escrito a partir do norte. Não é uma agência de viagens. Alguns links são de afiliados — paga o preço público.")
put("We do not take payment. You book on the partner’s page, under their cancellation terms. Some links", "No cobramos nada. Reservas en la página del socio, con sus condiciones de cancelación. Algunos enlaces nos dan una comisión, sin coste extra para ti —", "Nous n'encaissons rien. Vous réservez sur la page du partenaire, selon ses conditions d'annulation. Certains liens nous versent une commission, sans frais en plus pour vous —", "Wir nehmen keine Zahlung entgegen. Sie buchen auf der Seite des Partners, zu dessen Stornobedingungen. Einige Links bringen uns eine Provision, ohne Aufpreis für Sie —", "Não recebemos qualquer pagamento. A reserva faz-se na página do parceiro, com as condições de cancelamento dele. Alguns links dão-nos uma comissão, sem custo extra para si —")
put("The business, the address", "El negocio, la dirección y el horario son inventados, solo para esta demo. Si un dato no está confirmado, el asistente dice que lo consultará con el equipo. No inventa la respuesta.", "Le commerce, l'adresse et les horaires sont inventés, uniquement pour cette démo. Si une information n'est pas confirmée, l'assistant dit qu'il vérifiera avec l'équipe. Il n'invente pas de réponse.", "Betrieb, Adresse und Öffnungszeiten sind erfunden, nur für diese Demo. Ist eine Angabe nicht bestätigt, sagt der Assistent, dass er beim Team nachfragt. Er erfindet keine Antwort.", "O negócio, a morada e o horário são inventados, apenas para esta demonstração. Se um dado não estiver confirmado, o assistente diz que vai confirmar com a equipa. Não inventa uma resposta.")
put("We do not take payment. You book on the partner’s page, under their cancellation terms, and the price", "No cobramos nada. Reservas en la página del socio, con sus condiciones de cancelación, y el precio y los horarios que aparecen allí son los que cuentan. Algunos enlaces nos dan una comisión, sin coste extra para ti —", "Nous n'encaissons rien. Vous réservez sur la page du partenaire, selon ses conditions d'annulation : le prix et les horaires indiqués là-bas font foi. Certains liens nous versent une commission, sans frais en plus pour vous —", "Wir nehmen keine Zahlung entgegen. Sie buchen auf der Seite des Partners, zu dessen Stornobedingungen. Der dort gezeigte Preis und die Zeiten gelten. Einige Links bringen uns eine Provision, ohne Aufpreis für Sie —", "Não recebemos qualquer pagamento. A reserva faz-se na página do parceiro, com as condições de cancelamento dele, e o preço e os horários que lá aparecem é que contam. Alguns links dão-nos uma comissão, sem custo extra para si —")
put("Public information checked", "Información pública comprobada el 25 de octubre de 2026 (la web oficial y la ficha de Booking / el registro municipal). Si un dato no está confirmado, el asistente dice que lo consultará con el equipo. No inventa la respuesta.", "Informations publiques vérifiées le 25 octobre 2026 (le site officiel et la fiche Booking / le registre de la mairie). Si une information n'est pas confirmée, l'assistant dit qu'il vérifiera avec l'équipe. Il n'invente pas de réponse.", "Öffentliche Angaben, geprüft am 25. Oktober 2026 (die offizielle Website und der Booking-Eintrag / der Eintrag der Gemeinde). Ist eine Angabe nicht bestätigt, sagt der Assistent, dass er beim Team nachfragt. Er erfindet keine Antwort.", "Informação pública verificada a 25 de outubro de 2026 (o site oficial e a ficha do Booking / o registo da câmara). Se um dado não estiver confirmado, o assistente diz que vai confirmar com a equipa. Não inventa uma resposta.")
put("This demo is not connected", "Esta demo no está conectada a los sistemas del negocio: no toma reservas, no envía mensajes ni guarda datos. Las respuestas de reserva son borradores que el negocio aprobaría antes de enviar. Preparada por Pedro Carvalho · dayinportugal@gmail.com", "Cette démo n'est pas reliée aux systèmes du commerce : elle ne prend pas de réservation, n'envoie pas de message et ne stocke pas de données. Les réponses de réservation sont des brouillons que le commerce validerait avant envoi. Préparée par Pedro Carvalho · dayinportugal@gmail.com", "Diese Demo ist nicht mit den Systemen des Betriebs verbunden: sie nimmt keine Buchungen an, sendet keine Nachrichten und speichert keine Daten. Buchungsantworten sind Entwürfe, die der Betrieb vor dem Versand freigeben würde. Vorbereitet von Pedro Carvalho · dayinportugal@gmail.com", "Esta demonstração não está ligada aos sistemas do negócio: não aceita reservas, não envia mensagens nem guarda dados. As respostas de reserva são rascunhos que o negócio aprovaria antes de enviar. Preparada por Pedro Carvalho · dayinportugal@gmail.com")

missing = [s for s in shared if s not in T and s not in IDENTITY]
if missing:
    raise SystemExit("unclassified:\n" + "\n".join(missing))

out = ROOT / "tools" / "i18n" / "shared"
out.mkdir(parents=True, exist_ok=True)
for index, lang in enumerate(("es", "fr", "de", "pt")):
    data = {s: s for s in IDENTITY}
    for key, values in T.items():
        data[key] = values[index]
    (out / f"{lang}.json").write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(lang, len(data))
