export const users = {
  mamma: {
    name: 'Sara',
    role: 'mamma',
    avatar: '👩',
  },
  papa: {
    name: 'Valerio',
    role: 'papà',
    avatar: '👨',
  },
};

export const pregnancy = {
  currentWeek: 31,
  totalWeeks: 40,
  dueDate: '2026-06-15',
  babyNickname: 'Giacomo',
  sex: 'M',
  stats: {
    length: '37 cm',
    weight: '1.1 kg',
    heartRate: '148 BPM',
    sizeComparison: 'Grande come una lattuga',
    sizeEmoji: '🥬',
  },
  upcomingMilestones: [
    { week: 29, title: 'Accumulo di grasso', icon: '🧈' },
    { week: 30, title: 'Respirazione ritmica', icon: '🫁' },
    { week: 32, title: 'Si gira a testa in giù', icon: '🔄' },
    { week: 36, title: 'Polmoni maturi', icon: '🌬️' },
  ],
};

// Weekly development content for weeks 20-40
// Note: to be validated by medical advisory board before v1.0 release
export const weeklyDevelopment = {
  20: {
    heroTitle: 'Giacomo si muove di più',
    subtitle: 'Il bimbo è ormai lungo come una banana. I movimenti sono forti e frequenti — li senti davvero!',
    sizeEmoji: '🍌', sizeLabel: 'Banana',
    length: '25 cm', weight: '300 g',
    events: ['Si muove e scalcia', 'Ha le sopracciglia formate', 'Inizia a produrre meconio'],
    developmentDetails: {
      title: 'Primi Movimenti',
      fact: 'Il bimbo è molto attivo!',
      longDesc: 'Inizia a sentire i primi calcetti. È un segno di salute e vitalità.'
    },
    essentialTips: [
      { id: 'w20_t1', type: 'visit', title: 'Morfologica', desc: 'Ecografia di metà termine.' },
      { id: 'w20_t2', type: 'health', title: 'Ferro', desc: 'Mangia cibi ricchi di ferro.' }
    ],
    mamaTip: 'Inizia a documentare i movimenti: 10 al giorno è un buon riferimento.',
    papaTip: 'Metti la mano sulla pancia: le vibrazioni della tua voce arrivano benissimo al bimbo.',
    curiosities: [
      'Il bambino è ormai grande come una banana 🍌',
      'Il suo sistema riproduttivo è completamente formato.',
      'Può deglutire piccole quantità di liquido amniotico per allenare il sistema digerente.'
    ],
  },
  21: {
    heroTitle: 'Sente e reagisce ai suoni',
    subtitle: 'L\'orecchio interno è quasi completamente maturo. Il bimbo percepisce la tua voce con chiarezza.',
    sizeEmoji: '🥕', sizeLabel: 'Carota',
    length: '27 cm', weight: '360 g',
    events: ['Udito quasi completo', 'Deglutisce il liquido amniotico', 'Ciclo sonno-veglia attivo'],
    mamaTip: 'Parlagli e cantagli: riconoscerà la tua voce dalla nascita.',
    papaTip: 'Anche la tua voce grave arriva perfettamente. Leggigli una storia.',
    curiosities: [
      'Il bambino inizia a percepire i sapori del cibo che mangi attraverso il liquido amniotico.',
      'Il suo udito è così sviluppato che può sussultare se sente un rumore improvviso.',
      'Dorme circa 12-14 ore al giorno, alternando fasi di veglia e riposo.'
    ],
  },
  22: {
    heroTitle: 'Ha già le impronte digitali',
    subtitle: 'Le dita delle mani e dei piedi hanno impronte uniche. È già se stesso.',
    sizeEmoji: '🌽', sizeLabel: 'Spiga di mais',
    length: '28 cm', weight: '430 g',
    events: ['Impronte digitali formate', 'Ciglia e sopracciglia visibili', 'La pelle inizia a inspessirsi'],
    mamaTip: 'Inizia a pensare al corso preparto: i posti si esauriscono in fretta.',
    papaTip: 'Partecipa al corso di preparazione al parto: non è "roba da mamme".',
    curiosities: [
      'Le sue impronte digitali sono ormai uniche e completamente formate.',
      'Il bimbo è grande circa come una spiga di mais 🌽',
      'Inizia a fare dei piccoli movimenti con le labbra, come se stesse provando a succhiare.'
    ],
  },
  23: {
    heroTitle: 'Il cervello accelera',
    subtitle: 'Proliferazione neuronale intensa. Il cervelletto del bimbo si sviluppa rapidamente questa settimana.',
    sizeEmoji: '🫛', sizeLabel: 'Baccello di piselli',
    length: '29 cm', weight: '500 g',
    events: ['Sviluppo cerebrale accelerato', 'Orecchino interno completo', 'Polmoni in sviluppo'],
    mamaTip: 'Omega-3 (salmone, noci) supportano lo sviluppo cerebrale del bimbo.',
    papaTip: 'Aiutala a ridurre lo stress: è il miglior nutrimento per il cervello del bimbo.',
    curiosities: [
      'Il cervello sta crescendo così velocemente che la sua testa è la parte più grande del corpo.',
      'Pesa circa 500 grammi: mezzo chilo di puro amore!',
      'Il suo pancreas inizia a produrre insulina.'
    ],
  },
  24: {
    heroTitle: 'I polmoni si preparano',
    subtitle: 'Le cellule polmonari iniziano a produrre surfattante. Un passo fondamentale per la vita fuori.',
    sizeEmoji: '🌽', sizeLabel: 'Spiga di mais',
    length: '30 cm', weight: '600 g',
    events: ['Produzione di surfattante', 'Udito strutturalmente completo', 'Viso completamente formato'],
    developmentDetails: {
      title: 'Sviluppo Polmonare',
      fact: 'I polmoni iniziano a produrre surfattante.',
      longDesc: 'Le cellule polmonari si preparano alla prima boccata d\'aria.'
    },
    essentialTips: [
      { id: 'w24_t1', type: 'visit', title: 'Screening', desc: 'Premi per visualizzare i task' },
      { id: 'w24_t2', type: 'health', title: 'Preparazione al parto', desc: 'Premi per visualizzare i task' }
    ],
    mamaTip: 'Questo è il traguardo della viabilità fetale. Un momento importante.',
    papaTip: 'Comincia a guardare i seggiolini auto — richiede ricerca e installazione.',
    curiosities: [
      'I suoi polmoni producono già il surfattante, essenziale per respirare alla nascita.',
      'Può sentire il tuo battito cardiaco e persino il rumore della tua digestione!',
      'In questa fase ha ancora molto spazio per muoversi e fare capriole.'
    ],
  },
  25: {
    heroTitle: 'Apre e chiude le mani',
    subtitle: 'I riflessi delle mani sono attivi. Stringe il cordone ombelicale e risponde ai tocchi.',
    sizeEmoji: '🫑', sizeLabel: 'Peperone',
    length: '34 cm', weight: '660 g',
    events: ['Riflesso di prensione attivo', 'Capelli visibili', 'Grasso sottocutaneo in accumulo'],
    mamaTip: 'Bruciori di stomaco frequenti? Pasti piccoli e frequenti aiutano molto.',
    papaTip: 'Falle trovare già preparato il cuscino di supporto quando va a letto.',
    curiosities: [
      'Il suo riflesso di prensione è attivo: stringe forte il cordone ombelicale.',
      'Le unghie delle mani sono quasi completamente formate.',
      'Inizia ad accumulare grasso bruno, che servirà a scaldarlo dopo la nascita.'
    ],
  },
  26: {
    heroTitle: 'Apre gli occhi per la prima volta',
    subtitle: 'Le palpebre, sigillate fino ad ora, iniziano ad aprirsi. Può percepire la luce attraverso la pancia.',
    sizeEmoji: '🥦', sizeLabel: 'Broccolo',
    length: '35 cm', weight: '760 g',
    events: ['Occhi aperti per la prima volta', 'Risponde alla luce', 'Sistema immunitario in sviluppo'],
    mamaTip: 'Punta una torcia sulla pancia: reagirà al cambiamento di luce!',
    papaTip: 'Inizia a leggere del travaglio e del parto — capisci cosa accadrà.',
    curiosities: [
      'Il bambino apre gli occhi per la prima volta questa settimana!',
      'Può distinguere tra luce naturale e buio fuori dalla pancia.',
      'Le sue ciglia sono ora completamente cresciute.'
    ],
  },
  27: {
    heroTitle: 'Cicli di sonno regolari',
    subtitle: 'Il bimbo dorme e si sveglia a orari quasi regolari. Puoi iniziare a riconoscere il suo ritmo.',
    sizeEmoji: '🥬', sizeLabel: 'Lattuga',
    length: '36 cm', weight: '900 g',
    events: ['Ciclo sonno-veglia stabilizzato', 'Il cervello si sviluppa rapidamente', 'Sviluppo polmonare avanzato'],
    mamaTip: 'È normale sentirlo più attivo di sera — sta prendendo il ritmo inverso!',
    papaTip: 'Iniziate a scegliere il nome: i pediatri dicono che i bimbi reagiscono al loro nome già in utero.',
    curiosities: [
      'Il bimbo ha ormai dei ritmi di sonno e veglia abbastanza definiti.',
      'Sulla sua pelle inizia a formarsi la vernix caseosa per proteggerlo dall\'acqua.',
      'Pesa quasi un chilo: un traguardo importantissimo!'
    ],
  },
  28: {
    heroTitle: 'Giacomo sta formando i ricordi',
    subtitle: 'Il cervello entra nella fase REM. Il bimbo sogna e registra le esperienze sensoriali vissute in utero.',
    sizeEmoji: '🥬', sizeLabel: 'Lattuga',
    length: '37 cm', weight: '1.1 kg',
    events: ['Prima fase REM attiva — il bimbo sogna!', 'Sente e reagisce ai suoni esterni', 'Gli occhi si aprono e si chiudono'],
    developmentDetails: {
      title: 'Sogni e Memoria',
      fact: 'Il tuo bimbo sta iniziando a sognare!',
      longDesc: 'L\'attività cerebrale mostra cicli di sonno REM. Inizia a memorizzare suoni familiari come la tua voce.'
    },
    essentialTips: [
      { id: 't1', type: 'visit', title: 'Visita di controllo', desc: 'Controllo pressione e urine.' },
      { id: 't2', type: 'health', title: 'Idratazione', desc: 'Bevi 2 litri d\'acqua al giorno.' }
    ],
    mamaTip: 'Sara, il terzo trimestre è iniziato! Goditi questi momenti e riposa.',
    papaTip: 'Valerio, organizza la valigia ospedale per Sara: Giacomo potrebbe arrivare presto!',
    curiosities: [
      'Entriamo ufficialmente nel terzo trimestre!',
      'Il cervello del bimbo sta iniziando a creare i primi solchi e circonvoluzioni.',
      'Sogna molto: l\'attività cerebrale mostra cicli di sonno REM simili ai nostri.'
    ],
  },
  29: {
    heroTitle: 'Accumula grasso prezioso',
    subtitle: 'Il grasso sottocutaneo si forma velocemente. La pelle diventa meno trasparente e più rosata.',
    sizeEmoji: '🍆', sizeLabel: 'Melanzana',
    length: '38 cm', weight: '1.25 kg',
    events: ['Strato di grasso in formazione', 'Muscoli si rafforzano', 'Sistema nervoso in maturazione'],
    mamaTip: 'Sara, dormire sul fianco sinistro aiuta la circolazione per Giacomo.',
    papaTip: 'Valerio, prepara la stanza! Giacomo avrà bisogno di un posto accogliente.',
    curiosities: [
      'La sua pelle sta diventando meno trasparente grazie allo strato di grasso.',
      'Il midollo osseo ha preso il sopravvento nella produzione dei globuli rossi.',
      'Muove molto braccia e gambe perché ha ancora un po\' di spazio per girarsi.'
    ],
  },
  30: {
    heroTitle: 'Respira come prova generale',
    subtitle: 'Il bimbo compie movimenti ritmici di "respirazione" con il liquido amniotico — un esercizio per il futuro.',
    sizeEmoji: '🥥', sizeLabel: 'Cocco',
    length: '40 cm', weight: '1.35 kg',
    events: ['Respirazione ritmica fetale', 'Il cervello elabora suoni e luci', 'Unghie completamente formate'],
    mamaTip: 'Sara, idratati bene: Giacomo cresce e assorbe molti liquidi.',
    papaTip: 'Valerio, fai la lista degli acquisti per Giacomo insieme a Sara.',
    curiosities: [
      'Il bimo compie movimenti ritmici di "respirazione" come esercizio per il futuro.',
      'Le unghie dei piedi sono ora complete e visibili.',
      'Il volume del liquido amniotico ha raggiunto il suo picco massimo.'
    ],
  },
  31: {
    heroTitle: 'Sviluppo dei Sensi',
    subtitle: 'Il bimbo pesa circa 1.5kg e i suoi sensi si affinano: riconosce già i sapori di ciò che mangi.',
    sizeEmoji: '🫒', sizeLabel: 'Mazzo di olive',
    length: '41 cm', weight: '1.5 kg',
    events: ['Polmoni quasi maturi', 'Ciclo sonno-veglia regolare', 'Riconosce i sapori'],
    developmentDetails: {
      title: 'Maturazione Polmonare',
      fact: 'I polmoni sono quasi pronti!',
      longDesc: 'Se il bambino nascesse ora, avrebbe ottime possibilità di respirare quasi autonomamente. Il grasso sottocutaneo aumenta per aiutarlo a regolare la temperatura.'
    },
    essentialTips: [
      { id: 'w31_t1', type: 'visit', title: 'Ecografia di Accrescimento', desc: 'Monitora la crescita di Giacomo e la funzionalità della placenta.' },
      { id: 'w31_t2', type: 'health', title: 'Posizioni Travaglio', desc: 'Scopri le posizioni che aiutano a gestire il dolore e favoriscono il bimbo.' }
    ],
    curiosities: [
      'Il bambino dorme fino a 15 ore al giorno in questa fase.',
      'I suoi polmoni producono già surfattante per respirare alla nascita.',
      'Gli occhi reagiscono alla luce che filtra attraverso la pancia.'
    ],
    mamaTip: 'Focus sul Ferro: mangia carne rossa magra o legumi con limone per l\'assorbimento. Aiuterà contro la stanchezza.',
    papaTip: 'Supporto Fisico: la schiena di lei è sotto pressione. Un massaggio lombare di 10 minuti stasera farà miracoli.',
  },
  32: {
    heroTitle: 'Si prepara alla posizione di nascita',
    subtitle: 'Molti bimbi iniziano a girarsi a testa in giù questa settimana. La fine si avvicina!',
    sizeEmoji: '🍈', sizeLabel: 'Melone',
    length: '43 cm', weight: '1.7 kg',
    events: ['Girata a testa in giù (cefalica)', 'Polmoni quasi pronti', 'Guarisce più velocemente'],
    mamaTip: 'Ecografia di controllo questa settimana: controllano la posizione del bimbo.',
    papaTip: '8 settimane al parto: organizza il congedo di paternità con il datore di lavoro.',
  },
  33: {
    heroTitle: 'Il cervello accelera ancora',
    subtitle: 'Si formano milioni di connessioni neurali ogni secondo. Il cervello cresce del 25% in queste settimane.',
    sizeEmoji: '🍍', sizeLabel: 'Ananas',
    length: '44 cm', weight: '1.9 kg',
    events: ['Accelerazione connessioni neurali', 'Reflusso e succhiamento attivi', 'Sistema immunitario in rinforzo'],
    mamaTip: 'Il gonfiore alle caviglie è normale: eleva i piedi quando sei seduta.',
    papaTip: 'Fare un tour del reparto maternità aiuta entrambi a ridurre l\'ansia.',
  },
  34: {
    heroTitle: 'Sistema immunitario attivo',
    subtitle: 'Gli anticorpi della mamma passano al bimbo attraverso la placenta, proteggendolo dopo la nascita.',
    sizeEmoji: '🍉', sizeLabel: 'Melone piccolo',
    length: '45 cm', weight: '2.1 kg',
    events: ['Ricezione anticorpi materni', 'Grasso corporeo al 15%', 'Riflessi di suzione attivi'],
    mamaTip: 'Il bimbo è considerato quasi a termine. La valigia ospedale dovrebbe essere pronta.',
    papaTip: 'Fai la "prova viaggio" verso l\'ospedale a orari di punta.',
  },
  35: {
    heroTitle: 'Quasi pronto',
    subtitle: 'Tutti gli organi sono formati e funzionanti. Il bimbo sta solo prendendo peso e maturando.',
    sizeEmoji: '🥂', sizeLabel: 'Bottiglia di champagne',
    length: '46 cm', weight: '2.4 kg',
    events: ['Reni pienamente funzionanti', 'Fegato processa le scorie', 'Ciclo sonno-veglia regolare'],
    mamaTip: 'Contare i movimenti mattina e sera: almeno 10 in 2 ore è normale.',
    papaTip: 'Prepara il bagno ospedaliero: documenti, assicurazione, carta di credito.',
  },
  36: {
    heroTitle: 'I polmoni sono maturi',
    subtitle: 'I polmoni hanno raggiunto la maturità necessaria per respirare aria. Se nascesse ora, starebbe benissimo.',
    sizeEmoji: '🫐', sizeLabel: 'Grappolo di mirtilli',
    length: '47 cm', weight: '2.7 kg',
    events: ['Polmoni pronti per la respirazione', 'Posizione cefalica consolidata', 'Diminuzione spazio in utero'],
    mamaTip: 'Pretermine a termine! Se nasci ora, probabilmente nessuna terapia intensiva.',
    papaTip: 'Metti il numero dell\'ospedale in rubrica. Praticate il piano B per arrivare.',
  },
  37: {
    heroTitle: 'Termine precoce',
    subtitle: 'Il bimbo è considerato "a termine precoce". Ogni giorno in più è un regalo per la maturazione cerebrale.',
    sizeEmoji: '🥕🥕', sizeLabel: 'Due carote grandi',
    length: '48 cm', weight: '2.9 kg',
    events: ['Cervello in piena maturazione', 'Perde la vernix caseosa', 'Posizione finale nella pelvi'],
    mamaTip: 'La cervice inizia ad ammorbidirsi. Le visite sono ora ogni settimana.',
    papaTip: 'Tieni il telefono carico: potrebbe essere il momento in qualsiasi istante.',
  },
  38: {
    heroTitle: 'Pronto fisicamente',
    subtitle: 'Il bimbo è completamente sviluppato. Ora sta solo aspettando il momento giusto.',
    sizeEmoji: '🎃', sizeLabel: 'Piccola zucca',
    length: '49 cm', weight: '3.1 kg',
    events: ['Sviluppo completo', 'Grasso corporeo al 30%', 'Perdita del lanugo'],
    mamaTip: 'Le contrazioni di Braxton-Hicks aumentano — il corpo si prepara.',
    papaTip: 'Stai vicino. Rispondi sempre al telefono. Questo è il tuo momento.',
  },
  39: {
    heroTitle: 'Quasi ci siamo',
    subtitle: 'Il bimbo raggiunge il suo peso definitivo. Nella prossima settimana o due, il grande giorno arriva.',
    sizeEmoji: '🍈', sizeLabel: 'Melone grande',
    length: '50 cm', weight: '3.3 kg',
    events: ['Peso quasi definitivo', 'Tutti i riflessi pronti', 'Preparazione al canale del parto'],
    mamaTip: 'Riposa il più possibile: il travaglio richiede energia.',
    papaTip: 'Hai fatto tutto il possibile. Ora supporta, ascolta, stai vicino.',
  },
  40: {
    heroTitle: 'Il giorno è arrivato',
    subtitle: 'Siete arrivati! Il vostro bimbo è pronto a nascere e conoscere il mondo.',
    sizeEmoji: '🎂', sizeLabel: 'Torta di compleanno',
    length: '51 cm', weight: '3.5 kg',
    events: ['Pronto a nascere!', 'Capelli e unghie completi', 'Il cuore batte forte e regolare'],
    mamaTip: 'Non aver fretta: il 40% dei bambini nasce dopo la settimana 40.',
    papaTip: 'Sei pronto. Sarà la cosa più intensa e straordinaria della tua vita.',
  },
};

