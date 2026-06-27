// ==UserScript==
// @name         [V]-UI-Core
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  UI Framework for Torn
// @author       [V]-ochlu
// @match        https://www.torn.com/*
// @icon         https://avatars.githubusercontent.com/u/82180782?v=4
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_listValues
// @grant        GM_deleteValue
// @grant        GM_xmlhttpRequest
// @grant        GM_openInTab
// ==/UserScript==

// UI HELPER
const UI = {

    // --------------------
    // Shared styling defaults
    // --------------------
    style: {
        fontSize: "12px",   // default font size for all UI elements
        rowGap: 6,          // default gap between elements in a row
        margin: "0 0 6px 0", // default margin for rows
        inputHeight: "14px" // default height for small inputs
    },

    // --------------------
    // Create a flexible row container
    // --------------------
    row({ gap = UI.style.rowGap, align = "center", margin = UI.style.margin } = {}) {
        const el = document.createElement("div");
        el.style.display = "flex";
        el.style.alignItems = align;
        el.style.gap = `${gap}px`;
        el.style.margin = margin;
        return el;
    },

    // --------------------
    // Create a text label
    // --------------------
    label(text) {
        const el = document.createElement("span");
        el.textContent = text;
        el.style.fontSize = UI.style.fontSize;
        return el;
    },

    // --------------------
    // Create a labeled checkbox
    // Returns both the container and the input element
    // --------------------
    checkboxLabel(text, checked, onChange) {
        const row = UI.row({ gap: 4 });

        const input = document.createElement("input");
        input.type = "checkbox";
        input.checked = checked;
        input.style.width = "14px";
        input.style.height = "14px";
        input.style.margin = "0";

        input.addEventListener("change", () => onChange(input.checked));

        const label = UI.label(text);

        row.appendChild(input);
        row.appendChild(label);

        return { el: row, input };
    },

    // --------------------
    // Create a dropdown select
    // --------------------
    select(options, value, onChange) {
        const select = document.createElement("select");
        select.style.fontSize = UI.style.fontSize;

        for (const [val, label] of options) {
            const opt = document.createElement("option");
            opt.value = val;
            opt.textContent = label;
            select.appendChild(opt);
        }

        select.value = value;

        select.addEventListener("change", () => onChange(select.value));

        return select;
    },

    // --------------------
    // Create a text input
    // --------------------
    input(placeholder, value, onChange) {
        const input = document.createElement("input");
        input.placeholder = placeholder;
        input.value = value;
        input.style.fontSize = UI.style.fontSize;

        input.addEventListener("input", () => onChange(input.value));

        return input;
    },

    // --------------------
    // Create a textarea
    // --------------------
    textarea(placeholder, value, onChange, rows = 3) {
        const ta = document.createElement("textarea");
        ta.placeholder = placeholder;
        ta.value = value;
        ta.rows = rows;
        ta.style.fontSize = UI.style.fontSize;
        ta.style.resize = "vertical";

        ta.addEventListener("input", () => onChange(ta.value));

        return ta;
    },

    // --------------------
    // Create a button
    // --------------------
    button(text, onClick) {
        const btn = document.createElement("button");
        btn.textContent = text;
        btn.style.fontSize = UI.style.fontSize;

        btn.addEventListener("click", onClick);
        return btn;
    },

    // --------------------
    // Create a color picker input
    // --------------------
    color(value, onChange) {
        const input = document.createElement("input");
        input.type = "color";
        input.value = value;

        input.addEventListener("input", () => onChange(input.value));

        // Style the swatch and remove default browser styling
        input.style.height = "18px";
        input.style.padding = "0";
        input.style.border = "none";
        input.style.background = "transparent";
        input.style.margin = "0";
        input.style.cursor = "pointer";
        input.style.webkitAppearance = "none";
        input.style.appearance = "none";
        input.style.borderRadius = "3px";

        return input;
    },

    // --------------------
    // Create a slider (range input)
    // --------------------
    slider({ min = 0, max = 1, step = 0.01, value = 0, onChange }) {
        const input = document.createElement("input");
        input.type = "range";

        input.min = min;
        input.max = max;
        input.step = step;
        input.value = value;

        // Make slider flexible to fit container width
        input.style.width = "100%";
        input.style.flex = "1";
        input.style.minWidth = "0";
        input.style.margin = "0";

        input.addEventListener("input", () => onChange(parseFloat(input.value)));

        return input;
    },

    // --------------------
    // Create a "glow strip" UI for selecting a glow color
    // --------------------
    glowStrip(options = {}) {
        const {
            glowMap = {
                "#ffa500": "orange",
                "#800080": "purple",
                "#ff0000": "red",
                "#40e0d0": "turquoise",
                "#ffff00": "yellow"
            },
            activeIndex = 0,
            onChange = () => { }
        } = options;

        const glowEntries = Object.entries(glowMap);
        const segments = [];

        const wrap = document.createElement("div");
        wrap.style.display = "flex";
        wrap.style.flex = "1";
        wrap.style.gap = "4px";
        wrap.style.marginBottom = "-5px"; // adjust spacing below glow strip

        const track = document.createElement("div");
        track.style.display = "flex";
        track.style.height = "12px";
        track.style.borderRadius = "4px";
        track.style.overflow = "hidden";
        track.style.flex = "1";
        track.style.cursor = "pointer";
        track.style.border = "1px solid #555";

        glowEntries.forEach(([hex, name], i) => {
            const seg = document.createElement("div");
            seg.style.flex = "1";
            seg.style.background = hex;
            seg.style.transition = "opacity 0.2s";
            seg.style.opacity = i === activeIndex ? "1" : "0.35";

            seg.onclick = () => {
                onChange(i);
                update(i);
            };

            segments.push(seg);
            track.appendChild(seg);
        });

        function update(newIndex) {
            segments.forEach((s, i) => {
                s.style.opacity = i === newIndex ? "1" : "0.35";
            });
        }

        wrap.update = (newIndex) => update(newIndex);
        wrap.appendChild(track);

        return {
            el: wrap,
            update: (newIndex) => update(newIndex)
        };
    },

    // --------------------
    // Helper for creating a horizontal row with a label and a control
    // --------------------
    labeledRow(text, control) {
        const row = UI.row({
            gap: 6,
            align: "center",
            margin: "0, 0, 0px, 0"
        });
        row.appendChild(UI.label(text));
        row.appendChild(control);
        return row;
    }

};

