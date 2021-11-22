# Earnkeeper

## Getting Started

## Deploying

ℹ We have an [open issue](https://github.com/EarnKeeper/ekp/issues/1) for developing a command line client to automate the below instructions. Add a thumbs up if you think this will help!

This repository uses kubernetes to host its containers. I use digital ocean, you are free to use any provider you prefer, but I will provide instructions for digital ocean here.

Install the digital ocean `doctl` command line tool and authenticate it with digital ocean. [Instructions per platform are here.](https://docs.digitalocean.com/reference/doctl/how-to/install/).

Run the following command to create your kubernetes cluster and save the authentication details to your machine.

⚠️ Replace `ekp` below with a name of your choice. You will use it to reference the cluster later. In subsequent commands in this guide, do the same replacement.

```sh
doctl kubernetes cluster create ekp --count=1 --size=s-2vcpu-4gb --surge-upgrade=false --1-clicks=ingress-nginx
```

Once the command completes, run the following command to get the public host name of your cluster. You will need it later.

```
doctl kubernetes cluster get ekp --format=Endpoint
```

You need your own werf secret key to encrypt any private secrets you keep in your public repository. Generate one with this command:

```sh
werf helm secret generate-secret-key > .werf_secret_key
```

⚠️ By default this file is already ignored in the private .gitignore. DON'T change this behaviour, and DON'T commit .werf_secret_key to git history. It is meant to be private to you.

There are some already encrypted values in this file `.helm/secret-values`. Edit the file and input your own plain text values, the comments will guide you on what to enter. Save the file and then run:

```sh
werf helm secret values encrypt
```

Your values are now encrypted and safe to commit to git.

The github actions config in the start repo already has everything needed to deploy your app to kubernetes. You just need to configure your git repository and push to the main branch.

If you don't have it already, download and authenticate with the github command line client. [Instructions per platform are here](https://cli.github.com/manual/)

Upload your werf secret key to github, replace `ekp` below with the name of your github repository.

```sh
gh secret set WERF_SECRET_KEY --repos="ekp" < .werf_secret_key
```

Upload your kubernetes auth details to github, replace `ekp` below with the name of your github repository, and then the name of your kubernetes cluster (there are two occurrences of ekp).

```sh
gh secret set KUBE_CONFIG_BASE64_DATA --repos="ekp" -b$(doctl kubernetes cluster kubeconfig show ekp | base64)
```

You are all set, go ahead and push your changes to your repository. Once the build is complete, your plugin is available on websockets at your EndPoint address you received above!

This is the url you will enter into the EarnKeeper website to enable your plugin.

## Plugins

Earnkeeper supports 3rd party plugins to provide data for display.

Each plugin is a microservice that must be hosted by the developer of the plugin.

The microservice will expose a socket.io websocket, which the user will configure in their web app.

For example:

```
https://farms.cr.earnkeeper.io/socket
```

Earnkeeper will communicate with the plugin over this socket.

The lifecycle of the communication is as follows.

| Event             | Description                                                                          |
| ----------------- | ------------------------------------------------------------------------------------ |
| Connect           | The client connects to the socket                                                    |
| Send Client State | The client sends all current state variables, for the plugin to use as needed        |
| Join Rooms        | Join rooms required by the application (See the rooms sections for more information) |
| Emit              | The plugin emits data in rooms whenever it changes, for the client to consume        |

## Examples

### Send Client State

Client state is sent from the client to the plugin with event name:

`client-state`

The body of the event will contain an object which is a sub class of the following:

```typescript
export interface ClientState {
  currency?: string;
  walletAddress?: string;
  walletChainId?: number;
}
```

### Joining Rooms

Joining rooms allows the client to receive realtime updates from the plugin whenever data changes.

The event name for joining a room is:

`join`

The event data is an array of the following interface:

```typescript
export interface JoinRequest {
  name: string;
  lastUpdated?: number;
}
```

The supported room names are defined by the earn keeper client, and the plugin is responsible for emitting appropriate data to them.

The events and data formats supported for each room are defined here.

The plugin should join the client to the room, and emit directly to the client any data that has been emitted to the room since the lastUpdated date given in the request.

Here is an example for the `#farms` room:

Client sends:

```json
{
  "event": "join",
  "data": [
    {
      "room": "farms",
      "lastUpdated": 1637057719
    }
  ]
}
```

Plugin joins the client to the room, responds with success, and then emits directly to the client:

```json
{
  "event": "join",
  "data": [
    {
      "room": "farms",
      "lastUpdated": 1637057719,
      "history": [ { ... }, ... ]
    }
  ]
}
```
