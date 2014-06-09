(function () {
	microXTag.register("ozone-persona-permissions", "ozone-persona-permissions-tmpl", {
			lifecycle: {
				inserted: function() {
					component.init();
				}
			}
	});

	microXTag.ready(function () {
		microXTag.standUpTags(document.getElementsByTagName('ozone-persona-permissions'));
	});

	var component = (function () {
		var roleListEventListenerOnChange;
		var personas;
		var personaPermissionSaveButtonElement;
		var personaPermissionSelectedImageElement;
		return {
			init: function () {
				component.loadAppList();
				Ozone.Service("Personas").persona.query({}, function (res) {
					personas = res;
					component.loadPersonasList();
					pubsub.subscribe("navigate", function (payload) {
						component.navigated(payload);
					});
					component.navigated(window.location.hash);
				});

				// Script to calculate the height of parent container - the intro container = the application list

				var resizeAppsList = function() {
					var modalHeight = $('.ozone-persona-permissions').height();
					var introHeight = $('.opp-sidebar-intro').outerHeight();
					Ozone.logger.debug(introHeight);
					$('.opp-sidebar-app-list').css('height',modalHeight - introHeight);
				};
				resizeAppsList();
				$(window).resize(function() {
					resizeAppsList();
				});

				// Add a shadow class to the header container when scrolling the user list container

				$('.opp-content-container-content').scroll(function() {
					if ($(this).scrollTop() == 0) {
						$('.opp-content-container-header').removeClass('opp-content-container-header-shadow');
					}
					else {
						Ozone.logger.debug('not at scroll top');
						$('.opp-content-container-header').addClass('opp-content-container-header-shadow');
					}
				});

                // Set it up to close when you click outside the "modal"
                $('#ozone-mask').on('click', function () {
                    pubsub.publish('showApp');
                });

				// Switching between the list and grid view

				$('#oop-switch-grid').click(function() {
					$('.opp-content-container-content').addClass('opp-content-container-content-grid').removeClass('opp-content-container-content-list');
					$('#oop-switch-grid').addClass('opp-content-container-header-btn-icon-active');
					$('#oop-switch-list').removeClass('opp-content-container-header-btn-icon-active');
				});
				$('#oop-switch-list').click(function() {
					$('.opp-content-container-content').addClass('opp-content-container-content-list').removeClass('opp-content-container-content-grid');
					$('#oop-switch-list').addClass('opp-content-container-header-btn-icon-active');
					$('#oop-switch-grid').removeClass('opp-content-container-header-btn-icon-active');
				});

				// Need to trigger custom dropdown items

				var first = true;

				// Setup menu
				Ozone.Service("Personas").persona.getCurrent(function (persona) {
					var canOpen = persona.hasPermission("/Ozone/Apps/App/AppsMall/GrantPermission/");
					canOpen = canOpen || persona.hasPermission("/Ozone/Personas/Permission/GrantPermission/");
					if (canOpen) {
						var channel = "persona_menu_permissions_manager";
						setTimeout(function () {
							pubsub.publish("addToPersonaMenu", {
								label: "Permissions Manager",
								channel: channel
							});
						}, 1500);


						pubsub.subscribe(channel, function () {
							location.hash = "Persona/Permissions/";
						});

						document.getElementById("persona_permissions_backToList").addEventListener("click", function (event) {
							if (event.preventDefault) {
								event.preventDefault();
							}
							component.showGui();
						});
					}
				});
			},
			navigated: function (hash) {
				if (hash !== undefined && hash.indexOf("#Persona/Permissions") !== -1) {
					component.showGui();
				} else {
					component.hideGui();
				}
			},
			showGui: function () {
				pubsub.publish("showMask");
				document.getElementById("ozone-persona-permissions").style.display = "block";
				document.getElementById("ozone-persona-permissions-container").style.display = "block";
				document.getElementById("ozone-persona-permissions-persona-list").style.display = "block";
				document.getElementById("ozone-persona-permissions-persona").style.display = "none";
				document.onkeydown = function (event) {
					event = event || window.event;
					if (event.keyCode === 27) {
						pubsub.publish("showApp");
					}
				};
			},
			hideGui: function () {
				document.getElementById("ozone-persona-permissions").style.display = "none";
				document.getElementById("ozone-persona-permissions-container").style.display = "none";
				document.getElementById("ozone-persona-permissions-persona-list").style.display = "none";
				document.getElementById("ozone-persona-permissions-persona").style.display = "none";
				delete document.onkeydown;
			},
			loadPersonasList: function (update) {
				if (!Ozone.utils.isUndefinedOrNull(personas)) {
					var createTileRow = function (row, name, username, role, img, id) {
						// var icon = row.insertCell(0);
						// icon.className = "opp-content-container-content-user-profile";
						// var iconImg = document.createElement("img");
						// iconImg.setAttribute("id", "ozone-persona-permissions-persona-list-" + id);
						// var iconImgSrc = (Ozone.utils.isUndefinedOrNull(img) ? "components/ozone-persona-permissions/images/default-profile.jpg" : Ozone.Service("Persistence").Store("personas").Drive("profileImages").getDrivePath(img));
						// iconImg.setAttribute("src", iconImgSrc);
						// icon.appendChild(iconImg);

						var icon = row.insertCell(0);
                        icon.className = "opp-content-container-content-user-profile";

                        var div = document.createElement("div");
                        div.setAttribute("class", "opp-content-container-content-user-profile-container");

                        var iconImg = document.createElement("img");
                        iconImg.setAttribute("id", "ozone-persona-permissions-persona-list-" + id);
                        var iconImgSrc = (Ozone.utils.isUndefinedOrNull(img)
                                          ? Ozone.utils.murl("hudUrl", "/components/ozone-persona-permissions/images/default-profile.jpg", true)
                                          : Ozone.Service("Persistence").Store("personas").Drive("profileImages").getDrivePath(img));
                        iconImg.setAttribute("src", iconImgSrc);

div.appendChild(iconImg);

icon.appendChild(div);

						var nameC = row.insertCell(1);
						var nameP = document.createElement("p");
						nameP.appendChild(document.createTextNode(name));
						nameC.appendChild(nameP);

						var usernameC = row.insertCell(2);
						usernameC.className = "opp-content-container-content-username";
						var usernameP = document.createElement("p");
						usernameP.appendChild(document.createTextNode(username));
						usernameC.appendChild(usernameP);

						var roleC = row.insertCell(3);
						var roleP = document.createElement("p");
						if (!Ozone.utils.isUndefinedOrNull(role)) {
							roleP.appendChild(document.createTextNode(role));
						}
						roleC.appendChild(roleP);

						(function (usr, r) {
							r.addEventListener("click", function (event) {
								if (event.preventDefault) {
									event.preventDefault();
								}
								component.showAndLoadPermissionSelection(usr);
							});
						}(username, row));
					}
					var tileTable = document.getElementById("persona_tile_display");
					for (var i = 0; i < personas.length; ++i) {
						var row = tileTable.insertRow(tileTable.rows.length - 1);
						createTileRow(row, (personas[i].name || personas[i].username), personas[i].username, personas[i].meta.role, personas[i].meta.profileImageId, personas[i]._id);
					}
				}
			},
			loadAppList: function () {
				var listElm = document.getElementById("ozone-persona-permissions-app-list");
				var addEntry = function (name, iconUrl) {
					var li = document.createElement("li");
					var a = document.createElement("a");
					var img = document.createElement("img");
					var p = document.createElement("p");

					p.appendChild(document.createTextNode(name));
					img.setAttribute("src", iconUrl);
					a.appendChild(img);
					a.appendChild(p);

					li.appendChild(a);
					listElm.appendChild(li);
				};
				var specialSnowFlakeApps = [
					{ name: "Ozone", imgUrl: Ozone.utils.murl("hudUrl", "/assets/images/ozone-logo.png", true) },
					{ name: "Apps Mall", imgUrl: Ozone.utils.murl("hudUrl", "/components/ozone-persona-permissions/images/apps-mall.jpg", true) }
				];
				// Hide Ozone for this release; TODO: Add Ozone back
				specialSnowFlakeApps.shift();
				for (var i = 0; i < specialSnowFlakeApps.length; ++i) {
					addEntry(specialSnowFlakeApps[i].name, specialSnowFlakeApps[i].imgUrl);
				}
				Ozone.Service("Apps").query({}, function (result) {
					if (!Ozone.utils.isUndefinedOrNull(result)) {
						for (var i = 0; i < result.length; ++i) {

						}
					}
				});
			},
			showRoleAndPermissionsControlForPersona: function (persona, designation) {
				Ozone.Service("Personas").roles.query({ designation: designation }, function (results) {

					var loadPermissionList = function (permissions) {
						var permListElm = document.getElementById("ozone-persona-permissions-persona-permission-list");
						Ozone.utils.dom.removeAllChildrenNodes(permListElm);

						var header = document.createElement("label");
						header.appendChild(document.createTextNode("Permissions"));
						permListElm.appendChild(header);

						if (!Ozone.utils.isUndefinedOrNull(permissions) && permissions.length > 0) {
							Ozone.Service("Personas").permissions.query({ designation: designation }, function (permRes) {
								for (var i = 0; i < permissions.length; ++i) {
									var input = document.createElement("input");
									var label = document.createElement("label");

									for (var j = 0; j < permRes.length; ++j) {
										if (permissions[i] === permRes[j].permission) {
											input.setAttribute("type", "checkbox");
											input.setAttribute("name", "ozone-persona-permissions-" + i);
											input.setAttribute("id", "ozone-persona-permissions-" + i);
											if (persona.meta.permissions.indexOf(permissions[i]) !== -1) {
												input.setAttribute("checked", true);
											}
											input.setAttribute("value", permissions[i]);
											label.appendChild(document.createElement("span"));
											label.setAttribute("for", "ozone-persona-permissions-" + i)
											label.appendChild(document.createTextNode(permRes[j].label));

											break;
										}
									}

									permListElm.appendChild(input);
									permListElm.appendChild(label);
								}
							});
						} else {
							var none = document.createElement("p");
							none.appendChild(document.createTextNode("Please select a role to see permissions."));
							permListElm.appendChild(none);
						}
					};

					var loadRoleList = function (roles, selected) {
						var dd = document.getElementById("ozone-persona-permissions-role-dropdown");
						Ozone.utils.dom.removeAllChildrenNodes(dd);

						if (Ozone.utils.isUndefinedOrNull(roleListEventListenerOnChange)) {
							roleListEventListenerOnChange = function (event) {
								var perms;
								for (var i = 0; i < roles.length; ++i) {
									if (roles[i].role === dd.options[dd.selectedIndex].value) {
										perms = roles[i].permissions;
									}
								}
								loadPermissionList(perms || []);
							};
							dd.addEventListener("change", roleListEventListenerOnChange);
						}

						var first = document.createElement("option");
						first.text = "Please select a role";
						first.value = "select";
						dd.appendChild(first);

						var roleDescElm = document.getElementById("ozone-personas-permissions-persona-role-desc");
						Ozone.utils.dom.removeAllChildrenNodes(roleDescElm);

						var selectedRole;

						if (!Ozone.utils.isUndefinedOrNull(roles) && roles.length > 0) {
							var personaRole = ((persona.meta || { }).role || "");
							var oneSelected = false;

							for (var i = 0; i < roles.length; ++i) {
								var elm = document.createElement("option");
								elm.text = roles[i].label;
								elm.value = roles[i].role;

								if (selected) {
									console.log(personaRole.toLowerCase() + " versus " + roles[i].label.toLowerCase());
									if (personaRole.toLowerCase() === roles[i].label.toLowerCase()) {
										selectedRole = roles[i];
										elm.selected = true;
										oneSelected = true;
										var li = document.createElement("li");
										li.appendChild(document.createTextNode(roles[i].description));
										roleDescElm.appendChild(li);
									}
									if (!oneSelected) {
										selected = false;
									}
								}

								dd.appendChild(elm);
							}
						}

						if (!selected) {
							var li = document.createElement("li");
							li.appendChild(document.createTextNode("Lorem ipsum dolor sit amet, consect aetur adipiscing elit. Aliquam consequat lacinia euismod. Fusce eget mauris a ante luctus posuere."));
							roleDescElm.appendChild(li);
						}

						loadPermissionList((selectedRole || { }).permissions || []);
					};

					loadRoleList(results, persona.meta.role);
					//$(dd).msDropdown();

				});
			},
			showAndLoadPermissionSelection: function (username) {
				for (var i = 0; i < personas.length; ++i) {
					if (personas[i].username === username) {
						component.showRoleAndPermissionsControlForPersona(personas[i], "AppsMall");
						var p = Ozone.Service("Personas").persona.envelop(personas[i]);

						var nameNode = document.getElementById("persona-permission-selected-full-name");
						Ozone.utils.dom.removeAllChildrenNodes(nameNode);
						nameNode.appendChild(document.createTextNode(p.getUsername()));

						var userNameNode = document.getElementById("persona-permission-selected-username");
						Ozone.utils.dom.removeAllChildrenNodes(userNameNode);
						userNameNode.appendChild(document.createTextNode(p.getUsername()));

						var roleNode = document.getElementById("persona-permission-selected-role");
						Ozone.utils.dom.removeAllChildrenNodes(roleNode);
						if (!Ozone.utils.isUndefinedOrNull(p.getRoles())) {
							roleNode.parentNode.style.display = "block";
							roleNode.appendChild(document.createTextNode(p.getRoles()));
						} else {
							roleNode.parentNode.style.display = "none";
						}

						if (!Ozone.utils.isUndefinedOrNull(Ozone.utils.safe(personas[i], "meta.profileImageId"))) {
							document.getElementById("persona-permission-selected-image").src = Ozone.Service("Persistence").Store("personas").Drive("profileImages").getDrivePath(personas[i].meta.profileImageId);
						} else {
							document.getElementById("persona-permission-selected-image").src = "components/ozone-persona-permissions/images/default-profile.jpg";
						}

						if (Ozone.utils.isUndefinedOrNull(personaPermissionSelectedImageElement)) {
							personaPermissionSelectedImageElement = document.getElementById("persona-permission-selected-image-control");
							personaPermissionSelectedImageElement.addEventListener("click", function (event) {
								if (event.preventDefault) {
									event.preventDefault();
								}
								document.getElementById("persona-permission-selected-image-input").click();
							});

							document.getElementById("ozone-personas-permission-permission-save").addEventListener("click", function (event) {
								if (event.preventDefault) {
									event.preventDefault();
								}
								var checks = document.querySelectorAll("#ozone-persona-permissions-persona-permission-list input[type='checkbox']:checked");
								if (!Ozone.utils.isUndefinedOrNull(checks)) {
									Ozone.Service("Personas").persona.getPersonaById(personas[i]._id, function (pers) {
										if (!Ozone.utils.isUndefinedOrNull(pers)) {
											pers.removeAllPermissions(true);
											var perms = [];
											for (var i = 0; i < checks.length; ++i) {
												console.log(checks[i].value);
												perms.push(checks[i].value);
											}
											pers.addPermission(perms);
										}
									});
								}
							});

							document.getElementById("persona-permission-selected-image-input").addEventListener("change", function (event) {
								var file = document.getElementById("persona-permission-selected-image-input").files[0];

								var reader = new FileReader();
								reader.readAsDataURL(file);
								reader.onload = function (fileEvent) {
									document.getElementById("persona-permission-selected-image").src = fileEvent.target.result;
									document.getElementById("ozone-persona-permissions-persona-list-" + personas[i]._id).src = fileEvent.target.result;
									Ozone.Service("Persistence").Store("personas").Drive("profileImages").set(null, file, function (results) {
										if (!Ozone.utils.isUndefinedOrNull(results)) {
											Ozone.Service("Personas").persona.getPersonaById(personas[i]._id, function (pers) {
												if (!Ozone.utils.isUndefinedOrNull(pers)) {
													pers.setProfileImage(results[0]._id, function (result) {
														personas[i] = result.get();
													});
												}
											});
										}
									});
								};
							});
						}

						document.getElementById("ozone-persona-permissions-persona-list").style.display = "none";
						document.getElementById("ozone-persona-permissions-persona").style.display = "block";
						break;
					}
				}
			}
		};
	}());
}());
//@ sourceURL=ozone-persona-persmissions.js
