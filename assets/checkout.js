// Checkout enhancement. Everything here is optional: with this script blocked
// the form still validates natively, posts itself, and the server redirects to
// /thanks/. What this adds is inline messages tied to the field they belong
// to, a fetch submit that keeps you on the page, and the received stamp.
//
// All wording comes from data attributes the template rendered out of
// data/site.json, so no sentence a visitor reads is written in here.
(function () {
  "use strict";

  var form = document.querySelector("form.wo-form");
  if (!form) {
    return;
  }

  // With this script running, the browser's own validation bubbles would
  // block submit before the listener below ever fires, and 6.1 asks for
  // messages tied to their field instead. The required attributes stay in
  // the markup, so a reader without JavaScript still gets native checking.
  form.noValidate = true;

  var summary = document.getElementById("form-errors");
  var submit = form.querySelector("button[type='submit']");
  var startedField = form.querySelector("#started");

  // The page is static, so only the browser can say when it was opened (D54).
  if (startedField) {
    startedField.value = String(Date.now());
  }

  // ---- inline messages ---------------------------------------------------
  function messageFor(el) {
    return "err-" + el.id;
  }

  function showError(el, text) {
    var id = messageFor(el);
    var note = document.getElementById(id);
    if (!note) {
      note = document.createElement("p");
      note.className = "error";
      note.id = id;
      // Inside a fieldset the message goes after the legend, next to a plain
      // control it goes right after the control.
      if (el.tagName === "FIELDSET") {
        el.insertBefore(note, el.firstElementChild ? el.firstElementChild.nextSibling : null);
      } else {
        el.parentNode.insertBefore(note, el.nextSibling);
      }
    }
    note.textContent = text;
    el.setAttribute("aria-describedby", id);
    if (el.tagName !== "FIELDSET") {
      el.setAttribute("aria-invalid", "true");
    }
  }

  function clearError(el) {
    var note = document.getElementById(messageFor(el));
    if (note) {
      note.parentNode.removeChild(note);
    }
    el.removeAttribute("aria-describedby");
    el.removeAttribute("aria-invalid");
  }

  function focusTarget(el) {
    if (el.tagName !== "FIELDSET") {
      return el;
    }
    return el.querySelector("input, select, textarea") || el;
  }

  // ---- validation --------------------------------------------------------
  function fields() {
    return {
      name: form.querySelector("#name"),
      email: form.querySelector("#email"),
      budget: form.querySelector("#budget-group"),
      delivery: form.querySelector("#delivery-group")
    };
  }

  function problems() {
    var f = fields();
    var found = [];

    if (!f.name.value.trim()) {
      found.push([f.name, f.name.getAttribute("data-msg")]);
    }
    if (!f.email.value.trim()) {
      found.push([f.email, f.email.getAttribute("data-msg")]);
    } else if (f.email.checkValidity && !f.email.checkValidity()) {
      found.push([f.email, f.email.getAttribute("data-msg-invalid")]);
    }
    if (!form.querySelector("input[name='budget']:checked")) {
      found.push([f.budget, f.budget.getAttribute("data-msg")]);
    }
    // At least one of the two windows or the "email me instead" box (6.1).
    var dated = Array.prototype.some.call(
      form.querySelectorAll("input[type='date']"),
      function (d) {
        return d.value !== "";
      }
    );
    var flexible = form.querySelector("#flexible");
    if (!dated && !(flexible && flexible.checked)) {
      found.push([f.delivery, f.delivery.getAttribute("data-msg")]);
    }
    return found;
  }

  function clearAll() {
    var f = fields();
    [f.name, f.email, f.budget, f.delivery].forEach(clearError);
    summary.hidden = true;
    summary.textContent = "";
  }

  // ---- payload -----------------------------------------------------------
  function value(sel) {
    var el = form.querySelector(sel);
    return el ? el.value : "";
  }

  function payload() {
    var data = new FormData(form);
    var windows = Array.prototype.map.call(
      form.querySelectorAll("input[type='date']"),
      function (d) {
        var n = d.getAttribute("name").replace("date", "");
        return { date: d.value, time: value("[name='time" + n + "']") };
      }
    );
    var flexible = form.querySelector("#flexible");
    return {
      services: data.getAll("services"),
      name: value("#name"),
      email: value("#email"),
      org: value("#org"),
      budget: (form.querySelector("input[name='budget']:checked") || {}).value || "",
      windows: windows,
      flexible: !!(flexible && flexible.checked),
      details: value("#details"),
      company_website: value("#company_website"),
      started: startedField ? startedField.value : ""
    };
  }

  // ---- outcomes ----------------------------------------------------------
  function succeed(id) {
    var tpl = document.getElementById("wo-success");
    if (!tpl || !("content" in tpl)) {
      form.submit(); // no template support, fall back to the plain post
      return;
    }
    var block = tpl.content.cloneNode(true);
    var slot = block.querySelector("[data-wo-id]");
    if (slot) {
      slot.textContent = id || "";
    }
    form.parentNode.replaceChild(block, form);

    // The order is placed, so the browser's copy of it is no longer wanted.
    try {
      window.localStorage.removeItem("workorder.v1");
    } catch (e) {
      // storage may be unavailable; nothing here depends on it
    }

    var landing = document.querySelector("[data-wo-focus]");
    if (landing) {
      landing.focus();
    }
  }

  function fail(text) {
    var tpl = document.getElementById("wo-failure");
    if (!tpl || !("content" in tpl)) {
      return;
    }
    var block = tpl.content.cloneNode(true);
    if (text) {
      var line = block.querySelector("[data-fail-text]");
      if (line) {
        line.textContent = text;
      }
    }
    // The mailto carries the order along, so a failed send is still a way to
    // reach me rather than a dead end.
    var link = block.querySelector("[data-mailto]");
    if (link) {
      var p = payload();
      var body = [
        p.name,
        p.org,
        p.services.join(", "),
        p.budget,
        p.details
      ].filter(Boolean).join("\n");
      link.setAttribute(
        "href",
        link.getAttribute("href") +
          "?subject=" + encodeURIComponent(link.getAttribute("data-subject") || "") +
          "&body=" + encodeURIComponent(body)
      );
    }
    summary.hidden = false;
    summary.textContent = "";
    summary.appendChild(block);
    summary.focus && summary.focus();
  }

  function resetButton(label) {
    submit.disabled = false;
    submit.textContent = label;
  }

  // ---- submit ------------------------------------------------------------
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearAll();

    var found = problems();
    if (found.length) {
      found.forEach(function (pair) {
        showError(pair[0], pair[1]);
      });
      summary.hidden = false;
      summary.textContent = form.getAttribute("data-error-summary") || "";
      focusTarget(found[0][0]).focus();
      return;
    }

    var label = submit.textContent;
    submit.disabled = true;
    submit.textContent = submit.getAttribute("data-sending") || label;

    window.fetch(form.getAttribute("action"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload())
    }).then(function (res) {
      return res.json().then(function (body) {
        return { status: res.status, body: body };
      });
    }).then(function (out) {
      if (out.status === 200 && out.body && out.body.ok) {
        succeed(out.body.id);
        return;
      }
      resetButton(label);
      fail(out.body && out.body.error);
    }).catch(function () {
      resetButton(label);
      fail(null); // offline, blocked, or a reply that was not JSON
    });
  });

  // Clearing a message as soon as the field is fixed keeps the page from
  // nagging about something already dealt with.
  ["input", "change"].forEach(function (evt) {
    form.addEventListener(evt, function (e) {
      var el = e.target;
      if (!el.id) {
        return;
      }
      if (document.getElementById(messageFor(el))) {
        clearError(el);
      }
      var group = el.closest ? el.closest("fieldset[data-msg]") : null;
      if (group && document.getElementById(messageFor(group))) {
        clearError(group);
      }
    });
  });
})();
