# The Gallows Way

A multiplayer card game, of up to 4 players compete head-to-head.  In the match each player
tries to score 'runs' of 3 or more consecutive same-suit cards, emptying their hand in order 
to win the round.  

The goal: compete round after round, until the first player reaches 5,000 points.  No two rounds
are the same; every round has a different set of wildcards, and each players hand is determined by
a card flip.

---

## Table of Contents

- [About the Project](#about-the-project)
- [How to Play](#how-to-play)
- [Features](#features)
- [Game Modes](#game-modes)
---

## About the Project

**The Gallows Way** is a card game for iPhone.  
Think Uno meets Solitaire. 

My Aunt, Uncle, and Mom have played this game together for years at family gatherings. 
We live 2,000 miles apart now, so this app is how I bring a little piece of home with me — and stay connected to family.
Hope you have as much fun with it as we have. The ingame designs are inspired by my families unique Celtic and Norse heritage, the Gall-Ghàidhealaibh. 

- **Current version:** 1.0.1

---

## Features

- **Four ways to play** —
   - on device (solo vs. AI or pass-and-play)
   - Locally device-to-device via WiFi/Bluetooth (no internet connection required)
   - Online via Apple's Game Center: Challenge your friends or compete globally.
- **Competitve Matchmaking** - queue up to be paired up against up to 3 opponents, to see who
  is the best in the world!
- **Game Center Integration** - leverages Apple's Game Center functionality for
  authentication, profiles, leaderboards, and gameplay.  This means all of your
  private information stays with Apple, we don't store it, analyze it, or sell it.
- **Turn-based Gameplay** play at your own speed!  Each player gets notified when its
  their turn so you can play
- **AI opponents** — Practice against a computer; add 0–4 computer players. A
  full all-AI game can be watched in **spectator mode**.
- **Move hints** — a Hint button in games suggests your best next move
  and highlights the cards involved, so that you can challenge yourself and learn
  on the go.
- **Guided onboarding** — a pop-up driven tutorial walks new players through
  their first few turns, explaining how to play and each phase of the game.
- **In-app rules** — a full illustrated "How to Play" section with a 30-second
  quick start, real card examples, and topic deep-dives..
- **Activity log** — a synced play-by-play of every action, visible to all
  players in a game.  Catch up on what you missed, or form more complex strategies
  using probability.
- **Leaderboards** — See where you stack up against the best in the world. Global ranking system
  tracks Total Points and Total Wins, assigning everyone a numbered rank, updated in real-time at
  the end of each online game.
- **Accessibility-first** — user-controlled card-size and text-size multipliers
  and a high-contrast mode. A compact mode, to optimize the user-experience for people with
  smaller devices . VoiceOver labels throughout.
- **In-app bug reporting** — captures full game state into a diagnostic report
  for support.
- **Challenge Mode** - A way to challenge people who don't have the game
  to a single, tutorial focused match,without having to download the full app.
  Just send them a link or let them scan the QR code, which opens head-to-head
  into a single match.  Teach a friend to play, or use it as an conversation
  starter!    

---

## Game Modes

### Local (Pass & Play)
Everything runs on one device with no network. 2–4 players, any mix of humans
and AI. A pass-device screen hides hands between human turns; it is skipped
automatically in solo-vs-AI games. Games auto-save to disk.

### Local WiFi (LAN)
Peer-to-peer over Apple's Wireless Direct Link with a Bluetooth failsafe — no wireless infrastructure or
internet required. The host advertises the game to people within 200ft and then all moves are handled iphone
to iphone.  Good for camping with the family or riding the train, where cell service is spotty.

### Online (Game Center)
Asynchronous turn-based play via Apple's Game Center, which handles
inviting friends, auto-matching with strangers, and resuming in-progress games.
Players take turns on their own schedule; push notifications alert the next
player. All your data stays with apple, none of it is collected by the app.

---

### Privacy permissions (declared in `Info.plist`)

- **Camera** — scanning QR codes to join a LAN game.
- **Local Network** — peer-to-peer discovery for LAN multiplayer.
- **Bluetooth** - a fallback for discovery and gameplay 






   








