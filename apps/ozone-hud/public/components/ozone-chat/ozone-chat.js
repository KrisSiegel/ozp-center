(function () {
	var chatClient;
	var Messenger = Ozone.Service("Messaging");
	var xtaggerReady = false;

	var dummyChannelName = "The Talk Channel";
	var openConversations = {},
	    orderedConversations = [];

	function ChatClient(options) {
		var el = options.el;
		var self = this;
		this.receiveMessage = function (message) {
			el = openConversations[message.senderID];
			if (!el) {
				el = openChat(message.senderID);
			}
			el.addMessages([message]);
		};
		this.messengerInit(options.clientID);
		this.createChannel(dummyChannelName, {
			channelType: "open"
		});
		this.clientsUpdated = function () {
			Ozone.logger.debug("clientsUpdate called");
			var clients = Messenger.allClients.getKeys();
			Ozone.logger.debug(clients);
			loadContactList(clients);
		};
		setTimeout(function () {
			self.subscribe(dummyChannelName);
			Ozone.logger.debug("subscribing to " + dummyChannelName);
			self.subscribe(options.clientID);
			Ozone.logger.debug("subscribing to " + options.clientID);
		}, 500);
	};

	ChatClient.prototype = new Messenger();

	function loadContactList (contacts) {
		contacts.sort(function (a, b) {
			if (a == userID) return -1;
			if (b == userID) return 1;
			if (a < b) return -1;
			if (a > b) return 1;
			return 0;
		});
            
		// Build up a list of contact elements
		var contactStringArray = [];
		for (var i = 0; i < contacts.length; i++) {
			contactStringArray.push('<ozone-chat-contact ozone-contact-name="'
									+ contacts[i] +
									'" ozone-contact-title="CTU Agent"></ozone-chat-contact>');
		};
		var contactHtml = contactStringArray.join('');
		var fragment = document.createElement('div');
		fragment.id = "ozone-contact-list";
		xtag.innerHTML(fragment, contactHtml);

		// Replace placeholder element with contact list DOM
		var chatContent = document.getElementById("ozone-chat");
		var oldNodes = xtag.query(chatContent, '.placeholder-text-container');
		if (oldNodes.length == 0) {
			oldNodes = [document.getElementById("ozone-contact-list")];
		}
		oldNodes[0].parentNode.replaceChild(fragment, oldNodes[0]);
	};

	function createChatClient () {
		if (xtaggerReady && userID != null && chatClient == null) {
			chatClient = new ChatClient({
				clientID: userID
			});
		}
	};

	function openChat(targetID) {
		var container = document.createElement("ozone-chat-container");
		container.setAttribute('chat-label', targetID);
		document.getElementById('ozone-chat').appendChild(container);
		openConversations[targetID] = container;
		orderedConversations.push(container);
		setPositionAttribute(container, orderedConversations.length - 1);
		return container;
	}

	function setPositionAttribute(conversationContainer, index) {
		conversationContainer.setAttribute('chat-right-offset', 20 + index * 270);
	};

	xtagger.ready(function () {

		xtaggerReady = true;
		createChatClient();
		xtag.register("ozone-chat", {
			lifecycle: {
				created: function() {
					this.appendChild(xtagger.getImport("ozone-chat").cloneNode(true));
					chat.init();
				}
			}
		});
		xtag.register("ozone-chat-contact", {
			lifecycle: {
				created: function () {
					var tpl = document.getElementById('contact-container-tpl').content;
					this.appendChild(tpl.cloneNode(true));
				}
			},
			accessors: {
				contactName: {
					attribute: {
						name: 'ozone-contact-name'
					},
					get: function () {
						return "hi";
					},
					set: function (value) {
						var nameEl = xtag.query(this, '.contact-name')[0];
						nameEl.innerHTML = value +
							((value == userID) ? " (You)" : "");
					}
				},
				contactTitle: {
					attribute: {
						name: 'ozone-contact-title'
					},
					get: function () {
						return "bye";
					},
					set: function (value) {
						var titleEl = xtag.query(this, '.contact-title')[0];
						titleEl.innerHTML = value;
					}
				}
			},
			events: {
				'click': function (e) {
					e.preventDefault();

					var contact = e.currentTarget;
					var targetID = contact.getAttribute('ozone-contact-name');
					if (targetID == userID) {
						return;
					};
					if (targetID in openConversations) {
						console.log("Chat window for " + targetID + " already open");
						return;
					}

					openChat(targetID);
				}
			}
		});
		xtag.register("ozone-chat-container", {
			lifecycle: {
				created: function () {
					var tpl = document.getElementById('chat-container-tpl').content;
					this.appendChild(tpl.cloneNode(true));
				}
			},
			accessors: {
				chatLabel: {
					attribute: {
						name: 'chat-label'
					},
					set: function (value) {
						var label_p = xtag.query(this, 'p.label')[0];
						label_p.innerHTML = value;
					}
				},
				rightOffset: {
					attribute: {
						name: 'chat-right-offset'
					},
					set: function (value) {
						var container = xtag.query(this, '.chat-container')[0];
						container.style.right = value + 'px';
					}
				}
			},
			methods: {
				addMessages: function (messages) {
					var frag = document.createDocumentFragment(),
					    i, len;
					for (i = 0, len = messages.length; i < len; i++) {
						var messageNode = document.createElement("chat-message");
						messageNode.setAttribute('message-sender', messages[i].senderID);
						messageNode.addText(messages[i].message);
						frag.appendChild(messageNode);
					};
					xtag.query(this, '.conversation')[0].appendChild(frag);
				},
				closeConversation: function () {
					console.log("in closeConversation");
					// Maybe do something w/ adding .chat-inactive
					this.parentNode.removeChild(this);
					delete openConversations[this.chatLabel];
					for (var i = 0, len = orderedConversations.length; i < len; i++) {
						if (orderedConversations[i].chatLabel == this.chatLabel) {
							orderedConversations.splice(i, 1);
							setPositionAttribute(orderedConversations[i], i);
						}
					};
					if (i == len) throw "chat not found in array!";
				}
			},
			events: {
				'keyup:delegate(textarea):keypass(13)': function (e) {
					console.log("text is " + e.target.value);
					var el = this.parentNode
					    // LOLWUT???
						.parentNode
						.parentNode
						.parentNode
						.parentNode
					var contact = el.getAttribute("chat-label");
					chatClient.sendMessage(contact, e.target.value);
					if (contact != dummyChannelName) {
						// Add my message inline with my parter's messages
						el.addMessages([{
							senderID: userID,
							message: e.target.value
						}]);
					}
					e.target.value = "";
				},
				'click:delegate(.icon-close-4)': function (e) {
					console.log("closing chat dialog");
					var el = this.parentNode
						.parentNode
						.parentNode
						.parentNode
					el.closeConversation();
				}
			}
		});

		xtag.register('chat-message', {
			lifecycle: {
				created: function () {
					var tpl = document.getElementById('chat-message-tpl').content;
					this.appendChild(tpl.cloneNode(true));
				}
			},
			accessors: {
				messageSender: {
					attribute: {
						name: 'message-sender'
					},
					get: function () {},
					set: function (value) {
						xtag.addClass(this, "conversation-" + (value == userID ? "my" : "other") + "-side");
						xtag.query(this, 'img')[0].src = "assets/images/contact-sample.jpg";
					}
				}
			},
			methods: {
				addText: function (text) {
					xtag.query(this, 'p')[0].innerHTML = text;
				}
			}
		});

	}, this);

	var persona, userID;
	if (Ozone.utils.isUndefinedOrNull(persona)) {
		var personas = Ozone.Service("Personas");
		personas.getCurrent(function (_persona) {
			persona = _persona;
			console.log(persona);
			userID = persona.getUsername();
			createChatClient();
		});
	};

	var chat = (function () {

		return {
			init: function () {
				pubsub.subscribe("navigate", function (hash) {
					chat.navigate(hash);
				});
				chat.navigate(window.location.hash);

				document.getElementById("ozone-chat-close").addEventListener("click", function (event) {
					if (event.preventDefault) {
						event.preventDefault();
					};

					pubsub.publish("showApp");

					return false;
				}, false);
				//loadContactList(["David Rodriguez", "Derek Beck", "John Carlson"]);
			},
			navigate: function (hash) {
				if (hash !== undefined && hash.indexOf("#Chat/") !== -1) {
					chat.showGui();
				} else {
					chat.hideGui();
				}
			},
			hideGui: function () {
				document.getElementById("ozone-chat").style.display = "none";
			},
			showGui: function () {
				pubsub.publish("showMask");
				document.getElementById("ozone-chat").style.display = "block";
			}
		};
	}());
}());
