// Modern Mobile-First Game Engine for Sonic RPG V4

class GameEngine {
    constructor() {
        this.gameData = null;
        this.currentLocation = 'start';
        this.dialogueMode = false;
        this.currentNPC = null;
        this.actionBubbleTimeout = null;
        this.fabMenuOpen = false;
        
        this.init();
    }

    async init() {
        // Load game data
        try {
            const response = await fetch('data/game.json');
            this.gameData = await response.json();
        } catch (error) {
            console.error('Error loading game data:', error);
            // Fallback data structure
            this.gameData = {
                game: {
                    playerName: "",
                    currentLocation: "start",
                    gameState: {
                        hasName: false,
                        talkedToDean: false,
                        gotOrientation: false,
                        talkedToJim: false,
                        jimQuestionAnswered: false,
                        jimWrongAnswers: 0,
                        expelled: false
                    }
                }
            };
        }

        this.setupEventListeners();
        this.showStartScreen();
    }

    setupEventListeners() {
        // Start screen
        document.getElementById('enroll-btn').addEventListener('click', () => {
            this.startGame();
        });
        
        // History button
        document.getElementById('history-btn').addEventListener('click', () => {
            this.showLastMessage();
        });

        // Dialogue input
        document.getElementById('dialogue-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendDialogue();
            }
        });

        document.getElementById('dialogue-send').addEventListener('click', () => {
            this.sendDialogue();
        });

        document.getElementById('dialogue-cancel').addEventListener('click', () => {
            this.cancelDialogue();
        });

        // Restart button
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartGame();
        });

        // Floating Action Menu
        const fabMain = document.getElementById('fab-main');
        fabMain.addEventListener('click', () => {
            this.toggleFABMenu();
        });

        // Orientation modal
        document.querySelector('.modal-close').addEventListener('click', () => {
            this.closeOrientationModal();
        });

        document.getElementById('go-to-quad-btn').addEventListener('click', () => {
            this.closeOrientationModal();
            this.goToLocation('quad');
        });

        document.getElementById('drop-out-btn').addEventListener('click', () => {
            this.closeOrientationModal();
            this.gameOver('Dropped Out', 'You decided to drop out of Console University. Game over.');
        });

        // Close modal on background click
        document.getElementById('orientation-modal').addEventListener('click', (e) => {
            if (e.target.id === 'orientation-modal') {
                this.closeOrientationModal();
            }
        });

        // Speech bubble navigation removed - using inline navigation in bubbles now
    }

    showStartScreen() {
        // Hide all screens first
        document.getElementById('game-over-screen').classList.add('hidden');
        document.getElementById('game-over-screen').style.display = 'none';
        
        // Show start screen
        const startScreen = document.getElementById('start-screen');
        startScreen.classList.remove('hidden');
        startScreen.style.display = 'flex';
        startScreen.style.visibility = 'visible';
        
        // Hide FAB menu on welcome screen
        const fabMenu = document.getElementById('floating-action-menu');
        fabMenu.style.display = 'none';
        
        // Hide dialogue container
        const dialogueContainer = document.getElementById('dialogue-container');
        dialogueContainer.classList.add('hidden');
        
        // Clear any speech bubbles
        this.clearSpeechBubbles();
        
        // Clear action bubbles
        const actionBubbles = document.getElementById('action-bubbles');
        actionBubbles.innerHTML = '';
        
        // Show Console University image on start screen
        const sceneImage = document.getElementById('scene-image');
        const startLocation = this.gameData.game.locations.start;
        if (startLocation && startLocation.image) {
            sceneImage.src = startLocation.image;
            sceneImage.alt = startLocation.name;
            sceneImage.style.opacity = '1';
            sceneImage.onerror = () => {
                sceneImage.src = '';
                sceneImage.alt = startLocation.name;
            };
        }
    }

    startGame() {
        const startScreen = document.getElementById('start-screen');
        startScreen.classList.add('hidden');
        startScreen.style.display = 'none';
        startScreen.style.visibility = 'hidden';
        // Hide FAB menu on welcome screen
        const fabMenu = document.getElementById('floating-action-menu');
        if (fabMenu) {
            fabMenu.style.display = 'none';
        }
        // Clear start screen image overlay
        const sceneOverlay = document.getElementById('scene-overlay');
        if (sceneOverlay) {
            sceneOverlay.style.display = 'none';
        }
        this.goToLocation('dean_office');
    }

    goToLocation(locationId) {
        // Hide any NPC portraits when changing locations
        this.hideNPCPortrait();
        
        // Make sure start screen is hidden
        const startScreen = document.getElementById('start-screen');
        startScreen.classList.add('hidden');
        startScreen.style.display = 'none';
        
        this.currentLocation = locationId;
        const location = this.gameData.game.locations[locationId];
        
        if (!location) {
            console.error('Location not found:', locationId);
            return;
        }

        // Check if location has image/mission or show "Scene Coming Soon"
        if (!location.image || location.image === '') {
            this.showActionBubble('Scene Coming Soon', 'This location is under construction.');
        } else {
            // Show action bubble with setting description
            const settingDesc = location.settingDescription || location.description || '';
            this.showActionBubble(`You enter ${location.name}`, settingDesc);
        }

        // Update scene image - full screen background
        const sceneImage = document.getElementById('scene-image');
        const sceneContainer = document.getElementById('scene-image-container');
        
        if (location.image) {
            // Force reload by adding timestamp to prevent caching issues
            sceneImage.src = location.image + '?t=' + Date.now();
            sceneImage.alt = location.name;
            sceneImage.style.opacity = '1';
            sceneContainer.classList.add('showing-scene');
            sceneContainer.classList.remove('showing-portrait');
            
            sceneImage.onerror = () => {
                // If image fails to load, show placeholder
                console.warn('Image not found:', location.image);
                console.warn('Please place the image at:', location.image);
                sceneImage.src = '';
                sceneImage.alt = location.name;
            };
            
            sceneImage.onload = () => {
                console.log('Image loaded:', location.image);
            };
        } else {
            sceneImage.src = '';
            sceneImage.alt = location.name;
            sceneContainer.classList.add('showing-scene');
        }

        // Clear speech bubbles
        this.clearSpeechBubbles();

        // Update floating action menu
        this.updateFABMenu(location);

        // Handle location-specific logic
        this.handleLocationEntry(location);
    }

    handleLocationEntry(location) {
        if (location.id === 'dean_office' && !this.gameData.game.gameState.talkedToDean) {
            // Hide FAB menu until talking to dean
            const fabMenu = document.getElementById('floating-action-menu');
            fabMenu.style.display = 'none';
            
            // Clear action bubble before switching to Dean1 image
            setTimeout(() => {
                const actionBubbles = document.getElementById('action-bubbles');
                if (actionBubbles) {
                    actionBubbles.innerHTML = '';
                    if (this.actionBubbleTimeout) {
                        clearTimeout(this.actionBubbleTimeout);
                        this.actionBubbleTimeout = null;
                    }
                }
                // Auto-start conversation with Dean
                this.startDialogue('dean_cain');
            }, 1500);
        } else {
            // Show FAB menu for other locations
            const fabMenu = document.getElementById('floating-action-menu');
            fabMenu.style.display = 'block';
        }
    }

    showActionBubble(text, settingDescription = null) {
        const container = document.getElementById('action-bubbles');
        container.innerHTML = '';
        
        const bubble = document.createElement('div');
        bubble.className = 'action-bubble';
        
        const mainText = document.createElement('div');
        mainText.className = 'action-bubble-main';
        mainText.textContent = text;
        bubble.appendChild(mainText);
        
        // Add setting description if provided
        if (settingDescription) {
            const settingText = document.createElement('div');
            settingText.className = 'action-bubble-setting';
            settingText.textContent = settingDescription;
            bubble.appendChild(settingText);
        }
        
        container.appendChild(bubble);

        // Remove after animation - faster for dean's office
        if (this.actionBubbleTimeout) {
            clearTimeout(this.actionBubbleTimeout);
        }
        const timeoutDuration = (this.currentLocation === 'dean_office') ? 1200 : 4000;
        this.actionBubbleTimeout = setTimeout(() => {
            bubble.style.animation = 'actionPop 0.5s ease-out reverse';
            setTimeout(() => {
                container.innerHTML = '';
            }, 500);
        }, timeoutDuration);
    }

    updateFABMenu(location) {
        const fabOptions = document.getElementById('fab-options');
        fabOptions.innerHTML = '';
        this.fabMenuOpen = false;
        const fabMain = document.getElementById('fab-main');
        fabMain.classList.remove('active');

        // Check if location requires talking to NPC first
        const state = this.gameData.game.gameState;
        if (location.requiresTalk && !state.talkedToDean && location.id === 'dean_office') {
            // Show "Talk to Dean" option
            if (location.npc) {
                const talkOption = this.createFABOption(`Talk to ${this.getNPCName(location.npc)}`, () => {
                    this.closeFABMenu();
                    this.startDialogue(location.npc);
                });
                fabOptions.appendChild(talkOption);
            }
            return;
        }

        // Add location-specific actions
        if (location.npc) {
            const talkOption = this.createFABOption(`Talk to ${this.getNPCName(location.npc)}`, () => {
                this.closeFABMenu();
                this.startDialogue(location.npc);
            });
            fabOptions.appendChild(talkOption);
        }

        // Special handling for Quad
        if (location.id === 'quad') {
            // If Jim is gone, show "Go to Frat" and "Keep Walking"
            if (!location.npc) {
                const goToFratOption = this.createFABOption('Go to Frat', () => {
                    this.closeFABMenu();
                    this.showActionBubble('Scene Coming Soon', 'This location is under construction.');
                });
                fabOptions.appendChild(goToFratOption);
                
                const keepWalkingOption = this.createFABOption('Keep Walking', () => {
                    this.closeFABMenu();
                    this.showActionBubble('Scene Coming Soon', 'Other areas are under construction.');
                });
                fabOptions.appendChild(keepWalkingOption);
            } else {
                // Jim is still there - show "Talk to Jim" and "Keep Walking"
                const keepWalkingOption = this.createFABOption('Keep Walking', () => {
                    this.closeFABMenu();
                    this.showActionBubble('Scene Coming Soon', 'Other areas are under construction.');
                });
                fabOptions.appendChild(keepWalkingOption);
            }
            return; // Don't show other exits for quad
        }

        // Add exit buttons (only if requirements met and not quad)
        if (location.exits && location.exits.length > 0) {
            location.exits.forEach(exitId => {
                const exitLocation = this.gameData.game.locations[exitId];
                if (exitLocation) {
                    // Check if exit requires talking to dean first
                    if (exitId === 'quad' && location.id === 'dean_office' && !state.talkedToDean) {
                        return; // Skip this exit
                    }
                    
                    const exitOption = this.createFABOption(`Go to ${exitLocation.name}`, () => {
                        this.closeFABMenu();
                        this.goToLocation(exitId);
                    });
                    fabOptions.appendChild(exitOption);
                }
            });
        }
    }

    createFABOption(text, onClick) {
        const option = document.createElement('button');
        option.className = 'fab-option';
        option.textContent = text;
        option.addEventListener('click', onClick);
        return option;
    }

    toggleFABMenu() {
        const fabMain = document.getElementById('fab-main');
        const fabOptions = document.getElementById('fab-options');
        
        this.fabMenuOpen = !this.fabMenuOpen;
        
        if (this.fabMenuOpen) {
            fabMain.classList.add('active');
            fabOptions.classList.remove('hidden');
        } else {
            fabMain.classList.remove('active');
            fabOptions.classList.add('hidden');
        }
    }

    closeFABMenu() {
        if (this.fabMenuOpen) {
            this.toggleFABMenu();
        }
    }

    startDialogue(npcId) {
        this.dialogueMode = true;
        this.currentNPC = npcId;
        const npc = this.gameData.game.npcs[npcId];
        
        if (!npc) {
            console.error('NPC not found:', npcId);
            return;
        }

        // Close FAB menu if open
        this.closeFABMenu();

        // Switch scene image for NPCs (no character box)
        if (npcId === 'dean_cain') {
            const sceneImage = document.getElementById('scene-image');
            const state = this.gameData.game.gameState;
            // Clear action bubble immediately when switching to Dean1
            const actionBubbles = document.getElementById('action-bubbles');
            if (actionBubbles) {
                actionBubbles.innerHTML = '';
                if (this.actionBubbleTimeout) {
                    clearTimeout(this.actionBubbleTimeout);
                    this.actionBubbleTimeout = null;
                }
            }
            // If already got orientation, show Dean3 and tell them to leave
            if (state.gotOrientation) {
                sceneImage.src = 'assets/images/Dean3.png';
            } else {
                sceneImage.src = 'assets/images/Dean1.png';
            }
        } else if (npcId === 'earthworm_jim') {
            // Use Jim1 for intro greeting
            const sceneImage = document.getElementById('scene-image');
            sceneImage.src = 'assets/images/Jim1.png';
            sceneImage.style.opacity = '1';
            // Clear action bubble immediately when switching to Jim1
            const actionBubbles = document.getElementById('action-bubbles');
            if (actionBubbles) {
                actionBubbles.innerHTML = '';
                if (this.actionBubbleTimeout) {
                    clearTimeout(this.actionBubbleTimeout);
                    this.actionBubbleTimeout = null;
                }
            }
        }

        // Show dialogue input (slides up from bottom)
        const dialogueContainer = document.getElementById('dialogue-container');
        dialogueContainer.classList.remove('hidden');
        // Adjust FAB position when dialogue is visible
        this.adjustFABPosition(true);
        setTimeout(() => {
            document.getElementById('dialogue-input').focus();
        }, 300);

        // Show greeting
        this.showSpeechBubble(npc.name, npc.greeting, 'left');

        // Handle specific NPC logic
        if (npcId === 'dean_cain') {
            this.handleDeanDialogue();
        } else if (npcId === 'earthworm_jim') {
            this.handleJimDialogue();
        }
    }

    showNPCPortrait(npcId, variant = 'default') {
        const npc = this.gameData.game.npcs[npcId];
        if (!npc) return;

        const container = document.getElementById('npc-portrait-container');
        const portrait = document.getElementById('npc-portrait');
        const sceneContainer = document.getElementById('scene-image-container');
        
        // Determine which portrait to use
        let portraitSrc = npc.portrait;
        if (variant === 'question' && npc.portraitQuestion) {
            portraitSrc = npc.portraitQuestion;
        } else if (variant === 'bad' && npc.portraitBad) {
            portraitSrc = npc.portraitBad;
        } else if (variant === 'exam' && npc.portraitExam) {
            portraitSrc = npc.portraitExam;
        } else if (variant === 'expelled' && npc.portraitExpelled) {
            portraitSrc = npc.portraitExpelled;
        } else if (variant === 'orientation' && npc.portraitOrientation) {
            portraitSrc = npc.portraitOrientation;
        }
        
        // If NPC has a portrait image, show it
        if (portraitSrc) {
            portrait.src = portraitSrc;
            portrait.alt = npc.name;
            
            // Flip Jim1 horizontally to face other way (only for default Jim1)
            if (npcId === 'earthworm_jim' && variant === 'default') {
                portrait.style.transform = 'scaleX(-1)';
            } else {
                portrait.style.transform = 'none';
            }
            
            // Add class for Dean to size correctly
            if (npcId === 'dean_cain') {
                container.classList.add('showing-dean');
            } else {
                container.classList.remove('showing-dean');
            }
            
            portrait.onerror = () => {
                console.warn('Portrait not found:', portraitSrc);
                container.classList.add('hidden');
                sceneContainer.classList.remove('showing-portrait');
            };
            
            container.classList.remove('hidden');
            sceneContainer.classList.add('showing-portrait');
        } else {
            // No portrait, just show dialogue over scene
            container.classList.add('hidden');
            sceneContainer.classList.remove('showing-portrait');
        }
    }

    updateNPCPortrait(npcId, variant) {
        this.showNPCPortrait(npcId, variant);
    }

    hideNPCPortrait() {
        const container = document.getElementById('npc-portrait-container');
        const sceneContainer = document.getElementById('scene-image-container');
        container.classList.add('hidden');
        sceneContainer.classList.remove('showing-portrait');
    }

    checkAndHidePortrait(locationId) {
        // Hide portrait if leaving a location with an NPC
        const currentLocation = this.gameData.game.locations[locationId];
        if (currentLocation && currentLocation.npc) {
            // Only hide if we're leaving this location
            if (this.currentLocation !== locationId) {
                this.hideNPCPortrait();
            }
        }
    }

    handleDeanDialogue() {
        // This is called when dialogue starts, not when processing responses
        // The actual response handling is in processDialogueResponse
    }

    handleJimDialogue() {
        const state = this.gameData.game.gameState;
        
        if (!state.talkedToJim) {
            state.talkedToJim = true;
        }
    }

    sendDialogue() {
        const input = document.getElementById('dialogue-input');
        const text = input.value.trim();

        if (!text) return;

        // Show player's dialogue (bottom right)
        this.showSpeechBubble('You', text, 'right');

        // Process response
        setTimeout(() => {
            this.processDialogueResponse(text);
        }, 500);

        input.value = '';
    }

    processDialogueResponse(text) {
        const npc = this.gameData.game.npcs[this.currentNPC];
        const state = this.gameData.game.gameState;
        const textLower = text.toLowerCase();

        if (this.currentNPC === 'dean_cain') {
            // Check if we're waiting for name
            if (!state.hasName) {
                // Check for derogatory phrases and curse words
                const derogatoryPhrases = ['bite me', 'screw you', 'fuck off', 'piss off', 'go to hell', 'drop dead', 
                                          'shut up', 'shut it', 'shut your', 'get lost', 'buzz off', 'piss on', 
                                          'kiss my', 'kiss my ass', 'suck it', 'suck my', 'eat shit', 'eat me'];
                const curseWords = ['fuck', 'shit', 'damn', 'hell', 'ass', 'dipshit', 'jerk', 'idiot', 'stupid', 
                                   'dumb', 'moron', 'bastard', 'bitch', 'crap', 'piss'];
                const insults = ['stupid', 'idiot', 'dumb', 'suck', 'hate', 'screw', 'jerk'];
                
                const isDerogatory = derogatoryPhrases.some(phrase => textLower.includes(phrase)) ||
                                    curseWords.some(word => textLower === word || textLower.includes(' ' + word + ' ') || 
                                                          textLower.startsWith(word + ' ') || textLower.endsWith(' ' + word)) ||
                                    insults.some(insult => textLower.includes(insult));

                if (isDerogatory) {
                    // Update scene image to expelled version (Dean3)
                    const sceneImage = document.getElementById('scene-image');
                    sceneImage.src = 'assets/images/Dean3.png';
                    this.showSpeechBubble('Dean Cain', npc.responses.insult, 'left');
                    setTimeout(() => {
                        this.cancelDialogue();
                        // Show carback.png and game over screen
                        this.gameOver('Expelled from Console University', 'You insulted the Dean. Game over.');
                    }, 3000);
                    return;
                }

                // Check if it's a question
                const isQuestion = textLower.includes('?') || 
                                  textLower.startsWith('what') || textLower.startsWith('how') || 
                                  textLower.startsWith('why') || textLower.startsWith('when') || 
                                  textLower.startsWith('where') || textLower.startsWith('who') ||
                                  textLower.includes('what ') || textLower.includes('how ') ||
                                  textLower.includes('why ') || textLower.includes('when ') ||
                                  textLower.includes('where ') || textLower.includes('who ');

                if (isQuestion) {
                    // Question - show exam scene (Dean2)
                    const sceneImage = document.getElementById('scene-image');
                    sceneImage.src = 'assets/images/Dean2.png';
                    this.showSpeechBubble('Dean Cain', npc.responses.nonsense, 'left');
                    setTimeout(() => {
                        this.showEntranceExam();
                        this.cancelDialogue();
                    }, 3000);
                    return;
                }

                // Check if it's a recognizable name
                // Names are typically 1-3 words, 2-30 characters, no special punctuation except hyphens/apostrophes
                const isTooLong = text.length > 30;
                const hasGameKeywords = textLower.includes('sonic') || textLower.includes('stadium') || 
                                       textLower.includes('championship') || textLower.includes('mission');
                const hasInvalidChars = /[!@#$%^&*()_+=\[\]{};:"\\|,.<>\/?]/.test(text);
                const isCommand = textLower.startsWith('go ') || textLower.startsWith('talk ') || 
                                 textLower.startsWith('enter ') || textLower.startsWith('exit ');
                
                // Common name patterns: First Last, First-Middle-Last, or single name
                const namePattern = /^[A-Za-z]+([\s'-][A-Za-z]+)*$/;
                const looksLikeName = namePattern.test(text) && !isTooLong && !hasGameKeywords && 
                                     !hasInvalidChars && !isCommand && text.length >= 2;

                if (looksLikeName) {
                    // Recognizable name - show orientation (Dean4)
                    const sceneImage = document.getElementById('scene-image');
                    sceneImage.src = 'assets/images/Dean4.png';
                    
                    state.hasName = true;
                    state.talkedToDean = true;
                    this.gameData.game.playerName = text;
                    
                    setTimeout(() => {
                        this.showSpeechBubble('Dean Cain', 
                            npc.responses.name_given.replace('{name}', text),
                            'left');
                        
                        setTimeout(() => {
                            this.showOrientation();
                            this.cancelDialogue();
                            // Show FAB menu after orientation
                            const fabMenu = document.getElementById('floating-action-menu');
                            fabMenu.style.display = 'block';
                            this.updateFABMenu(this.gameData.game.locations['dean_office']);
                        }, 3000);
                    }, 500);
                } else {
                    // Not recognizable as name - treat as question/exam
                    const sceneImage = document.getElementById('scene-image');
                    sceneImage.src = 'assets/images/Dean2.png';
                    this.showSpeechBubble('Dean Cain', npc.responses.nonsense, 'left');
                    setTimeout(() => {
                        this.showEntranceExam();
                        this.cancelDialogue();
                    }, 3000);
                }
            } else {
                // Already got name - if got orientation, tell them to leave
                const sceneImage = document.getElementById('scene-image');
                if (state.gotOrientation) {
                    sceneImage.src = 'assets/images/Dean3.png';
                    this.showSpeechBubble('Dean Cain', 'You can leave my office now.', 'left');
                } else {
                    this.showSpeechBubble('Dean Cain', 'You can exit my office now.', 'left');
                }
                setTimeout(() => {
                    this.cancelDialogue();
                }, 2000);
            }
        } else if (this.currentNPC === 'earthworm_jim') {
            // Jim's simplified flow - whatever user says, Jim responds with default response
            const sceneImage = document.getElementById('scene-image');
            // Switch to Jim2.png when he says he was being nice
            sceneImage.src = 'assets/images/Jim2.png';
            sceneImage.style.opacity = '1';
            sceneImage.style.transition = 'opacity 0.3s ease';
            
            // Show Jim's response
            this.showSpeechBubble('Earthworm Jim', npc.defaultResponse || 'Uh yeah I was just being nice but why don\'t you check out the frat.', 'left');
            
            setTimeout(() => {
                this.cancelDialogue();
                // Fade out Jim2 image, then show quad
                sceneImage.style.transition = 'opacity 0.5s ease-out';
                sceneImage.style.opacity = '0';
                setTimeout(() => {
                    // Switch to quad image
                    sceneImage.src = 'assets/images/Quad1.png';
                    // Wait for image to load, then fade in
                    sceneImage.onload = () => {
                        sceneImage.style.opacity = '1';
                    };
                    // Fallback if image is cached
                    if (sceneImage.complete) {
                        sceneImage.style.opacity = '1';
                    }
                    sceneImage.style.transition = '';
                    
                    // Jim exits - remove from location
                    const location = this.gameData.game.locations[this.currentLocation];
                    if (location.npc === 'earthworm_jim') {
                        delete location.npc;
                        // Update FAB menu to show only "Go to Frat" and "Keep Walking"
                        this.updateFABMenu(location);
                    }
                }, 500);
            }, 3000);
        }
    }

    showOrientation() {
        // Show orientation as image modal
        const modal = document.getElementById('orientation-modal');
        const orientationImage = document.getElementById('orientation-image');
        
        // Set image source
        orientationImage.src = 'assets/images/letterO.png';
        orientationImage.onerror = () => {
            console.warn('Orientation image not found. Please add orientation_schedule.png to assets/images/');
            // Fallback: show text in modal if image not found
            const npc = this.gameData.game.npcs.dean_cain;
            const orientation = npc.orientation.replace(/{name}/g, this.gameData.game.playerName);
            orientationImage.style.display = 'none';
            const textDiv = document.createElement('div');
            textDiv.style.padding = '20px';
            textDiv.style.fontFamily = 'Comic Neue, Comic Sans MS, cursive';
            textDiv.style.whiteSpace = 'pre-line';
            textDiv.textContent = orientation;
            document.querySelector('.modal-content').insertBefore(textDiv, document.querySelector('.modal-actions'));
        };
        
        modal.classList.remove('hidden');
        this.gameData.game.gameState.gotOrientation = true;
    }

    closeOrientationModal() {
        const modal = document.getElementById('orientation-modal');
        modal.classList.add('hidden');
    }

    showEntranceExam() {
        // Show entrance exam screen (simplified for now)
        this.showActionBubble('Entrance Exam', 'Scene Coming Soon');
        // Could add exam logic here
    }

    showSpeechBubble(speaker, text, position = 'left') {
        const container = document.getElementById('speech-bubbles');
        
        // Track speech bubbles for history
        if (!this.currentConversationBubbles) {
            this.currentConversationBubbles = [];
        }
        this.currentConversationBubbles.push({ speaker, text, position });
        this.currentSpeechIndex = this.currentConversationBubbles.length - 1;
        
        // Clear previous bubbles when new speaker talks or same speaker says new line
        const existingBubbles = container.querySelectorAll('.speech-bubble');
        existingBubbles.forEach(bubble => {
            const existingSpeaker = bubble.querySelector('.speaker-name')?.textContent;
            const existingPosition = bubble.classList.contains('left') ? 'left' : 'right';
            
            // Remove if different speaker OR same speaker saying new line
            if (existingSpeaker !== speaker || existingPosition !== position) {
                bubble.style.opacity = '0';
                bubble.style.transform = 'scale(0.8)';
                setTimeout(() => bubble.remove(), 300);
            } else {
                // Same speaker, new line - remove previous bubble
                bubble.style.opacity = '0';
                bubble.style.transform = 'scale(0.8)';
                setTimeout(() => bubble.remove(), 300);
            }
        });
        
        // Create new bubble
        const bubble = document.createElement('div');
        bubble.className = `speech-bubble ${position}`;
        bubble.style.opacity = '0';
        bubble.style.transform = 'scale(0.8)';
        
        const speakerName = document.createElement('div');
        speakerName.className = 'speaker-name';
        speakerName.textContent = speaker;
        
        const speechText = document.createElement('div');
        speechText.className = 'speech-text';
        speechText.textContent = text;
        
        bubble.appendChild(speakerName);
        bubble.appendChild(speechText);
        
        container.appendChild(bubble);
        
        // Animate in
        setTimeout(() => {
            bubble.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            bubble.style.opacity = '1';
            bubble.style.transform = 'scale(1)';
        }, 50);

        // Adjust position if dialogue is visible (for user bubbles)
        if (position === 'right') {
            const dialogueVisible = !document.getElementById('dialogue-container').classList.contains('hidden');
            const isMobile = window.innerWidth <= 480;
            if (dialogueVisible) {
                bubble.style.bottom = isMobile ? '200px' : '220px';
            } else {
                bubble.style.bottom = isMobile ? '120px' : '140px';
            }
        }
        
        // Auto-remove bubbles after delay (shorter on mobile)
        const isMobile = window.innerWidth <= 480;
        const delay = isMobile ? 3000 : 4000;
        setTimeout(() => {
            if (bubble.parentNode) {
                bubble.style.opacity = '0';
                bubble.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    if (bubble.parentNode) {
                        bubble.remove();
                    }
                }, 300);
            }
        }, delay);
        
        // Update history button
        this.updateHistoryButton();
    }

    showCurrentBubble() {
        if (!this.currentConversationBubbles || this.currentConversationBubbles.length === 0) return;
        
        const current = this.currentConversationBubbles[this.currentSpeechIndex];
        const container = document.getElementById('speech-bubbles');
        
        // Remove all bubbles for this speaker
        const bubblesToRemove = container.querySelectorAll(`.speech-bubble.${current.position}`);
        bubblesToRemove.forEach(b => {
            if (b.querySelector('.speaker-name')?.textContent === current.speaker) {
                b.remove();
            }
        });
        
        // Show current bubble
        this.showSpeechBubble(current.speaker, current.text, current.position);
    }

    clearSpeechBubbles() {
        document.getElementById('speech-bubbles').innerHTML = '';
        this.currentConversationBubbles = [];
        this.currentSpeechIndex = 0;
        this.updateHistoryButton();
    }
    
    updateHistoryButton() {
        const historyBtn = document.getElementById('history-btn');
        if (this.currentConversationBubbles && this.currentConversationBubbles.length > 0) {
            historyBtn.classList.remove('hidden');
        } else {
            historyBtn.classList.add('hidden');
        }
    }
    
    showLastMessage() {
        if (!this.currentConversationBubbles || this.currentConversationBubbles.length === 0) return;
        
        const lastMessage = this.currentConversationBubbles[this.currentConversationBubbles.length - 1];
        // Clear all bubbles and show last one
        const container = document.getElementById('speech-bubbles');
        container.innerHTML = '';
        
        // Show last message
        this.showSpeechBubble(lastMessage.speaker, lastMessage.text, lastMessage.position);
    }

    cancelDialogue() {
        this.dialogueMode = false;
        this.currentNPC = null;
        const dialogueContainer = document.getElementById('dialogue-container');
        dialogueContainer.classList.add('hidden');
        document.getElementById('dialogue-input').value = '';
        this.hideNPCPortrait();
        // Adjust FAB position when dialogue is hidden
        this.adjustFABPosition(false);
        
        // Restore action bubble visibility
        const actionBubbles = document.getElementById('action-bubbles');
        if (actionBubbles) {
            const bubble = actionBubbles.querySelector('.action-bubble');
            if (bubble) {
                bubble.style.opacity = '1';
                bubble.style.transform = 'translate(-50%, -50%) rotate(-2deg) scale(1)';
            }
        }
        
        // Don't clear speech bubbles immediately - let them stay visible longer
        setTimeout(() => {
            this.clearSpeechBubbles();
        }, 2000);
        
        // Update FAB menu to show "Talk to Dean" if in dean's office
        if (this.currentLocation === 'dean_office' && !this.gameData.game.gameState.talkedToDean) {
            const fabMenu = document.getElementById('floating-action-menu');
            fabMenu.style.display = 'block';
            this.updateFABMenu(this.gameData.game.locations['dean_office']);
        }
    }

    adjustFABPosition(dialogueVisible) {
        const fabMenu = document.getElementById('floating-action-menu');
        const isMobile = window.innerWidth <= 480;
        if (dialogueVisible) {
            fabMenu.style.bottom = isMobile ? '160px' : '170px';
        } else {
            fabMenu.style.bottom = isMobile ? '70px' : '80px';
        }
    }

    getNPCName(npcId) {
        const npc = this.gameData.game.npcs[npcId];
        return npc ? npc.name : npcId;
    }

    gameOver(title, message) {
        // Show carback.png image for expelled/dropped out
        const sceneImage = document.getElementById('scene-image');
        sceneImage.src = 'assets/images/carback.png';
        sceneImage.style.opacity = '1';
        
        // Hide start screen if visible
        const startScreen = document.getElementById('start-screen');
        startScreen.classList.add('hidden');
        startScreen.style.display = 'none';
        
        // Hide dialogue container
        const dialogueContainer = document.getElementById('dialogue-container');
        dialogueContainer.classList.add('hidden');
        
        // Hide FAB menu
        const fabMenu = document.getElementById('floating-action-menu');
        fabMenu.style.display = 'none';
        
        // Clear speech bubbles
        this.clearSpeechBubbles();
        
        // Show game over screen
        const gameOverScreen = document.getElementById('game-over-screen');
        gameOverScreen.classList.remove('hidden');
        gameOverScreen.style.display = 'flex';
        
        document.getElementById('game-over-title').textContent = title;
        document.getElementById('game-over-message').textContent = message;
        this.gameData.game.gameState.expelled = true;
    }

    restartGame() {
        // Reset game state
        this.gameData.game.playerName = "";
        this.gameData.game.currentLocation = "start";
        this.gameData.game.gameState = {
            hasName: false,
            talkedToDean: false,
            gotOrientation: false,
            talkedToJim: false,
            jimQuestionAnswered: false,
            jimWrongAnswers: 0,
            expelled: false
        };
        
        document.getElementById('game-over-screen').classList.add('hidden');
        this.showStartScreen();
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.game = new GameEngine();
});

