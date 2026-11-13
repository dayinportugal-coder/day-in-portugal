"""Hero photos added 13/11/2026 (Wikimedia Commons, licences checked via the Commons API)."""
import html
PHOTOS = {
 "bom-jesus-stairway": dict(w=1600, h=1067, author="Joseolgon", lic="CC BY-SA 4.0", licurl="https://creativecommons.org/licenses/by-sa/4.0",
   src="https://commons.wikimedia.org/wiki/File:Escad%C3%B3rios_do_Bom_Jesus_2017_(6).jpg",
   alt={"en": "The Baroque stairway of Bom Jesus do Monte in Braga under a blue sky", "es": "La escalinata barroca del Bom Jesus do Monte en Braga", "fr": "L’escalier baroque du Bom Jesus do Monte à Braga", "de": "Die barocke Treppe von Bom Jesus do Monte in Braga", "pt": "O escadório barroco do Bom Jesus do Monte, em Braga"}),
 "rabelos-gaia-dom-luis": dict(w=1600, h=1067, author="Michael Gaylard", lic="CC BY 4.0", licurl="https://creativecommons.org/licenses/by/4.0",
   src="https://commons.wikimedia.org/wiki/File:Barcos_Rabelos_(55242912711).jpg",
   alt={"en": "Rabelo boats on the Douro at Vila Nova de Gaia, with the Dom Luís I bridge behind", "es": "Barcos rabelos en el Duero, en Vila Nova de Gaia, con el puente Dom Luís I al fondo", "fr": "Bateaux rabelos sur le Douro à Vila Nova de Gaia, avec le pont Dom Luís I", "de": "Rabelo-Boote auf dem Douro in Vila Nova de Gaia, dahinter die Brücke Dom Luís I", "pt": "Barcos rabelos no Douro, em Vila Nova de Gaia, com a ponte D. Luís I ao fundo"}),
 "porto-se-from-clerigos": dict(w=1600, h=1068, author="Jakub Hałun", lic="CC BY 4.0", licurl="https://creativecommons.org/licenses/by/4.0",
   src="https://commons.wikimedia.org/wiki/File:View_of_Porto_Cathedral_from_Cl%C3%A9rigos_Tower,_20250605_1724_9965.jpg",
   alt={"en": "Porto’s rooftops and the cathedral seen from the Clérigos Tower", "es": "Los tejados de Oporto y la catedral vistos desde la Torre dos Clérigos", "fr": "Les toits de Porto et la cathédrale vus de la tour des Clérigos", "de": "Die Dächer von Porto und die Kathedrale vom Clérigos-Turm aus", "pt": "Os telhados do Porto e a Sé vistos da Torre dos Clérigos"}),
 "lisbon-praca-comercio-tejo": dict(w=1600, h=1067, author="Norbert Nagel", lic="CC BY-SA 4.0", licurl="https://creativecommons.org/licenses/by-sa/4.0",
   src="https://commons.wikimedia.org/wiki/File:Praca_do_Comercio_-_Lisbon_-_Portugal.jpg",
   alt={"en": "Praça do Comércio and the Tagus river in Lisbon from above", "es": "La Praça do Comércio y el Tajo en Lisboa, vistos desde arriba", "fr": "La Praça do Comércio et le Tage à Lisbonne, vus d’en haut", "de": "Die Praça do Comércio und der Tejo in Lissabon von oben", "pt": "A Praça do Comércio e o Tejo, em Lisboa, vistos de cima"}),
 "lisbon-lapa-stairs": dict(w=1600, h=1065, author="Pedro Ribeiro Simões", lic="CC BY 2.0", licurl="https://creativecommons.org/licenses/by/2.0",
   src="https://commons.wikimedia.org/wiki/File:Lisbon_typical_street_stairs_(10334036624).jpg",
   alt={"en": "A quiet stepped street with trees in Lapa, Lisbon", "es": "Una tranquila calle con escaleras y árboles en Lapa, Lisboa", "fr": "Une rue calme en escalier, avec des arbres, à Lapa, Lisbonne", "de": "Eine ruhige Treppengasse mit Bäumen in Lapa, Lissabon", "pt": "Uma rua calma, com escadas e árvores, na Lapa, em Lisboa"}),
}
CAP = {"en": ("Photo: ", ", via Wikimedia Commons. Resized and converted to WebP."),
       "es": ("Foto: ", ", vía Wikimedia Commons. Redimensionada y convertida a WebP."),
       "fr": ("Photo : ", ", via Wikimedia Commons. Redimensionnée et convertie en WebP."),
       "de": ("Foto: ", ", über Wikimedia Commons. Größe geändert und in WebP umgewandelt."),
       "pt": ("Foto: ", ", via Wikimedia Commons. Redimensionada e convertida para WebP.")}

def figure(name, lang):
    p = PHOTOS[name]; a, b = CAP[lang]
    return (f'<figure class="guide-hero">\n    <img src="/img/{name}-1600.webp" srcset="/img/{name}-800.webp 800w, /img/{name}-1600.webp 1600w" sizes="(min-width: 1280px) 1200px, 100vw" '
            f'width="{p["w"]}" height="{p["h"]}" alt="{html.escape(p["alt"][lang])}" fetchpriority="high" decoding="async" />\n'
            f'    <figcaption>{a}<a href="{p["src"]}" rel="noopener" target="_blank">{html.escape(p["author"])}</a>, '
            f'<a href="{p["licurl"]}" rel="license noopener" target="_blank">{p["lic"]}</a>{b}</figcaption>\n  </figure>')
