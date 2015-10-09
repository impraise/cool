var SHORTCUTS = [
  { type: "unicode", code: "1f44d", title: "Looks good!", value: ":+1:"},
  { type: "emoji", code: "shipit", title: "Ship it!", value: ":shipit:"},
];

var $ = document.querySelector.bind(document);

https://github.com/impraise/impraise-web/pull/833/comment

var EMOJI_PATH         = "/images/icons/emoji/";
var WRAPPER_CLASS_NAME = "cool-shortcut-wrapper";

var href = document.location.href;

// Elements and data to be extracted on page load
var BUTTON_CONTAINER;
var EMOJI_URL;
var PULL_ID;
var AUTHENTICITY_TOKEN;
var CSRF_TOKEN;
var TIMELINE_LAST_MODIFIED;

function prepare() {
  var valid = inspectPage();

  // If some of the required elements/information are missing, abort
  if (!valid) return;

  addShortcutButtons();
}

function poll() {
  var currentHref = document.location.href;

  if (currentHref !== href) {
    href = currentHref;
    setTimeout(prepare, 1000);
  }

  setTimeout(poll, 200);
}

function inspectPage() {
  var assetHost = $("link[rel='assets']").getAttribute("href");

  EMOJI_URL = assetHost + EMOJI_PATH;

  var form = $(".js-new-comment-form");

  if (!form) return false;

  BUTTON_CONTAINER = form.querySelector(".form-actions");

  PULL_ID            = parseInt(hiddenInputValue(form, "issue"));
  AUTHENTICITY_TOKEN = hiddenInputValue(form, "authenticity_token");

  CSRF_TOKEN = $("meta[name=csrf-token]").getAttribute("content");

  var timelineMarker = $("#partial-timeline-marker");

  TIMELINE_LAST_MODIFIED = timelineMarker.getAttribute("data-last-modified");

  return !!(
    BUTTON_CONTAINER &&
    assetHost &&
    PULL_ID &&
    AUTHENTICITY_TOKEN &&
    CSRF_TOKEN &&
    TIMELINE_LAST_MODIFIED
  );
}

function hiddenInputValue(form, name) {
  var input = form.querySelector("input[type=hidden][name=" + name + "]");
  return input.getAttribute("value");
}

function addShortcutButtons() {
  if (BUTTON_CONTAINER.children[0].classList.contains(WRAPPER_CLASS_NAME)) {
    // We've already applied the shortcut buttons apparently. Abort!
    return;
  }

  var buttons = SHORTCUTS.map(function (shortcut) {
    var button = document.createElement("button");

    button.classList.add("btn");
    button.classList.add("btn-outline");

    button.setAttribute("title", shortcut.title);

    button.appendChild(shortcutButtonImage(shortcut));

    button.addEventListener("click", activateShortcut.bind(button, shortcut));

    return button;
  });

  var wrapper = document.createElement("div");

  wrapper.classList.add(WRAPPER_CLASS_NAME);

  buttons.forEach(function (button) { wrapper.appendChild(button); });

  BUTTON_CONTAINER.insertBefore(wrapper, BUTTON_CONTAINER.children[0]);
}

function shortcutButtonImage(shortcut) {
  var image = document.createElement("img");

  image.classList.add("emoji");

  image.setAttribute("src", shortcutImagePath(shortcut));
  image.setAttribute("alt", shortcut.value);

  return image;
}

function shortcutImagePath(shortcut) {
  var path = shortcut.code + ".png";

  if (shortcut.type === "unicode") path = "unicode/" + path;

  return EMOJI_URL + path;
}

function activateShortcut(shortcut, e) {
  e.preventDefault();

  animateButtonImage(this);

  // Gets the comment POST endpoint URL by removing anything after the pull id
  var commentUrl = location.href.replace(/(pull\/\d+).*/, "$1/comment");

  var xhr = new XMLHttpRequest();

  xhr.open("POST", commentUrl);

  xhr.setRequestHeader(
    "Content-Type", "application/x-www-form-urlencoded; charset=UTF-8"
  );

  xhr.setRequestHeader("X-CSRF-Token", CSRF_TOKEN);
  xhr.setRequestHeader("X-Timeline-Last-Modified", TIMELINE_LAST_MODIFIED);
  xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

  var data = {
    "utf8":               "✓",
    "authenticity_token": AUTHENTICITY_TOKEN,
    "issue":              PULL_ID,
    "comment[body]":      shortcut.value,
  };

  var pairs = [];

  for (var key in data) {
     if (data.hasOwnProperty(key)) {
        pairs.push(
          encodeURIComponent(key) + "=" + encodeURIComponent(data[key])
        );
     }
  }

  var formData = pairs.join("&");

  xhr.send(formData);
}

function animateButtonImage(button) {
  var image = button.children[0];
  var clone = image.cloneNode();

  var offsetLeft = image.offsetLeft;
  var offsetTop  = image.offsetTop;

  button.insertBefore(clone, image);

  clone.classList.add("cool-shortcut-animated-emoji");

  clone.style.left = offsetLeft;
  clone.style.top  = offsetTop;

  setTimeout(function () { clone.remove(); }, 1000);
}

document.addEventListener("DOMContentLoaded", function () {
  prepare();
  poll();
});