// FEATURE REGISTRY
const FeatureRegistry = (() => {
    const features = []; // Internal array storing all registered feature objects

    //////////////////////
    // REGISTER FEATURE
    //////////////////////
    // Adds a feature to the registry if it hasn't been added yet
    // feature: { id: string, render: function, ... }
    function register(feature) {
        // Only add the feature if there isn't already a feature with the same ID
        if (!features.some(f => f.id === feature.id)) {
            features.push(feature);
        }
    }

    //////////////////////
    // GET ALL FEATURES
    //////////////////////
    // Returns an array of all registered features
    function getAll() {
        return features;
    }

    // Expose public API
    return { register, getAll };
})();

// CUSTOM MENU
const CustomMenu = (() => {
    const PREFIX = (GM_info?.script?.name || "script").replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const MENU_ID = `${PREFIX}-custom-menu`;
    const HEADER_ID = `${PREFIX}-custom-menu-header`;
    const BODY_ID = `${PREFIX}-custom-menu-body`;

    // Default menu configuration
    const config = {
        title: GM_info?.script?.name ? (GM_info.script.name + " " + (GM_info.script.version || "")) : "Menu",
        width: "260px",
        top: "80px",
        left: "20px",
        zIndex: 99999,

        // MOBILE SETTINGS
        mobileBreakpoint: 768
    };

    const STORAGE_KEY = `${PREFIX}-customMenuState`;

    let menuEl = null;
    let isOpen = false;

    // Load saved state
    let state = typeof GM_getValue === 'function' ? GM_getValue(STORAGE_KEY, {
        top: config.top,
        left: config.left,
        open: false,
        sections: {}
    }) : {
        top: config.top,
        left: config.left,
        open: false,
        sections: {}
    };

    // Save current menu state
    function saveState() {
        if (typeof GM_setValue === 'function') GM_setValue(STORAGE_KEY, state);
    }

    //////////////////////
    // CREATE MENU DOM
    //////////////////////
    function create() {
        // Prevent multiple menu instances
        if (document.getElementById(MENU_ID)) return;

        // Create main container
        menuEl = document.createElement("div");
        menuEl.id = MENU_ID;

        // Header
        const header = document.createElement("div");
        header.id = HEADER_ID;
        header.textContent = config.title;

        // Body container
        const body = document.createElement("div");
        body.id = BODY_ID;

        menuEl.appendChild(header);
        menuEl.appendChild(body);
        document.body.appendChild(menuEl);

        // DESKTOP ONLY: Apply saved position
        if (window.innerWidth > config.mobileBreakpoint) {
            menuEl.style.top = state.top;
            menuEl.style.left = state.left;
        }

        // Enable drag functionality
        makeDraggable(menuEl);

        // Build menu UI
        buildUI(body);

        // Restore open/closed state
        state.open ? show() : hide();

        // Clamp to screen on window resize
        window.addEventListener('resize', clampPosition);
    }

    //////////////////////
    // CLAMP POSITION
    //////////////////////
    function clampPosition() {
        if (!menuEl || !isOpen || window.innerWidth <= config.mobileBreakpoint) return;

        const width = menuEl.offsetWidth;
        const height = menuEl.offsetHeight;

        let left = parseFloat(state.left) || 0;
        let top = parseFloat(state.top) || 0;

        left = Math.max(0, Math.min(window.innerWidth - width, left));
        top = Math.max(0, Math.min(window.innerHeight - height, top));

        state.left = left + "px";
        state.top = top + "px";

        menuEl.style.left = state.left;
        menuEl.style.top = state.top;
    }

    //////////////////////
    // COLLAPSING SECTION HEADER
    //////////////////////
    function addCollapsingHeader(container, title) {
        const wrapper = document.createElement("div");

        const head = document.createElement("div");
        head.className = "imgui-header";

        const content = document.createElement("div");
        content.className = "imgui-body";
        content.style.display = "none";

        let open = state.sections[title] ?? false;

        const updateHeader = () => {
            head.textContent = (open ? "\u25BC " : "\u25B6 ") + title;
            content.style.display = open ? "block" : "none";
        };

        head.addEventListener("click", () => {
            open = !open;
            state.sections[title] = open;
            saveState();
            updateHeader();
            // Clamp position in case opening the panel pushes the menu off the bottom
            setTimeout(clampPosition, 10);
        });

        updateHeader();

        wrapper.appendChild(head);
        wrapper.appendChild(content);
        container.appendChild(wrapper);

        return content;
    }

    //////////////////////
    // BUILD MENU UI
    //////////////////////
    function buildUI(body) {
        FeatureRegistry.getAll().forEach(feature => {
            feature.render(body, addCollapsingHeader);
        });
    }

    //////////////////////
    // SHOW / HIDE MENU
    //////////////////////
    function show() {
        if (!menuEl) return;

        menuEl.style.display = "block";

        isOpen = true;
        state.open = true;

        clampPosition();
        saveState();
    }

    function hide() {
        if (!menuEl) return;

        menuEl.style.display = "none";

        isOpen = false;
        state.open = false;

        saveState();
    }

    //////////////////////
    // TOGGLE MENU
    //////////////////////
    function toggle() {
        if (!menuEl) create();

        isOpen ? hide() : show();
    }

    //////////////////////
    // DRAGGABLE FUNCTIONALITY
    //////////////////////
    function makeDraggable(el) {
        const header = el.querySelector(`#${HEADER_ID}`);

        let offsetX = 0;
        let offsetY = 0;
        let dragging = false;

        header.style.cursor = "move";

        header.addEventListener("pointerdown", (e) => {

            // MOBILE: Disable dragging
            if (window.innerWidth <= config.mobileBreakpoint) {
                return;
            }

            dragging = true;

            const rect = el.getBoundingClientRect();

            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            header.setPointerCapture(e.pointerId);
        });

        header.addEventListener("pointermove", (e) => {
            if (!dragging) return;

            // Update live position
            state.left = e.clientX - offsetX + "px";
            state.top = e.clientY - offsetY + "px";

            clampPosition();
        });

        // Stop dragging
        window.addEventListener("pointerup", () => {
            if (!dragging) return;

            dragging = false;

            saveState();
        });
    }

    //////////////////////
    // APPLY STYLES
    //////////////////////
    function apply() {

        GM_addStyle(`
            #${MENU_ID} {
                position: fixed;

                top: ${config.top};
                left: ${config.left};

                width: ${config.width};

                min-width: 240px;
                max-width: 420px;

                background: rgba(20,20,20,0.95);
                color: white;

                border-radius: 8px;

                z-index: ${config.zIndex};

                font-family: Arial, sans-serif;

                box-shadow: 0 5px 20px rgba(0,0,0,0.4);

                display: none;

                overflow: hidden;

                backdrop-filter: blur(10px);

                border: 1px solid rgba(255,255,255,0.08);
            }

            #${HEADER_ID} {
                padding: 10px 12px;

                background: rgba(40,40,40,0.9);

                font-weight: bold;

                user-select: none;
            }

            #${BODY_ID} {
                padding: 10px;
            }

            .imgui-header {
                padding: 2px;

                background: rgba(255,255,255,0.08);

                cursor: pointer;

                font-weight: bold;

                font-size: 12px;

                margin-bottom: 4px;
            }

            .imgui-body {
                padding: 6px 8px 6px 26px;

                margin-bottom: 4px;
            }

            /* Inputs and selects */
            #${MENU_ID} input,
            #${MENU_ID} select,
            #${MENU_ID} textarea {
                width: 100%;

                margin: 2px 0 4px 0;

                background: #222;

                color: white;

                border: 1px solid #444;

                border-radius: 4px;

                font-size: 12px;

                box-sizing: border-box;
            }

            #${MENU_ID} input,
            #${MENU_ID} select {
                height: 22px;
            }

            #${MENU_ID} textarea {
                padding: 4px;
                font-family: inherit;
            }

            #${MENU_ID},
            #${MENU_ID} * {
                font-family: Arial, Helvetica, "Segoe UI Symbol", "Arial Unicode MS", sans-serif;
            }

            /* Buttons */
            #${MENU_ID} button {
                width: 100%;

                height: 22px;

                padding: 2px 6px;

                margin: 2px 0 0 0;

                background: #222;

                color: white;

                border: none;

                border-radius: 4px;

                cursor: pointer;

                font-weight: bold;

                font-size: 12px;

                touch-action: manipulation;
            }

            #${MENU_ID} button:hover {
                background: #0088ff;
            }

            /* MOBILE LAYOUT */
            @media (max-width: ${config.mobileBreakpoint}px) {

                #${MENU_ID} {

                    top: 50% !important;
                    left: 50% !important;

                    transform: translate(-50%, -50%);

                    width: calc(100vw - 24px);

                    max-width: 340px;

                    max-height: 80vh;

                    overflow-y: auto;
                }

                #${HEADER_ID} {
                    cursor: default;
                }
            }
        `);

        // Create menu
        create();
    }

    // Public API
    return {
        apply,
        toggle
    };
})();