export function getWeekData(week) {
  // Clamp to available data
  const w = Math.max(1, Math.min(40, week));
  const base = weeklyDevelopment[w] || weeklyDevelopment[24];
  
  // Ensure we always have these fields for UI stability
  return {
    ...base,
    developmentDetails: base.developmentDetails || {
      title: 'Sviluppo in corso',
      fact: 'Il tuo bimbo cresce ogni giorno!',
      longDesc: 'Ogni settimana porta nuove incredibili scoperte e sviluppi in Giacomo.'
    },
    essentialTips: base.essentialTips || [
      { id: 'def-1', type: 'health', title: 'Benessere', desc: 'Prenditi cura di te e del tuo bimbo.' },
      { id: 'def-2', type: 'visit', title: 'Controllo', desc: 'Consulta il calendario per le prossime visite.' }
    ]
  };
}

export const newbornDevelopment = {
  month1: {
    heroTitle: 'Il mondo in Bianco e Nero',
    subtitle: 'Il tuo bimbo vede solo a contrasto. Reagisce ai riflessi primordiali e riconosce l\'odore della mamma.',
    sizeEmoji: '👶', sizeLabel: 'Neonato',
    length: '52 cm', weight: '3.8 kg',
    mamaTip: 'Cura del moncone: mantienilo sempre asciutto e pulito.',
    papaTip: 'Contatto pelle a pelle: fondamentale per calmare il pianto serale.',
    essentialTips: [
      { id: 'nb-t1', type: 'visit', title: 'Pediatra', desc: 'Prima visita di controllo.' },
      { id: 'nb-t2', type: 'health', title: 'Vitamina D', desc: 'Inizia la somministrazione giornaliera.' }
    ],
    developmentDetails: {
      title: 'Primi Giorni',
      fact: 'Il bimbo riconosce il tuo odore.',
      longDesc: 'Il senso dell\'olfatto è molto sviluppato dalla nascita.'
    }
  }
};

