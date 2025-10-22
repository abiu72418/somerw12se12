document.addEventListener('DOMContentLoaded', () => {
    const ui = {
        loader: document.getElementById('loader'),
        content: document.getElementById('content'),
        errorMessage: document.getElementById('error-message'),
        pageTitle: document.querySelector('title'),
        mainHeading: document.querySelector('h1'),
        entityName: document.getElementById('share-entity-name'),
        maxValue: document.getElementById('share-max-value'),
        maxFy: document.getElementById('share-max-fy'),
        minValue: document.getElementById('share-min-value'),
        minFy: document.getElementById('share-min-fy'),
    };

    /**
     * Processes raw SEC data to find min/max shares outstanding.
     * @param {object} rawData - The raw JSON data from the SEC API.
     * @returns {object|null} - Processed data object or null on error.
     */
    const processData = (rawData) => {
        try {
            const entityName = rawData.entityName;
            const shares = rawData.units.shares;

            const filteredShares = shares.filter(item => 
                item.fy > 2020 && typeof item.val === 'number'
            );

            if (filteredShares.length === 0) {
                throw new Error("No shares data found for the period after 2020.");
            }

            const max = filteredShares.reduce((prev, current) => (prev.val > current.val) ? prev : current);
            const min = filteredShares.reduce((prev, current) => (prev.val < current.val) ? prev : current);
            
            // Title-case the entity name for better display
            const formattedEntityName = entityName
                .toLowerCase()
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

            return {
                entityName: formattedEntityName,
                max: { val: max.val, fy: max.fy },
                min: { val: min.val, fy: min.fy }
            };
        } catch (error) {
            console.error("Error processing data:", error);
            return null;
        }
    };

    /**
     * Updates the UI with the processed data.
     * @param {object} data - The processed data object.
     */
    const updateUI = (data) => {
        const title = `${data.entityName} | Shares Outstanding`;
        ui.pageTitle.textContent = title;
        ui.mainHeading.textContent = title;
        
        ui.entityName.textContent = data.entityName;
        ui.maxValue.textContent = data.max.val.toLocaleString();
        ui.maxFy.textContent = data.max.fy;
        ui.minValue.textContent = data.min.val.toLocaleString();
        ui.minFy.textContent = data.min.fy;

        ui.loader.style.display = 'none';
        ui.errorMessage.style.display = 'none';
        ui.content.style.display = 'block';
    };

    /**
     * Displays an error message in the UI.
     * @param {string} message - The error message to display.
     */
    const displayError = (message) => {
        ui.errorMessage.textContent = message;
        ui.loader.style.display = 'none';
        ui.content.style.display = 'none';
        ui.errorMessage.style.display = 'block';
    };

    /**
     * Fetches and processes data for a given CIK.
     * @param {string} cik - The 10-digit CIK.
     */
    const fetchDataForCIK = async (cik) => {
        ui.loader.style.display = 'block';
        ui.content.style.display = 'none';
        ui.errorMessage.style.display = 'none';

        // Pad CIK with leading zeros to 10 digits if necessary
        const paddedCik = cik.padStart(10, '0');
        const secUrl = `https://data.sec.gov/api/xbrl/companyconcept/CIK${paddedCik}/dei/EntityCommonStockSharesOutstanding.json`;
        
        // Using a CORS proxy as required
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(secUrl)}`;

        try {
            // Per SEC guidance, a descriptive User-Agent is required.
            // NOTE: Browsers block setting the User-Agent header in fetch.
            // This request relies on the CORS proxy's default User-Agent.
            // This is a known limitation of client-side browser applications.
            const response = await fetch(proxyUrl);

            if (!response.ok) {
                throw new Error(`Failed to fetch data for CIK ${cik}. Status: ${response.status}`);
            }

            const rawData = await response.json();
            const processedData = processData(rawData);

            if (processedData) {
                updateUI(processedData);
            } else {
                displayError(`Could not process data for CIK ${cik}. The data might be in an unexpected format or missing required fields.`);
            }
        } catch (error) {
            console.error("Fetch error:", error);
            displayError(`An error occurred while fetching data for CIK ${cik}. Please check the CIK and try again.`);
        }
    };

    /**
     * Loads the initial data from the local data.json file.
     */
    const loadInitialData = async () => {
        try {
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error('Could not load initial data.json file.');
            }
            const data = await response.json();
            
            // Title-case the entity name for better display
            const formattedEntityName = data.entityName
                .toLowerCase()
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            data.entityName = formattedEntityName;

            updateUI(data);
        } catch (error) {
            console.error("Initial load error:", error);
            displayError("Failed to load initial company data.");
        }
    };

    /**
     * Initializes the application.
     */
    const init = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const cik = urlParams.get('CIK');

        if (cik && /^\d{1,10}$/.test(cik)) {
            fetchDataForCIK(cik);
        } else {
            loadInitialData();
        }
    };

    init();
});
