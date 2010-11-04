/// <reference path="json2.js" />
/// <reference path="linq.js" />
/// <reference path="rx.js" />

BlackJack =
    (function () {
        var messages = [
            {
                message: "PlayerJoin",
                data: { index: 0, playerName: "" }
            },
            {
                message: "Deal",
                data:
                {
                    playerSummaries:
                        [
                            { index: 0, card: new Card(Face.King, Suit.Hearts) },
                            { index: 1, card: new Card(Face.King, Suit.Clubs) }
                        ]
                }
            },
            {
                message: "TurnChanged",
                data: { index: 2 }
            },
            {
                message: "Hit",
                data: { index: 2, card: new Card(Face.Jack, Suit.Hearts) }
            },
            {
                message: "EndRound",
                data: {
                    playerSummaries: [
                        { index: 0, points: 12 },
                        { index: 1, points: 23 },
                        { index: 2, points: 22 },
                        { index: 3, points: 44 }
                    ]
                }
            }
        ];

        var deepCopy = function (obj) { return JSON.parse(JSON.stringify(obj)); };

        var Face = {
            Ace: 1,
            Jack: 11,
            Queen: 12,
            King: 13
        };

        var Suit = {
            Clubs: 0,
            Diamonds: 1,
            Hearts: 2,
            Spades: 3
        };

        var Card = function (face, suit) {
            this.face = face;
            this.suit = suit;
        }

        var DeckData = function () {
            this.cards =
                Enumerable
                    .RangeTo(Face.Ace, Face.King)
                    .SelectMany(
                        function (face) {
                            return (
                                Enumerable
                                    .RangeTo(Suit.Clubs, Suit.Spades)
                                    .Select(function (suit) { return new Card(face, suit); }))
                        })
                    .OrderBy(function () { return Math.random(); })
                    .ToArray();
        };

        var Deck = function (data) {
            data = deepCopy(data);

            this.draw = function () {
                return data.cards.splice(0, 1)[0];
            };

            this.data = function () { return deepCopy(data); };
        };

        var Player = function (data) {
            data = deepCopy(data);

            this.id = function () { return data.id; };
            this.isTurn = function (value) { 
                if (value != undefined) 
                    data.isTurn = value;
                else 
                    return data.isTurn;    
                };

            this.index = function() { return data.index; };
            this.stay = function () {
                this.data.isTurn = false;
            };

            this.hit = function (card) {
                this.data.hand.push(card);
            };

            this.data = function () { return deepCopy(data); };

            // TODO: Push to the client
            this.eventOccurred = function (event) { // sendToChannel(this.data.channel, JSON.stringify(event)); };

            var getCardValue = function(card) {
                if (card.face == Face.Ace)
                    return [1,11];
                else if (card.face >= Face.Jack) 
                    return [10];
                else
                    return [card.face];
            };

            this.handValue = function() {
                
            };
        };


        var Game = function (data) {
            data = deepCopy(data);

            var eventOccurred = new Rx.Subject();

            Enumerable
                .From(data.players)
                .ForEach(function (player) {
                    eventOccurred.Subscribe(player.eventOccurred);
                });

            this.hit = function (playerId) {
                var player =
                    Enumerable
                        .From(data.players)
                        .Where(function (player) { return player.id() == playerId; })
                        .FirstOrDefault();

                if (!player.isTurn())
                    throw "It's not your turn bitch.";

                var topCard = this.deck.draw();
                player.hit(topCard);

                eventOccurred.OnNext(
                    {
                        message: "Hit",
                        data: { index: player.index(), card: topCard }
                    });
            };

            this.stay = function (playerId) {
                var player =
                    Enumerable
                        .From(data.players)
                        .Where(function (player) { return player.id() == playerId; })
                        .FirstOrDefault();

                if (!player.isTurn())
                    throw "It's not your turn bitch.";

                player.isTurn(false);

                if (data.players.length == player.index() - 1) {
                    
                }
                else {
                    var newIndex = player.index() + 1;
                    data.players[newIndex].isTurn(true);
                    
                    eventOccurred.OnNext(
                        {
                            message: "TurnChanged",
                            data: { index: newIndex }
                        });
                }
            };

            this.data = function () { return deepCopy(data); };
        };

        var Server = function () {
            this.game = null;
            this.join = function (playerName) {
                if (this.game == null) {
                    this.game = new Game();
                    this.game.players.push(new Player(playerName));
                }
            };

            this.hit = function (playerId) {
                this.game.hit(playerId);
            };
        };

        return {
            Face: Face,
            Suit: Suit,
            Card: Card,
            Deck: Deck,
            Player: Player,
            Game: Game,
            Server: Server
        };
    })();