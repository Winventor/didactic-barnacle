export type DocSection = {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
  specs?: { label: string; value: string }[];
  scores?: { label: string; score: string }[];
};

export const TECH_DOC = {
  title: "Technisch dossier: Windkracht Vier",
  intro:
    "Volledige technische beschrijving van de open toerzeiler Windkracht Vier — identificatie, specificaties, staat en vaareigenschappen.",
  sections: [
    {
      id: "identificatie",
      title: "Identificatie en herkomst",
      paragraphs: [
        "De boot draagt de scheepsnaam Windkracht Vier. Het betreft een open toerzeiler die sterk doet denken aan een Valk, gebouwd in de vroege jaren zeventig, naar alle waarschijnlijkheid door Heijblom Watersport. Op de spiegel, kuiprand en mastvoet is geen serienummer of werfplaatje aanwezig. De zeilen zijn origineel en zonder zeilnummers. Het bouwjaar wordt geschat op 1970 tot 1972, op basis van de rompvorm, kuipindeling, mastvoet, type dekbeslag en afwerking.",
        "De combinatie van polyester romp, vaste ballastkiel, doorgestoken roer, gaffeltuig en volledig originele houten rondhouten maakt dit een uitzonderlijk zeldzaam en vermoedelijk kleinseriegebouwd ontwerp. Bekende Nederlandse open zeilboten als de Polyvalk, Flytour, Spanker en Randmeer delen de geest van dit ontwerp, maar geen van hen combineert al deze kenmerken. De combinatie van klassieke elementen met praktische verbeteringen, zoals de scharnierende mast, integrale opbergruimte en kikkerbeslag in RVS, wijst op een overgangsmodel vóór standaardisering. Dit is geen serieboot: het is een eigenhandig karakter.",
      ],
    },
    {
      id: "specificaties",
      title: "Technische specificaties",
      paragraphs: [
        "De romp is vervaardigd in zwaar handgelamineerd polyester.",
      ],
      specs: [
        { label: "Lengte", value: "5,90 m" },
        { label: "Breedte", value: "ca. 1,85 m" },
        { label: "Kiel", value: "vast, 85 cm" },
        { label: "Gewicht", value: "650–750 kg" },
        { label: "Zeiloppervlak", value: "16 m²" },
        { label: "Bemanning", value: "1–4 personen" },
      ],
    },
    {
      id: "romp",
      title: "Rompvorm en onderwaterschip",
      paragraphs: [
        "De romp heeft een uitgesproken knikspantvorm: aan de voorzijde loopt deze vloeiend van boven- naar onderwaterlijn, maar vanaf het begin van de kiel loopt een scherpe knik door naar de spiegel. De romp vertoont een scherpe V-vorm in de voorsteven en een vrij vlak achterschip met klassieke zeeg. Dit zijn kenmerken van een toerzeiler.",
        "De vaste kiel heeft een lengte van 85 cm en is bevestigd met drie kielbouten die in de kuip zichtbaar zijn. Deze lopen door korte houten balkjes in een polyester compartiment. Een lange kielbalk zoals bij oudere Wegu-modellen ontbreekt. De kiel is strak en netjes in de blauwe antifouling. Na een zeilseizoen en na afspuiten zijn enkele kleine roestplekjes zichtbaar die eenvoudig behandelbaar en overschilderbaar zijn.",
        "Het gehele onderwaterschip is behandeld met blauwe antifouling, elk jaar vernieuwd, voor het laatst in 2026. De romp vertoont geen osmoseblaren en heeft een strakke waterlijn. De romp is uitgevoerd in een originele crèmekleurige, ivoorwitte gelcoat. De romp en het dek zijn nooit overschilderd. UV-vergeling is niet zichtbaar. De kleur is egaal en goed behouden: ook onder de giek, onder de mast en op minder aan zon blootgestelde delen is dezelfde tint aanwezig. De warme crèmetint is met zeer hoge aannemelijkheid de bewust gekozen oorspronkelijke kleur, in de Nederlandse jachtbouw van de jaren zeventig een gangbaar en gewaardeerd kleurschema.",
      ],
    },
    {
      id: "voordek",
      title: "Dek en voordek",
      paragraphs: [
        "Het voordek is volledig van polyester en bevat geen opbouw. Toegang tot het vooronder gebeurt via een verticaal houten luik in de kuipwand. Onder het voordek bevindt zich een ruime polyester bergruimte. Aan weerszijden, onder de dekrand, zijn polyester opbergvakken geïntegreerd, elk voorzien van een houten opstaande rand om verschuiven van materiaal tijdens het varen te voorkomen. Het dek is stroef uitgevoerd en vertoont geen doorgezakte delen, scheuren of beschadigingen.",
      ],
    },
    {
      id: "kuip",
      title: "Kuip en achterdek",
      paragraphs: [
        "De kuip is verdiept en afgedekt met twee houten platen. Onder deze platen bevindt zich een polyester compartiment met de kielconstructie. Dit compartiment biedt ruime droge opbergruimte en vormt door zijn ligging het koelste deel van de boot, geschikt voor het koel houden van voorraden. De kuip heeft houten banken, een nette afwerking en ruimte voor 1 tot 4 personen. Een losse houten plank dient als extra zitbank.",
        "Het achterdek is breed, vlak en van polyester. Hier loopt het doorgestoken roer doorheen. Aan de binnenzijde biedt een houten achterluik toegang tot de ruimte onder het achterdek. Direct vóór dit luik bevindt zich de vaste kapiteinszitplek. Er is ruimte voor twee volwassenen om te overnachten, of voor één volwassene met drie jonge kinderen. De boot is daarmee geschikt voor dagtochten, weekendtochtjes en langere vakanties.",
      ],
    },
    {
      id: "tuigage",
      title: "Rondhouten en tuigage",
      paragraphs: [
        "De mast, giek en gaffel zijn van massief hout en verkeren in uitstekende staat: meerdere lagen hoogwaardige blanke lak, geen craquelé, scherpe hoeken en mooie verbindingen. De mast staat op een scharnierpunt op het voordek, niet doorgestoken in het vooronder, wat strijken bij brugpassages of transport eenvoudig maakt. Op de mast bevinden zich katrollen in houtkleurig kunststof. De lijnen en vallen lopen naar een verhoogde horizontale balk op het voordek. In deze balk zijn vier RVS-pennen aangebracht die als kikkers dienen voor het beleggen van vallen. Alle metalen onderdelen aan boord zijn van RVS. Nieuwe mast, giek en gaffel kosten tegenwoordig gemakkelijk 3.000 tot 5.000 euro.",
      ],
    },
    {
      id: "beslag",
      title: "Dekbeslag",
      paragraphs: [
        "Het dekbeslag bestaat uit één zwarte kunststof kikker midden op het voordek, twee zwarte kunststof kikkers op het achterdek aan weerszijden, twee verstelbare RVS fokkeschootrails met katrollen aan stuur- en bakboordzijde, en één scharnierende touwklem voor de fokkeschoot in bruine houtkleurige kunststof. Alle metalen onderdelen zijn van RVS en zijn vrij van corrosie en verbogen delen.",
      ],
    },
    {
      id: "roer",
      title: "Roer",
      paragraphs: [
        "Het roer is doorgestoken door het achterdek. Het roerblad is recht, onbeschadigd, nooit hersteld en heeft geen scheuren. De helmstok is massief hout en in goede staat.",
      ],
    },
    {
      id: "zeilen",
      title: "Zeilen",
      paragraphs: [
        "De originele zeilen zijn aanwezig en in goede staat: grootzeil, fok en stormfok, alle zonder nummers. Een nieuwe zeilhuik is geplaatst in 2026. De oorspronkelijke zeilhuik is ook nog aanwezig. Een nieuw dekzeil is aangebracht in 2026.",
      ],
    },
    {
      id: "motor",
      title: "Motor",
      paragraphs: [
        "De buitenboordmotor is een Mercury 5 pk langstaart, ruim voldoende voor deze bootgrootte. Een fervente zeiler verbruikt tijdens drie weken vakantie en een tour van 50 km makkelijk niet meer dan 2,5 liter benzine.",
      ],
    },
    {
      id: "trailer",
      title: "Trailer",
      paragraphs: [
        "De trailer is een degelijke gegalvaniseerde wegtrailer speciaal voor deze zeilboot. De banden en wiellagers zijn vernieuwd in 2022, bandendruk 3,5 bar. Er is een reserveband aanwezig. De trailer heeft geen remmen. De verlichting werkt uitstekend.",
      ],
    },
    {
      id: "onderhoud",
      title: "Onderhoud en staat",
      paragraphs: [
        "Het onderhoudsniveau is structureel hoog. Elk jaar wordt het hout verzorgd en gelakt, worden romp en dek schoongepoetst en wordt nieuwe antifouling aangebracht. De boot heeft in de winterperiode uitgebreid gebruik gemaakt van binnenstalling, wat zichtbaar bijdraagt aan de staat van het houtwerk en de gelcoat. De oorspronkelijke rubberen stootrand is nog aanwezig.",
      ],
      scores: [
        { label: "Romp", score: "9/10" },
        { label: "Kiel", score: "9/10" },
        { label: "Houtwerk", score: "9,5/10" },
        { label: "Dek", score: "8,5/10" },
        { label: "Beslag", score: "8,5/10" },
        { label: "Motor", score: "8/10" },
        { label: "Trailer", score: "8,5/10" },
        { label: "Algemene indruk", score: "9/10" },
      ],
    },
    {
      id: "vaareigenschappen",
      title: "Vaareigenschappen",
      paragraphs: [
        "De vaste ballastkiel maakt de boot koersvast, comfortabel en uitermate wendbaar. De boot is geschikt voor groot water, goed solo te varen en vaart prettig bij weinig wind. De snelheid is prima en een goed zeiler weet er hoge snelheden mee te halen. De boot is geschikt voor alle Nederlandse binnenwateren, de Randmeren, de Friese wateren, de grote plassen in de regio Giethoorn waaronder de Beulakerwijde en de Belterwijde, en bij rustig weer ook voor het IJsselmeer.",
      ],
    },
    {
      id: "ligplek",
      title: "Ligplek",
      paragraphs: [
        "De boot ligt in de directe omgeving van Giethoorn, in de buurt van de Beulakerwijde. Voor dit zeilseizoen is nog een ligplaats bij Beulackerhaven te regelen. Dit gaat in overleg en behoort tot de mogelijkheden bij aankoop. De foto's zijn op meerdere locaties in het gebied gemaakt.",
      ],
    },
  ] satisfies DocSection[],
};