// VISUAL EDITOR
const VisualEditor = (() => {
    // Generate a unique prefix based on UUID (desktop) or Name+Version (mobile fallback).
    // We avoid Math.random() because SPAs (like Torn on mobile PDA) may re-inject the script
    // multiple times, which would generate new random IDs and cause duplicate buttons.
    const scriptIdentifier = GM_info?.script?.uuid ||
        `${GM_info?.script?.name || "script"}-${GM_info?.script?.version || "1.0"}`;

    const PREFIX = scriptIdentifier.replace(/[^a-z0-9]/gi, '-').toLowerCase();

    // Unique container ID per script for individual floating button positioning
    let CONTAINER_ID = `${PREFIX}-ui-button-container`;
    let POSITION_KEY = `${PREFIX}-ui-button-container-position`;

    // Unique button ID for this specific script
    let BTN_ID = `${PREFIX}-visual-editor-btn`;

    const config = {
        iconUrl: "https://avatars.githubusercontent.com/u/82180782?v=4",

        // SHARED CONTAINER SETTINGS (Applies to the wrapper holding all buttons)
        containerPosition: "absolute",
        containerTop: "5px",

        // IMPORTANT ANCHORING LOGIC:
        // - To expand to the RIGHT: Set a value for 'containerLeft' and leave 'containerRight' as "auto".
        // - To expand to the LEFT: Set a value for 'containerRight' and leave 'containerLeft' as "auto".

        // Default is on the right side of the screen, expanding to the RIGHT.
        // (Equivalent of the old right anchor: calc(50vw + 542px))
        containerLeft: "calc(50vw + 522px)",
        containerRight: "auto",

        containerBottom: "auto",
        containerDirection: "row", // Options: "row", "column", "row-reverse", "column-reverse"
        containerGap: "8px",
        zIndex: 2147483647,

        // DESKTOP BUTTON SETTINGS
        size: "36px",
        borderRadius: "50%",

        // MOBILE SETTINGS
        mobileBreakpoint: "768px",
        mobileContainerPosition: "fixed",
        mobileContainerTop: "1px",
        mobileContainerLeft: "50%",
        mobileContainerRight: "auto",
        mobileContainerBottom: "auto",
        mobileContainerTransform: "translateX(-50%)",
        mobileDirection: "row",
        mobileSize: "44px"
    };

    //////////////////////
    // CREATE DOM ELEMENTS
    //////////////////////

    let isDragging = false;
    let isEditMode = false;
    let startX = 0;
    let startY = 0;
    let containerLeft = 0;
    let containerTop = 0;
    let lastTapTime = 0;

    function deduplicateContainers() {
        const containers = document.querySelectorAll(`#${CONTAINER_ID}`);
        if (containers.length > 1) {
            const primary = containers[0];
            for (let i = 1; i < containers.length; i++) {
                while (containers[i].firstChild) {
                    primary.appendChild(containers[i].firstChild);
                }
                containers[i].remove();
            }
            console.log("[v-ui-core] Deduplicated button containers.");
        }
    }

    // Trigger de-duplication sweeps on boot and page load events
    setTimeout(deduplicateContainers, 100);
    setTimeout(deduplicateContainers, 500);
    setTimeout(deduplicateContainers, 1500);
    setTimeout(deduplicateContainers, 3000);
    window.addEventListener("load", deduplicateContainers);
    document.addEventListener("DOMContentLoaded", deduplicateContainers);

    function makeContainerDraggable(container) {
        container.addEventListener("pointerdown", (e) => {
            if (!isEditMode) return;
            
            isDragging = true;
            container.setPointerCapture(e.pointerId);
            
            const rect = container.getBoundingClientRect();
            startX = e.clientX;
            startY = e.clientY;
            containerLeft = rect.left;
            containerTop = rect.top;
            
            e.stopPropagation();
            e.preventDefault();
        });

        container.addEventListener("pointermove", (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            const newLeft = containerLeft + deltaX;
            const newTop = containerTop + deltaY;
            
            container.style.position = "fixed";
            container.style.left = `${newLeft}px`;
            container.style.top = `${newTop}px`;
            container.style.right = "auto";
            container.style.bottom = "auto";
            container.style.transform = "none";
            
            e.stopPropagation();
            e.preventDefault();
        });

        container.addEventListener("pointerup", (e) => {
            if (!isDragging) return;
            isDragging = false;
            
            // Save position to localStorage
            const rect = container.getBoundingClientRect();
            localStorage.setItem(POSITION_KEY, JSON.stringify({
                left: `${rect.left}px`,
                top: `${rect.top}px`
            }));
            
            e.stopPropagation();
            e.preventDefault();
        });
    }

    function createContainer() {
        let container = document.getElementById(CONTAINER_ID);
        
        // De-duplicate immediately if possible
        deduplicateContainers();
        container = document.getElementById(CONTAINER_ID);

        if (!container) {
            container = document.createElement('div');
            container.id = CONTAINER_ID;
            
            const parent = document.body || document.documentElement;
            if (parent) {
                parent.appendChild(container);
            }

            // Restore saved position if it exists
            const savedPos = localStorage.getItem(POSITION_KEY);
            if (savedPos) {
                try {
                    const pos = JSON.parse(savedPos);
                    if (pos && pos.top && pos.left) {
                        container.style.position = "fixed";
                        container.style.top = pos.top;
                        container.style.left = pos.left;
                        container.style.right = "auto";
                        container.style.bottom = "auto";
                        container.style.transform = "none";
                    }
                } catch (e) {}
            }

            makeContainerDraggable(container);
        }
        return container;
    }

    function create() {
        // If the button already exists, just update its icon and return
        let btn = document.getElementById(BTN_ID);
        if (btn) {
            btn.style.backgroundImage = `url(${config.iconUrl})`;
            return;
        }

        // Get or create the shared container
        const container = createContainer();

        // Actual button
        btn = document.createElement('button');
        btn.id = BTN_ID;
        btn.style.backgroundImage = `url(${config.iconUrl})`;

        let longPressTimer = null;
        let longPressTriggered = false;
        let startTouchX = 0;
        let startTouchY = 0;

        btn.addEventListener("pointerdown", (e) => {
            e.preventDefault();
            btn.setPointerCapture(e.pointerId);
            longPressTriggered = false;
            startTouchX = e.clientX;
            startTouchY = e.clientY;

            // Short hold (600ms) to toggle Edit Mode
            longPressTimer = setTimeout(() => {
                longPressTriggered = true;
                isEditMode = !isEditMode;
                const c = document.getElementById(CONTAINER_ID);
                if (c) {
                    if (isEditMode) {
                        c.classList.add('vch-container-edit-mode');
                        if (navigator.vibrate) navigator.vibrate(100);
                    } else {
                        c.classList.remove('vch-container-edit-mode');
                        if (navigator.vibrate) navigator.vibrate([50, 50]);
                    }
                }
            }, 600);
        });

        btn.addEventListener("pointermove", (e) => {
            if (!longPressTriggered && longPressTimer) {
                // If they moved more than 5px, cancel the long press
                const dist = Math.hypot(e.clientX - startTouchX, e.clientY - startTouchY);
                if (dist > 5) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
            }
        });

        btn.addEventListener("pointerup", (e) => {
            e.preventDefault();
            clearTimeout(longPressTimer);

            if (!longPressTriggered) {
                // Double-tap to reset position back to default
                const now = Date.now();
                if (now - lastTapTime < 300) {
                    localStorage.removeItem(POSITION_KEY);
                    container.style.position = "";
                    container.style.left = "";
                    container.style.top = "";
                    container.style.right = "";
                    container.style.bottom = "";
                    container.style.transform = "";
                    
                    isEditMode = false;
                    container.classList.remove('vch-container-edit-mode');
                    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
                    return;
                }
                lastTapTime = now;

                if (isEditMode) {
                    isEditMode = false;
                    const c = document.getElementById(CONTAINER_ID);
                    if (c) {
                        c.classList.remove('vch-container-edit-mode');
                        if (navigator.vibrate) navigator.vibrate(50);
                    }
                } else {
                    CustomMenu.toggle();
                }
            }
        });

        btn.addEventListener("pointercancel", (e) => {
            clearTimeout(longPressTimer);
        });

        // Add button to the container
        container.appendChild(btn);

        // De-duplicate again after appending button
        deduplicateContainers();
    }

    //////////////////////
    // APPLY STYLES AND CREATE BUTTON
    //////////////////////
    function apply(options = {}) {
        Object.assign(config, options);

        if (!config.iconUrl) return;

        // Use custom id if provided to allow independent button repositioning
        const id = options.id || PREFIX;
        CONTAINER_ID = `${id}-ui-button-container`;
        POSITION_KEY = `${id}-ui-button-container-position`;
        BTN_ID = `${id}-visual-editor-btn`;

        // Note: Multiple scripts will inject these styles. The last injected script
        // will determine the final layout of the shared container.
        GM_addStyle(`
            /* SHARED CONTAINER DEFAULTS */
            #${CONTAINER_ID} {
                position: ${config.containerPosition};
                top: ${config.containerTop};
                right: ${config.containerRight};
                bottom: ${config.containerBottom};
                left: ${config.containerLeft};
                z-index: ${config.zIndex};

                display: flex;
                flex-direction: ${config.containerDirection};
                gap: ${config.containerGap};
                align-items: center;
                justify-content: center;
            }

            /* CONTAINER EDIT MODE STYLING */
            #${CONTAINER_ID}.vch-container-edit-mode {
                border: 2px dashed #00aaff !important;
                background: rgba(0, 170, 255, 0.25) !important;
                padding: 6px !important;
                border-radius: 8px !important;
                box-shadow: 0 0 15px rgba(0, 170, 255, 0.6) !important;
                cursor: move !important;
                touch-action: none !important;
            }

            /* BUTTON DEFAULTS */
            #${CONTAINER_ID} button {
                width: ${config.size};
                height: ${config.size};
                background-size: contain;
                background-repeat: no-repeat;
                background-position: center;
                border: none;
                background-color: transparent;
                cursor: pointer;
                border-radius: ${config.borderRadius};
                flex-shrink: 0;

                touch-action: manipulation;
                -webkit-tap-highlight-color: transparent;
                user-select: none;

                transition: transform 0.1s ease, filter 0.1s ease;
            }

            #${CONTAINER_ID} button:hover {
                filter: brightness(1.1);
            }

            #${CONTAINER_ID} button:active {
                transform: scale(0.92);
            }

            /* MOBILE OVERRIDES */
            @media (max-width: ${config.mobileBreakpoint}) {
                #${CONTAINER_ID} {
                    position: ${config.mobileContainerPosition};
                    top: ${config.mobileContainerTop};
                    left: ${config.mobileContainerLeft};
                    right: ${config.mobileContainerRight};
                    bottom: ${config.mobileContainerBottom};
                    transform: ${config.mobileContainerTransform};

                    flex-direction: ${config.mobileDirection};
                }

                #${CONTAINER_ID} button {
                    width: ${config.mobileSize};
                    height: ${config.mobileSize};
                }
            }
        `);

        // Create the button in the DOM
        create();
    }

    // Public API
    return { apply, config };
})();