export const pregnancyTasks = [
  { id: 'pt1', text: 'Prenota Curva Glicemica (GTT)', assignee: 'mamma', category: 'Salute', priority: 'high' },
  { id: 'pt2', text: 'Iscrizione Corso Preparto', assignee: 'entrambi', category: 'Da fare', priority: 'medium' },
];

export const newbornTasks = [
  { id: 'nt1', text: 'Dichiarazione Nascita (Comune)', assignee: 'papa', category: 'Da fare', priority: 'high' },
];

export const pregnancyArticles = [
  { id: 'article-1', title: 'Il bimbo sente la tua voce', category: 'Sviluppo', readingTime: '4 min' },
  { id: 'article-2', title: 'Dormire con la pancia', category: 'Benessere', readingTime: '5 min' },
  { id: 'article-4', title: 'Scegliere il nome giusto', category: 'Supporto', readingTime: '6 min' },
  { id: 'article-5', title: 'Primi acquisti: la culla', category: 'Da avere', readingTime: '5 min' },
];

export const newbornArticles = [
  { id: 'n1', title: 'Il moncone ombelicale', category: 'Salute', readingTime: '4 min' },
  { id: 'n2', title: 'Ritmi sonno-veglia', category: 'Benessere', readingTime: '6 min' },
  { id: 'n3', title: 'Dichiarazione di nascita', category: 'Da fare', readingTime: '3 min' },
];