export const SALES_DOC = {
  title: "Windkracht Vier, klassieke open toerzeiler te koop",
  intro:
    "Verkoopinformatie voor de uitzonderlijk goed onderhouden klassieke open toerzeiler Windkracht Vier — pakket, karakter, staat en marktwaarde.",
  sections: [
    {
      id: "aanbod",
      title: "Het aanbod",
      paragraphs: [
        "Te koop: een uitzonderlijk goed onderhouden klassieke open toerzeiler, gebouwd in de vroege jaren zeventig, naar alle waarschijnlijkheid door Heijblom Watersport. De boot heet Windkracht Vier en is al ruim 22 jaar in één hand geweest. De vraagprijs is vast. Het is geen vraagprijs die verdedigd hoeft te worden: de boot spreekt voor zichzelf.",
        "De boot is te koop als volledig pakket inclusief trailer en buitenboordmotor, maar ook los. Voor dit zeilseizoen is door ons nog een ligplaats bij Beulackerhaven te regelen. Een ligplaats in dit gebied is schaars en heeft aanzienlijke bijkomende waarde.",
      ],
    },
    {
      id: "inbegrepen",
      title: "Wat is inbegrepen",
      paragraphs: [
        "De boot is vaarklaar en volledig uitgerust. De originele zeilen zijn aanwezig en in goede staat: grootzeil, fok en stormfok, zonder zeilnummers. Verder is inbegrepen een houten vaarboom, een houten peddel, drie stootkussens, een zeilzak, schone schoten en vallen. De zeilhuik is nieuw in 2026, het dekzeil is nieuw in 2026, en de antifouling is vernieuwd in 2026. Elk jaar krijgt de boot nieuwe antifouling, wordt het hout verzorgd en gelakt, en worden romp en dek schoongepoetst. De oorspronkelijke zeilhuik is ook nog aanwezig.",
        "De trailer heeft nieuwe banden en nieuwe wiellagers gekregen in 2022, met een bandendruk van 3,5 bar. Er is een reserveband aanwezig. De verlichting werkt uitstekend.",
        "De buitenboordmotor is een Mercury 5 pk langstaart, ruim voldoende voor deze boot.",
      ],
    },
    {
      id: "zeldzaam",
      title: "Een zeldzame verschijning",
      paragraphs: [
        "Windkracht Vier is geen serieproduct. De combinatie van kenmerken die hij draagt, een polyester romp met knikspant, een vaste ballastkiel, doorgestoken roer, gaffeltuig en volledig originele houten rondhouten, komt bij bekende Nederlandse open zeilboten niet voor. Wie zoekt op Valk, Polyvalk, Flytour, Varuna, Spanker of Randmeer beweegt zich in de juiste richting: Windkracht Vier deelt de geest van deze klassieke Nederlandse toerzeilers, maar is geen van hen. Hij lijkt het sterkst op een kleinseriegebouwde werfboot uit de jaren zeventig, vergelijkbaar van karakter met een Spanker of vroege Varuna, maar met een eigenheid die hem zeldzamer maakt dan elk van die types.",
        "Dat zeldzame karakter is geen nadeel. Het betekent dat wie deze boot koopt, iets in handen heeft wat niet meer bestaat: een zorgvuldig gebouwde, vakkundig onderhouden klassieker die zijn eigen verhaal vertelt op het water, zonder klasse-eisen, zonder wedstrijdverleden, en zonder dat er een identieke boot naast hem ligt.",
      ],
    },
    {
      id: "type",
      title: "Type en bouw",
      paragraphs: [
        "De boot is gebouwd in zwaar handgelamineerd polyester, met klassieke houten accenten: een massief houten mast, giek en gaffel, een lange houten helmstok en houten afdekplaten in de kuip. De romp heeft een uitgesproken knikspantvorm die aan de voorzijde vloeiend loopt en vanaf de kiel scherp doorloopt naar de spiegel. De vaste kiel heeft een lengte van 85 cm. Het gewicht ligt tussen de 650 en 750 kg, afhankelijk van de aanwezige materialen tijdens transport, wat duidt op een robuuste bouw van vóór de lichtgewicht series. De bemanning kan bestaan uit 1 tot 4 volwassenen. De oorspronkelijke rubberen stootrand is nog aanwezig.",
        "De mast staat op een scharnierpunt op het voordek, wat het strijken bij brugpassages en transport eenvoudig maakt. De gaffel, giek en mast zijn allen in uitstekende staat: meerdere lagen hoogwaardige blanke lak, geen craquelé, scherpe hoeken en mooie verbindingen. Een nieuw stel rondhouten van deze kwaliteit kost tegenwoordig gemakkelijk 3.000 tot 5.000 euro.",
      ],
    },
    {
      id: "liefhebbers",
      title: "Wat liefhebbers en fijnproevers hier in zoeken",
      paragraphs: [
        "Voor wie klassieke houten tuigage op waarde schat, biedt deze boot iets wat op de markt steeds zeldzamer wordt: een volledig origineel stel rondhouten in topstaat, door één eigenaar met regelmaat onderhouden en nooit vervangen door aluminium of carbon. Mast, giek en gaffel zijn niet alleen functioneel, ze zijn ambachtelijk mooi.",
        "Het gaffeltuig spreekt een specifieke groep zeilliefhebbers aan: mensen die zeilen als ambacht beschouwen, die de extra handelingen van het gaffeltuig niet als last ervaren maar als ritueel, en die op het water willen opvallen met iets wat karakter heeft in plaats van conformiteit.",
        "De vaste kiel maakt hem interessant voor wie comfort en koersvast gedrag op prijs stelt. Windkracht Vier vaar je met vertrouwen op breed water, met een stabiliteit die ook in frissere wind aangenaam blijft.",
        "De handgelamineerde romp van voor de lichtgewicht series is dikker, zwaarder en in de praktijk robuuster dan wat daarna uit de mallen kwam. Voor iemand die een boot zoekt om lang mee te doen, is dat een bewuste keuze, geen compromis.",
      ],
    },
    {
      id: "staat",
      title: "Staat van onderhoud",
      paragraphs: [
        "De boot verkeert in bovengemiddelde staat en dat is zichtbaar in elk detail. De romp heeft mooie lijnen, geen osmoseblaren, geen reparaties en een strakke waterlijn. De romp is uitgevoerd in een originele crèmekleurige, ivoorwitte gelcoat. De romp en het dek zijn nooit overschilderd. UV-vergeling is niet zichtbaar. De kleur is egaal en goed behouden: ook onder de giek, onder de mast en op minder aan zon blootgestelde delen is dezelfde tint aanwezig. De warme crèmetint is met zeer hoge aannemelijkheid de bewust gekozen oorspronkelijke kleur, in de Nederlandse jachtbouw van de jaren zeventig een gewaardeerd kleurschema. Een spierwitte romp zou de boot moderner laten ogen, maar juist deze ivoor- en crèmekleur geeft hem een klassieke uitstraling die naadloos aansluit bij het gelakte houtwerk en de blauwe accenten van waterlijn en onderwaterschip. Het geheel oogt authentiek en harmonieus.",
        "Het dek is stroef uitgevoerd en vertoont geen doorgezakte delen of scheuren. Het beslag is volledig RVS, zonder corrosie of verbogen delen. De kiel is strak en netjes in de verf. Na een zeilseizoen en na afspuiten zijn enkele kleine roestplekjes zichtbaar die eenvoudig behandelbaar en overschilderbaar zijn. De boot heeft in de winterperiode uitgebreid gebruik gemaakt van binnenstalling, wat zichtbaar bijdraagt aan de staat van het houtwerk.",
      ],
      scores: [
        { label: "Romp", score: "9/10" },
        { label: "Kiel", score: "9/10" },
        { label: "Houtwerk", score: "9,5/10" },
        { label: "Dek", score: "8,5/10" },
        { label: "Beslag", score: "8,5/10" },
        { label: "Motor", score: "8/10" },
        { label: "Trailer", score: "8,5/10" },
        { label: "Algemene indruk", score: "9/10" },
      ],
    },
    {
      id: "vaareigenschappen",
      title: "Vaareigenschappen",
      paragraphs: [
        "Door de vaste ballastkiel is de boot koersvast, comfortabel en uitermate wendbaar op het water. De boot is goed te varen met twee personen, maar ook solo uitstekend handelbaar. De snelheid is uitstekend en een goed zeiler weet er hoge snelheden mee te halen. Bij weinig wind vaart hij prettig. Hij is geschikt voor alle Nederlandse binnenwateren, de Randmeren, de Friese wateren, de grote plassen in de regio Giethoorn waaronder de Beulakerwijde en de Belterwijde, en bij rustig weer ook voor het IJsselmeer. Overnachten is mogelijk voor twee volwassenen, of voor één volwassene met drie jonge kinderen. Een fervente zeiler verbruikt tijdens drie weken vakantie makkelijk niet meer dan 2,5 liter benzine.",
      ],
    },
    {
      id: "locatie",
      title: "Locatie en ligplek",
      paragraphs: [
        "De boot ligt in de directe omgeving van Giethoorn, dichtbij de Beulakerwijde. De foto's zijn op meerdere locaties in het gebied gemaakt. Voor dit zeilseizoen is nog een ligplaats bij Beulackerhaven te regelen, wat als bijkomend voordeel onderdeel mag uitmaken als toevoeging op het totaalpakket.",
      ],
    },
    {
      id: "marktwaarde",
      title: "Marktwaarde",
      paragraphs: [
        "Bij een volledige uitrusting inclusief zeilen, trailer, motor en tuigage ligt een realistische verkoopprijs tussen de 4.750 en 6.000 euro. Aan een liefhebber die de waarde van het houtwerk, de zeldzaamheid van dit ontwerp en de bijkomende ligplaats begrijpt, is 6.000 tot 7.000 euro reëel. Het is geen vraagprijs die verdedigd hoeft te worden: de boot spreekt voor zichzelf.",
      ],
    },
  ] satisfies DocSection[],
};
