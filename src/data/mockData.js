export const users = {
  mamma: {
    name: 'Sara',
    role: 'mamma',
    avatar: '👩',
  },
  papa: {
    name: 'Marco',
    role: 'papà',
    avatar: '👨',
  },
};

export const pregnancy = {
  currentWeek: 24,
  totalWeeks: 40,
  dueDate: '2026-06-15',
  babyNickname: 'Piccolo',
  sex: 'M',
  stats: {
    length: '30 cm',
    weight: '600 g',
    heartRate: '148 BPM',
    sizeComparison: 'Grande come una spiga di mais',
    sizeEmoji: '🌽',
  },
  upcomingMilestones: [
    { week: 25, title: 'Risponde ai suoni', icon: '👂' },
    { week: 26, title: 'Apertura degli occhi', icon: '👁️' },
    { week: 27, title: 'Cicli sonno-veglia regolari', icon: '😴' },
    { week: 28, title: 'Può sognare (fase REM)', icon: '💭' },
  ],
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
      id: 'bond-papa',
      category: 'Sviluppo',
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
        text: 'A 24 settimane, il sistema uditivo del tuo bambino ha raggiunto un livello di maturazione straordinario. Le strutture dell\'orecchio interno sono completamente formate e il cervello inizia a elaborare i suoni che arrivano dall\'esterno.',
      },
      {
        type: 'heading',
        text: 'Cosa sente il tuo bambino?',
      },
      {
        type: 'paragraph',
        text: 'Il liquido amniotico trasmette le vibrazioni sonore in modo diverso dall\'aria: i suoni arrivano attutiti ma chiari. La tua voce è il suono più presente e familiare — viaggia attraverso le vibrazioni del tuo corpo oltre che dall\'esterno.',
      },
      {
        type: 'list',
        items: [
          'Il battito del tuo cuore — il suo ritmo preferito',
          'La tua voce e quella del papà',
          'Musica e suoni ambientali',
          'Rumori forti improvvisi (che possono farlo sussultare)',
        ],
      },
      {
        type: 'heading',
        text: 'Cosa puoi fare questa settimana',
      },
      {
        type: 'paragraph',
        text: 'Parla con il tuo bambino, leggigli una storia, cantagli una canzone. Non sentirti a disagio — studi dimostrano che i neonati riconoscono la voce della mamma già dal primo istante. Anche il papà può iniziare: i bambini reagiscono alle voci maschili con calma e attenzione.',
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
        text: 'Trovare una posizione comoda per dormire nel secondo trimestre può iniziare a essere una sfida. La pancia cresce e la posizione supina (a pancia in su) non è più raccomandata per lunghi periodi.',
      },
      {
        type: 'heading',
        text: 'La posizione migliore (SOS)',
      },
      {
        type: 'paragraph',
        text: 'SOS sta per "Sleep On Side" (dormire sul fianco). Ancora meglio è dormire sul lato sinistro, poiché aumenta la quantità di sangue e nutrienti che raggiungono la placenta e il bambino, ed evita che l\'utero prema sul fegato.',
      },
      {
        type: 'tip',
        text: 'Un cuscino per la gravidanza (o un cuscino extra tra le ginocchia) può alleviare la pressione su fianchi e zona lombare, migliorando significativamente la qualità del sonno.',
      },
    ],
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
        text: 'Spesso ci si concentra solo sui cambiamenti fisici e mentali della madre, ma anche il cervello dei futuri padri subisce modifiche significative durante la gravidanza della partner. È un fenomeno documentato scientificamente, a volte chiamato "couvade".',
      },
      {
        type: 'heading',
        text: 'Cambiamenti ormonali',
      },
      {
        type: 'paragraph',
        text: 'Studi indicano che anche i futuri papà subiscono variazioni ormonali. Il livello di testosterone può diminuire leggermente, mentre l\'ossitocina (l\'ormone dell\'attaccamento) e la prolattina aumentano in prossimità del parto, preparando il padre a livello neurobiologico ad accudire il neonato.',
      },
    ],
  },
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
