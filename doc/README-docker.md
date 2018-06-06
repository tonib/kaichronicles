# Docker

Running Kai Chronicles inside a Docker cointainer configures and runs a local website for playing the game. If you intend to develop the game and are not familiar with Docker, then this method is not recommended.
 * Download and install [Docker](https://docs.docker.com/install/) and make sure it's is in your PATH environment variable
 * Using a terminal (Linux or iOS) or PowerShell (Windows 10) navigate to the project's directory
 * Type `docker build -t kai:1.10 .` (including the `.`)
     * The build command only needs to be run once.
     * It takes awhile.
 * Type `docker run -p 8080:8080 kai:1.10` 
     * If you want to access the site via a different port, change the *first* 8080 e.g. `docker run -p 5000:8080 kai:1.10`
     * If you want to run the website independently of your terminal window (i.e. as a daemon), add a `-d` flag e.g. `docker run -d -p 8080:8080 kai:1.10`
 * Open http://localhost:8080
     * The server's ready message has incorrect URLs. Use the URL above, with the correct port.