export const getHomeTips = (isBorn, role) => {
  const ids = (isBorn ? newbornArticles : pregnancyArticles).map(a => a.id);
  const activeArticles = articles || [];
  return activeArticles.filter(a => ids.includes(a.id));
};

export const smartTrackerData = {
  pregnancy: {
    hydration: { current: 5, target: 8 },
    kicks: { count: 3, target: 10 }
  },
  newborn: {
    feeding: { current: 4, target: 8 },
    diapers: { count: 5, target: 7 }
  }
};

export const partnerSync = {
  papaView: { mammaStatus: 'Sara sta riposando 💤', lastUpdate: '5 min fa' },
  mammaView: { papaStatus: 'Valerio sta pulendo ✨', lastUpdate: '2 min fa' }
};

export const pregnancyWeather = {
  mamma: { condition: 'Sereno', icon: '☀️', description: 'Giorno perfetto.', tips: 'Bevi molta acqua.' }
};

export const newbornWeather = {
  mamma: { condition: 'Nuvole', icon: '☁️', description: 'Riposa.', tips: 'Dormi quando dorme lui.' }
};


export const weeklyContent = {
  hero: {
    title: 'Biologia dello Sviluppo',
    subtitle: 'L\'udito del feto è strutturalmente completo. L\'orecchio interno (coclea, canali semicircolari) ha raggiunto la dimensione finale e i recettori sensoriali sono attivi. Il feto inizia a percepire chiaramente frequenze medio-basse, come il ritmo cardiaco materno e i borborigmi intestinali, ma anche voci esterne. A livello polmonare, le cellule alveolari di tipo II iniziano la sintesi del surfattante, essenziale per la futura respirazione aerea evitando il collasso alveolare.',
    readingTime: '4 min',
    tag: 'Sviluppo',
    id: 'article-1',
  },
  mammaTips: [
    {
      id: 'dev-mamma',
      category: 'Sviluppo',
      color: '#2C6B5A',
      bg: '#E8F2EE',
      preview: 'Sente la tua voce e reagisce ai suoni',
      title: 'Il tuo bimbo questa settimana',
      body: [
        'A 24 settimane il sistema uditivo è completamente formato. Il tuo bimbo sente la tua voce, il tuo battito cardiaco e i suoni dell\'ambiente circostante.',
        'Parlagli spesso — lo studio del linguaggio inizia già in utero. Quando nasceranno si calmeranno più facilmente sentendo la tua voce.',
      ],
      tip: 'Prova a cantargli una canzoncina ogni sera. Dopo la nascita la riconoscerà.',
    },
    {
      id: 'duty-mamma',
      category: 'Da fare',
      color: '#D4725B',
      bg: '#FAEEE8',
      preview: 'Prenotare ecografia morfologica',
      title: 'Checklist settimana 24',
      body: [
        'Questa è la settimana ideale per confermare l\'ecografia morfologica, se non l\'hai già fatto.',
        'Inizia anche a documentare i movimenti del bambino: 10 movimenti al giorno è il target indicativo.',
      ],
      tip: 'Porta un quaderno agli appuntamenti: annotare le domande prima ti aiuterà a non dimenticarle.',
    },
    {
      id: 'shop-mamma',
      category: 'Da avere',
      color: '#5B8FD4',
      bg: '#EBF2FA',
      preview: 'Cuscino gravidanza e prime tutine',
      title: 'Cosa comprare ora',
      body: [
        'Il secondo trimestre è il momento giusto per iniziare gli acquisti: hai tempo di scegliere con calma senza lo stress delle ultime settimane.',
        'Priorità: cuscino per la gravidanza, reggiseni premaman, crema anti-smagliature.',
      ],
      tip: 'Le tutine neonato crescono in fretta — comprane poche del newborn e più della taglia 1 mese.',
    },
    {
      id: 'health-mamma',
      category: 'Salute',
      color: '#D4A95B',
      bg: '#FAF3E8',
      preview: 'Più ferro e acido folico questa settimana',
      title: 'Cosa mangiare questa settimana',
      body: [
        'Il fabbisogno di ferro aumenta nel secondo trimestre: legumi, carne rossa magra, spinaci e lenticchie sono i tuoi alleati.',
        'L\'acido folico rimane importante per la formazione del sistema nervoso del bambino.',
      ],
      tip: 'Abbina gli alimenti ricchi di ferro a vitamina C (succo di limone, kiwi) per aumentarne l\'assorbimento.',
    },
  ],
  papaTips: [
    {
      id: 'dev-papa',
      category: 'Sviluppo',
      color: '#2C6B5A',
      bg: '#E8F2EE',
      preview: 'Ha sviluppato le papille gustative',
      title: 'Come sta il bimbo',
      body: [
        'A 24 settimane il bambino ha già le papille gustative formate. I sapori che la mamma mangia si trasmettono al liquido amniotico — il bambino sta letteralmente assaporando la tua cucina di famiglia.',
        'Anche la sua faccia è completamente formata: sopracciglia, ciglia, e persino le unghie.',
      ],
      tip: 'Metti la mano sulla pancia e parlagli: sentirà la tua voce e l\'associerà con il tuo calore.',
    },
    {
      id: 'support-papa',
      category: 'Supporto',
      color: '#D4725B',
      bg: '#FAEEE8',
      preview: 'Massaggia la zona lombare alla mamma',
      title: 'Come aiutarla questa settimana',
      body: [
        'Al quinto mese la pancia è già significativa e la zona lombare è sotto pressione. Un massaggio di 10-15 minuti alla sera fa una grande differenza.',
        'Partecipa attivamente: accompagnala alle visite, fai la spesa, prepara pasti nutrienti.',
      ],
      tip: 'Usa olio per massaggi anche sulla pancia di lei — aiuta contro le smagliature.',
    },
    {
      id: 'shop-papa',
      category: 'Da avere',
      color: '#5B8FD4',
      bg: '#EBF2FA',
      preview: 'Cosa comprare per lei e per il bimbo',
      title: 'Lista acquisti papà',
      body: [
        'Cuscino per la gravidanza: fondamentale per il suo sonno nelle prossime settimane.',
        'Per il bimbo: inizia a valutare il seggiolino auto — richiede tempo di ricerca e installazione.',
      ],
      tip: 'Il seggiolino auto è obbligatorio per il ritorno a casa dall\'ospedale: non rimandarlo all\'ultimo.',
    },
    {
      id: 'health-papa',
      category: 'Salute',
      color: '#D4A95B',
      bg: '#FAF3E8',
      preview: 'I polmoni si preparano a respirare',
      title: 'Biologia Fetale Avanzata',
      body: [
        'A livello respiratorio, le cellule polmonari iniziano a produrre il surfactante, una complessa miscela di fosfolipidi e proteine. Questa sostanza impedirà agli alveoli di collassare durante l\'espirazione una volta nato.',
        'Nel cervello, si verifica una rapida proliferazione neurale e l\'inizio della mielinizzazione, che velocizzerà la trasmissione degli impulsi elettrici lungo il sistema nervoso.',
      ],
      tip: 'La percezione dei suoni esterni è ormai documentata: voci gravi (come quelle maschili) attraversano il liquido amniotico con minore distorsione.',
    },
  ],
  curiosities: [
    'A 24 settimane il bambino ha sviluppato le papille gustative!',
    'Pesa circa come una spiga di mais 🌽',
    'Ha già un ciclo sonno-veglia regolare.',
    'Le sue impronte digitali sono completamente formate.',
  ],
};


