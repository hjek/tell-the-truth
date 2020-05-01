// which browser are we running in?
var browser = browser || chrome

// default settings
var settings = {
    enable: false,
    target: "localhost",
    frequency: "60"
}

// the relevant attribute to get/set in the DOM element
var value = element => {
    // note: this doesn't work for <select>
    if (element.type == "checkbox") {
	return "checked"
    } else {
	return "value"}}

var updatePopup = settings => {
    // update logo icon
    let logo = document.getElementById("logo")
    if (settings.enable === true) {
	logo.src = "../icons/active-128.png"
    } else {
	logo.src = "../icons/inactive-128.png"}
    // show frequency
    let frequencyOutput = document.getElementById("frequencyOutput")
    frequencyOutput.innerText = settings.frequency
    // enable button animation
    let enable = document.getElementById("enable")
    enable.style["animation-duration"] = 60/settings.frequency*4 + "s"
}

// TODO: must be stored in background!
// load stored settings, if any
Object.keys(settings).map(
    setting => {
	browser.storage.local.get(
	    setting,
	    stored => {
		let element = document.getElementById(setting)
		// TODO: don't auto-start by loading stored enable state
		if (stored[setting]) {
		    settings[setting] = stored[setting]
		}
		element[value(element)] = settings[setting]
		updatePopup(settings)
		// update background.js according to settings loaded
		// let message = {action: "toggle", settings: settings}
	    })
    })

// add event listeners to capture user interaction
document.addEventListener('DOMContentLoaded', (event) => {
    // request data from background.js
    browser.runtime.sendMessage({type: "data"})
    Object.keys(settings).map(
	key => {
	    let element = document.getElementById(key)
	    element.onchange = () => {
		// set the setting to the selected vallue
		settings[key] = element[value(element)]
		// send message with settings to background.js
		let message = {type: "toggle", settings: settings}
		browser.runtime.sendMessage(message)
		// save the selected setting
		let setting = {}
		setting[key] = element[value(element)]
		browser.storage.local.set(setting)
		// update the icon
		updatePopup(settings)
	    }})})

browser.runtime.onMessage.addListener(
    message => {
	switch(message.type){
	case "request":
	    document.getElementById("request").innerText = message.url
	    document.getElementById("counter").innerText = message.counter
	    break
	case "data":
	    message.polluters.map(
		(polluter) => {
		    let pollutersGroup = document.getElementById("polluters")
		    let option = document.createElement("option")
		    option.innerText = polluter.name
		    if (polluter.domain !== "") {
			option.title = polluter.domain
			option.value = polluter.domain
		    } else {
			option.disabled = "disabled"
		    }
		    if (settings.target === polluter.domain) {
			option.selected = "selected"
		    }
		    pollutersGroup.appendChild(option)
		    if (polluter.name === message.suggestion.name) {
			let suggestion = document.getElementById("suggestion")
			suggestion.append(option)
		    }
		})
	    break
	}})


// run on first popup
updatePopup(settings)
