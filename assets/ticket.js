// The work order: a cart in one localStorage key, workorder.v1, holding an
// array of SKU ids. No cookies, no network, nothing leaves the machine until
// the order is sent. Everything here upgrades markup that already works
// without it: add links become toggle buttons, the header link becomes the
// drawer trigger.
(function () {
  "use strict";

  var KEY = "workorder.v1";
  var SKU = /^AAA-\d{2}(-O\d+)?$/;

  var items = readStored();
  var drawer = null;
  var scrim = null;
  var trigger = null;
  var lastFocus = null;

  // Storage is user editable, so it is validated like any untrusted input.
  function readStored() {
    try {
      var list = JSON.parse(window.localStorage.getItem(KEY) || "[]");
      if (!Array.isArray(list)) {
        return [];
      }
      return list.filter(function (s, i) {
        return typeof s === "string" && SKU.test(s) && list.indexOf(s) === i;
      }).sort();
    } catch (e) {
      return []; // private mode, disabled storage, or corrupt JSON
    }
  }

  function save() {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(items));
    } catch (e) {
      // A full or blocked store must never break the page.
    }
  }

  function has(sku) {
    return items.indexOf(sku) !== -1;
  }

  function toggle(sku) {
    var at = items.indexOf(sku);
    if (at === -1) {
      items.push(sku);
      items.sort();
    } else {
      items.splice(at, 1);
    }
    save();
    render();
  }

  // ---- rendering ---------------------------------------------------------
  function each(selector, fn) {
    Array.prototype.forEach.call(document.querySelectorAll(selector), fn);
  }

  function render() {
    each("button[data-sku]", function (btn) {
      var on = has(btn.getAttribute("data-sku"));
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.textContent = on ? btn.getAttribute("data-added") : btn.getAttribute("data-add");
    });

    // Option checkboxes on the cards share the cart, so ticking one
    // adds it and unchecking in the drawer unchecks the card as well.
    each("input[name='services']", function (box) {
      box.checked = has(box.value);
      box.addEventListener("change", function () {
        var at = items.indexOf(box.value);
        if (box.checked && at === -1) {
          items.push(box.value);
          items.sort();
        } else if (!box.checked && at !== -1) {
          items.splice(at, 1);
        }
        save();
        render();
      });
    });

    // Every link to checkout carries the current selection, so following one
    // hands the form the same list the drawer is showing.
    each("a[href^='/checkout/']", function (a) {
      a.setAttribute("href", items.length ? "/checkout/?s=" + items.join(",") : "/checkout/");
    });

    renderCount();
    renderList();
  }

  function renderCount() {
    if (!trigger) {
      return;
    }
    var badge = trigger.querySelector(".count");
    if (!items.length) {
      if (badge) {
        badge.parentNode.removeChild(badge);
      }
      return;
    }
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "count";
      trigger.appendChild(badge);
    }
    // The number is seen; the label says what it counts.
    badge.textContent = "";
    var spoken = document.createElement("span");
    spoken.className = "vh";
    spoken.textContent = items.length + " " + (trigger.getAttribute("data-count-label") || "");
    var seen = document.createElement("span");
    seen.setAttribute("aria-hidden", "true");
    seen.textContent = String(items.length);
    badge.appendChild(spoken);
    badge.appendChild(seen);
  }

  function renderList() {
    if (!drawer) {
      return;
    }
    var list = drawer.querySelector("[data-wo-list]");
    var empty = drawer.querySelector("[data-wo-empty]");
    var removeLabel = list.getAttribute("data-remove-label") || "Remove";

    list.textContent = "";
    items.forEach(function (sku) {
      var li = document.createElement("li");
      li.className = "wo-item";

      var code = document.createElement("span");
      code.className = "wo-sku";
      code.textContent = sku.toUpperCase();

      var name = document.createElement("span");
      name.textContent = nameFor(sku);

      var drop = document.createElement("button");
      drop.type = "button";
      drop.className = "btn btn-quiet";
      drop.textContent = removeLabel;
      drop.addEventListener("click", function () {
        toggle(sku);
        focusFirst();
      });

      li.appendChild(code);
      li.appendChild(name);
      li.appendChild(drop);
      list.appendChild(li);
    });
    empty.hidden = items.length > 0;
  }

  // Names come from the card when the page has one; elsewhere the SKU stands
  // alone, which is what a ticket line is anyway.
  function nameFor(sku) {
    var btn = document.querySelector("[data-sku='" + sku + "']");
    var card = btn ? btn.closest(".ticket") : null;
    var name = card ? card.querySelector(".ticket-name") : null;
    if (name) {
      return name.textContent;
    }
    var opt = document.querySelector("label[for='opt-" + sku + "']");
    return opt ? opt.textContent : "";
  }

  // ---- drawer ------------------------------------------------------------
  function build() {
    var tpl = document.getElementById("wo-template");
    if (!tpl || !("content" in tpl)) {
      return false;
    }
    var parts = tpl.content.cloneNode(true);
    document.body.appendChild(parts);
    scrim = document.querySelector("[data-wo-scrim]");
    drawer = document.getElementById("wo-drawer");
    if (!drawer || !scrim) {
      return false;
    }
    drawer.querySelector("[data-wo-close]").addEventListener("click", close);
    scrim.addEventListener("click", close);
    drawer.addEventListener("keydown", trap);
    return true;
  }

  function focusable() {
    return Array.prototype.filter.call(
      drawer.querySelectorAll("a[href], button:not([disabled])"),
      function (el) {
        return el.offsetParent !== null;
      }
    );
  }

  function focusFirst() {
    var list = focusable();
    if (list.length) {
      list[0].focus();
    }
  }

  function trap(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (e.key !== "Tab") {
      return;
    }
    var list = focusable();
    if (!list.length) {
      return;
    }
    var first = list[0];
    var last = list[list.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function open() {
    lastFocus = document.activeElement;
    drawer.classList.add("is-open");
    scrim.classList.add("is-open");
    document.documentElement.classList.add("wo-open");
    trigger.setAttribute("aria-expanded", "true");
    focusFirst();
  }

  function close() {
    drawer.classList.remove("is-open");
    scrim.classList.remove("is-open");
    document.documentElement.classList.remove("wo-open");
    trigger.setAttribute("aria-expanded", "false");
    if (lastFocus && lastFocus.focus) {
      lastFocus.focus();
    }
  }

  // ---- progressive upgrade ----------------------------------------------
  function upgradeCards() {
    each("a.btn[data-sku]", function (link) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = link.className;
      btn.setAttribute("data-sku", link.getAttribute("data-sku"));
      btn.setAttribute("data-add", link.textContent.trim());
      btn.setAttribute("data-added", link.getAttribute("data-added") || link.textContent.trim());
      btn.textContent = link.textContent.trim();
      btn.addEventListener("click", function () {
        toggle(btn.getAttribute("data-sku"));
      });
      link.parentNode.replaceChild(btn, link);
    });
  }

  // A real button, not the link: a link that opens a panel misreports itself
  // to anything reading the page out loud.
  function upgradeTrigger(labels) {
    var link = document.getElementById("wo-open");
    if (!link) {
      return false;
    }
    trigger = document.createElement("button");
    trigger.type = "button";
    trigger.id = "wo-open";
    trigger.className = link.className;
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", "wo-drawer");
    trigger.setAttribute("data-count-label", labels.count);
    trigger.setAttribute("aria-label", labels.open);
    trigger.textContent = link.textContent.trim();
    trigger.addEventListener("click", open);
    link.parentNode.replaceChild(trigger, link);
    return true;
  }

  // 6.1: boxes start from the ?s= list if the link carried one, otherwise from
  // storage, and ticking one writes back so the drawer cannot disagree.
  function syncCheckboxes() {
    var boxes = document.querySelectorAll("input[name='services']");
    if (!boxes.length) {
      return;
    }
    var asked = new URLSearchParams(window.location.search).get("s");
    if (asked) {
      var wanted = asked.split(",").filter(function (s, i, all) {
        return SKU.test(s) && all.indexOf(s) === i;
      });
      if (wanted.length) {
        items = wanted.sort();
        save();
      }
    }
    Array.prototype.forEach.call(boxes, function (box) {
      box.checked = has(box.value);
      box.addEventListener("change", function () {
        var at = items.indexOf(box.value);
        if (box.checked && at === -1) {
          items.push(box.value);
          items.sort();
        } else if (!box.checked && at !== -1) {
          items.splice(at, 1);
        }
        save();
        render();
      });
    });
  }

  var header = document.getElementById("wo-open");
  var labels = {
    open: header ? header.getAttribute("data-open-label") || "" : "",
    count: document.documentElement.getAttribute("data-count-label") || "items on your work order"
  };

  if (!build() || !upgradeTrigger(labels)) {
    return; // no drawer available, so the plain links stay exactly as they are
  }
  upgradeCards();
  syncCheckboxes();
  render();
})();
