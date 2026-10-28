/*
 * Comfy Stay — ρυθμίσεις ιστοσελίδας
 * Εδώ αλλάζεις κείμενα, φωτογραφίες και στοιχεία επικοινωνίας.
 * Οι ΤΙΜΕΣ ορίζονται στον server (worker.js) — εδώ υπάρχει μόνο το "από X €" που δείχνει η αρχική.
 */
window.COMFY = {
  // Διεύθυνση του server κρατήσεων. Όσο είναι κενό, η σελίδα δουλεύει σε δοκιμαστική λειτουργία.
  apiBase: '',

  // Online κρατήσεις με πληρωμή κάρτας. false = οι επισκέπτες κλείνουν σε Booking.com / Airbnb ή επικοινωνούν μαζί μας.
  directBooking: false,

  // Τιμή «από … / νύχτα» στις κάρτες και στη σελίδα καταλύματος
  showPrices: false,

  // Σελίδα «Χρήσιμες πληροφορίες» (terms.html). false = δεν εμφανίζεται στο μενού.
  termsPage: false,

  // Εμφάνιση ΑΜΑ στη σελίδα (σελίδα καταλύματος και κάτω μέρος). Ο αριθμός μένει αποθηκευμένος στο κάθε κατάλυμα.
  showAma: false,

  brand: 'ComfyStay in Greece',
  logo: 'img/logo-180.jpg',
  languages: ['el', 'en', 'de', 'bg', 'sr', 'ru'],

  // Φωτογραφίες στην πρώτη οθόνη της αρχικής (κενό = χωρίς φωτογραφίες).
  // Μορφή: { src: 'img/hero/....jpg', caption: { el: '...', en: '...' }, credit: '' }
  heroPhotos: [
    {
      city: 'thessaloniki', src: 'img/hero/thessaloniki.jpg', position: 'center 30%',
      credit: 'C messier, CC BY-SA 4.0, via Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:%CE%9B%CE%B5%CF%85%CE%BA%CF%8C%CF%82_%CE%A0%CF%8D%CF%81%CE%B3%CE%BF%CF%82_4014.jpg',
      caption: { el: 'Θεσσαλονίκη · ο Λευκός Πύργος', en: 'Thessaloniki · the White Tower', de: 'Thessaloniki · der Weiße Turm', bg: 'Солун · Бялата кула', sr: 'Solun · Bela kula', ru: 'Салоники · Белая башня' },
    },
    {
      city: 'siatista', src: 'img/hero/siatista.jpg', position: 'center 70%',
      credit: 'Papastasos, CC BY-SA 4.0, via Wikimedia Commons',
      creditUrl: 'https://commons.wikimedia.org/wiki/File:Siatista_Dec-2019.jpg',
      caption: { el: 'Σιάτιστα', en: 'Siatista', de: 'Siatista', bg: 'Сятища', sr: 'Sjatista', ru: 'Сьятиста' },
    },
  ],

  contact: {
    // viber / whatsapp: false αν ο αριθμός δεν έχει την εφαρμογή
    phones: [
      { number: '+30 694 874 2713', viber: true, whatsapp: true },
      { number: '+30 694 913 5270', viber: true, whatsapp: true },
    ],
    instagram: '', // ΣΥΜΠΛΗΡΩΣΕ: π.χ. 'comfystay.gr' (χωρίς @)
    email: 'info@comfystay.gr',
  },

  cities: [
    {
      id: 'thessaloniki',
      name: { el: 'Θεσσαλονίκη', en: 'Thessaloniki', de: 'Thessaloniki', bg: 'Солун', sr: 'Solun', ru: 'Салоники' },
      nameIn: { el: 'στη Θεσσαλονίκη', en: 'in Thessaloniki', de: 'in Thessaloniki', bg: 'в Солун', sr: 'u Solunu', ru: 'в Салониках' },
      blurb: {
        el: 'Διαμερίσματα στην πόλη, κοντά στη θάλασσα και στο κέντρο.',
        en: 'City apartments close to the sea and the centre.',
        de: 'Stadtwohnungen nahe am Meer und am Zentrum.',
        bg: 'Апартаменти в града, близо до морето и центъра.',
        sr: 'Gradski apartmani blizu mora i centra.',
        ru: 'Городские апартаменты рядом с морем и центром.',
      },
    },
    {
      id: 'siatista',
      name: { el: 'Σιάτιστα', en: 'Siatista', de: 'Siatista', bg: 'Сятища', sr: 'Sjatista', ru: 'Сьятиста' },
      nameIn: { el: 'στη Σιάτιστα', en: 'in Siatista', de: 'in Siatista', bg: 'в Сятища', sr: 'u Sjatisti', ru: 'в Сьятисте' },
      blurb: {
        el: 'Ήσυχη διαμονή στη Δυτική Μακεδονία, ανάμεσα σε αρχοντικά και αμπέλια.',
        en: 'A quiet stay in Western Macedonia, among old mansions and vineyards.',
        de: 'Ruhiger Aufenthalt in Westmakedonien, zwischen alten Herrenhäusern und Weinbergen.',
        bg: 'Спокоен престой в Западна Македония, сред стари имения и лозя.',
        sr: 'Miran boravak u Zapadnoj Makedoniji, među starim vilama i vinogradima.',
        ru: 'Спокойный отдых в Западной Македонии среди старинных особняков и виноградников.',
      },
    },
  ],

  properties: [
    {
      id: 'panoramic',
      city: 'thessaloniki',
      name: 'Panoramic View Apartment',
      area: { el: 'Θεσσαλονίκη, δίπλα στη ΔΕΘ', en: 'Thessaloniki, next to the International Fair', de: 'Thessaloniki, direkt neben der Messe', bg: 'Солун, до самия Панаир', sr: 'Solun, pored Sajma', ru: 'Салоники, у самой Ярмарки' },
      tagline: {
        el: 'Πανοραμική θέα σε όλη την πόλη.', en: 'A panoramic view over the whole city.',
        de: 'Panoramablick über die ganze Stadt.', bg: 'Панорамна гледка към целия град.',
        sr: 'Panoramski pogled na ceo grad.', ru: 'Панорамный вид на весь город.',
      },
      description: {
        el: 'Φωτεινό, πλήρως ανακαινισμένο διαμέρισμα 60 τ.μ. με πανοραμική θέα σε όλη τη Θεσσαλονίκη, από τον Λευκό Πύργο μέχρι το Σέιχ Σου, και τη θάλασσα στο βάθος του ορίζοντα.\n\nΕνιαίο σαλόνι και τραπεζαρία με ξύλινο πάτωμα, ηλεκτρικό τζάκι και μεγάλη τηλεόραση. Ο καναπές ανοίγει σε κρεβάτι.\n\nΔύο υπνοδωμάτια με τηλεόραση και κλιματισμό: το πρώτο με διπλό κρεβάτι 160×200, γραφείο και έξοδο στο μπαλκόνι, το δεύτερο με διπλό κρεβάτι 140×200.\n\nΕξοπλισμένη κουζίνα με φούρνο, κεραμικές εστίες, ψυγείο, φούρνο μικροκυμάτων, καφετιέρα Nespresso, βραστήρα και τοστιέρα, και μπαράκι για πρωινό.\n\nΜοντέρνο μπάνιο με ντους-βροχή, πετσέτες, μπουρνούζια και προϊόντα περιποίησης.\n\nΤο μπαλκόνι, με τραπεζάκι και καρέκλες, βλέπει την πόλη: ιδανικό για τον πρωινό καφέ ή ένα ποτήρι κρασί το βράδυ.',
        en: 'A bright, fully renovated 60 m² apartment with a panoramic view over the whole of Thessaloniki, from the White Tower to Seich Sou forest, and the sea on the horizon.\n\nOpen living and dining room with wooden floors, an electric fireplace and a large TV. The sofa opens into a bed.\n\nTwo bedrooms with TV and air conditioning: the first with a 160×200 double bed, a desk and access to the balcony, the second with a 140×200 double bed.\n\nEquipped kitchen with oven, ceramic hob, fridge, microwave, Nespresso machine, kettle and toaster, plus a breakfast bar.\n\nA modern bathroom with a rain shower, towels, bathrobes and toiletries.\n\nThe balcony, with a small table and chairs, looks out over the city: perfect for morning coffee or a glass of wine in the evening.',
        de: 'Helle, komplett renovierte Wohnung mit 60 m² und Panoramablick über ganz Thessaloniki, vom Weißen Turm bis zum Wald Seich Sou, und das Meer am Horizont.\n\nOffener Wohn- und Essbereich mit Holzboden, elektrischem Kamin und großem Fernseher. Das Sofa lässt sich zum Bett ausziehen.\n\nZwei Schlafzimmer mit Fernseher und Klimaanlage: das erste mit Doppelbett 160×200, Schreibtisch und Zugang zum Balkon, das zweite mit Doppelbett 140×200.\n\nAusgestattete Küche mit Backofen, Ceranfeld, Kühlschrank, Mikrowelle, Nespresso-Maschine, Wasserkocher und Toaster sowie eine Frühstückstheke.\n\nModernes Bad mit Regendusche, Handtüchern, Bademänteln und Pflegeprodukten.\n\nDer Balkon mit Tisch und Stühlen blickt über die Stadt: ideal für den Morgenkaffee oder ein Glas Wein am Abend.',
        bg: 'Светъл, изцяло ремонтиран апартамент от 60 м² с панорамна гледка към цял Солун, от Бялата кула до гората Сейх Су, и морето на хоризонта.\n\nОбединени дневна и трапезария с дървен под, електрическа камина и голям телевизор. Диванът се разтяга в легло.\n\nДве спални с телевизор и климатик: първата с двойно легло 160×200, бюро и излаз на балкона, втората с двойно легло 140×200.\n\nОборудвана кухня с фурна, керамични котлони, хладилник, микровълнова, кафемашина Nespresso, кана за вода и тостер, плюс бар плот за закуска.\n\nМодерна баня с душ тип „дъжд“, хавлии, халати и козметика.\n\nБалконът с масичка и столове гледа към града: идеален за сутрешното кафе или чаша вино вечер.',
        sr: 'Svetao, potpuno renoviran stan od 60 m² sa panoramskim pogledom na ceo Solun, od Bele kule do šume Sejh Su, i more na horizontu.\n\nSpojeni dnevni boravak i trpezarija sa drvenim podom, električnim kaminom i velikim televizorom. Kauč se razvlači u krevet.\n\nDve spavaće sobe sa televizorom i klima-uređajem: prva sa bračnim krevetom 160×200, radnim stolom i izlazom na balkon, druga sa bračnim krevetom 140×200.\n\nOpremljena kuhinja sa rernom, keramičkom pločom, frižiderom, mikrotalasnom, Nespresso aparatom, kuvalom za vodu i tosterom, kao i šankom za doručak.\n\nModerno kupatilo sa tušem sa kišnom ružom, peškirima, bade-mantilima i kozmetikom.\n\nBalkon sa stočićem i stolicama gleda na grad: idealan za jutarnju kafu ili čašu vina uveče.',
        ru: 'Светлая квартира 60 м² с полным ремонтом с панорамным видом на все Салоники, от Белой башни до леса Сейх-Су, и с морем на горизонте.\n\nОбъединённые гостиная и столовая с деревянным полом, электрокамином и большим телевизором. Диван раскладывается в кровать.\n\nДве спальни с телевизором и кондиционером: в первой двуспальная кровать 160×200, рабочий стол и выход на балкон, во второй двуспальная кровать 140×200.\n\nОборудованная кухня с духовкой, стеклокерамической плитой, холодильником, микроволновкой, кофемашиной Nespresso, чайником и тостером, а также барная стойка для завтрака.\n\nСовременная ванная с тропическим душем, полотенцами, халатами и средствами по уходу.\n\nС балкона со столиком и стульями открывается вид на город: идеально для утреннего кофе или бокала вина вечером.',
      },
      maxGuests: 6, bedrooms: 2, beds: 2, sofaBeds: 1, baths: 1, size: 60,
      fromPrice: 70,
      weekendPrice: 80, // Παρασκευή & Σάββατο — οι πραγματικές τιμές ορίζονται στο worker.js
      minNights: 2,
      cleaningFee: 0,
      checkin: '15:00', checkout: '11:00',
      parking: {
        el: 'Δεν υπάρχει ιδιωτικό πάρκινγκ. Θα βρείτε εύκολα θέση στον δρόμο· κοντά υπάρχει δημόσιο δωρεάν πάρκινγκ και ιδιωτικό κλειστό επί πληρωμή.',
        en: 'No private parking. Street parking is easy to find; there is a free public car park nearby and a paid covered garage.',
        de: 'Kein privater Parkplatz. Parkplätze an der Straße findet man leicht; in der Nähe gibt es einen kostenlosen öffentlichen Parkplatz und ein kostenpflichtiges überdachtes Parkhaus.',
        bg: 'Няма собствен паркинг. Лесно се намира място на улицата; наблизо има безплатен обществен паркинг и платен закрит гараж.',
        sr: 'Nema privatnog parkinga. Mesto na ulici se lako nalazi; u blizini je besplatan javni parking i plaćena natkrivena garaža.',
        ru: 'Собственной парковки нет. Место на улице найти легко; рядом есть бесплатная общественная стоянка и платный крытый гараж.',
      },
      address: { el: 'Λυσιμάχου Καυταντζόγλου 32, 546 39 Θεσσαλονίκη', en: 'Lysimachou Kaftantzoglou 32, 546 39 Thessaloniki' },
      mapsQuery: 'The Panoramic View Apartment - by Comfy stay in Greece, Lysimachou Kaftantzoglou 32, Thessaloniki',
      placeId: 'ChIJ_xyEvCk5qBQR3sCcj9nzXZU', // η καταχώρηση «The Panoramic View Apartment» στο Google Maps
      mapsUrl: 'https://maps.app.goo.gl/ZD98PUCXYvaxP24p7',
      mapImage: 'img/map/panoramic.jpg', // χάρτης με την ακριβή θέση
      mapImageCard: 'img/map/panoramic-card.jpg', // πιο κοντινός, για την κάρτα της αρχικής
      mapPin: [50, 50], mapPinCard: [50, 50.4], // θέση της καρφίτσας πάνω στον χάρτη (%)
      floor: 3,
      airport: true, // δείχνει «Από το αεροδρόμιο» (ταξί, λεωφορείο 01X/01N)
      // Απόσταση με τα πόδια (μέτρα) και χρόνος (λεπτά), κατά προσέγγιση
      nearby: [
        { metro: { el: 'Πανεπιστήμιο', en: 'Panepistimio' }, meters: 500, walk: 6 },
        { metro: { el: 'Παπάφη', en: 'Papafi' }, meters: 550, walk: 7 },
        { place: 'beach', meters: 650, walk: 8 },
        { place: 'tif', meters: 800, walk: 10 },
        { place: 'whitetower', meters: 1300, walk: 17 },
        { place: 'kamara', meters: 1600, walk: 20 },
        { place: 'agiasofia', meters: 1700, walk: 21 },
      ],
      amenities: ['view', 'balcony', 'wifi', 'ac', 'heating', 'fireplace', 'tv', 'kitchen', 'coffee', 'microwave', 'washer', 'rainshower', 'linens', 'towels', 'bathrobes', 'toiletries', 'dental', 'slippers', 'welcome', 'sofabed', 'desk', 'elevator', 'pets', 'crib', 'selfcheckin'],
      // Η πρώτη φωτογραφία είναι αυτή της αρχικής. Για κάθε NN.jpg υπάρχει και μικρότερο NN-s.jpg.
      photos: Array.from({ length: 40 }, (_, i) => `img/panoramic/${String(i + 1).padStart(2, '0')}.jpg`),
      ama: '00003728235',
      // Βαθμολογίες από τις πλατφόρμες — βάλε πάντα τα πραγματικά, τρέχοντα νούμερα και το link της αγγελίας.
      // Πραγματικές κριτικές επισκεπτών, όπως γράφτηκαν (μόνο μικρό όνομα και χώρα)
      reviews: [
        {
          name: 'Sonja', source: 'google', score: 5, scale: 5, date: '2026-10-26', lang: 'en',
          text: 'Wonderful apartment, clean and comfortable, with 2 bedrooms, wide balcony with a panoramic sea view and kitchen fuuuly equiped. You may also find a parking in front of the building. Highly recommended!',
        },
        {
          name: 'Ioanna', country: { el: 'Ελλάδα', en: 'Greece', de: 'Griechenland', bg: 'Гърция', sr: 'Grčka', ru: 'Греция' },
          source: 'booking', score: 10, scale: 10, date: '2026-10-07', lang: 'el',
          title: 'Μονοήμερη απόδραση',
          text: 'Το κατάλυμα ήταν προσεγμένο στην παραμικρή λεπτομέρεια και διακοσμημένο με γούστο, με υπέροχη θέα. Βρίσκεται σε φοβερή τοποθεσία, πολύ κοντά στο κέντρο και σε στάση μετρό. Θα βρείτε προϊόντα για πρωινό, καφέ, μικροσυσκευές, παντόφλες και γενικά ό,τι μπορεί να χρειαστείτε για μια άνετη διαμονή.',
        },
        {
          name: 'Evgeni', source: 'airbnb', score: 5, scale: 5, date: '2026-10', lang: 'el',
          // Μετάφραση του Airbnb — αν θέλεις, βάλε εδώ το αρχικό κείμενο
          text: 'Άνετο διαμέρισμα στο κέντρο της Θεσσαλονίκης, σε απόσταση που μπορείς να διανύσεις με τα πόδια από τη θάλασσα, τον Λευκό Πύργο και πολλά μπαρ και εστιατόρια. Ο χώρος είναι πολύ καθαρός και τακτοποιημένος, με οικεία ατμόσφαιρα. Ο οικοδεσπότης είναι κάτι περισσότερο από προνοητικός, η επικοινωνία ήταν εξαιρετικά ομαλή και μας πρόσφερε κάποιες προσωπικές πινελιές. Το συνιστούμε!',
        },
        {
          name: 'Feng', country: { el: 'Χονγκ Κονγκ', en: 'Hong Kong', de: 'Hongkong', bg: 'Хонконг', sr: 'Hongkong', ru: 'Гонконг' },
          source: 'booking', score: 10, scale: 10, date: '2026-09-20', lang: 'en',
          title: 'Exceptionally hospitable',
          text: 'Great location, not far from the sea with lovely views. Best of all, parking is easy. It was really hard for us to find parking in this city after work. We stayed near the central square the previous night and drove around and around looking for a parking spot. The host was very welcoming. The apartment has great facilities and was thoughtfully prepared. We had a wonderful stay.',
        },
        {
          name: 'Simone', country: { el: 'Γερμανία', en: 'Germany', de: 'Deutschland', bg: 'Германия', sr: 'Nemačka', ru: 'Германия' },
          source: 'booking', score: 10, scale: 10, date: '2026-08-29', lang: 'de',
          title: 'Traumhafter Aufenthalt!',
          text: 'Alle Erwartungen übertroffen! Sehr schöne, super ausgestattete Wohnung mit einer traumhaften Aussicht vom Balkon aus! Super Lage, Preis und Leistung super! Sehr netter Kontakt! Sehr freundliche und hilfsbereite Gastgeberin! Immer wieder gerne! Es hätte nichts besser sein können!',
        },
        {
          name: 'Rania', source: 'airbnb', score: 5, scale: 5, date: '2026-10', lang: 'el',
          text: 'Δεν έχω λόγια για να περιγράψω το κατάλυμα αυτό. Πέρα από πανέμορφο, καλόγουστο και πεντακάθαρο ήταν κ εξαιρετικά βολικό. Είχε τα πάντα, λίγα πράγματα για πρωινό, καφέ, προγράμματα στην τηλεόραση για ταινίες κλπ. Η Ουρανία ήταν εξαιρετική οικοδέσποινα, φοβερά επικοινωνιακή κ με σαφέστατες οδηγίες. Πολύ κοντά στο κέντρο. Εξαιρετική περιοχή αλλά το σπίτι έκανε όλη τη διαφορά καθώς κ ο άνθρωπος που το έχει. Το προτείνω ανεπιφύλακτα κ θα το επισκεφτώ ξανά κ ξανά. Βρήκα το σπίτι μου για όταν έρχομαι Θεσσαλονίκη. Σας ευχαριστούμε για όλα.',
        },
        {
          name: 'Thomas', source: 'airbnb', score: 5, scale: 5, date: '2026-09', lang: 'de',
          text: 'Haben acht Nächte in der Wohnung verbracht. Haben uns sofort wie zu Hause gefühlt. Die Wohnung war blitzsauber und stilvoll eingerichtet. Besonders hervorzuheben wäre die Auswahl an verschiedenen Kissen und Decken zum Schlafen. Auch Handtücher waren mehr als genügend vorhanden. Die Wohnung hat zwei Schlafzimmer. Eines zur Straße und eins zum Hinterhof. Beide besitzen eine Klimaanlage, welche wir aber Jahreszeit bedingt nicht benötigten. Die Küche ist modern und mit allen Utensilien ausgestattet. Besonders ist der Balkon mit seinem unverbauten Blick auf die Stadt und das Meer hervorzuheben. Rundum eine schöne Wohnung, welche ihren Preis wert ist. Kostenlose Parkplätze vor der Tür, Restaurants, Bäcker fußläufig erreichbar in wenigen Minuten. Auch ins Zentrum sowie zur Strandpromenade gelangt man in 10-15 Minuten zu Fuß. Wir kommen gerne wieder. Volle Punktzahl.',
        },
        {
          name: 'Spiros', source: 'airbnb', score: 5, scale: 5, date: '2026-10', lang: 'el',
          text: 'Ήταν όλα τέλεια, ευχαριστούμε πολύ για την φιλοξενία το συστήνουμε ανεπιφύλακτα!!!',
        },
        {
          name: 'Georgios', source: 'google', score: 5, scale: 5, date: '2026-09', lang: 'el',
          text: 'Περάσαμε μια υπέροχη εβδομάδα σε αυτό το κατάλυμα! Ο χώρος ήταν πεντακάθαρος, προσεγμένος στην παραμικρή λεπτομέρεια και είχε πραγματικά όλα όσα χρειαζόμασταν για μια άνετη διαμονή. Στα μεγάλα θετικά συγκαταλέγεται το πολύ εύκολο πάρκινγκ που μας έλυσε τα χέρια. Ο οικοδεσπότης ήταν εξαιρετικός – εξυπηρετικός, φιλόξενος και πάντα διαθέσιμος να βοηθήσει με το χαμόγελο. Το συνιστώ ανεπιφύλακτα και σίγουρα θα το επιλέξουμε ξανά στο μέλλον!',
        },
        {
          name: 'Daniela', source: 'airbnb', score: 5, scale: 5, date: '2026-08', lang: 'en',
          text: 'Immaculate apartment. The host was great. The apartment is right in the center. We enjoyed our stay.',
        },
        {
          name: 'Κυριάκος', source: 'airbnb', score: 5, scale: 5, date: '2026-08', lang: 'el',
          text: 'Το σπίτι της Ουρανίας ήταν ευρύχωρο, καθαρό, ιδανικό για τετραμελείς οικογένειες! Μας έκανε θετική εντύπωση η καθαριότητα και ο πλήρης οικιακός εξοπλισμός. Επίσης κάθε χώρος διέθετε κλιματιστικό και τηλεόραση. Η τοποθεσία του καταλύματος ήταν πολύ κοντά στο κέντρο αλλά σε ήσυχη περιοχή κοντά σε στάση του μετρό. Σίγουρα θα το ξανά επιλέξω όταν επισκεφτώ τη Θεσσαλονίκη!',
        },
        {
          name: 'Lambros', source: 'airbnb', score: 5, scale: 5, date: '2026-10', lang: 'el',
          text: 'Άψογο το διαμέρισμα. Πεντακάθαρο με όλες τις ανέσεις. Η κα Ουρανία ήταν πολύ εξυπηρετική. Σας ευχαριστούμε για την φιλοξενία.',
        },
      ],
      ratings: [
        { source: 'booking', score: 10, scale: 10, count: 7, url: 'https://www.booking.com/Share-8QlRCF' },
        { source: 'airbnb', score: 5, scale: 5, count: 10, url: 'https://www.airbnb.com/rooms/1747334720248612750' },
        { source: 'google', score: 5, scale: 5, count: 5, url: 'https://maps.app.goo.gl/ZD98PUCXYvaxP24p7' },
      ],
    },
    {
      id: 'gg',
      city: 'thessaloniki',
      name: 'G&G Apartment',
      area: { el: 'Βασιλίσσης Όλγας, Θεσσαλονίκη', en: 'Vasilissis Olgas Ave, Thessaloniki', de: 'Vasilissis-Olgas-Allee, Thessaloniki', bg: 'бул. Василисис Олгас, Солун', sr: 'Bulevar Vasilisis Olgas, Solun', ru: 'проспект Василиссис Ольгас, Салоники' },
      tagline: {
        el: 'Μοντέρνο διαμέρισμα 78 τ.μ. στη Βασιλίσσης Όλγας, κοντά στη θάλασσα.', en: 'A modern 78 m² apartment on Vasilissis Olgas, close to the sea.',
        de: 'Moderne 78-m²-Wohnung an der Vasilissis Olgas, nahe am Meer.', bg: 'Модерен апартамент от 78 м² на Василисис Олгас, близо до морето.',
        sr: 'Moderan stan od 78 m² na Vasilisis Olgas, blizu mora.', ru: 'Современная квартира 78 м² на Василиссис Ольгас, рядом с морем.',
      },
      description: {
        el: 'Μοντέρνο, πλήρως ανακαινισμένο διαμέρισμα 78 τ.μ. στη λεωφόρο Βασιλίσσης Όλγας, λίγα λεπτά από την παραλία, με εστιατόρια, φούρνους και σούπερ μάρκετ γύρω σας.\n\nΜεγάλο σαλόνι με πολύ μεγάλο γωνιακό καναπέ, όπου μπορεί να κοιμηθεί και κάποιος, και τηλεόραση. Ανοιχτή κουζίνα με τραπεζαρία, φούρνο, εστίες, ψυγείο, πλυντήριο πιάτων και πλυντήριο ρούχων.\n\nΔύο υπνοδωμάτια με διπλά κρεβάτια και κλιματισμό, και γωνιά εργασίας με γραφείο.\n\nΜοντέρνο μπάνιο με γυάλινη καμπίνα ντους, πετσέτες, μπουρνούζια και προϊόντα περιποίησης.\n\nΤο μπαλκόνι, με τέντα, τραπεζάκι και πολυθρόνες, βλέπει την πόλη.',
        en: 'A modern, fully renovated 78 m² apartment on Vasilissis Olgas Avenue, a few minutes from the seafront, with restaurants, bakeries and supermarkets all around.\n\nA large living room with a very large corner sofa, big enough to sleep on, and a TV. Open kitchen with dining table, oven, hob, fridge, dishwasher and washing machine.\n\nTwo bedrooms with double beds and air conditioning, plus a work corner with a desk.\n\nA modern bathroom with a glass shower, towels, bathrobes and toiletries.\n\nThe balcony, with an awning, a small table and armchairs, looks out over the city.',
        de: 'Moderne, komplett renovierte Wohnung mit 78 m² an der Vasilissis-Olgas-Allee, wenige Minuten von der Uferpromenade, mit Restaurants, Bäckereien und Supermärkten ringsum.\n\nGroßes Wohnzimmer mit einem sehr großen Ecksofa, auf dem man auch schlafen kann, und Fernseher. Offene Küche mit Esstisch, Backofen, Kochfeld, Kühlschrank, Geschirrspüler und Waschmaschine.\n\nZwei Schlafzimmer mit Doppelbetten und Klimaanlage sowie eine Arbeitsecke mit Schreibtisch.\n\nModernes Bad mit Glasdusche, Handtüchern, Bademänteln und Pflegeprodukten.\n\nDer Balkon mit Markise, Tischchen und Sesseln blickt über die Stadt.',
        bg: 'Модерен, изцяло ремонтиран апартамент от 78 м² на бул. Василисис Олгас, на няколко минути от крайбрежната алея, с ресторанти, фурни и супермаркети наоколо.\n\nГоляма дневна с много голям ъглов диван, на който може и да се спи, и телевизор. Отворена кухня с маса за хранене, фурна, котлони, хладилник, съдомиялна и пералня.\n\nДве спални с двойни легла и климатик, плюс кът за работа с бюро.\n\nМодерна баня със стъклен душ, хавлии, халати и козметика.\n\nБалконът с сенник, масичка и кресла гледа към града.',
        sr: 'Moderan, potpuno renoviran stan od 78 m² na bulevaru Vasilisis Olgas, nekoliko minuta od šetališta uz more, sa restoranima, pekarama i supermarketima svuda okolo.\n\nVeliki dnevni boravak sa veoma velikom ugaonom garniturom, na kojoj se može i spavati, i televizorom. Otvorena kuhinja sa trpezarijskim stolom, rernom, pločom, frižiderom, mašinom za sudove i mašinom za veš.\n\nDve spavaće sobe sa bračnim krevetima i klima-uređajem, kao i radni kutak sa stolom.\n\nModerno kupatilo sa staklenom tuš-kabinom, peškirima, bade-mantilima i kozmetikom.\n\nBalkon sa tendom, stočićem i foteljama gleda na grad.',
        ru: 'Современная квартира 78 м² с полным ремонтом на проспекте Василиссис Ольгас, в нескольких минутах от набережной; вокруг рестораны, пекарни и супермаркеты.\n\nБольшая гостиная с очень большим угловым диваном, на котором можно и спать, и телевизором. Открытая кухня с обеденным столом, духовкой, варочной панелью, холодильником, посудомоечной и стиральной машиной.\n\nДве спальни с двуспальными кроватями и кондиционером, а также рабочий уголок со столом.\n\nСовременная ванная со стеклянной душевой, полотенцами, халатами и средствами по уходу.\n\nБалкон с маркизой, столиком и креслами смотрит на город.',
      },
      maxGuests: 6, bedrooms: 2, beds: 2, baths: 1, size: 78,
      fromPrice: 65,
      checkin: '15:00', checkout: '11:00',
      floor: 5,
      parking: {
        el: 'Δεν υπάρχει ιδιωτικό πάρκινγκ. Θέση βρίσκεται συνήθως στους γύρω δρόμους.', en: 'No private parking. Street parking is usually available nearby.',
        de: 'Kein privater Parkplatz. In den umliegenden Straßen findet man meist einen Platz.', bg: 'Няма частен паркинг. Обикновено има място по околните улици.',
        sr: 'Nema privatnog parkinga. Mesto se obično nađe u okolnim ulicama.', ru: 'Частной парковки нет. Место обычно находится на соседних улицах.',
      },
      amenities: ['balcony', 'wifi', 'ac', 'heating', 'tv', 'kitchen', 'dishwasher', 'washer', 'desk', 'linens', 'towels', 'bathrobes', 'toiletries', 'elevator', 'pets', 'crib'],
      // Η πρώτη φωτογραφία είναι αυτή της αρχικής. Για κάθε NN.jpg υπάρχει και μικρότερο NN-s.jpg.
      photos: Array.from({ length: 14 }, (_, i) => `img/gg/${String(i + 1).padStart(2, '0')}.jpg`),
      ama: '',
      address: { el: 'Λεωφ. Βασιλίσσης Όλγας 74, 546 43 Θεσσαλονίκη', en: 'Vasilissis Olgas Ave 74, 546 43 Thessaloniki' },
      placeId: 'ChIJ09vNOQA5qBQRa4I-mu4dHSE',
      mapsUrl: 'https://maps.app.goo.gl/EFf2A32rm94A1Ebb6',
      mapCenter: [40.6087597, 22.9533057],
      reviews: [
        { name: 'Sladjana', country: { el: 'Βοσνία-Ερζεγοβίνη', en: 'Bosnia and Herzegovina', de: 'Bosnien und Herzegowina', bg: 'Босна и Херцеговина', sr: 'Bosna i Hercegovina', ru: 'Босния и Герцеговина' }, source: 'booking', lang: 'en',
          text: 'Absolutely perfect stay! G&G Apartment in Thessaloniki exceeded our expectations – clean, modern, comfortable, and fully equipped with everything you might need. The location is great, close to the city center and all amenities.' },
        { name: 'Goran', country: { el: 'Σερβία', en: 'Serbia', de: 'Serbien', bg: 'Сърбия', sr: 'Srbija', ru: 'Сербия' }, source: 'booking', lang: 'en',
          text: 'Everything was great. It is a pity that it is not possible to give a rating higher than ten. The apartment is new, clean, fragrant. The apartment has everything you need.' },
        { name: 'Maria', country: { el: 'Ισπανία', en: 'Spain', de: 'Spanien', bg: 'Испания', sr: 'Španija', ru: 'Испания' }, source: 'booking', lang: 'en',
          text: 'Very good apartment. Everything you need is there, including for the kitchen, hair dryer. Good, tasteful renovation. Location. Nice and responsive hosts. Very clean. Better than a hotel. Just super.' },
        { name: 'Todorova', country: { el: 'Βουλγαρία', en: 'Bulgaria', de: 'Bulgarien', bg: 'България', sr: 'Bugarska', ru: 'Болгария' }, source: 'booking', lang: 'en',
          text: 'Perfect place, chic and cozy apartment. With attention to every detail and guests comfort. Bravo, keep it up :)' },
        { name: 'Anna', country: { el: 'Βέλγιο', en: 'Belgium', de: 'Belgien', bg: 'Белгия', sr: 'Belgija', ru: 'Бельгия' }, source: 'booking', lang: 'en',
          text: 'It is a spacious, comfortable, cozy, luminous and clean apartment. The owner was very kind and helpful. The location is very well served by public transport. We had a wonderful time in Thessaloniki.' },
        { name: 'Peter', country: { el: 'ΗΠΑ', en: 'United States', de: 'USA', bg: 'САЩ', sr: 'SAD', ru: 'США' }, source: 'booking', lang: 'en',
          text: 'Large spacious apartment fully equipped and stocked for our stay. Owner/Manager extremely helpful and responsive to our needs and questions.' },
        { name: 'Patrick', country: { el: 'Ολλανδία', en: 'Netherlands', de: 'Niederlande', bg: 'Нидерландия', sr: 'Holandija', ru: 'Нидерланды' }, source: 'booking', lang: 'en',
          text: 'Very cosy place! Felt great there. Good beds, wifi, nice apartment, really. Close to beach boulevard. Great host communications.' },
      ],
      ratings: [
        { source: 'booking', score: 9.6, scale: 10, count: 43, url: 'https://www.booking.com/Share-rirvXiH' },
        { source: 'airbnb', score: 5, scale: 5, count: 13, url: 'https://www.airbnb.gr/rooms/1260155043819083529' },
        { source: 'google', score: 5, scale: 5, count: 2, url: 'https://maps.app.goo.gl/EFf2A32rm94A1Ebb6' },
      ],
    },
    {
      id: 'pilea',
      city: 'thessaloniki',
      name: 'Pilea Comfy Home',
      area: { el: 'Πυλαία, Θεσσαλονίκη', en: 'Pylaia, Thessaloniki', de: 'Pylaia, Thessaloniki', bg: 'Пилея, Солун', sr: 'Pilea, Solun', ru: 'Пилеа, Салоники' },
      tagline: {
        el: 'Ευρύχωρο σπίτι 87 τ.μ. σε ήσυχη γειτονιά, με δωρεάν πάρκινγκ.', en: 'A spacious 87 m² home in a quiet neighbourhood, with free parking.',
        de: 'Geräumiges 87-m²-Zuhause in ruhiger Gegend, mit kostenlosem Parkplatz.', bg: 'Просторен дом от 87 м² в тих квартал, с безплатен паркинг.',
        sr: 'Prostran dom od 87 m² u mirnom kraju, sa besplatnim parkingom.', ru: 'Просторный дом 87 м² в тихом районе, с бесплатной парковкой.',
      },
      description: {
        el: 'Ευρύχωρο, φωτεινό διαμέρισμα 87 τ.μ. στην Πυλαία, σε ήσυχη γειτονιά κοντά στην περιφερειακή, λίγα λεπτά με το αυτοκίνητο από το κέντρο της Θεσσαλονίκης.\n\nΜεγάλο σαλόνι με μεγάλο γωνιακό καναπέ, όπου μπορεί να κοιμηθεί και κάποιος, μεγάλη τηλεόραση και τραπεζαρία. Πλήρως εξοπλισμένη κουζίνα με φούρνο, εστίες, ψυγείο, φούρνο μικροκυμάτων, πλυντήριο πιάτων και καφετιέρα.\n\nΔύο υπνοδωμάτια με διπλά κρεβάτια και πολλές ντουλάπες, και γωνιά με γραφείο.\n\nΜπάνιο με μπανιέρα και ξεχωριστό WC. Πλυντήριο και στεγνωτήριο ρούχων.\n\nΜπαλκόνι με τραπέζι και καρέκλες, κεντρική θέρμανση και κλιματισμός.',
        en: 'A spacious, bright 87 m² apartment in Pylaia, in a quiet neighbourhood close to the ring road, a few minutes by car from the centre of Thessaloniki.\n\nA large living room with a large corner sofa, big enough to sleep on, a large TV and a dining table. Fully equipped kitchen with oven, hob, fridge, microwave, dishwasher and coffee machine.\n\nTwo bedrooms with double beds and plenty of wardrobe space, plus a corner with a desk.\n\nA bathroom with a bathtub and a separate WC. Washing machine and tumble dryer.\n\nA balcony with a table and chairs, central heating and air conditioning.',
        de: 'Geräumige, helle 87-m²-Wohnung in Pylaia, in ruhiger Gegend nahe der Ringstraße, wenige Autominuten vom Zentrum Thessalonikis.\n\nGroßes Wohnzimmer mit großem Ecksofa, auf dem man auch schlafen kann, großem Fernseher und Esstisch. Voll ausgestattete Küche mit Backofen, Kochfeld, Kühlschrank, Mikrowelle, Geschirrspüler und Kaffeemaschine.\n\nZwei Schlafzimmer mit Doppelbetten und viel Schrankraum sowie eine Ecke mit Schreibtisch.\n\nBad mit Badewanne und separates WC. Waschmaschine und Wäschetrockner.\n\nBalkon mit Tisch und Stühlen, Zentralheizung und Klimaanlage.',
        bg: 'Просторен, светъл апартамент от 87 м² в Пилея, в тих квартал близо до околовръстния път, на няколко минути с кола от центъра на Солун.\n\nГоляма дневна с голям ъглов диван, на който може и да се спи, голям телевизор и маса за хранене. Напълно оборудвана кухня с фурна, котлони, хладилник, микровълнова, съдомиялна и кафемашина.\n\nДве спални с двойни легла и много гардероби, плюс кът с бюро.\n\nБаня с вана и отделна тоалетна. Пералня и сушилня.\n\nБалкон с маса и столове, централно отопление и климатик.',
        sr: 'Prostran, svetao stan od 87 m² u Pilei, u mirnom kraju blizu obilaznice, nekoliko minuta kolima od centra Soluna.\n\nVeliki dnevni boravak sa velikom ugaonom garniturom, na kojoj se može i spavati, velikim televizorom i trpezarijskim stolom. Potpuno opremljena kuhinja sa rernom, pločom, frižiderom, mikrotalasnom, mašinom za sudove i aparatom za kafu.\n\nDve spavaće sobe sa bračnim krevetima i mnogo ormara, kao i kutak sa radnim stolom.\n\nKupatilo sa kadom i odvojen toalet. Mašina za pranje i mašina za sušenje veša.\n\nBalkon sa stolom i stolicama, centralno grejanje i klima-uređaj.',
        ru: 'Просторная светлая квартира 87 м² в Пилее, в тихом районе у кольцевой дороги, в нескольких минутах езды от центра Салоник.\n\nБольшая гостиная с большим угловым диваном, на котором можно и спать, большим телевизором и обеденным столом. Полностью оборудованная кухня с духовкой, варочной панелью, холодильником, микроволновкой, посудомоечной машиной и кофемашиной.\n\nДве спальни с двуспальными кроватями и вместительными шкафами, а также уголок с рабочим столом.\n\nВанная комната с ванной и отдельный туалет. Стиральная и сушильная машины.\n\nБалкон со столом и стульями, центральное отопление и кондиционер.',
      },
      maxGuests: 5, bedrooms: 2, beds: 2, baths: 1, size: 87,
      fromPrice: 60,
      checkin: '15:00', checkout: '11:00',
      parking: {
        el: 'Δωρεάν ιδιωτικό πάρκινγκ στον χώρο του καταλύματος.', en: 'Free private parking on site.', de: 'Kostenloser privater Parkplatz auf dem Grundstück.',
        bg: 'Безплатен частен паркинг в имота.', sr: 'Besplatan privatni parking u okviru objekta.', ru: 'Бесплатная частная парковка на территории.',
      },
      amenities: ['balcony', 'wifi', 'ac', 'heating', 'tv', 'kitchen', 'coffee', 'microwave', 'dishwasher', 'washer', 'dryer', 'desk', 'linens', 'towels', 'toiletries', 'parking', 'elevator', 'pets', 'crib'],
      // Η πρώτη φωτογραφία είναι αυτή της αρχικής. Για κάθε NN.jpg υπάρχει και μικρότερο NN-s.jpg.
      photos: Array.from({ length: 14 }, (_, i) => `img/pilea/${String(i + 1).padStart(2, '0')}.jpg`),
      ama: '',
      address: { el: 'Σταδίου 46, 555 35 Πυλαία', en: 'Stadiou 46, 555 35 Pylaia' },
      mapsUrl: 'https://maps.app.goo.gl/PsLtHK5NSG23bxjeA',
      mapCenter: [40.6007727, 22.9946931],
      reviews: [
        { name: 'Παναγιώτης', source: 'google', score: 5, scale: 5, lang: 'el',
          text: 'Καταπληκτικό διαμέρισμα! Πεντακάθαρο και πλήρως εξοπλισμένο, δεν του λείπει τίποτα! Τα παιδιά έχουν κάνει καταπληκτική δουλειά, έχουν προσέξει και την παραμικρή λεπτομέρεια. Ίσως το καλύτερο διαμέρισμα βραχείας μίσθωσης που έχω μείνει ποτέ! Θα είναι η πρώτη μου επιλογή όταν θα έρχομαι στη Θεσσαλονίκη.' },
        { name: 'Krotidas', country: { el: 'Γερμανία', en: 'Germany', de: 'Deutschland', bg: 'Германия', sr: 'Nemačka', ru: 'Германия' }, source: 'booking', lang: 'en',
          text: 'The Comfy House was one of the best apartments we stayed in. You have everything you need and more. The hostess was always there if we needed anything. We recommend it without a single doubt.' },
        { name: 'Eleni', country: { el: 'Ελλάδα', en: 'Greece', de: 'Griechenland', bg: 'Гърция', sr: 'Grčka', ru: 'Греция' }, source: 'booking', lang: 'en',
          text: 'Clean and well equipped. Comfortable for a whole family. The owner replied to every request immediately and was interested in asking us whether we needed anything else.' },
        { name: 'Ιγνάτιος', source: 'google', score: 5, scale: 5, lang: 'el',
          text: 'Καταπληκτικό κατάλυμα το οποίο παρέχει όλες τις ανέσεις. Νιώθεις πραγματικά σαν το σπίτι σου. Ευγενέστατος και εξυπηρετικότατος ιδιοκτήτης! Εξαιρετική επιλογή, εννοείται 5 αστέρια, αν μπορούσα θα έβαζα και περισσότερα!' },
        { name: 'Alessandro', country: { el: 'Ιταλία', en: 'Italy', de: 'Italien', bg: 'Италия', sr: 'Italija', ru: 'Италия' }, source: 'booking', lang: 'en',
          text: 'Everything was perfect! The place has everything one could need to have a nice stay, it’s quite near the city center of Thessaloniki and the surrounding area is very quiet. The owner is very nice and helpful!' },
        { name: 'Ozan', country: { el: 'Τουρκία', en: 'Turkey', de: 'Türkei', bg: 'Турция', sr: 'Turska', ru: 'Турция' }, source: 'booking', lang: 'en',
          text: 'Everything was wonderful. Clean and comfortable. Everything you could possibly need was available. The host was even ready to help if you needed anything else.' },
        { name: 'Harv', country: { el: 'Ηνωμένο Βασίλειο', en: 'United Kingdom', de: 'Vereinigtes Königreich', bg: 'Обединено кралство', sr: 'Ujedinjeno Kraljevstvo', ru: 'Великобритания' }, source: 'booking', lang: 'en',
          text: 'Well equipped with nearly everything you need, place stayed cool despite extremely hot weather. Hosts provided an easy check in process and had good, responsive communication and messaged to see how we were getting on. Would happily stay again.' },
      ],
      ratings: [
        { source: 'booking', score: 9.9, scale: 10, count: 71, url: 'https://www.booking.com/Share-XdaSOF' },
        { source: 'airbnb', score: 5, scale: 5, count: 9, url: 'https://www.airbnb.gr/rooms/1251493509581383775' },
        { source: 'google', score: 5, scale: 5, count: 17, url: 'https://maps.app.goo.gl/PsLtHK5NSG23bxjeA' },
      ],
    },
    {
      id: 'siatista-1',
      city: 'siatista',
      name: 'Suite Apartment Siatista',
      area: { el: 'Σιάτιστα, Κοζάνη', en: 'Siatista, Kozani', de: 'Siatista, Kozani', bg: 'Сятища, Козани', sr: 'Sjatista, Kozani', ru: 'Сьятиста, Козани' },
      tagline: {
        el: 'Δύο υπνοδωμάτια και μεγάλη ιδιωτική βεράντα.', en: 'Two bedrooms and a large private terrace.',
        de: 'Zwei Schlafzimmer und eine große private Terrasse.', bg: 'Две спални и голяма самостоятелна тераса.',
        sr: 'Dve spavaće sobe i velika privatna terasa.', ru: 'Две спальни и большая собственная терраса.',
      },
      description: {
        el: 'Μοντέρνο, προσεγμένο διαμέρισμα με δύο υπνοδωμάτια και μεγάλη ιδιωτική βεράντα, στη Σιάτιστα.\n\nΕνιαίο σαλόνι με γωνιακό καναπέ που ανοίγει σε κρεβάτι, τραπεζαρία και μεγάλη τηλεόραση. Η κουζίνα έχει φούρνο, εστίες, ψυγείο και καφετιέρα Nespresso.\n\nΤο πρώτο υπνοδωμάτιο έχει διπλό κρεβάτι με ξύλινο κεφαλάρι, γραφείο, τηλεόραση και πόρτα προς τη βεράντα. Το δεύτερο έχει διπλό κρεβάτι, τηλεόραση και φωτιστικά κομοδίνου που αλλάζουν χρώμα.\n\nΜοντέρνο μπάνιο με στήλη ντους, ξύλινο πάγκο και φωτιζόμενο καθρέφτη, με πετσέτες και προϊόντα περιποίησης.\n\nΗ μεγάλη βεράντα, με τραπέζι και καρέκλες, είναι ιδανική για τον πρωινό καφέ. Στη διάθεσή σας επίσης πλυντήριο ρούχων, σίδερο, σεσουάρ και χρηματοκιβώτιο.',
        en: 'A modern, carefully finished apartment with two bedrooms and a large private terrace in Siatista.\n\nOpen living room with a corner sofa that opens into a bed, a dining table and a large TV. The kitchen has an oven, hob, fridge and a Nespresso machine.\n\nThe first bedroom has a double bed with a wooden headboard, a desk, a TV and a door to the terrace. The second has a double bed, a TV and colour-changing bedside lamps.\n\nA modern bathroom with a shower column, a wooden vanity and a backlit mirror, with towels and toiletries.\n\nThe large terrace, with a table and chairs, is perfect for your morning coffee. Also available: washing machine, iron, hair dryer and a safe.',
        de: 'Moderne, sorgfältig eingerichtete Wohnung mit zwei Schlafzimmern und einer großen privaten Terrasse in Siatista.\n\nOffener Wohnbereich mit ausziehbarem Ecksofa, Esstisch und großem Fernseher. Die Küche hat Backofen, Kochfeld, Kühlschrank und eine Nespresso-Maschine.\n\nDas erste Schlafzimmer hat ein Doppelbett mit Holzkopfteil, einen Schreibtisch, einen Fernseher und eine Tür zur Terrasse. Das zweite hat ein Doppelbett, einen Fernseher und Nachttischlampen mit Farbwechsel.\n\nModernes Bad mit Duschsäule, Waschtisch aus Holz und beleuchtetem Spiegel, mit Handtüchern und Pflegeprodukten.\n\nDie große Terrasse mit Tisch und Stühlen ist ideal für den Morgenkaffee. Außerdem vorhanden: Waschmaschine, Bügeleisen, Haartrockner und Safe.',
        bg: 'Модерен, грижливо обзаведен апартамент с две спални и голяма самостоятелна тераса в Сятища.\n\nОбединена дневна с разтегателен ъглов диван, маса за хранене и голям телевизор. Кухнята има фурна, котлони, хладилник и кафемашина Nespresso.\n\nПървата спалня е с двойно легло с дървена табла, бюро, телевизор и врата към терасата. Втората е с двойно легло, телевизор и нощни лампи, които сменят цвета си.\n\nМодерна баня с душ колона, дървен плот и осветено огледало, с хавлии и козметика.\n\nГолямата тераса с маса и столове е идеална за сутрешното кафе. На ваше разположение са още пералня, ютия, сешоар и сейф.',
        sr: 'Moderan, pažljivo uređen stan sa dve spavaće sobe i velikom privatnom terasom u Sjatisti.\n\nDnevni boravak sa ugaonom garniturom na razvlačenje, trpezarijskim stolom i velikim televizorom. Kuhinja ima rernu, ploču za kuvanje, frižider i Nespresso aparat.\n\nPrva spavaća soba ima bračni krevet sa drvenim uzglavljem, radni sto, televizor i vrata ka terasi. Druga ima bračni krevet, televizor i noćne lampe koje menjaju boju.\n\nModerno kupatilo sa tuš stubom, drvenim pultom i osvetljenim ogledalom, sa peškirima i kozmetikom.\n\nVelika terasa sa stolom i stolicama idealna je za jutarnju kafu. Na raspolaganju su i mašina za veš, pegla, fen i sef.',
        ru: 'Современная, продуманно обставленная квартира с двумя спальнями и большой собственной террасой в Сьятисте.\n\nГостиная с раскладным угловым диваном, обеденным столом и большим телевизором. На кухне есть духовка, варочная панель, холодильник и кофемашина Nespresso.\n\nВ первой спальне двуспальная кровать с деревянным изголовьем, рабочий стол, телевизор и выход на террасу. Во второй двуспальная кровать, телевизор и прикроватные лампы со сменой цвета.\n\nСовременная ванная с душевой панелью, деревянной столешницей и зеркалом с подсветкой, с полотенцами и средствами по уходу.\n\nБольшая терраса со столом и стульями идеально подходит для утреннего кофе. Также есть стиральная машина, утюг, фен и сейф.',
      },
      maxGuests: 6, bedrooms: 2, beds: 2, sofaBeds: 1, baths: 1, size: 60,
      parking: {
        el: 'Δωρεάν δημόσιο πάρκινγκ ακριβώς δίπλα στο σπίτι.', en: 'Free public parking right next to the house.',
        de: 'Kostenlose öffentliche Parkplätze direkt neben dem Haus.', bg: 'Безплатен обществен паркинг точно до къщата.',
        sr: 'Besplatan javni parking odmah pored kuće.', ru: 'Бесплатная общественная парковка прямо рядом с домом.',
      },
      fromPrice: 55,
      checkin: '15:00', checkout: '11:00',
      amenities: ['terrace', 'wifi', 'ac', 'heating', 'tv', 'kitchen', 'coffee', 'washer', 'iron', 'hairdryer', 'safe', 'sofabed', 'desk', 'moodlights', 'linens', 'towels', 'bathrobes', 'toiletries', 'dental', 'parking', 'pets', 'crib'],
      // Η πρώτη φωτογραφία είναι αυτή της αρχικής. Για κάθε NN.jpg υπάρχει και μικρότερο NN-s.jpg.
      photos: Array.from({ length: 23 }, (_, i) => `img/siatista-suite/${String(i + 1).padStart(2, '0')}.jpg`),
      ama: '',
      address: { el: 'Μητροπόλεως 19, 503 00 Σιάτιστα', en: 'Mitropoleos 19, 503 00 Siatista' },
      placeId: 'ChIJwYJvIQDDWRMR594w0YiRvIA',
      mapsUrl: 'https://maps.app.goo.gl/9EQoVmKcsPJFKXEv9',
      mapCenter: [40.2629021, 21.5477052], // ο χάρτης φορτώνει ζωντανά από το OpenStreetMap
      // Οδική απόσταση (μέτρα) και χρόνος με αυτοκίνητο (λεπτά), κατά προσέγγιση
      nearby: [
        { city: { el: 'Γρεβενά', en: 'Grevena', de: 'Grevena', bg: 'Гревена', sr: 'Grevena', ru: 'Гревена' }, meters: 28800, drive: 22 },
        { city: { el: 'Κοζάνη', en: 'Kozani', de: 'Kozani', bg: 'Козани', sr: 'Kozani', ru: 'Козани' }, meters: 27300, drive: 25 },
        { city: { el: 'Καστοριά', en: 'Kastoria', de: 'Kastoria', bg: 'Костур (Кастория)', sr: 'Kastorija', ru: 'Кастория' }, meters: 49500, drive: 36 },
      ],
      reviews: [
        { name: 'Dimitris', source: 'google', score: 5, scale: 5, lang: 'el',
          text: 'Άψογο κατάλυμα, τίμιες παροχές, υπέροχοι ιδιοκτήτες. Πεντακάθαρο και πανέμορφο.' },
        { name: 'Aneta', country: { el: 'Πολωνία', en: 'Poland', de: 'Polen', bg: 'Полша', sr: 'Poljska', ru: 'Польша' }, source: 'booking', lang: 'en',
          text: 'Very cosy two bedroom apartment. The landlady was super nice and helpful. Public parking nearby is visible from one of the bedrooms. We received wine as a gift which was very pleasant :) highly recommend staying there.' },
        { name: 'Antonis', source: 'airbnb', date: '2025-04', lang: 'el',
          text: 'Ο χώρος εξαιρετικός, με όλες τις απαραίτητες παροχές, καινούργιος και πολύ καλά συντηρημένος. Το σπίτι είναι πραγματικά στολίδι, χωρίς να έχει φτιαχτεί πρόχειρα για να εξυπηρετήσει ανάγκες Airbnb. Είναι φτιαγμένος με προσοχή και μεράκι. Η δε οικοδέσποινα, Ουράνια, πάντα σαφής με τις οδηγίες και προνοητική ώστε να μην λείψει τίποτα. Πάντα ευέλικτη και εξυπηρετικότατη όταν χρειάστηκε.' },
        { name: 'Stoian', country: { el: 'Ρουμανία', en: 'Romania', de: 'Rumänien', bg: 'Румъния', sr: 'Rumunija', ru: 'Румыния' }, source: 'booking', lang: 'en',
          text: 'The house has very detailed design, comfortable and warm. We felt really welcome because the host is very friendly and careful.' },
        { name: 'Patrycja', source: 'google', score: 5, scale: 5, lang: 'el',
          text: 'Πολύ όμορφο διαμέρισμα, με όλες τις ανέσεις, σε καλή τοποθεσία και εύκολο πάρκινγκ. Φαίνεται πρόσφατα ανακαινισμένο και φτιαγμένο με μεράκι. Η οικοδέσποινα, η κυρία Ουρανία, πολύ ευγενική και πρόθυμη να μας βοηθήσει σε ό,τι χρειαζόμασταν. Περάσαμε τέλεια, το συνιστώ ανεπιφύλακτα.' },
        { name: 'Yana', country: { el: 'Βουλγαρία', en: 'Bulgaria', de: 'Bulgarien', bg: 'България', sr: 'Bugarska', ru: 'Болгария' }, source: 'booking', lang: 'en',
          text: 'Excellent apartment with everything you need. Clean and new. The host was very nice and responsive.' },
        { name: 'Στυλιανός', source: 'airbnb', date: '2026-01', lang: 'el',
          text: 'Πανέμορφο και πλήρως ανακαινισμένο διαμέρισμα σε ήσυχη περιοχή, ιδανικό για όλους όσους πρόκειται να επισκεφθούν τη Σιάτιστα!' },
        { name: 'Νικόλαος', source: 'google', score: 5, scale: 5, lang: 'el',
          text: 'Ένα από τα καλύτερα διαμερίσματα που έχουμε μείνει. Ιδιοκτήτης πολύ ευγενικός και εξυπηρέτηση άψογη. Τα δωμάτια ήσυχα και πεντακάθαρα με πλήρη εξοπλισμό. Η προφανής ανακαίνιση καταπληκτική, με ιδιαίτερο γούστο. Εύκολο πάρκινγκ σε ένα όμορφο σημείο της πόλης. Σίγουρα θα έρθουμε ξανά!' },
        { name: 'Manolache', country: { el: 'Ρουμανία', en: 'Romania', de: 'Rumänien', bg: 'Румъния', sr: 'Rumunija', ru: 'Румыния' }, source: 'booking', lang: 'en',
          text: 'Everything was beautiful. Beautiful and cozy apartment, plenty of space for a big family. Clean, warm, situated in an area with a lot of places where you can eat.' },
      ],
      ratings: [
        { source: 'booking', score: 9.7, scale: 10, count: 44, url: 'https://www.booking.com/Share-3Y76pA' },
        { source: 'airbnb', score: 4.97, scale: 5, count: 34, url: 'https://www.airbnb.gr/rooms/769218011856546126' },
        { source: 'google', score: 5, scale: 5, count: 5, url: 'https://maps.app.goo.gl/9EQoVmKcsPJFKXEv9' },
      ],
    },
    {
      id: 'siatista-2',
      city: 'siatista',
      name: 'Guest House Siatista',
      area: { el: 'Σιάτιστα, Κοζάνη', en: 'Siatista, Kozani', de: 'Siatista, Kozani', bg: 'Сятища, Козани', sr: 'Sjatista, Kozani', ru: 'Сьятиста, Козани' },
      tagline: {
        el: 'Ευρύχωρο σπίτι 110 τ.μ. για έως 8 άτομα, δίπλα στην πλατεία.', en: 'A spacious 110 m² home for up to 8 guests, next to the square.',
        de: 'Geräumiges Haus mit 110 m² für bis zu 8 Gäste, direkt am Platz.', bg: 'Просторна къща от 110 м² за до 8 души, до площада.',
        sr: 'Prostrana kuća od 110 m² za do 8 osoba, pored trga.', ru: 'Просторный дом 110 м² для 8 гостей, рядом с площадью.',
      },
      description: {
        el: 'Ευρύχωρο σπίτι 110 τ.μ. στο κέντρο της Σιάτιστας, δίπλα στην πλατεία, με εστιατόρια, καφετέριες και φούρνο σε λίγα βήματα. Ιδανικό για οικογένειες και παρέες.\n\nΜεγάλο σαλόνι με παραδοσιακά ξύλινα έπιπλα, καναπέ που ανοίγει σε κρεβάτι, μεγάλη τηλεόραση, κλιματισμό και σκάκι για τα βράδια. Δίπλα, η τραπεζαρία και η κουζίνα με φούρνο, εστίες, ψυγείο, φούρνο μικροκυμάτων και καφετιέρα.\n\nΤρία υπνοδωμάτια με τηλεόραση: δύο με διπλό κρεβάτι, ένα με δύο μονά κρεβάτια και πολυθρόνα που ανοίγει σε κρεβάτι.\n\nΜεγάλο μπάνιο με μπανιέρα, πλυντήριο ρούχων, πετσέτες και προϊόντα περιποίησης.',
        en: 'A spacious 110 m² home in the centre of Siatista, next to the square, with restaurants, cafés and a bakery a few steps away. Ideal for families and groups.\n\nA large living room with traditional wooden furniture, a sofa that opens into a bed, a large TV, air conditioning and a chess set for the evenings. Next to it, the dining area and the kitchen with oven, hob, fridge, microwave and coffee machine.\n\nThree bedrooms with TV: two with a double bed, one with two single beds and an armchair that opens into a bed.\n\nA large bathroom with a bathtub, washing machine, towels and toiletries.',
        de: 'Geräumiges Haus mit 110 m² im Zentrum von Siatista, direkt am Platz, mit Restaurants, Cafés und einer Bäckerei nur wenige Schritte entfernt. Ideal für Familien und Gruppen.\n\nGroßes Wohnzimmer mit traditionellen Holzmöbeln, ausziehbarem Sofa, großem Fernseher, Klimaanlage und einem Schachspiel für die Abende. Daneben Essbereich und Küche mit Backofen, Kochfeld, Kühlschrank, Mikrowelle und Kaffeemaschine.\n\nDrei Schlafzimmer mit Fernseher: zwei mit Doppelbett, eines mit zwei Einzelbetten und einem ausziehbaren Sessel.\n\nGroßes Bad mit Badewanne, Waschmaschine, Handtüchern und Pflegeprodukten.',
        bg: 'Просторна къща от 110 м² в центъра на Сятища, до площада, с ресторанти, кафенета и фурна на няколко крачки. Идеална за семейства и групи.\n\nГоляма дневна с традиционни дървени мебели, разтегателен диван, голям телевизор, климатик и шах за вечерите. До нея трапезарията и кухнята с фурна, котлони, хладилник, микровълнова и кафемашина.\n\nТри спални с телевизор: две с двойно легло, една с две единични легла и разтегателно кресло.\n\nГоляма баня с вана, пералня, хавлии и козметика.',
        sr: 'Prostrana kuća od 110 m² u centru Sjatiste, pored trga, sa restoranima, kafićima i pekarom na nekoliko koraka. Idealna za porodice i društva.\n\nVeliki dnevni boravak sa tradicionalnim drvenim nameštajem, kaučem na razvlačenje, velikim televizorom, klima-uređajem i šahom za večeri. Pored njega trpezarija i kuhinja sa rernom, pločom za kuvanje, frižiderom, mikrotalasnom i aparatom za kafu.\n\nTri spavaće sobe sa televizorom: dve sa bračnim krevetom, jedna sa dva kreveta za jednu osobu i foteljom na razvlačenje.\n\nVeliko kupatilo sa kadom, mašinom za veš, peškirima i kozmetikom.',
        ru: 'Просторный дом 110 м² в центре Сьятисты, рядом с площадью: рестораны, кафе и пекарня в нескольких шагах. Идеально для семей и компаний.\n\nБольшая гостиная с традиционной деревянной мебелью, раскладным диваном, большим телевизором, кондиционером и шахматами для вечеров. Рядом столовая и кухня с духовкой, варочной панелью, холодильником, микроволновкой и кофемашиной.\n\nТри спальни с телевизором: две с двуспальной кроватью, одна с двумя односпальными кроватями и раскладным креслом.\n\nБольшая ванная с ванной, стиральной машиной, полотенцами и средствами по уходу.',
      },
      maxGuests: 8, bedrooms: 3, beds: 4, sofaBeds: 2, baths: 1, size: 110,
      fromPrice: 80,
      checkin: '15:00', checkout: '11:00',
      parking: {
        el: 'Δωρεάν πάρκινγκ στον δρόμο και σε δημόσιο χώρο στάθμευσης κοντά.', en: 'Free street parking and a free public car park nearby.',
        de: 'Kostenlose Parkplätze an der Straße und ein kostenloser öffentlicher Parkplatz in der Nähe.', bg: 'Безплатно паркиране на улицата и безплатен обществен паркинг наблизо.',
        sr: 'Besplatan parking na ulici i besplatan javni parking u blizini.', ru: 'Бесплатная парковка на улице и бесплатная общественная стоянка рядом.',
      },
      amenities: ['wifi', 'ac', 'heating', 'tv', 'kitchen', 'coffee', 'microwave', 'washer', 'sofabed', 'linens', 'towels', 'toiletries', 'welcome', 'parking', 'pets', 'crib'],
      // Η πρώτη φωτογραφία είναι αυτή της αρχικής. Για κάθε NN.jpg υπάρχει και μικρότερο NN-s.jpg.
      photos: Array.from({ length: 13 }, (_, i) => `img/siatista-guesthouse/${String(i + 1).padStart(2, '0')}.jpg`),
      ama: '',
      address: { el: 'Πλατεία 3 Πηγάδια 19, 503 00 Σιάτιστα', en: '3 Pigadia Square 19, 503 00 Siatista' },
      placeId: 'ChIJKxVI8SDDWRMRjYG2F6fIBnk',
      mapsUrl: 'https://maps.app.goo.gl/rFHc8WcvikyuNe837',
      mapCenter: [40.2630621, 21.5475534],
      nearby: [
        { city: { el: 'Γρεβενά', en: 'Grevena', de: 'Grevena', bg: 'Гревена', sr: 'Grevena', ru: 'Гревена' }, meters: 28800, drive: 22 },
        { city: { el: 'Κοζάνη', en: 'Kozani', de: 'Kozani', bg: 'Козани', sr: 'Kozani', ru: 'Козани' }, meters: 27300, drive: 25 },
        { city: { el: 'Καστοριά', en: 'Kastoria', de: 'Kastoria', bg: 'Костур (Кастория)', sr: 'Kastorija', ru: 'Кастория' }, meters: 49500, drive: 36 },
      ],
      reviews: [
        { name: 'Chrysovelis', source: 'airbnb', date: '2025-12', lang: 'el',
          text: 'Πολύ καθαρό σπίτι, όπως ακριβώς φαίνεται στις φωτογραφίες. Μεγάλο σπίτι με 3 δωμάτια για 8 άτομα. Αρκετά μεγάλο μπάνιο. Θέρμανση όλη την ημέρα και πάντα ζεστό νερό. Συνεχής επικοινωνία της Ουρανίας και του Γιώργου για οποιοδήποτε θέμα. Μας άφησαν φαγώσιμα και 2 κρασιά για να απολαύσουμε. Πραγματικά από τις καλύτερες διαμονές που έχουμε βιώσει μέσω Airbnb.' },
        { name: 'Vicki', country: { el: 'Αυστραλία', en: 'Australia', de: 'Australien', bg: 'Австралия', sr: 'Australija', ru: 'Австралия' }, source: 'booking', lang: 'en',
          text: 'The location is fantastic for a stop over! The host was lovely, the home is beautiful and excellently maintained with everything you need. Very clean and the host George provides snacks, coffee, tea and other food to get you started.' },
        { name: 'Georgia', source: 'google', score: 5, scale: 5, lang: 'el',
          text: 'Πολύ ωραίο κατάλυμα, καθαρό, μείναμε 6 βράδια και δεν μας έλειψε τίποτα! Είναι δίπλα από την πλατεία, πιο πάνω υπάρχει ωραίο αρτοποιείο για το πρωινό μας, παντοπωλεία υπάρχουν πολλά στην περιοχή καθώς και εστιατόρια, καφετέριες. Συστήνεται!' },
        { name: 'Bryan', country: { el: 'Ηνωμένο Βασίλειο', en: 'United Kingdom', de: 'Vereinigtes Königreich', bg: 'Обединено кралство', sr: 'Ujedinjeno Kraljevstvo', ru: 'Великобритания' }, source: 'booking', lang: 'en',
          text: 'Very clean and comfortable apartment, very close to a wonderful taverna, Tria Pigadia. Hosts were attentive with excellent communication and made our stay very easy and straightforward. I would highly recommend.' },
        { name: 'Alin', source: 'airbnb', date: '2025-09', lang: 'el',
          text: 'Καταπληκτική διαμονή, όλα ήταν εξαιρετικά καθαρά, κρίμα που δεν μπορούσαμε να μείνουμε περισσότερο, καθώς το διαμέρισμα είναι πραγματικά καλά εξοπλισμένο. Υπάρχει δωρεάν πάρκινγκ στον δρόμο και επίσης δωρεάν πάρκινγκ κοντά. Υπάρχουν καλά εστιατόρια στην περιοχή.' },
        { name: 'Dimitris', source: 'google', score: 5, scale: 5, lang: 'el',
          text: 'Άψογο κατάλυμα, εξαιρετικές παροχές, υπέροχοι ιδιοκτήτες. Πεντακάθαρο και πανέμορφο. Το πιο σημαντικό: νιώθεις σαν το σπίτι σου ακόμη και στο ταξίδι.' },
        { name: 'Γιάννης', source: 'airbnb', date: '2025-06', lang: 'el',
          text: 'Εξαιρετικός χώρος, όλα πεντακάθαρα και τακτοποιημένα, πλήρως λειτουργικό σπίτι με όλες τις συσκευές που χρειάζονται. Άψογη εξυπηρέτηση και επικοινωνία, σας ευχαριστούμε πάρα πολύ!' },
        { name: 'Сергей', source: 'airbnb', date: '2026-09', lang: 'el',
          text: 'Υπέροχο διαμέρισμα, με καλή τοποθεσία και εξοπλισμένο με όλα τα απαραίτητα για τη διαμονή. Μας άρεσαν όλα. Η οικοδέσποινα είναι φιλική και πάντα διαθέσιμη. Σίγουρα θα επιστρέψουμε αν έχουμε την ευκαιρία.' },
      ],
      ratings: [
        { source: 'booking', score: 9.8, scale: 10, count: 56, url: 'https://www.booking.com/Share-Kdcena' },
        { source: 'airbnb', score: 4.96, scale: 5, count: 27, url: 'https://www.airbnb.gr/rooms/628059743946227371' },
        { source: 'google', score: 4.9, scale: 5, count: 47, url: 'https://maps.app.goo.gl/rFHc8WcvikyuNe837' },
      ],
    },
  ],

  // Κανόνες — εμφανίζονται στη σελίδα Όρων και στη σελίδα κάθε καταλύματος
  policies: {
    house: {
      el: 'Τα κατοικίδια είναι ευπρόσδεκτα. Το κάπνισμα επιτρέπεται μόνο στο μπαλκόνι, όχι μέσα στο σπίτι. Δεν επιτρέπονται πάρτι και εκδηλώσεις. Ώρες κοινής ησυχίας 23:00–08:00. Βρεφικό παρκοκρέβατο διαθέσιμο δωρεάν: γράψτε μας στο μήνυμα της κράτησης.',
      en: 'Pets are welcome. Smoking is allowed only on the balcony, not indoors. No parties or events. Quiet hours 23:00–08:00. A baby travel cot is available free of charge: mention it in your booking message.',
      de: 'Haustiere sind willkommen. Rauchen ist nur auf dem Balkon erlaubt, nicht in der Wohnung. Keine Partys oder Veranstaltungen. Nachtruhe 23:00–08:00 Uhr. Ein Babyreisebett steht kostenlos zur Verfügung: Geben Sie es in Ihrer Buchungsnachricht an.',
      bg: 'Домашните любимци са добре дошли. Пушенето е разрешено само на балкона, не вътре. Без партита и събития. Тишина от 23:00 до 08:00. Бебешка кошара се предоставя безплатно: споменете го в съобщението към резервацията.',
      sr: 'Kućni ljubimci su dobrodošli. Pušenje je dozvoljeno samo na balkonu, ne unutra. Zabave i događaji nisu dozvoljeni. Tišina od 23:00 do 08:00. Bebi krevetac je besplatno na raspolaganju: navedite to u poruci uz rezervaciju.',
      ru: 'Можно с домашними животными. Курить можно только на балконе, не в помещении. Вечеринки и мероприятия запрещены. Тишина с 23:00 до 08:00. Детская кроватка предоставляется бесплатно: укажите это в сообщении к бронированию.',
    },
  },
};
