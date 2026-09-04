// Shows the work order number from the ?wo= parameter on the confirmation
// page. Two rules make this safe: the value has to match the shape the server
// issues (WO-YYMMDD-NNN, section 6.2), and it reaches the page through
// textContent, so a crafted URL can only ever become text on the screen.
// With JavaScript off, the block stays hidden and the generic copy stands
// on its own.
(function () {
  "use strict";

  var box = document.getElementById("wo-box");
  var slot = document.getElementById("wo-id");
  if (!box || !slot) {
    return;
  }

  var wo = new URLSearchParams(window.location.search).get("wo");
  if (!wo || !/^WO-\d{6}-\d{3}$/.test(wo)) {
    return;
  }

  slot.textContent = wo;
  box.hidden = false;
})();
