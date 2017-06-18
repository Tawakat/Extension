class Tawaliive {

    constructor() {

        /**
         * Le CLIENT-ID de l'application pour utiliser l'API de Twitch.
         * @type {Array.<String>}
         */
        this.CLIENT_IDS = [
            '7hc3qbe141dnraujszt2wr5zi5cp8t',
        ];

        /**
         * L'URL a appeler pour avoir les infos sur un stream.
         * @type {string}
         */
        this.API_URL_STREAM = 'https://api.twitch.tv/kraken/streams/tawaliive';

        /**
         * L'URL du stream Twitch.
         * @type {string}
         */
        this.URL_STREAM = 'https://www.twitch.tv/tawaliive';

        /**
         * @type {Boolean|null}
         */
        this.isOnline = null;

        this.updateStreamState();
        this.setupBadge()
    }

    /**
     * Configure le badge
     */
    setupBadge() {
        chrome.browserAction.onClicked.addListener(_ => this._openStream())
    }

    _openStream() {
        chrome.tabs.create({active: true, url: this.URL_STREAM})
    }

    /**
     * Met à jour l'état en-ligne/hors-ligne d'un stream en particulier, en appelant l'API Twitch.
     */
    updateStreamState() {
        console.info(new Date, "Mise à jour de l'état du stream...")

        const clientId = this.CLIENT_IDS[Math.floor(Math.random() * this.CLIENT_IDS.length)];
        const headers = {
            'Accept': 'application/vnd.twitchtv.v5+json',
            'Client-ID': clientId
        };
        const request = new Request(this.API_URL_STREAM, {headers});

        // Connexion à l'API de Twitch
        fetch(request)
            .then(response => {
                if(response.ok) {
                    response.json().then(json => this.handleResponse(json))
                } else {
                    console.error(new Date(), "Mauvaise réponse du réseau");
                }
            })
            .catch(error => {
                console.error(new Date(), "Erreur avec la fonction fetch()", error)
            });

        this.prepareNextUpdate();
    }

    /**
     * Traite les données issues d'une requête à l'API Twitch.
     * @param {Object} json Les données en JSON retournées par l'API Twitch
     */
    handleResponse(json) {
        console.info(new Date, "Réponse bien récupérée", JSON.stringify(json, null, 2))

        let isOnline = json['streams'].length > 0;

        if (this.isOnline === false && isOnline === true) {
            chrome.notifications.create('alderiate', {
                type: 'basic',
                iconUrl: '../icons/alderiate_128.png',
                title: 'Tawaliive est actuellement en live !',
                message: json['streams'][0]['channel']['status'].trim()
            }, _ => chrome.notifications.onClicked.addListener(_ => this._openStream()))
        }

        isOnline ? this.putOnline() : this.putOffline();
        this.isOnline = isOnline;
    }

    prepareNextUpdate () {
      // Entre 1 et 3 minutes
      const timeToWaitBeforeNextUpdate = (Math.random() * 2 + 1) * 60 * 1000;
      console.info(new Date, `Prochaine mise à jour de l'état du stream dans ${timeToWaitBeforeNextUpdate / 1000} secondes.`)
      setTimeout(_ => this.updateStreamState(), timeToWaitBeforeNextUpdate)
    }

    putOnline() {
        chrome.browserAction.setBadgeText({text: 'ON'});
        chrome.browserAction.setBadgeBackgroundColor({color: 'green'})
    }

    putOffline() {
        chrome.browserAction.setBadgeText({text: 'OFF'});
        chrome.browserAction.setBadgeBackgroundColor({color: 'gray'})
    }
}

window.AL = new Tawaliive();