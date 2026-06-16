# Summoner Name Reveal V2

Summoner Name Reveal V2 is a Pengu Loader plugin for League of Legends champion select. It listens to League Client game-flow events, detects champion select, reads teammate data from local League Client endpoints, and displays each teammate's visible Riot ID, rank, recent win rate, common role, and KDA.

The plugin can post summaries into champion-select chat, show a small sidebar overlay, and generate OP.GG and Porofessor multi-search links for the lobby.

## Features

- Detects the champion-select phase through the League Client websocket.
- Reads champion-select participants through local Riot client endpoints.
- Fetches ranked stats and recent match history for each teammate.
- Computes recent win rate, most common role, and aggregate KDA.
- Optional chat messages.
- Optional sidebar popup.
- OP.GG and Porofessor pregame links.
- Simple `config.json` toggles.

## Requirements

- League of Legends desktop client.
- Pengu Loader installed and enabled.
- A plugin folder containing this repo's `index.js`, `config.json`, and `src/` files.

## Install

1. Install Pengu Loader from its official releases page.
2. Open Pengu Loader.
3. Go to the `Plugins` tab.
4. Click `Open folder`.
5. Copy this plugin folder into the Pengu Loader `plugins` directory.
6. Restart or reload Pengu Loader.

The plugin entry point is `index.js`.

## Configuration

Edit `config.json`:

```json
{
  "textchat": true,
  "popup": true
}
```

Options:

- `textchat`: when `true`, posts each teammate summary into champion-select chat.
- `popup`: when `true`, shows the sidebar overlay with teammate summaries and lookup links.

Set either value to `false` to disable that behavior.

## What the Output Looks Like

Chat and popup rows use this format:

```text
GameName - Rank - WinRate - CommonRole - KDA
```

The popup version also includes the Riot tag:

```text
GameName #TAG - Rank - WinRate - CommonRole - KDA
```

## Source Files

```text
.
|-- index.js              # Pengu Loader entry point
|-- config.json           # Runtime toggles
`-- src/
    |-- source.js         # Readable source
    |-- compressed.js     # Minified runtime source
    `-- compressedslow.js # Alternate compressed build
```

`index.js` fetches and evaluates the compressed runtime script. If you host a fork or move the repository, update the raw script URL in `index.js`.

## Troubleshooting

- If nothing appears, confirm Pengu Loader is running and this folder is inside the active plugins directory.
- If the popup does not show, make sure `popup` is `true` in `config.json`.
- If chat messages do not post, make sure `textchat` is `true` and you are in champion select.
- If ranked or match data is missing, the local League Client endpoints may have returned incomplete data.
- The plugin only does work during champion select; it removes the sidebar outside that phase.

## Notes

This plugin uses local League Client APIs and DOM surfaces exposed inside the client. League Client updates can change endpoint behavior or page structure, so occasional maintenance may be required.