export const articles = [
  {
    id: 'article-1',
    title: 'Il bimbo sente la tua voce',
    readingTime: '4 min',
    category: 'Sviluppo fetale',
    validatedBy: {
      name: 'Dr.ssa G. Ferretti',
      specialty: 'Pediatra neonatologa',
      institution: 'Ospedale Bambino Gesù, Roma',
    },
    publishedDate: '18 febbraio 2026',
    imageTag: '👶 Sviluppo',
    content: [
      {
        type: 'paragraph',
        text: 'A **24 settimane**, il sistema uditivo del tuo bambino ha raggiunto un livello di **maturazione straordinario**. Le strutture dell\'orecchio interno sono completamente formate e il **cervello** inizia a elaborare i suoni che arrivano dall\'esterno.',
      },
      {
        type: 'heading',
        text: 'Cosa sente il tuo bambino?',
      },
      {
        type: 'paragraph',
        text: 'Il **liquido amniotico** trasmette le vibrazioni sonore in modo diverso dall\'aria: i suoni arrivano attutiti ma chiari. La **tua voce** è il suono più presente e familiare — viaggia attraverso le vibrazioni del tuo corpo oltre che dall\'esterno.',
      },
      {
        type: 'list',
        items: [
          'Il **battito del tuo cuore** — il suo ritmo preferito',
          'La **tua voce** e quella del **papà**',
          '**Musica** e suoni ambientali',
          '**Rumori forti** improvvisi (che possono farlo sussultare)',
        ],
      },
      {
        type: 'heading',
        text: 'Cosa puoi fare questa settimana',
      },
      {
        type: 'paragraph',
        text: 'Parla con il tuo bambino, leggigli una storia, cantagli una canzone. Non sentirti a disagio — studi dimostrano che i **neonati riconoscono la voce della mamma** già dal primo istante. Anche il **papà** può iniziare: i bambini reagiscono alle voci maschili con **calma e attenzione**.',
      },
      {
        type: 'tip',
        text: 'Prova a mettere la musica vicino alla pancia per 10-15 minuti al giorno. Melodie calme e ripetitive sono le più apprezzate.',
      },
    ],
  },
  {
    id: 'article-2',
    title: 'Dormire con la pancia',
    readingTime: '5 min',
    category: 'Benessere',
    validatedBy: {
      name: 'Dr. M. Russo',
      specialty: 'Ostetrico',
      institution: 'Clinica Mangiagalli, Milano',
    },
    publishedDate: '15 febbraio 2026',
    imageTag: '😴 Sonno',
    content: [
      {
        type: 'paragraph',
        text: 'Trovare una posizione comoda per dormire nel secondo e terzo trimestre può iniziare a essere una sfida. La pancia cresce e la posizione supina (a pancia in su) non è più raccomandata perché il peso dell\'utero può comprimere la vena cava, riducendo il flusso di sangue verso il cuore e la placenta.'
      },
      {
        type: 'heading',
        text: 'La posizione migliore (SOS)'
      },
      {
        type: 'paragraph',
        text: 'SOS sta per "Sleep On Side" (dormire sul fianco). Ancora meglio è dormire sul lato sinistro, poiché aumenta la quantità di sangue e nutrienti che raggiungono la placenta e il bambino.'
      },
      {
        type: 'list',
        items: [
          'Sinistro è meglio: evita la compressione del fegato e facilita il lavoro dei reni.',
          'Ginocchia flesse: aiuta a scaricare la tensione dalla zona lombare.',
          'Cuscino tra le gambe: mantiene le anche allineate e riduce i dolori al bacino.'
        ]
      },
      {
        type: 'tip',
        text: 'Se ti svegli sulla schiena, non preoccuparti: è normale muoversi nel sonno. Semplicemente rigirati con calma sul fianco sinistro.'
      }
    ]
  },
  {
    id: 'article-3',
    title: 'La mente del papà',
    readingTime: '3 min',
    category: 'Psicologia',
    validatedBy: {
      name: 'Dr.ssa E. Bianchi',
      specialty: 'Psicologa Perinatale',
      institution: 'Polo Maternità, Firenze',
    },
    publishedDate: '10 febbraio 2026',
    imageTag: '🧠 Mente',
    content: [
      {
        type: 'paragraph',
        text: 'Spesso ci si concentra solo sui cambiamenti fisici e mentali della madre, ma anche il cervello dei futuri padri subisce modifiche significative durante la gravidanza della partner. È un fenomeno documentato scientificamente, a volte chiamato "couvade".'
      },
      {
        type: 'heading',
        text: 'Cambiamenti ormonali'
      },
      {
        type: 'paragraph',
        text: 'Anche se non portano il bambino in grembo, i padri mostrano variazioni nei livelli di testosterone, ossitocina e prolattina. Questi cambiamenti preparano il cervello maschile alla cura e alla protezione del neonato.'
      },
      {
        type: 'list',
        items: [
          'Aumento dell\'ossitocina: favorisce il legame affettivo.',
          'Riduzione del testosterone: riduce l\'aggressività e aumenta la pazienza.',
          'Aumento della prolattina: stimola l\'istinto di accudimento.'
        ]
      },
      {
        type: 'tip',
        text: 'Abbracciare la partner e appoggiare la mano sulla pancia non aiuta solo lei, ma sincronizza i tuoi ritmi biologici con quelli del bambino.'
      }
    ]
  },
  {
    id: 'article-4',
    title: 'Scegliere il nome giusto',
    readingTime: '6 min',
    category: 'Supporto',
    publishedDate: '20 febbraio 2026',
    validatedBy: { name: 'Redazione', specialty: 'Editor', institution: 'ParentPath' },
    content: [
      {
        type: 'paragraph',
        text: 'Il nome accompagnerà il tuo bimbo per tutta la vita. Spesso è una decisione che genera stress o indecisione tra i partner, ma può essere anche un momento di profonda connessione.'
      },
      {
        type: 'heading',
        text: 'Consigli per decidere'
      },
      {
        type: 'list',
        items: [
          'Provate a pronunciarlo ad alta voce insieme al cognome per sentirne l\'armonia.',
          'Considerate il significato e l\'origine, se per voi è importante.',
          'Evitate nomi troppo complessi o difficili da sillabare.',
          'Assicuratevi che piaccia davvero a entrambi, senza compromessi forzati.'
        ]
      },
      {
        type: 'tip',
        text: 'Non sentitevi obbligati a condividerlo prima della nascita. Mantenerlo segreto riduce le opinioni non richieste.'
      }
    ]
  },
  {
    id: 'article-5',
    title: 'Primi acquisti: la culla',
    readingTime: '5 min',
    category: 'Da avere',
    publishedDate: '22 febbraio 2026',
    validatedBy: { name: 'Redazione', specialty: 'Editor', institution: 'ParentPath' },
    content: [
      {
        type: 'paragraph',
        text: 'La sicurezza nel sonno è la priorità assoluta per un neonato. La culla non è solo un elemento d\'arredo, ma il luogo dove passerà la maggior parte del tempo nei primi mesi.'
      },
      {
        type: 'heading',
        text: 'Requisiti di sicurezza'
      },
      {
        type: 'list',
        items: [
          'Certificazione EN 1130 (normativa europea per culle).',
          'Sbarre distanti non più di 4.5 - 6.5 cm per evitare che il bimbo si incastri.',
          'Materasso rigido e della misura esatta della base.',
          'Nessun paracolpi morbido, peluche o cuscini all\'interno.'
        ]
      },
      {
        type: 'tip',
        text: 'Posizionate la culla nella vostra stanza per i primi 6 mesi (room-sharing), come consigliato dalle linee guida pediatriche.'
      }
    ]
  },
  {
    id: 'n2',
    title: 'Ritmi sonno-veglia',
    readingTime: '6 min',
    category: 'Benessere',
    publishedDate: '1 marzo 2026',
    validatedBy: { name: 'Dr.ssa Ferretti', specialty: 'Neonatologa', institution: 'Roma' },
    content: [
      {
        type: 'paragraph',
        text: 'Nei primi giorni, il neonato non distingue il giorno dalla notte. Il suo stomaco è piccolo e ha bisogno di nutrirsi circa ogni 2-3 ore, indipendentemente dall\'orario.'
      },
      {
        type: 'heading',
        text: 'Come aiutarlo a sincronizzarsi'
      },
      {
        type: 'list',
        items: [
          'Luce naturale e rumori domestici durante il giorno.',
          'Buio totale (o luce rossa molto soffusa) e silenzio durante le poppate notturne.',
          'Nessuna interazione o gioco durante i risvegli notturni.',
          'Esposizione alla luce solare indiretta al mattino.'
        ]
      },
      {
        type: 'tip',
        text: 'Verso i 3-4 mesi inizierà a produrre melatonina con più regolarità e i ritmi si stabilizzeranno.'
      }
    ]
  },
  {
    id: 'n3',
    title: 'Dichiarazione di nascita',
    readingTime: '3 min',
    category: 'Da fare',
    publishedDate: '2 marzo 2026',
    validatedBy: { name: 'Ufficio Anagrafe', specialty: 'Servizi', institution: 'Italia' },
    content: [
      {
        type: 'paragraph',
        text: 'La burocrazia è l\'ultimo pensiero dopo il parto, ma è necessaria. Ecco i tempi e i modi previsti dalla legge italiana.'
      },
      {
        type: 'heading',
        text: 'Dove e quando'
      },
      {
        type: 'list',
        items: [
          'Entro 3 giorni: presso la direzione sanitaria dell\'ospedale dove è avvenuta la nascita.',
          'Entro 10 giorni: presso l\'ufficio dello stato civile del comune di residenza (o di nascita).',
          'Documenti: attestazione di nascita (rilasciata dall\'ospedale) e documenti d\'identità dei genitori.'
        ]
      },
      {
        type: 'tip',
        text: 'La denuncia in ospedale è spesso la via più rapida e comoda per i neo-genitori.'
      }
    ]
  },
  {
    id: 'n1',
    title: 'Il moncone ombelicale',
    readingTime: '4 min',
    category: 'Salute',
    publishedDate: '28 febbraio 2026',
    validatedBy: { name: 'Dr.ssa Ferretti', specialty: 'Neonatologa', institution: 'Roma' },
    content: [
      {
        type: 'paragraph',
        text: 'Il moncone è ciò che resta del cordone ombelicale. La sua cura è semplice ma fondamentale per prevenire infezioni (onfaliti).'
      },
      {
        type: 'heading',
        text: 'Pratiche consigliate'
      },
      {
        type: 'list',
        items: [
          'Tenerlo pulito e, soprattutto, ASCIUTTO.',
          'Piegare il pannolino verso il basso per lasciarlo esposto all\'aria.',
          'Non usare polveri o disinfettanti aggressivi a meno di indicazioni mediche.',
          'Attendere che cada spontaneamente (solitamente tra 7 e 14 giorni).'
        ]
      },
      {
        type: 'tip',
        text: 'Se notate rossore intenso alla base, cattivo odore o secrezioni, consultate il pediatra.'
      }
    ]
  }
];

