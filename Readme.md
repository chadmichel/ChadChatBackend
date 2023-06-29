# ChadChatBackend - Azure Function

## Project Overview

This is the front end component that goes with the backend component. Combined these create a very simple chat application. Both of these can be ran together on your machine to give you a simple chat application.

## Project Tech Overview

Project was built using Angualr 15.2.6 and Angular Material. Backend is an Azure Function application.

Frontend makes calls to an Azure function backend for some services. And uses Azure Chat service for sending and receiving messages.

### Development server

Run `func start` for a dev server. This will run you endpoints on the default Azure Function Port 7071

## Azure CLI Quick Help / Deployment

```
az account tenant list
az login --tenant <your tenant id>
```

```
func azure functionapp publish <Azure Function Name>
```
