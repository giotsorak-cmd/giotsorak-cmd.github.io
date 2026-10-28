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
        el: 'Φωτεινό, πλήρως ανακαινισμένο διαμέρισμα 60 τ.μ. με πανοραμική θέα σε όλη τη Θεσσαλονίκη, από τον Πύργο του ΟΤΕ μέχρι την Άνω Πόλη, και τη θάλασσα στο βάθος του ορίζοντα.\n\nΕνιαίο σαλόνι και τραπεζαρία με ξύλινο πάτωμα, ηλεκτρικό τζάκι και μεγάλη τηλεόραση. Ο καναπές ανοίγει σε κρεβάτι.\n\nΔύο υπνοδωμάτια με τηλεόραση και κλιματισμό: το πρώτο με διπλό κρεβάτι 160×200, γραφείο και έξοδο στο μπαλκόνι, το δεύτερο με διπλό κρεβάτι 140×200. Φιλοξενεί έως 6 άτομα.\n\nΕξοπλισμένη κουζίνα με φούρνο, κεραμικές εστίες, ψυγείο, φούρνο μικροκυμάτων, καφετιέρα Nespresso, βραστήρα και τοστιέρα, και μπαράκι για πρωινό.\n\nΜοντέρνο μπάνιο με ντους-βροχή, πετσέτες, μπουρνούζια και προϊόντα περιποίησης.\n\nΤο μπαλκόνι, με τραπεζάκι και καρέκλες, βλέπει την πόλη: ιδανικό για τον πρωινό καφέ ή ένα ποτήρι κρασί το βράδυ.',
        en: 'A bright, fully renovated 60 m² apartment with a panoramic view over the whole of Thessaloniki, from the OTE Tower to the Upper Town, and the sea on the horizon.\n\nOpen living and dining room with wooden floors, an electric fireplace and a large TV. The sofa opens into a bed.\n\nTwo bedrooms with TV and air conditioning: the first with a 160×200 double bed, a desk and access to the balcony, the second with a 140×200 double bed. Sleeps up to 6.\n\nEquipped kitchen with oven, ceramic hob, fridge, microwave, Nespresso machine, kettle and toaster, plus a breakfast bar.\n\nA modern bathroom with a rain shower, towels, bathrobes and toiletries.\n\nThe balcony, with a small table and chairs, looks out over the city: perfect for morning coffee or a glass of wine in the evening.',
        de: 'Helle, komplett renovierte Wohnung mit 60 m² und Panoramablick über ganz Thessaloniki, vom OTE-Turm bis zur Oberstadt, und das Meer am Horizont.\n\nOffener Wohn- und Essbereich mit Holzboden, elektrischem Kamin und großem Fernseher. Das Sofa lässt sich zum Bett ausziehen.\n\nZwei Schlafzimmer mit Fernseher und Klimaanlage: das erste mit Doppelbett 160×200, Schreibtisch und Zugang zum Balkon, das zweite mit Doppelbett 140×200. Platz für bis zu 6 Personen.\n\nAusgestattete Küche mit Backofen, Ceranfeld, Kühlschrank, Mikrowelle, Nespresso-Maschine, Wasserkocher und Toaster sowie eine Frühstückstheke.\n\nModernes Bad mit Regendusche, Handtüchern, Bademänteln und Pflegeprodukten.\n\nDer Balkon mit Tisch und Stühlen blickt über die Stadt: ideal für den Morgenkaffee oder ein Glas Wein am Abend.',
        bg: 'Светъл, изцяло ремонтиран апартамент от 60 м² с панорамна гледка към цял Солун, от кулата на ОТЕ до Горния град, и морето на хоризонта.\n\nОбединени дневна и трапезария с дървен под, електрическа камина и голям телевизор. Диванът се разтяга в легло.\n\nДве спални с телевизор и климатик: първата с двойно легло 160×200, бюро и излаз на балкона, втората с двойно легло 140×200. Побира до 6 души.\n\nОборудвана кухня с фурна, керамични котлони, хладилник, микровълнова, кафемашина Nespresso, кана за вода и тостер, плюс бар плот за закуска.\n\nМодерна баня с душ тип „дъжд“, хавлии, халати и козметика.\n\nБалконът с масичка и столове гледа към града: идеален за сутрешното кафе или чаша вино вечер.',
        sr: 'Svetao, potpuno renoviran stan od 60 m² sa panoramskim pogledom na ceo Solun, od OTE tornja do Gornjeg grada, i more na horizontu.\n\nSpojeni dnevni boravak i trpezarija sa drvenim podom, električnim kaminom i velikim televizorom. Kauč se razvlači u krevet.\n\nDve spavaće sobe sa televizorom i klima-uređajem: prva sa bračnim krevetom 160×200, radnim stolom i izlazom na balkon, druga sa bračnim krevetom 140×200. Prima do 6 osoba.\n\nOpremljena kuhinja sa rernom, keramičkom pločom, frižiderom, mikrotalasnom, Nespresso aparatom, kuvalom za vodu i tosterom, kao i šankom za doručak.\n\nModerno kupatilo sa tušem sa kišnom ružom, peškirima, bade-mantilima i kozmetikom.\n\nBalkon sa stočićem i stolicama gleda na grad: idealan za jutarnju kafu ili čašu vina uveče.',
        ru: 'Светлая квартира 60 м² с полным ремонтом с панорамным видом на все Салоники, от башни ОТЕ до Верхнего города, и с морем на горизонте.\n\nОбъединённые гостиная и столовая с деревянным полом, электрокамином и большим телевизором. Диван раскладывается в кровать.\n\nДве спальни с телевизором и кондиционером: в первой двуспальная кровать 160×200, рабочий стол и выход на балкон, во второй двуспальная кровать 140×200. Вмещает до 6 гостей.\n\nОборудованная кухня с духовкой, стеклокерамической плитой, холодильником, микроволновкой, кофемашиной Nespresso, чайником и тостером, а также барная стойка для завтрака.\n\nСовременная ванная с тропическим душем, полотенцами, халатами и средствами по уходу.\n\nС балкона со столиком и стульями открывается вид на город: идеально для утреннего кофе или бокала вина вечером.',
      },
      maxGuests: 6, bedrooms: 2, beds: 3, baths: 1, size: 60,
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
      area: { el: 'Βασιλίσσης Όλγας, Θεσσαλονίκη', en: 'Vasilissis Olgas Ave, Thessaloniki', bg: 'бул. Василисис Олгас, Солун', sr: 'Bulevar Vasilisis Olgas, Solun', ru: 'проспект Василиссис Ольгас, Салоники' },
      tagline: { el: 'Πέμπτος όροφος στη λεωφόρο Βασιλίσσης Όλγας.', en: 'Fifth floor on Vasilissis Olgas Avenue.' },
      description: {
        el: 'ΣΥΜΠΛΗΡΩΣΕ: περιγραφή του διαμερίσματος.',
        en: 'TO FILL IN: apartment description.',
      },
      maxGuests: 4, bedrooms: 1, beds: 2, baths: 1, size: 60,
      fromPrice: 65,
      checkin: '15:00', checkout: '11:00',
      parking: {
        el: 'Δεν υπάρχει ιδιωτικό πάρκινγκ.',
        en: 'No private parking.',
      },
      amenities: ['wifi', 'ac', 'kitchen', 'washer', 'tv', 'elevator', 'selfcheckin'],
      photos: [],
      ama: '',
    },
    {
      id: 'pilea',
      city: 'thessaloniki',
      name: 'Pilea Comfy Home',
      area: { el: 'Πυλαία, Θεσσαλονίκη', en: 'Pylaia, Thessaloniki', bg: 'Пилея, Солун', sr: 'Pilea, Solun', ru: 'Пилеа, Салоники' },
      tagline: { el: 'Ήσυχη γειτονιά, λίγα λεπτά από το κέντρο.', en: 'A quiet neighbourhood a few minutes from the centre.' },
      description: {
        el: 'ΣΥΜΠΛΗΡΩΣΕ: περιγραφή του σπιτιού.',
        en: 'TO FILL IN: home description.',
      },
      maxGuests: 4, bedrooms: 1, beds: 2, baths: 1, size: 50,
      fromPrice: 60,
      checkin: '15:00', checkout: '11:00',
      parking: { el: 'ΣΥΜΠΛΗΡΩΣΕ: πληροφορίες στάθμευσης.', en: 'TO FILL IN: parking information.' },
      amenities: ['wifi', 'ac', 'kitchen', 'washer', 'tv', 'selfcheckin'],
      photos: [],
      ama: '',
    },
    {
      id: 'siatista-1',
      city: 'siatista',
      name: 'Suite Apartment Siatista',
      area: { el: 'Σιάτιστα, Κοζάνη', en: 'Siatista, Kozani', de: 'Siatista, Kozani', bg: 'Сятища, Козани', sr: 'Sjatista, Kozani', ru: 'Сьятиста, Козани' },
      tagline: {
        el: 'Δύο υπνοδωμάτια και μεγάλη βεράντα με θέα στα αρχοντικά.', en: 'Two bedrooms and a large terrace overlooking the old mansions.',
        de: 'Zwei Schlafzimmer und eine große Terrasse mit Blick auf die alten Herrenhäuser.', bg: 'Две спални и голяма тераса с изглед към старите имения.',
        sr: 'Dve spavaće sobe i velika terasa sa pogledom na stare vile.', ru: 'Две спальни и большая терраса с видом на старинные особняки.',
      },
      description: {
        el: 'Μοντέρνο, προσεγμένο διαμέρισμα με δύο υπνοδωμάτια και μεγάλη ιδιωτική βεράντα, με θέα στα παραδοσιακά αρχοντικά της Σιάτιστας.\n\nΕνιαίο σαλόνι με γωνιακό καναπέ που ανοίγει σε κρεβάτι, τραπεζαρία και μεγάλη τηλεόραση. Φιλοξενεί έως 6 άτομα. Η κουζίνα έχει φούρνο, εστίες, ψυγείο και καφετιέρα Nespresso.\n\nΤο πρώτο υπνοδωμάτιο έχει διπλό κρεβάτι με ξύλινο κεφαλάρι, γραφείο, τηλεόραση και πόρτα προς τη βεράντα. Το δεύτερο έχει διπλό κρεβάτι, τηλεόραση και φωτιστικά κομοδίνου που αλλάζουν χρώμα.\n\nΜοντέρνο μπάνιο με στήλη ντους, ξύλινο πάγκο και φωτιζόμενο καθρέφτη, με πετσέτες και προϊόντα περιποίησης.\n\nΣτη βεράντα, με τραπέζι και καρέκλες, πίνετε τον καφέ σας ανάμεσα στα αρχοντικά. Στη διάθεσή σας επίσης πλυντήριο ρούχων, σίδερο, σεσουάρ και χρηματοκιβώτιο.',
        en: 'A modern, carefully finished apartment with two bedrooms and a large private terrace overlooking the traditional mansions of Siatista.\n\nOpen living room with a corner sofa that opens into a bed, a dining table and a large TV. Sleeps up to 6. The kitchen has an oven, hob, fridge and a Nespresso machine.\n\nThe first bedroom has a double bed with a wooden headboard, a desk, a TV and a door to the terrace. The second has a double bed, a TV and colour-changing bedside lamps.\n\nA modern bathroom with a shower column, a wooden vanity and a backlit mirror, with towels and toiletries.\n\nOn the terrace, with a table and chairs, you can enjoy your coffee among the old mansions. Also available: washing machine, iron, hair dryer and a safe.',
        de: 'Moderne, sorgfältig eingerichtete Wohnung mit zwei Schlafzimmern und einer großen privaten Terrasse mit Blick auf die traditionellen Herrenhäuser von Siatista.\n\nOffener Wohnbereich mit ausziehbarem Ecksofa, Esstisch und großem Fernseher. Platz für bis zu 6 Personen. Die Küche hat Backofen, Kochfeld, Kühlschrank und eine Nespresso-Maschine.\n\nDas erste Schlafzimmer hat ein Doppelbett mit Holzkopfteil, einen Schreibtisch, einen Fernseher und eine Tür zur Terrasse. Das zweite hat ein Doppelbett, einen Fernseher und Nachttischlampen mit Farbwechsel.\n\nModernes Bad mit Duschsäule, Waschtisch aus Holz und beleuchtetem Spiegel, mit Handtüchern und Pflegeprodukten.\n\nAuf der Terrasse mit Tisch und Stühlen genießen Sie Ihren Kaffee zwischen den alten Herrenhäusern. Außerdem vorhanden: Waschmaschine, Bügeleisen, Haartrockner und Safe.',
        bg: 'Модерен, грижливо обзаведен апартамент с две спални и голяма самостоятелна тераса с изглед към традиционните имения на Сятища.\n\nОбединена дневна с разтегателен ъглов диван, маса за хранене и голям телевизор. Побира до 6 души. Кухнята има фурна, котлони, хладилник и кафемашина Nespresso.\n\nПървата спалня е с двойно легло с дървена табла, бюро, телевизор и врата към терасата. Втората е с двойно легло, телевизор и нощни лампи, които сменят цвета си.\n\nМодерна баня с душ колона, дървен плот и осветено огледало, с хавлии и козметика.\n\nНа терасата с маса и столове пиете кафето си сред старите имения. На ваше разположение са още пералня, ютия, сешоар и сейф.',
        sr: 'Moderan, pažljivo uređen stan sa dve spavaće sobe i velikom privatnom terasom sa pogledom na tradicionalne vile Sjatiste.\n\nDnevni boravak sa ugaonom garniturom na razvlačenje, trpezarijskim stolom i velikim televizorom. Prima do 6 osoba. Kuhinja ima rernu, ploču za kuvanje, frižider i Nespresso aparat.\n\nPrva spavaća soba ima bračni krevet sa drvenim uzglavljem, radni sto, televizor i vrata ka terasi. Druga ima bračni krevet, televizor i noćne lampe koje menjaju boju.\n\nModerno kupatilo sa tuš stubom, drvenim pultom i osvetljenim ogledalom, sa peškirima i kozmetikom.\n\nNa terasi sa stolom i stolicama pijete kafu među starim vilama. Na raspolaganju su i mašina za veš, pegla, fen i sef.',
        ru: 'Современная, продуманно обставленная квартира с двумя спальнями и большой собственной террасой с видом на традиционные особняки Сьятисты.\n\nГостиная с раскладным угловым диваном, обеденным столом и большим телевизором. Вмещает до 6 гостей. На кухне есть духовка, варочная панель, холодильник и кофемашина Nespresso.\n\nВ первой спальне двуспальная кровать с деревянным изголовьем, рабочий стол, телевизор и выход на террасу. Во второй двуспальная кровать, телевизор и прикроватные лампы со сменой цвета.\n\nСовременная ванная с душевой панелью, деревянной столешницей и зеркалом с подсветкой, с полотенцами и средствами по уходу.\n\nНа террасе со столом и стульями можно пить кофе среди старинных особняков. Также есть стиральная машина, утюг, фен и сейф.',
      },
      maxGuests: 6, bedrooms: 2, beds: 3, baths: 1, size: 60,
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
      name: 'Σιάτιστα — Κατάλυμα 2', // ΣΥΜΠΛΗΡΩΣΕ όνομα
      area: { el: 'Σιάτιστα, Κοζάνη', en: 'Siatista, Kozani', bg: 'Сятища, Козани', sr: 'Sjatista, Kozani', ru: 'Сьятиста, Козани' },
      tagline: { el: 'ΣΥΜΠΛΗΡΩΣΕ: μία πρόταση για το κατάλυμα.', en: 'TO FILL IN: one line about the place.' },
      description: { el: 'ΣΥΜΠΛΗΡΩΣΕ: περιγραφή.', en: 'TO FILL IN: description.' },
      maxGuests: 4, bedrooms: 1, beds: 2, baths: 1, size: 60,
      fromPrice: 55,
      checkin: '15:00', checkout: '11:00',
      parking: { el: 'ΣΥΜΠΛΗΡΩΣΕ: πληροφορίες στάθμευσης.', en: 'TO FILL IN: parking information.' },
      amenities: ['wifi', 'heating', 'kitchen', 'tv'],
      photos: [],
      ama: '',
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