export const toolsData = {
  kicks: {
    todayScore: 8,
    target: 10,
    lastRecorded: '14:30',
  },
  contractions: {
    lastDuration: '45s',
    frequency: '--',
    history: [],
  },
  weight: {
    start: 62.0,
    current: 68.5,
    targetMin: 73,
    targetMax: 78,
  },
  appointments: [
    {
      id: 'app-1',
      title: 'Ecografia Morfologica',
      date: 'Oggi',
      time: '16:00',
      doctor: 'Dr.ssa Rossi',
      type: 'Ultrasound',
      status: 'upcoming'
    },
    {
      id: 'app-2',
      title: 'Curva Glicemica',
      date: 'Tra 2 settimane',
      time: '08:00',
      doctor: 'Laboratorio Centrale',
      type: 'Exam',
      status: 'pending'
    },
    {
      id: 'app-3',
      title: 'Visita di Controllo Mensile',
      date: 'Settimana 26',
      time: '11:30',
      doctor: 'Dr. Bianchi',
      type: 'Checkup',
      status: 'pending'
    }
  ]
};

export const notifications = [
  {
    id: 'n1',
    type: 'mamma',
    title: 'Aggiornamento settimanale',
    message: 'Settimana 24: il bambino sente la tua voce! Scopri cosa succede questa settimana.',
    time: '08:30',
    date: 'Oggi',
    read: false,
    icon: '📋',
  },
  {
    id: 'n2',
    type: 'partner',
    title: 'Marco ti ha inviato un articolo',
    message: '"10 nomi che mi piacciono" — apri per leggerlo insieme.',
    time: '14:22',
    date: 'Oggi',
    read: false,
    icon: '💌',
  },
  {
    id: 'n3',
    type: 'medical',
    title: 'Visita ostetrica',
    message: 'Promemoria: appuntamento con Dr.ssa Rossi domani alle 10:00.',
    time: '18:00',
    date: 'Oggi',
    read: true,
    icon: '🏥',
  },
  {
    id: 'n4',
    type: 'papa',
    title: 'Consiglio per papà',
    message: 'Questa sera prova a leggere una storia alla pancia — il bambino ti sentirà.',
    time: '19:00',
    date: 'Ieri',
    read: true,
    icon: '📖',
  },
  {
    id: 'n5',
    type: 'mamma',
    title: 'Nuovo contenuto disponibile',
    message: 'Guida completa: cosa mettere nella valigia per l\'ospedale.',
    time: '09:15',
    date: 'Ieri',
    read: true,
    icon: '🧳',
  },
  {
    id: 'n6',
    type: 'partner',
    title: 'Sara ha completato una milestone!',
    message: 'Primo calcetto sentito — vai a vedere nella sezione Tappe.',
    time: '11:30',
    date: 'Ieri',
    read: true,
    icon: '🎉',
  },
];

