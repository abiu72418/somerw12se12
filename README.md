# somerw12se12 - SEC Shares Outstanding Viewer

This is a static web application that displays the maximum and minimum number of common shares outstanding for a publicly traded company, based on data from the U.S. Securities and Exchange Commission (SEC).

## Features

- **Default View**: By default, the application displays data for American Electric Power (CIK: 0000004904).
- **Dynamic CIK Lookup**: You can view data for any company by providing its CIK number as a URL parameter.
- **Data Filtering**: The application only considers data from fiscal years after 2020.
- **Clean UI**: A modern, responsive, and visually appealing interface to present the data.
- **Purely Static**: The entire application is built with HTML, CSS, and JavaScript and can be hosted on any static web hosting service.

## How to Use

### Running Locally

To run this application, you can use a simple local web server.

1.  Ensure you have Python 3 installed.
2.  Navigate to the project's root directory in your terminal.
3.  Start a local server:
    ```bash
    python -m http.server
    ```
4.  Open your web browser and go to `http://localhost:8000`.

Alternatively, you can use any other local server tool like `live-server` for VS Code.

### Viewing Data for a Different Company

To look up data for a different company, add the `CIK` query parameter to the URL. The CIK should be the company's 10-digit Central Index Key from the SEC.

**Example:** To view data for Microsoft (CIK: 0000789019):
`http://localhost:8000/?CIK=0000789019` or `http://localhost:8000/?CIK=789019`

The application will automatically fetch, process, and display the data for the specified company.

## Project Structure

```
.
├── data.json        # Pre-fetched data for the default company (AEP)
├── index.html       # The main HTML file
├── README.md        # This file
├── uid.txt          # Project UID file
├── css/
│   └── style.css    # Stylesheet for the application
└── js/
    └── app.js       # Core application logic
```

## Technical Notes

- **SEC EDGAR API**: The application fetches data from the SEC's public EDGAR API. The specific endpoint used is `https://data.sec.gov/api/xbrl/companyconcept/CIK...`.
- **User-Agent**: The SEC requests that automated tools provide a descriptive User-Agent string (e.g., "Company Name email@example.com"). While this is followed for the pre-generated `data.json`, it's not possible to set a custom User-Agent header in client-side JavaScript `fetch` requests due to browser security restrictions.
- **CORS Proxy**: To work around Cross-Origin Resource Sharing (CORS) restrictions when fetching data from `sec.gov` in a browser, this application uses a public CORS proxy (`api.allorigins.win`). This allows the client-side code to access the SEC API without requiring a dedicated backend.
