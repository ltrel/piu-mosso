# Deploying Piu Mosso Server Guide
This doesn’t need to be done on the same computer as the client. The client machine just needs to be able to send HTTP requests to the server machine. If the two machines are not on the same LAN this would require port forwarding and is probably a security risk if you don’t reverse proxy it through NGINX (or similar) and setup SSL certificates so that HTTPS can be used. In the real world the server would likely be running in the cloud so that users can access it from anywhere.

## 1. Install Node.js
Download and install the latest LTS release of Node.js from https://nodejs.org/en/. As with the Python setup make sure to select the option that adds the binaries to the PATH variable.

## 2. Install dependencies
Open a command prompt in the project’s directory (the one that has a file named package.json in it). From there run this command:

```npm install --include=dev```

## 3. (Optional) Run the automated tests
In order to make sure that everything is functioning as intended it’s a good idea to run the automated tests that have been written. This should ideally be done before running the server for normal use to make sure the tests cannot interfere with the existing files (this shouldn’t happen but It’s better to be careful).

Prior to running the tests, open `config.json` and set the following values

```"printQueries": false```

```"inMemoryDatabase": true```

This keeps the database used by the tests in RAM so that it can be read or written to much faster and disables the printing of SQL queries to the console that would interfere with printing the results of the tests.

Once the preparation has been done the tests can be run with the following command:

```npm test```

## 4. Run the server
If you ran the tests prior to this step, make sure you set the `inMemoryDatabase` config option back to false so changes to the database aren’t lost if the server stops. To start the server run the following:

```node index.js```

If this doesn't work make sure your command prompt is in the same directory as the `package.json` file.