export const milestones = [
  { id: 'm1', title: 'Primo battito', icon: '💓', completed: true, week: 6 },
  { id: 'm2', title: 'Forma umana', icon: '👶', completed: true, week: 8 },
  { id: 'm3', title: 'Prime dita', icon: '🖐️', completed: true, week: 10 },
  { id: 'm4', title: 'Può deglutire', icon: '💧', completed: true, week: 12 },
  { id: 'm5', title: 'Sesso visibile', icon: '🔍', completed: true, week: 14 },
  { id: 'm6', title: 'Primo movimento', icon: '🤸', completed: true, week: 16 },
  { id: 'm7', title: 'Sente i suoni', icon: '👂', completed: true, week: 18 },
  { id: 'm8', title: 'Vernix caseosa', icon: '🧴', completed: true, week: 20 },
  { id: 'm9', title: 'Impronte digitali', icon: '🔎', completed: true, week: 22 },
  { id: 'm10', title: 'Udito completo', icon: '🎵', completed: true, week: 24 },
  { id: 'm11', title: 'Apre gli occhi', icon: '👁️', completed: false, week: 26 },
  { id: 'm12', title: 'Sogna (fase REM)', icon: '💭', completed: false, week: 28 },
  { id: 'm13', title: 'Respirazione ritmica', icon: '🫁', completed: false, week: 30 },
  { id: 'm14', title: 'Si gira a testa in giù', icon: '🔄', completed: false, week: 32 },
  { id: 'm15', title: 'Polmoni maturi', icon: '🌬️', completed: false, week: 36 },
  { id: 'm16', title: 'Pronto a nascere', icon: '🎂', completed: false, week: 40 },
];
