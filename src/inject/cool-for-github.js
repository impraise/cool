var ASSET_HOST = document.querySelector("link[rel='assets']").href;
var SHORTCUTS = [
	{ type: "emoji", code: "shipit", title: "Ship it!", value: ":shipit:"},
	{ type: "unicode", code: "1f44d", title: "Looks good!", value: ":+1:"},
];

var containerParent = document.querySelector(".js-new-comment-form .form-actions");
var container = document.createElement("div");
var commentBox = document.querySelector("#new_comment_field");
var commentForm = document.querySelector(".js-new-comment-form");

function githubEmojiPath(type, code) {
	var baseUrl = ASSET_HOST + "/images/icons/emoji/";

	if (type == "unicode") {
		baseUrl = baseUrl + "unicode/";
	}

	return baseUrl + code + ".png";
}

function submitComment(value) {
	commentBox.value = value;
	commentForm.submit();
}

container.className = "cool-shortcut-container";

SHORTCUTS.forEach(function (shortcut) {
	var button = document.createElement("button");
	button.className = "btn cool-btn-" + shortcut.code;
	button.title = shortcut.title;

	var emoji = document.createElement("img");
	emoji.src = githubEmojiPath(shortcut.type, shortcut.code);
	emoji.alt = shortcut.value;
	emoji.className = "emoji";
	emoji.width = "20";
	emoji.height = "20"

	button.onclick = submitComment.bind(null, shortcut.value);

	button.appendChild(emoji);
	container.appendChild(button);
});

containerParent.appendChild(container);
